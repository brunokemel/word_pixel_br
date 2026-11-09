import { describe, expect, it } from "vitest";
import { COLOR_GROUPS, COLOR_PALETTE, colorGroupIdFor, colorIdToHex, hexToColorId } from "./palette";

describe("paleta da API", () => {
  it("mantém exatamente 32 cores com IDs estáveis", () => {
    expect(COLOR_PALETTE).toHaveLength(32);
    COLOR_PALETTE.forEach((color, id) => expect(hexToColorId(color)).toBe(id));
  });

  it("usa uma cor segura para IDs inválidos", () => {
    expect(colorIdToHex(99)).toBe(COLOR_PALETTE[0]);
  });

  it("organiza cada ID uma única vez em famílias de oito tons", () => {
    const groupedIds = COLOR_GROUPS.flatMap((group) => [...group.colorIds]);

    expect(COLOR_GROUPS.every((group) => group.colorIds.length === 8)).toBe(true);
    expect(new Set(groupedIds).size).toBe(COLOR_PALETTE.length);
    expect(groupedIds.toSorted((a, b) => a - b)).toEqual(COLOR_PALETTE.map((_, id) => id));
  });

  it("encontra a família da cor selecionada", () => {
    expect(colorGroupIdFor(COLOR_PALETTE[5])).toBe("warm");
    expect(colorGroupIdFor(COLOR_PALETTE[21])).toBe("nature");
    expect(colorGroupIdFor(COLOR_PALETTE[24])).toBe("cool");
  });
});
