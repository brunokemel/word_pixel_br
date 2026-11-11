import { describe, expect, it } from "vitest";
import { isValidEmail, isValidPassword, normalizeEmail, validateDisplayName } from "./auth";

describe("validação de autenticação e perfil", () => {
  it("normaliza e valida e-mail", () => {
    expect(normalizeEmail("  Pessoa@Exemplo.COM ")).toBe("pessoa@exemplo.com");
    expect(isValidEmail("pessoa@exemplo.com")).toBe(true);
    expect(isValidEmail("email-invalido")).toBe(false);
  });

  it("exige senha com pelo menos oito caracteres", () => {
    expect(isValidPassword("1234567")).toBe(false);
    expect(isValidPassword("12345678")).toBe(true);
  });

  it("aplica trim e limite de 1 a 40 caracteres ao nome", () => {
    expect(validateDisplayName("  Pixelista  ")).toBe("Pixelista");
    expect(validateDisplayName("   ")).toBeNull();
    expect(validateDisplayName("a".repeat(41))).toBeNull();
  });
});
