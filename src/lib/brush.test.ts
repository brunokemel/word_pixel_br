import { describe, expect, it } from "vitest";
import { densifyBrushPoints, distanceBetween } from "./brush";

describe("pincel vetorial", () => {
  it("interpola movimentos rápidos sem deixar gaps maiores que o limite", () => {
    const points = densifyBrushPoints([{ x: 0, y: 0 }, { x: 25, y: 0 }], 3);
    for (let index = 1; index < points.length; index += 1) {
      expect(distanceBetween(points[index - 1], points[index])).toBeLessThanOrEqual(3);
    }
    expect(points.at(-1)).toEqual({ x: 25, y: 0 });
  });

  it("preserva os extremos durante a interpolação", () => {
    const points = densifyBrushPoints([{ x: 4, y: 7 }, { x: 10, y: 13 }]);
    expect(points[0]).toEqual({ x: 4, y: 7 });
    expect(points.at(-1)).toEqual({ x: 10, y: 13 });
  });
});
