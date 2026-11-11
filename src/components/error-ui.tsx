"use client";

import { AlertTriangle, Copy, RefreshCw, WifiOff } from "lucide-react";
import type { ErrorUiState } from "@/lib/error-ux";
import { useI18n } from "@/lib/i18n";

async function copyRequestId(requestId: string) { await navigator.clipboard.writeText(requestId); }

function SupportCode({ requestId }: { requestId?: string }) {
  const { t } = useI18n();
  if (!requestId) return null;
  return <div className="support-code"><span>{t("errorUi.supportCode", { requestId })}</span><button type="button" onClick={() => void copyRequestId(requestId)}><Copy size={14} /> {t("errorUi.copyCode")}</button></div>;
}

export function InlineFieldError({ id, message }: { id: string; message: string }) { return <p id={id} className="field-error" role="alert"><AlertTriangle size={14} /> {message}</p>; }

export function ActionError({ error, onRetry }: { error: ErrorUiState; onRetry?: () => void }) {
  const { t } = useI18n();
  if (error.surface === "silent") return null;
  return <div className="action-error" role="alert"><AlertTriangle size={18} /><div><strong>{t(error.titleKey)}</strong><p>{t(error.messageKey)}</p><SupportCode requestId={error.requestId} />{onRetry && error.retryable && <button type="button" onClick={onRetry}><RefreshCw size={14} /> {t("errorUi.retry")}</button>}</div></div>;
}

export function ErrorBanner({ error, onRetry }: { error: ErrorUiState; onRetry?: () => void }) {
  const { t } = useI18n();
  return <div className="error-banner" role="alert"><WifiOff size={18} /><div><strong>{t(error.titleKey)}</strong><span>{t(error.messageKey)}</span></div>{onRetry && <button type="button" onClick={onRetry}>{t("errorUi.retry")}</button>}<SupportCode requestId={error.requestId} /></div>;
}

export function FullPageError({ error, onRetry, onBack }: { error: ErrorUiState; onRetry?: () => void; onBack?: () => void }) {
  const { t } = useI18n();
  return <section className="full-page-error" role="alert"><AlertTriangle size={32} /><h1>{t(error.titleKey)}</h1><p>{t(error.messageKey)}</p><SupportCode requestId={error.requestId} /><div>{onBack && <button type="button" className="secondary-button" onClick={onBack}>{t("errorUi.back")}</button>}{onRetry && <button type="button" className="primary-button" onClick={onRetry}>{t("errorUi.retry")}</button>}</div></section>;
}

export function PaymentErrorPanel({ error, balance, cost, onRetry, onBuyCredits }: { error: ErrorUiState; balance?: number; cost?: number; onRetry?: () => void; onBuyCredits?: () => void }) {
  const { t } = useI18n();
  return <section className="payment-error-panel" role="alert"><AlertTriangle size={21} /><div><strong>{t(error.titleKey)}</strong><p>{t(error.messageKey)}</p>{balance !== undefined && <small>{t(cost !== undefined ? "errorUi.balanceCost" : "errorUi.balance", { balance, cost: cost ?? 0 })}</small>}<SupportCode requestId={error.requestId} /><div className="error-actions">{onBuyCredits && <button type="button" className="primary-button" onClick={onBuyCredits}>{t("errorUi.buyCredits")}</button>}{onRetry && error.retryable && <button type="button" className="secondary-button" onClick={onRetry}>{t("errorUi.retry")}</button>}</div></div></section>;
}
