// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toErrorUi } from "@/lib/error-ux";
import { ApiError } from "@/lib/types";
import { ActionError, ErrorBanner, FullPageError, InlineFieldError, PaymentErrorPanel } from "./error-ui";
import { I18nProvider } from "@/lib/i18n";

afterEach(cleanup);

describe("componentes de erro", () => {
  it("usa alert, texto e retry sem depender apenas de cor", () => {
    const retry = vi.fn();
    render(<I18nProvider><ErrorBanner error={toErrorUi(new ApiError("SERVICE_UNAVAILABLE", "raw", undefined, 503, true))} onRetry={retry} /></I18nProvider>);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("renderiza os cinco estados reutilizáveis", () => {
    const action = toErrorUi(new ApiError("INTERNAL_ERROR", "raw", "support-123", 500));
    const { rerender } = render(<I18nProvider><InlineFieldError id="field-error" message="Campo inválido" /></I18nProvider>);
    expect(screen.getByText("Campo inválido")).toBeTruthy();
    rerender(<I18nProvider><ActionError error={action} /></I18nProvider>); expect(screen.getByText(/support-123/)).toBeTruthy();
    rerender(<I18nProvider><FullPageError error={toErrorUi(new ApiError("NOT_FOUND", "raw"), { page: true })} /></I18nProvider>); expect(screen.getByText("Conteúdo indisponível")).toBeTruthy();
    rerender(<I18nProvider><PaymentErrorPanel error={toErrorUi(new ApiError("INSUFFICIENT_CREDITS", "raw"))} balance={2} cost={5} /></I18nProvider>); expect(screen.getByText(/Saldo: 2/)).toBeTruthy();
  });
});
