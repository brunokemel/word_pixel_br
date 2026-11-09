import { describe, expect, it } from "vitest";
import { COLOR_PALETTE, colorIdToHex, hexToColorId } from "./palette";

describe("paleta da API", () => {
  it("mantém exatamente 32 cores com IDs estáveis", () => {
    expect(COLOR_PALETTE).toHaveLength(32);
    COLOR_PALETTE.forEach((color, id) => expect(hexToColorId(color)).toBe(id));
  });

  it("usa uma cor segura para IDs inválidos", () => {
    expect(colorIdToHex(99)).toBe(COLOR_PALETTE[0]);
  });
});
