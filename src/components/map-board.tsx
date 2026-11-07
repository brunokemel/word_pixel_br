"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
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
  onCellSelect: (cell: GridCell) => void;
  onPaint: (cell: GridCell) => void;
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

function cellFeature(cell: GridCell): PolygonFeature {
  const bounds = cellToBounds(cell.x, cell.y);
  return boundsFeature(bounds.west, bounds.south, bounds.east, bounds.north, {
    x: cell.x, y: cell.y, color: cell.color, protected: Boolean(cell.protectedBy),
  });
}

function getMapBounds(map: MapLibreMap): MapBounds {
  const bounds = map.getBounds();
  return { west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() };
}

export function MapBoard({
  mode, cells, protectedAreas, selectedCell, onCellSelect, onPaint, onProtectPreview, onProtectSelect,
  onChunksLoaded, onConnectionChange,
}: MapBoardProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const cellsRef = useRef(cells);
  const modeRef = useRef(mode);
  const handlersRef = useRef({ onCellSelect, onPaint, onProtectPreview, onProtectSelect, onChunksLoaded, onConnectionChange });
  const [zoom, setZoom] = useState(3.2);
  const [loading, setLoading] = useState(true);
  const [cursorCell, setCursorCell] = useState<GridCell | null>(null);

  useEffect(() => { cellsRef.current = cells; }, [cells]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => {
    handlersRef.current = { onCellSelect, onPaint, onProtectPreview, onProtectSelect, onChunksLoaded, onConnectionChange };
  }, [onCellSelect, onPaint, onProtectPreview, onProtectSelect, onChunksLoaded, onConnectionChange]);

  const pixelData = useMemo<PolygonCollection>(() => ({
    type: "FeatureCollection",
    features: [...cells.values()].map(cellFeature),
  }), [cells]);

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

    map.on("load", () => {
      map.addSource("pixels", { type: "geojson", data: EMPTY_COLLECTION });
      map.addLayer({
        id: "pixel-relief-shadow",
        type: "fill",
        source: "pixels",
        paint: {
          "fill-color": "#02050a",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.18, 6, 0.48],
          "fill-translate": [2.5, 3.5],
          "fill-translate-anchor": "viewport",
        },
      });
      map.addLayer({ id: "pixel-fill", type: "fill", source: "pixels", paint: { "fill-color": ["get", "color"], "fill-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.7, 6, 0.94] } });
      map.addLayer({
        id: "pixel-relief-highlight",
        type: "line",
        source: "pixels",
        paint: {
          "line-color": "rgba(255,255,255,.72)",
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 3.5, 0, 6, 0.62],
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.35, 9, 1.15],
          "line-translate": [-0.7, -0.7],
          "line-translate-anchor": "viewport",
        },
      });
      map.addLayer({ id: "pixel-grid", type: "line", source: "pixels", minzoom: 4.5, paint: { "line-color": "rgba(7,17,31,.55)", "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.3, 9, 1] } });
      map.addSource("protections", { type: "geojson", data: EMPTY_COLLECTION });
      map.addLayer({ id: "protection-fill", type: "fill", source: "protections", paint: { "fill-color": "#ffc857", "fill-opacity": 0.08 } });
      map.addLayer({ id: "protection-line", type: "line", source: "protections", paint: { "line-color": "#ffd66e", "line-width": 2, "line-dasharray": [2, 2] } });
      map.addSource("selection", { type: "geojson", data: EMPTY_COLLECTION });
      map.addLayer({ id: "selection", type: "line", source: "selection", paint: { "line-color": "#ffffff", "line-width": 3 } });
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
        handlersRef.current.onCellSelect(cell);
        handlersRef.current.onPaint(cell);
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
      painting = true;
      lastPaintCell = null;
      paintedInStroke = new Set();
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
      painting = false;
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

  useEffect(() => { (mapRef.current?.getSource("pixels") as GeoJSONSource | undefined)?.setData(pixelData); }, [pixelData]);
  useEffect(() => { (mapRef.current?.getSource("protections") as GeoJSONSource | undefined)?.setData(protectionData); }, [protectionData]);
  useEffect(() => { (mapRef.current?.getSource("selection") as GeoJSONSource | undefined)?.setData(selectionData); }, [selectionData]);

  return (
    <div className={`map-shell mode-${mode}`}>
      <div ref={containerRef} className="map-container" aria-label={t("map.label")} />
      <div className="map-vignette" aria-hidden="true" />
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
