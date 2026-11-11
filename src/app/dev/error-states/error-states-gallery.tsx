"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ActionError, ErrorBanner, FullPageError, InlineFieldError, PaymentErrorPanel } from "@/components/error-ui";
import { toErrorUi, type ErrorSurface } from "@/lib/error-ux";
import { ApiError, type ApiErrorCode } from "@/lib/types";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const codes: ApiErrorCode[] = ["UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND", "VALIDATION_ERROR", "CELL_NOT_LAND", "INSUFFICIENT_CREDITS", "AREA_PROTECTED", "AREA_CONFLICT", "USERNAME_TAKEN", "IDEMPOTENCY_CONFLICT", "RATE_LIMITED", "PAYMENT_PROVIDER_UNAVAILABLE", "SERVICE_UNAVAILABLE", "INTERNAL_ERROR", "NETWORK_ERROR", "OFFLINE", "TIMEOUT"];
const surfaces: Array<{ value: ErrorSurface; label: TranslationKey }> = [
  { value: "inline", label: "gallery.surface.inline" }, { value: "action", label: "gallery.surface.action" }, { value: "banner", label: "gallery.surface.banner" },
  { value: "payment", label: "gallery.surface.payment" }, { value: "page", label: "gallery.surface.page" },
];

function simulatedError(code: ApiErrorCode) { return toErrorUi(new ApiError(code, "Mensagem interna não exibida", "demo-request-123", code === "INTERNAL_ERROR" ? 500 : undefined, true)); }

export function ErrorStatesGallery() {
  const { t } = useI18n();
  const [code, setCode] = useState<ApiErrorCode>("INTERNAL_ERROR");
  const recommended = useMemo(() => simulatedError(code), [code]);
  const [surface, setSurface] = useState<ErrorSurface>("action");
  const [preview, setPreview] = useState<{ code: ApiErrorCode; surface: ErrorSurface } | null>(null);
  const [interactions, setInteractions] = useState(0);
  const interact = () => setInteractions((value) => value + 1);
  const opened = useMemo(() => preview ? { ...simulatedError(preview.code), surface: preview.surface } : null, [preview]);
  const changeCode = (next: ApiErrorCode) => { setCode(next); const nextSurface = simulatedError(next).surface; setSurface(nextSurface === "silent" ? "action" : nextSurface); };

  return <main className="error-gallery">
    <header className="error-gallery-header"><div><span className="eyebrow">{t("gallery.eyebrow")}</span><h1>{t("gallery.title")}</h1><p>{t("gallery.description")}</p></div><Link href="/">{t("errorUi.back")}</Link></header>
    <section className="error-launcher" aria-label={t("gallery.configure")}>
      <div><label htmlFor="error-code">{t("gallery.code")}</label><select id="error-code" value={code} onChange={(event) => changeCode(event.target.value as ApiErrorCode)}>{codes.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div><label htmlFor="error-surface">{t("gallery.surface")}</label><select id="error-surface" value={surface} onChange={(event) => setSurface(event.target.value as ErrorSurface)}>{surfaces.map((item) => <option key={item.value} value={item.value}>{t(item.label)}</option>)}</select></div>
      <button type="button" className="primary-button" onClick={() => setPreview({ code, surface })}>{t("gallery.open")}</button>
      <small>{t("gallery.recommended", { surface: t(surfaces.find((item) => item.value === recommended.surface)?.label ?? "gallery.surface.action") })}</small>
    </section>
    <p className="error-gallery-counter" aria-live="polite">{t("gallery.interactions", { count: interactions })}</p>
    {!opened && <section className="error-gallery-empty"><strong>{t("gallery.emptyTitle")}</strong><p>{t("gallery.emptyText")}</p></section>}
    {opened && <section className={`error-preview error-preview-${opened.surface}`} aria-label={t("gallery.preview", { code: preview?.code ?? "" })}>
      <div className="error-preview-toolbar"><span><strong>{preview?.code}</strong> · {t(surfaces.find((item) => item.value === opened.surface)?.label ?? "gallery.surface.action")}</span><button type="button" onClick={() => setPreview(null)}>{t("gallery.close")}</button></div>
      <div className="error-preview-stage">
        {opened.surface === "banner" && <ErrorBanner error={opened} onRetry={interact} />}
        {opened.surface === "inline" && <div className="error-preview-form"><label htmlFor="demo-field">{t("gallery.exampleField")}</label><input id="demo-field" defaultValue={t("gallery.preservedValue")} aria-invalid="true" aria-describedby="demo-field-error" /><InlineFieldError id="demo-field-error" message={t(opened.messageKey)} /></div>}
        {opened.surface === "action" && <ActionError error={opened} onRetry={interact} />}
        {opened.surface === "payment" && <PaymentErrorPanel error={opened} balance={120} cost={256} onBuyCredits={interact} onRetry={interact} />}
        {opened.surface === "page" && <FullPageError error={opened} onRetry={interact} onBack={interact} />}
      </div>
    </section>}
  </main>;
}
