import { describe, expect, it } from "vitest";
import { toErrorUi } from "./error-ux";
import { ApiError, type ApiErrorCode } from "./types";
import { translate } from "./i18n";

describe("toErrorUi", () => {
  it.each<[ApiErrorCode, string]>([
    ["UNAUTHENTICATED", "Sua sessão expirou"], ["FORBIDDEN", "não tem permissão"], ["NOT_FOUND", "não está mais disponível"],
    ["VALIDATION_ERROR", "Revise os dados"], ["CELL_NOT_LAND", "áreas terrestres"], ["INSUFFICIENT_CREDITS", "saldo"],
    ["AREA_PROTECTED", "protegida por outro"], ["AREA_CONFLICT", "reservada"], ["USERNAME_TAKEN", "já está em uso"],
    ["IDEMPOTENCY_CONFLICT", "mudou"], ["RATE_LIMITED", "Muitas tentativas"], ["PAYMENT_PROVIDER_UNAVAILABLE", "dados foram preservados"],
    ["SERVICE_UNAVAILABLE", "instabilidade"], ["INTERNAL_ERROR", "concluir"], ["OFFLINE", "sem conexão"], ["TIMEOUT", "demorou"],
  ])("mapeia %s sem expor a mensagem crua", (code, expected) => {
    const result = toErrorUi(new ApiError(code, "segredo interno", "request-id", 500));
    expect(translate("pt", result.messageKey)).toContain(expected);
    expect(translate("en", result.messageKey)).not.toBe(translate("pt", result.messageKey));
    expect(translate("es", result.messageKey)).not.toBe(translate("pt", result.messageKey));
    expect(result.requestId).toBe("request-id");
  });

  it("direciona username para erro inline e cancelamento para silêncio", () => {
    expect(toErrorUi(new ApiError("USERNAME_TAKEN", "raw"))).toMatchObject({ field: "username", surface: "inline" });
    expect(toErrorUi(new ApiError("CANCELED", "raw"))).toMatchObject({ surface: "silent" });
  });
});
