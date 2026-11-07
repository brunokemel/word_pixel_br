import { describe, expect, it } from "vitest";
import { alignProtectionOrigin, cellToBounds, createProtectionSelection, interpolateCellLine, isInsideProtection, lngLatToCell, protectionAreasOverlap } from "./grid";
import type { ProtectedArea } from "./types";

describe("grade geográfica", () => {
  it("converte longitude/latitude e preserva os limites da célula", () => {
    const cell = lngLatToCell(-46.63, -23.55);
    const bounds = cellToBounds(cell.x, cell.y);
    expect(-46.63).toBeGreaterThanOrEqual(bounds.west);
    expect(-46.63).toBeLessThan(bounds.east);
    expect(-23.55).toBeGreaterThan(bounds.south);
    expect(-23.55).toBeLessThanOrEqual(bounds.north);
  });

  it("alinha seleções ao bloco 16×16", () => {
    expect(alignProtectionOrigin(277, 211)).toEqual({ originX: 272, originY: 208 });
  });

  it("interpola um traço contínuo sem deixar buracos", () => {
    expect(interpolateCellLine({ x: 2, y: 3 }, { x: 6, y: 5 })).toEqual([
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 5 },
    ]);
  });

  it("limita uma seleção retangular a 256 pixels preservando a direção", () => {
    const selection = createProtectionSelection({ x: 100, y: 100 }, { x: 140, y: 130 });
    expect(selection.pixelCount).toBeLessThanOrEqual(256);
    expect(selection.originX).toBe(100);
    expect(selection.originY).toBe(100);
  });

  it("detecta sobreposição entre áreas retangulares", () => {
    const first = { originX: 10, originY: 10, width: 5, height: 5 };
    expect(protectionAreasOverlap(first, { originX: 14, originY: 14, width: 3, height: 3 })).toBe(true);
    expect(protectionAreasOverlap(first, { originX: 15, originY: 10, width: 3, height: 3 })).toBe(false);
  });

  it("bloqueia somente células dentro de uma proteção ativa", () => {
    const area: ProtectedArea = { id: "a", originX: 16, originY: 32, width: 16, height: 16, ownerId: "u", ownerName: "U", status: "active", expiresAt: new Date(Date.now() + 10000).toISOString() };
    expect(isInsideProtection({ x: 20, y: 40 }, area)).toBe(true);
    expect(isInsideProtection({ x: 32, y: 40 }, area)).toBe(false);
  });
});
