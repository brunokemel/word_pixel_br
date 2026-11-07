import { beforeEach, describe, expect, it } from "vitest";
import { MockWorldPixelApi } from "./mock-api";
import { ApiError } from "./types";

describe("MockWorldPixelApi", () => {
  let api: MockWorldPixelApi;
  beforeEach(() => { api = new MockWorldPixelApi(); });

  it("exige autenticação para pintar", async () => {
    await expect(api.paintPixel({ cellX: 270, cellY: 190, color: "#fff", idempotencyKey: "1" })).rejects.toBeInstanceOf(ApiError);
  });

  it("persiste pintura depois do login", async () => {
    await api.signIn("artista@world.test");
    const result = await api.paintPixel({ cellX: 270, cellY: 190, color: "#ff4f87", idempotencyKey: "2" });
    expect(result.color).toBe("#ff4f87");
    expect(result.authorName).toBe("artista");
  });

  it("calcula uma cotação proporcional para a área selecionada", async () => {
    await api.signIn("artista@world.test");
    const quote = await api.quoteProtection({ originX: 270, originY: 190, width: 4, height: 3, pixelCount: 12 });
    expect(quote.pixelCount).toBe(12);
    expect(quote.priceInCents).toBe(12);
  });

  it("rejeita seleção acima de 256 pixels", async () => {
    await api.signIn("artista@world.test");
    await expect(api.quoteProtection({ originX: 270, originY: 190, width: 17, height: 16, pixelCount: 272 })).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
