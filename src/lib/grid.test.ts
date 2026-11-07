import { describe, expect, it } from "vitest";
import { alignProtectionOrigin, cellToBounds, isInsideProtection, lngLatToCell } from "./grid";
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

  it("bloqueia somente células dentro de uma proteção ativa", () => {
    const area: ProtectedArea = { id: "a", originX: 16, originY: 32, width: 16, height: 16, ownerId: "u", ownerName: "U", status: "active", expiresAt: new Date(Date.now() + 10000).toISOString() };
    expect(isInsideProtection({ x: 20, y: 40 }, area)).toBe(true);
    expect(isInsideProtection({ x: 32, y: 40 }, area)).toBe(false);
  });
});
