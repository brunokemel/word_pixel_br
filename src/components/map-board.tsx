"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import { densifyBrushPoints, distanceBetween, drawSmoothBrushStroke, type BrushPoint } from "@/lib/brush";
import { cellToBounds, createProtectionSelection, interpolateCellLine, lngLatToCell, MIN_PAINT_ZOOM, visibleChunkIds } from "@/lib/grid";
import type { GridCell, MapBounds, ProtectedArea, ProtectionSelection, ToolMode } from "@/lib/types";
import { worldPixelApi } from "@/lib/mock-api";
import { useI18n } from "@/lib/i18n";

maplibregl.setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
);

type PolygonFeature = {
  type: "Feature";
  properties: Record<string, string | number | boolean>;
  geometry: { type: "Polygon"; coordinates: number[][][] };
};

type PolygonCollection = { type: "FeatureCollection"; features: PolygonFeature[] };

interface MapBoardProps {
  mode: ToolMode;
  cells: Map<string, GridCell>;
  protectedAreas: ProtectedArea[];
  selectedCell: GridCell | null;
  brushColor: string;
  canPaint: boolean;
  onCellSelect: (cell: GridCell) => void;
  onPaint: (cells: GridCell[]) => void;
  onProtectPreview: (selection: ProtectionSelection | null) => void;
  onProtectSelect: (selection: ProtectionSelection) => void;
  onChunksLoaded: (cells: GridCell[]) => void;
  onConnectionChange: (connected: boolean) => void;
}

const EMPTY_COLLECTION: PolygonCollection = { type: "FeatureCollection", features: [] };

function boundsFeature(west: number, south: number, east: number, north: number, properties: PolygonFeature["properties"]): PolygonFeature {
  return {
    type: "Feature",
    properties,
    geometry: { type: "Polygon", coordinates: [[[west, north], [east, north], [east, south], [west, south], [west, north]]] },
  };
}

function getMapBounds(map: MapLibreMap): MapBounds {
  const bounds = map.getBounds();
  return { west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() };
}

