import type { GridCell, MapBounds, ProtectedArea, ProtectionSelection } from "./types";

export const GRID_WIDTH = 65536;
export const GRID_HEIGHT = 32768;
export const CELL_WIDTH = 360 / GRID_WIDTH;
export const CELL_HEIGHT = 180 / GRID_HEIGHT;
export const CHUNK_SIZE = 64;
export const PROTECTION_SIZE = 16;
export const MIN_PAINT_ZOOM = 10;
export const MAX_PROTECTION_PIXELS = 256;

export function lngLatToCell(lng: number, lat: number): Pick<GridCell, "x" | "y" | "lng" | "lat"> {
  const x = Math.min(GRID_WIDTH - 1, Math.max(0, Math.floor(((lng + 180) / 360) * GRID_WIDTH)));
  const y = Math.min(GRID_HEIGHT - 1, Math.max(0, Math.floor(((90 - lat) / 180) * GRID_HEIGHT)));
  return { x, y, lng: x * CELL_WIDTH - 180, lat: 90 - y * CELL_HEIGHT };
}

export function cellToBounds(x: number, y: number): MapBounds {
  const west = x * CELL_WIDTH - 180;
  const north = 90 - y * CELL_HEIGHT;
  return { west, east: west + CELL_WIDTH, north, south: north - CELL_HEIGHT };
}

export function getChunkId(x: number, y: number): string {
  return `chunk:${Math.floor(x / CHUNK_SIZE)}:${Math.floor(y / CHUNK_SIZE)}`;
}

export function alignProtectionOrigin(x: number, y: number) {
  return {
    originX: Math.floor(x / PROTECTION_SIZE) * PROTECTION_SIZE,
    originY: Math.floor(y / PROTECTION_SIZE) * PROTECTION_SIZE,
  };
}

export function interpolateCellLine(
  start: Pick<GridCell, "x" | "y">,
  end: Pick<GridCell, "x" | "y">,
): Array<Pick<GridCell, "x" | "y">> {
  const cells: Array<Pick<GridCell, "x" | "y">> = [];
  let x = start.x;
  let y = start.y;
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const stepX = start.x < end.x ? 1 : -1;
  const stepY = start.y < end.y ? 1 : -1;
  let error = dx - dy;

  while (true) {
    cells.push({ x, y });
    if (x === end.x && y === end.y) break;
    const doubledError = error * 2;
    if (doubledError > -dy) { error -= dy; x += stepX; }
    if (doubledError < dx) { error += dx; y += stepY; }
  }

  return cells;
}

export function createProtectionSelection(
  start: Pick<GridCell, "x" | "y">,
  end: Pick<GridCell, "x" | "y"> = start,
  maxPixels = MAX_PROTECTION_PIXELS,
): ProtectionSelection {
  void end;
  void maxPixels;
  const { originX, originY } = alignProtectionOrigin(start.x, start.y);
  return { originX, originY, width: PROTECTION_SIZE, height: PROTECTION_SIZE, pixelCount: MAX_PROTECTION_PIXELS };
}

export function protectionAreasOverlap(
  first: Pick<ProtectedArea, "originX" | "originY" | "width" | "height">,
  second: Pick<ProtectedArea, "originX" | "originY" | "width" | "height">,
): boolean {
  return !(
    first.originX + first.width <= second.originX ||
    second.originX + second.width <= first.originX ||
    first.originY + first.height <= second.originY ||
    second.originY + second.height <= first.originY
  );
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
  const width = Math.floor(last.x / CHUNK_SIZE) - Math.floor(first.x / CHUNK_SIZE) + 1;
  const height = Math.floor(last.y / CHUNK_SIZE) - Math.floor(first.y / CHUNK_SIZE) + 1;
  if (width * height > 256) return ids;
  for (let x = Math.floor(first.x / CHUNK_SIZE); x <= Math.floor(last.x / CHUNK_SIZE); x++) {
    for (let y = Math.floor(first.y / CHUNK_SIZE); y <= Math.floor(last.y / CHUNK_SIZE); y++) {
      ids.push(`chunk:${x}:${y}`);
    }
  }
  return ids;
}
