import type { GridCell, MapBounds, ProtectedArea } from "./types";

export const CELL_SIZE = 0.5;
export const CHUNK_SIZE = 16;
export const MIN_PAINT_ZOOM = 5;

export function lngLatToCell(lng: number, lat: number): Pick<GridCell, "x" | "y" | "lng" | "lat"> {
  const x = Math.floor((lng + 180) / CELL_SIZE);
  const y = Math.floor((90 - lat) / CELL_SIZE);
  return { x, y, lng: x * CELL_SIZE - 180, lat: 90 - y * CELL_SIZE };
}

export function cellToBounds(x: number, y: number): MapBounds {
  const west = x * CELL_SIZE - 180;
  const north = 90 - y * CELL_SIZE;
  return { west, east: west + CELL_SIZE, north, south: north - CELL_SIZE };
}

export function getChunkId(x: number, y: number): string {
  return `chunk:${Math.floor(x / CHUNK_SIZE)}:${Math.floor(y / CHUNK_SIZE)}`;
}

export function alignProtectionOrigin(x: number, y: number) {
  return {
    originX: Math.floor(x / CHUNK_SIZE) * CHUNK_SIZE,
    originY: Math.floor(y / CHUNK_SIZE) * CHUNK_SIZE,
  };
}

export function isInsideProtection(cell: Pick<GridCell, "x" | "y">, area: ProtectedArea): boolean {
  return (
    area.status === "active" &&
    new Date(area.expiresAt).getTime() > Date.now() &&
    cell.x >= area.originX &&
    cell.x < area.originX + area.width &&
    cell.y >= area.originY &&
    cell.y < area.originY + area.height
  );
}

export function visibleChunkIds(bounds: MapBounds): string[] {
  const first = lngLatToCell(bounds.west, bounds.north);
  const last = lngLatToCell(bounds.east, bounds.south);
  const ids: string[] = [];
  for (let x = Math.floor(first.x / CHUNK_SIZE); x <= Math.floor(last.x / CHUNK_SIZE); x++) {
    for (let y = Math.floor(first.y / CHUNK_SIZE); y <= Math.floor(last.y / CHUNK_SIZE); y++) {
      ids.push(`chunk:${x}:${y}`);
    }
  }
  return ids;
}