export function MapBoard({
  mode, cells, protectedAreas, selectedCell, brushColor, canPaint, onCellSelect, onPaint, onProtectPreview, onProtectSelect,
  onChunksLoaded, onConnectionChange,
}: MapBoardProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const cellsRef = useRef(cells);
  const modeRef = useRef(mode);
  const brushColorRef = useRef(brushColor);
  const canPaintRef = useRef(canPaint);
  const handlersRef = useRef({ onCellSelect, onPaint, onProtectPreview, onProtectSelect, onChunksLoaded, onConnectionChange });
  const [zoom, setZoom] = useState(3.2);
  const [loading, setLoading] = useState(true);
  const [cursorCell, setCursorCell] = useState<GridCell | null>(null);

  useEffect(() => { cellsRef.current = cells; }, [cells]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);
  useEffect(() => { canPaintRef.current = canPaint; }, [canPaint]);
  useEffect(() => {
    handlersRef.current = { onCellSelect, onPaint, onProtectPreview, onProtectSelect, onChunksLoaded, onConnectionChange };
  }, [onCellSelect, onPaint, onProtectPreview, onProtectSelect, onChunksLoaded, onConnectionChange]);

  const protectionData = useMemo<PolygonCollection>(() => ({
    type: "FeatureCollection",
    features: protectedAreas.filter((area) => area.status === "active").map((area) => {
      const start = cellToBounds(area.originX, area.originY);
      const end = cellToBounds(area.originX + area.width - 1, area.originY + area.height - 1);
      return boundsFeature(start.west, end.south, end.east, start.north, { id: area.id, owner: area.ownerName });
    }),
  }), [protectedAreas]);

  const selectionData = useMemo<PolygonCollection>(() => {
    if (!selectedCell) return EMPTY_COLLECTION;
    const bounds = cellToBounds(selectedCell.x, selectedCell.y);
    return { type: "FeatureCollection", features: [boundsFeature(bounds.west, bounds.south, bounds.east, bounds.north, {})] };
  }, [selectedCell]);

  const loadViewport = useCallback(async (map: MapLibreMap) => {
    const bounds = getMapBounds(map);
    try {
      const chunks = await worldPixelApi.getVisibleChunks(bounds, map.getZoom());
      handlersRef.current.onChunksLoaded(chunks.flatMap((chunk) => chunk.cells));
      unsubscribeRef.current?.();
      unsubscribeRef.current = worldPixelApi.subscribe(visibleChunkIds(bounds), (event) => {
        handlersRef.current.onConnectionChange(event.connected !== false);
        if (event.cell) handlersRef.current.onChunksLoaded([event.cell]);
      });
      handlersRef.current.onConnectionChange(true);
    } catch {
      handlersRef.current.onConnectionChange(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [-47.8, -15.7],
      zoom: 3.2,
      minZoom: 1.5,
      maxZoom: 12,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          base: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          { id: "background", type: "background", paint: { "background-color": "#07111f" } },
          {
            id: "base",
            type: "raster",
            source: "base",
            paint: {
              "raster-opacity": 0.9,
              "raster-saturation": -0.75,
              "raster-brightness-min": 0.08,
              "raster-brightness-max": 0.42,
              "raster-contrast": 0.2,
            },
          },
        ],
      },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    type GeoBrushPoint = { lng: number; lat: number };
    type GeoBrushStroke = { color: string; points: GeoBrushPoint[] };
    const brushStrokes: GeoBrushStroke[] = [];
    const brushStorageKey = "world-pixel-brush-strokes-v1";
    try {
      const stored = JSON.parse(window.localStorage.getItem(brushStorageKey) ?? "[]") as unknown;
      if (Array.isArray(stored)) {
        for (const candidate of stored.slice(-200)) {
          if (
            typeof candidate === "object" && candidate !== null &&
            "color" in candidate && typeof candidate.color === "string" &&
            "points" in candidate && Array.isArray(candidate.points)
          ) {
            const points = candidate.points.filter((point: unknown): point is GeoBrushPoint => (
              typeof point === "object" && point !== null &&
              "lng" in point && typeof point.lng === "number" && Number.isFinite(point.lng) &&
              "lat" in point && typeof point.lat === "number" && Number.isFinite(point.lat)
            ));
            if (points.length > 0) brushStrokes.push({ color: candidate.color, points });
          }
        }
      }
    } catch {
      window.localStorage.removeItem(brushStorageKey);
    }
    let activeBrushStroke: GeoBrushStroke | null = null;
    let lastBrushScreenPoint: BrushPoint | null = null;
    let brushFrame: number | null = null;

    const renderBrushStrokes = () => {
      brushFrame = null;
      const canvas = brushCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      for (const stroke of brushStrokes) {
        const projected = stroke.points.map((point) => map.project([point.lng, point.lat]));
        drawSmoothBrushStroke(context, densifyBrushPoints(projected, 2.5), stroke.color, 12);
      }
    };

    const scheduleBrushRender = () => {
      if (brushFrame === null) brushFrame = window.requestAnimationFrame(renderBrushStrokes);
    };
    const resizeObserver = new ResizeObserver(scheduleBrushRender);
    resizeObserver.observe(containerRef.current);
    map.on("move", scheduleBrushRender);

    map.on("load", () => {
      map.addSource("protections", { type: "geojson", data: EMPTY_COLLECTION });
      map.addLayer({ id: "protection-fill", type: "fill", source: "protections", paint: { "fill-color": "#ffc857", "fill-opacity": 0.08 } });
      map.addLayer({ id: "protection-line", type: "line", source: "protections", paint: { "line-color": "#ffd66e", "line-width": 2, "line-dasharray": [2, 2] } });
      map.addSource("selection", { type: "geojson", data: EMPTY_COLLECTION });
      map.addLayer({ id: "selection", type: "line", source: "selection", paint: { "line-color": "#ffffff", "line-width": 3 } });
      scheduleBrushRender();
      void loadViewport(map);
    });

    let debounce: ReturnType<typeof setTimeout>;
    map.on("moveend", () => {
      setZoom(map.getZoom());
      clearTimeout(debounce);
      debounce = setTimeout(() => void loadViewport(map), 180);
    });
    map.on("mousemove", (event: MapMouseEvent) => {
      const base = lngLatToCell(event.lngLat.lng, event.lngLat.lat);
      setCursorCell({ ...base, color: cellsRef.current.get(`${base.x}:${base.y}`)?.color ?? "#18283b" });
      if (painting) paintTowards(base);
      if (painting && activeBrushStroke) {
        const screenPoint = { x: event.point.x, y: event.point.y };
        if (!lastBrushScreenPoint || distanceBetween(lastBrushScreenPoint, screenPoint) >= 0.5) {
          activeBrushStroke.points.push({ lng: event.lngLat.lng, lat: event.lngLat.lat });
          lastBrushScreenPoint = screenPoint;
          scheduleBrushRender();
        }
      }
      if (protectionStart) handlersRef.current.onProtectPreview(createProtectionSelection(protectionStart, base));
    });
    let painting = false;
    let lastPaintCell: Pick<GridCell, "x" | "y"> | null = null;
    let paintedInStroke = new Set<string>();
    let protectionStart: Pick<GridCell, "x" | "y"> | null = null;

    const paintTowards = (target: Pick<GridCell, "x" | "y">) => {
      if (map.getZoom() < MIN_PAINT_ZOOM) return;
      const path = lastPaintCell ? interpolateCellLine(lastPaintCell, target) : [target];
      lastPaintCell = target;
      const cellsToPaint: GridCell[] = [];
      for (const point of path) {
        const key = `${point.x}:${point.y}`;
        if (paintedInStroke.has(key) || !worldPixelApi.isLandCell(point.x, point.y)) continue;
        paintedInStroke.add(key);
        const existing = cellsRef.current.get(key);
        const bounds = cellToBounds(point.x, point.y);
        const cell: GridCell = existing ?? {
          x: point.x,
          y: point.y,
          lng: bounds.west,
          lat: bounds.north,
          color: "#18283b",
        };
        cellsToPaint.push(cell);
      }
      const lastCell = cellsToPaint.at(-1);
      if (lastCell) {
        handlersRef.current.onCellSelect(lastCell);
        handlersRef.current.onPaint(cellsToPaint);
      }
    };

    map.on("mousedown", (event: MapMouseEvent) => {
      if (
        modeRef.current === "protect" &&
        map.getZoom() >= MIN_PAINT_ZOOM &&
        event.originalEvent.button === 0 &&
        event.originalEvent.ctrlKey
      ) {
        event.preventDefault();
        map.dragPan.disable();
        protectionStart = lngLatToCell(event.lngLat.lng, event.lngLat.lat);
        handlersRef.current.onProtectPreview(createProtectionSelection(protectionStart, protectionStart));
        return;
      }
      if (modeRef.current !== "paint") return;
      event.preventDefault();
      if (!canPaintRef.current) {
        paintTowards(lngLatToCell(event.lngLat.lng, event.lngLat.lat));
        return;
      }
      painting = true;
      lastPaintCell = null;
      paintedInStroke = new Set();
      activeBrushStroke = {
        color: brushColorRef.current,
        points: [{ lng: event.lngLat.lng, lat: event.lngLat.lat }],
      };
      brushStrokes.push(activeBrushStroke);
      if (brushStrokes.length > 200) brushStrokes.shift();
      lastBrushScreenPoint = { x: event.point.x, y: event.point.y };
      scheduleBrushRender();
      paintTowards(lngLatToCell(event.lngLat.lng, event.lngLat.lat));
    });
    const finishInteraction = (event?: MapMouseEvent) => {
      if (protectionStart && event) {
        const selection = createProtectionSelection(protectionStart, lngLatToCell(event.lngLat.lng, event.lngLat.lat));
        handlersRef.current.onProtectPreview(selection);
        handlersRef.current.onProtectSelect(selection);
      }
      protectionStart = null;
      if (modeRef.current === "protect") map.dragPan.enable();
      if (painting && activeBrushStroke && event) {
        activeBrushStroke.points.push({ lng: event.lngLat.lng, lat: event.lngLat.lat });
        scheduleBrushRender();
      }
      if (painting && activeBrushStroke) {
        try { window.localStorage.setItem(brushStorageKey, JSON.stringify(brushStrokes)); } catch { /* armazenamento indisponível */ }
      }
      painting = false;
      activeBrushStroke = null;
      lastBrushScreenPoint = null;
      lastPaintCell = null;
      paintedInStroke.clear();
    };
    map.on("mouseup", finishInteraction);
    map.on("mouseout", () => {
      protectionStart = null;
      finishInteraction();
    });
    map.on("click", (event: MapMouseEvent) => {
      const base = lngLatToCell(event.lngLat.lng, event.lngLat.lat);
      const existing = cellsRef.current.get(`${base.x}:${base.y}`);
      const cell: GridCell = existing ?? { ...base, color: "#18283b" };
      handlersRef.current.onCellSelect(cell);
    });
    return () => {
      clearTimeout(debounce);
      resizeObserver.disconnect();
      if (brushFrame !== null) window.cancelAnimationFrame(brushFrame);
      unsubscribeRef.current?.();
      map.remove();
      mapRef.current = null;
    };
  }, [loadViewport]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (mode === "paint") map.dragPan.disable();
    else map.dragPan.enable();
  }, [mode]);

  useEffect(() => { (mapRef.current?.getSource("protections") as GeoJSONSource | undefined)?.setData(protectionData); }, [protectionData]);
  useEffect(() => { (mapRef.current?.getSource("selection") as GeoJSONSource | undefined)?.setData(selectionData); }, [selectionData]);

  return (
    <div className={`map-shell mode-${mode}`}>
      <div ref={containerRef} className="map-container" aria-label={t("map.label")} />
      <div className="map-vignette" aria-hidden="true" />
      <canvas ref={brushCanvasRef} className="brush-canvas" aria-hidden="true" />
      {loading && <div className="map-status"><span className="spinner" /> {t("map.loading")}</div>}
      {zoom < MIN_PAINT_ZOOM && mode !== "navigate" && (
        <div className="zoom-hint">{mode === "paint" ? t("map.zoomPaint") : t("map.zoomProtect")}</div>
      )}
      {mode === "protect" && zoom >= MIN_PAINT_ZOOM && (
        <div className="zoom-hint">{t("map.protectHint")}</div>
      )}
      {cursorCell && zoom >= MIN_PAINT_ZOOM && (
        <div className="coordinates" aria-hidden="true">{cursorCell.x}, {cursorCell.y}</div>
      )}
    </div>
  );
}
