"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import { cellToBounds, lngLatToCell, MIN_PAINT_ZOOM, visibleChunkIds } from "@/lib/grid";
import type { GridCell, MapBounds, ProtectedArea, ToolMode } from "@/lib/types";
import { worldPixelApi } from "@/lib/mock-api";
import { useI18n } from "@/lib/i18n";

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
  onProtectSelect: (cell: GridCell) => void;
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
  mode, cells, protectedAreas, selectedCell, onCellSelect, onPaint, onProtectSelect,
  onChunksLoaded, onConnectionChange,
}: MapBoardProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const cellsRef = useRef(cells);
  const modeRef = useRef(mode);
  const handlersRef = useRef({ onCellSelect, onPaint, onProtectSelect, onChunksLoaded, onConnectionChange });
  const [zoom, setZoom] = useState(3.2);
  const [loading, setLoading] = useState(true);
  const [cursorCell, setCursorCell] = useState<GridCell | null>(null);

  useEffect(() => { cellsRef.current = cells; }, [cells]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => {
    handlersRef.current = { onCellSelect, onPaint, onProtectSelect, onChunksLoaded, onConnectionChange };
  }, [onCellSelect, onPaint, onProtectSelect, onChunksLoaded, onConnectionChange]);

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
            tiles: ["https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap © CARTO",
          },
        },
        layers: [
          { id: "background", type: "background", paint: { "background-color": "#07111f" } },
          { id: "base", type: "raster", source: "base", paint: { "raster-opacity": 0.92, "raster-saturation": -0.25 } },
        ],
      },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("pixels", { type: "geojson", data: EMPTY_COLLECTION });
      map.addLayer({ id: "pixel-fill", type: "fill", source: "pixels", paint: { "fill-color": ["get", "color"], "fill-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.7, 6, 0.94] } });
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
    });
    map.on("click", (event: MapMouseEvent) => {
      const base = lngLatToCell(event.lngLat.lng, event.lngLat.lat);
      const existing = cellsRef.current.get(`${base.x}:${base.y}`);
      const cell: GridCell = existing ?? { ...base, color: "#18283b" };
      handlersRef.current.onCellSelect(cell);
      if (map.getZoom() < MIN_PAINT_ZOOM || !worldPixelApi.isLandCell(cell.x, cell.y)) return;
      if (modeRef.current === "paint") handlersRef.current.onPaint(cell);
      if (modeRef.current === "protect") handlersRef.current.onProtectSelect(cell);
    });
    return () => {
      clearTimeout(debounce);
      unsubscribeRef.current?.();
      map.remove();
      mapRef.current = null;
    };
  }, [loadViewport]);

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
      {cursorCell && zoom >= MIN_PAINT_ZOOM && (
        <div className="coordinates" aria-hidden="true">{cursorCell.x}, {cursorCell.y}</div>
      )}
    </div>
  );
}
