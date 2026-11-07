import type { GridCell, MapBounds, ProtectedArea, ProtectionSelection } from "./types";

export const CELL_SIZE = 0.5;
export const CHUNK_SIZE = 16;
export const MIN_PAINT_ZOOM = 5;
export const MAX_PROTECTION_PIXELS = 256;

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
  end: Pick<GridCell, "x" | "y">,
  maxPixels = MAX_PROTECTION_PIXELS,
): ProtectionSelection {
  const directionX = end.x >= start.x ? 1 : -1;
  const directionY = end.y >= start.y ? 1 : -1;
  let width = Math.abs(end.x - start.x) + 1;
  let height = Math.abs(end.y - start.y) + 1;

  if (width * height > maxPixels) {
    const scale = Math.sqrt(maxPixels / (width * height));
    width = Math.max(1, Math.floor(width * scale));
    height = Math.max(1, Math.floor(height * scale));
    while (width * height > maxPixels) {
      if (width >= height) width -= 1;
      else height -= 1;
    }
  }

  const finalX = start.x + directionX * (width - 1);
  const finalY = start.y + directionY * (height - 1);
  const originX = Math.min(start.x, finalX);
  const originY = Math.min(start.y, finalY);
  return { originX, originY, width, height, pixelCount: width * height };
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
  for (let x = Math.floor(first.x / CHUNK_SIZE); x <= Math.floor(last.x / CHUNK_SIZE); x++) {
    for (let y = Math.floor(first.y / CHUNK_SIZE); y <= Math.floor(last.y / CHUNK_SIZE); y++) {
      ids.push(`chunk:${x}:${y}`);
    }
  }
  return ids;
}
