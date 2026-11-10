import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, normalizeOtp, validateDisplayName } from "./auth";

describe("validação de autenticação e perfil", () => {
  it("normaliza e valida e-mail", () => {
    expect(normalizeEmail("  Pessoa@Exemplo.COM ")).toBe("pessoa@exemplo.com");
    expect(isValidEmail("pessoa@exemplo.com")).toBe(true);
    expect(isValidEmail("email-invalido")).toBe(false);
  });

  it("aceita apenas os seis primeiros dígitos do OTP", () => {
    expect(normalizeOtp("12 34-567")).toBe("123456");
  });

  it("aplica trim e limite de 1 a 40 caracteres ao nome", () => {
    expect(validateDisplayName("  Pixelista  ")).toBe("Pixelista");
    expect(validateDisplayName("   ")).toBeNull();
    expect(validateDisplayName("a".repeat(41))).toBeNull();
  });
});
