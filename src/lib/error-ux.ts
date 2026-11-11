import { ApiError, type ApiErrorCode } from "./types";
import type { TranslationKey } from "./i18n";

export type ErrorSurface = "inline" | "action" | "banner" | "page" | "payment" | "silent";

export interface ErrorUiState {
  code: ApiErrorCode;
  titleKey: TranslationKey;
  messageKey: TranslationKey;
  surface: ErrorSurface;
  retryable: boolean;
  requestId?: string;
  field?: "username" | "avatar";
}

const messages: Record<ApiErrorCode, Pick<ErrorUiState, "titleKey" | "messageKey" | "surface">> = Object.fromEntries([
  "UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND", "VALIDATION_ERROR", "CELL_NOT_LAND", "INSUFFICIENT_CREDITS", "AREA_PROTECTED", "AREA_CONFLICT", "USERNAME_TAKEN", "IDEMPOTENCY_CONFLICT", "RATE_LIMITED", "PAYMENT_PROVIDER_UNAVAILABLE", "SERVICE_UNAVAILABLE", "INTERNAL_ERROR", "NETWORK_ERROR", "OFFLINE", "TIMEOUT", "CANCELED", "CONFIGURATION_ERROR",
].map((code) => [code, { titleKey: `errorUx.${code}.title`, messageKey: `errorUx.${code}.message`, surface: ({ NOT_FOUND: "page", VALIDATION_ERROR: "inline", USERNAME_TAKEN: "inline", INSUFFICIENT_CREDITS: "payment", PAYMENT_PROVIDER_UNAVAILABLE: "payment", SERVICE_UNAVAILABLE: "banner", NETWORK_ERROR: "banner", OFFLINE: "banner", CONFIGURATION_ERROR: "banner", CANCELED: "silent" } as Record<string, ErrorSurface>)[code] ?? "action" }])) as Record<ApiErrorCode, Pick<ErrorUiState, "titleKey" | "messageKey" | "surface">>;

export function toErrorUi(error: unknown, context: { field?: "username" | "avatar"; page?: boolean; payment?: boolean } = {}): ErrorUiState {
  const apiError = error instanceof ApiError ? error : new ApiError("INTERNAL_ERROR", "Unexpected error");
  const base = messages[apiError.code];
  const field = apiError.code === "USERNAME_TAKEN" ? "username" : context.field;
  const surface = context.payment ? "payment" : context.page ? "page" : field ? "inline" : base.surface;
  return { code: apiError.code, titleKey: base.titleKey, messageKey: base.messageKey, surface, retryable: apiError.retryable || ["SERVICE_UNAVAILABLE", "NETWORK_ERROR", "OFFLINE"].includes(apiError.code), requestId: apiError.requestId, field };
}
