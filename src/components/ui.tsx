"use client";

import Image from "next/image";
import Link from "next/link";
import { Brush, Compass, Flag, Globe2, HelpCircle, LockKeyhole, LogIn, LogOut, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { GridCell, ProtectionQuote, ToolMode, UserProfile } from "@/lib/types";
import { localeLabels, type Locale, useI18n } from "@/lib/i18n";
import { COLOR_GROUPS, COLOR_PALETTE, colorGroupIdFor, type ColorGroupId } from "@/lib/palette";
import { isValidEmail, isValidPassword, normalizeEmail, validateDisplayName } from "@/lib/auth";
import { reportCategories, type ReportCategory, validateReport } from "@/lib/reports";
import { ApiError } from "@/lib/types";
import logoMaior from "@/logo/logoMaior.png";

export function Header({ profile, balance, authReady, onLogin, onProfile, onLogout, onHelp }: {
  profile: UserProfile | null; balance: number; authReady: boolean; onLogin: () => void; onProfile: () => void; onLogout: () => void; onHelp: () => void;
}) {
  const { locale, setLocale, t } = useI18n();
  return (
    <header className="topbar">
      <div className="brand"><Image className="brand-logo" src={logoMaior} alt="World Pixel" priority /></div>
      <div className="topbar-actions">
        <div className="live-pill"><span /> {t("header.live")}</div>
        <label className="language-select" aria-label={t("language.label")}><Globe2 size={16} /><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>{Object.entries(localeLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
        <button className="icon-button" onClick={onHelp} aria-label={t("header.help")}><HelpCircle size={19} /></button>
        <div className="balance"><Wallet size={17} /><span><small>{t("header.balance")}</small> {balance.toLocaleString(locale)}</span></div>
        {!authReady ? <div className="auth-placeholder" aria-hidden="true" /> : profile ? (
          <><button className="profile-button" onClick={onProfile} title={t("profile.edit")}><span>{profile.displayName.slice(0, 1).toUpperCase()}</span><b>{profile.displayName}</b></button><button className="icon-button logout-button" onClick={onLogout} aria-label={t("header.logout")}><LogOut size={16} /></button></>
        ) : (
          <button className="primary-button compact" onClick={onLogin}><LogIn size={17} /><span className="button-label">{t("header.login")}</span></button>
        )}
      </div>
    </header>
  );
}

export function ToolDock({ mode, onMode, color, onColor }: { mode: ToolMode; onMode: (mode: ToolMode) => void; color: string; onColor: (color: string) => void }) {
  const { t } = useI18n();
  const [activeColorGroup, setActiveColorGroup] = useState<ColorGroupId>(() => colorGroupIdFor(color));
  const activeGroup = COLOR_GROUPS.find((group) => group.id === activeColorGroup) ?? COLOR_GROUPS[0];
  const selectColor = (nextColor: string) => {
    setActiveColorGroup(colorGroupIdFor(nextColor));
    onColor(nextColor.toLowerCase());
    onMode("paint");
  };
  const tools: { id: ToolMode; label: string; icon: ReactNode }[] = [
    { id: "navigate", label: t("tools.navigate"), icon: <Compass size={19} /> },
    { id: "paint", label: t("tools.paint"), icon: <Brush size={19} /> },
    { id: "protect", label: t("tools.protect"), icon: <LockKeyhole size={19} /> },
  ];
  return (
    <div className="tool-dock" aria-label={t("tools.label")}>
      <div className="tool-tabs">
        {tools.map((tool) => <button key={tool.id} className={mode === tool.id ? "active" : ""} onClick={() => onMode(tool.id)} aria-pressed={mode === tool.id}>{tool.icon}<span>{tool.label}</span></button>)}
      </div>
      <div className={`palette-panel ${mode !== "paint" ? "muted" : ""}`}>
        <div className="tone-tabs" role="tablist" aria-label={t("palette.groups")}>
          {COLOR_GROUPS.map((group) => (
            <button key={group.id} type="button" role="tab" aria-selected={activeColorGroup === group.id} className={activeColorGroup === group.id ? "active" : ""} onClick={() => setActiveColorGroup(group.id)}>
              {t(`palette.group.${group.id}`)}
            </button>
          ))}
        </div>
        <div className="palette" role="tabpanel" aria-label={`${t("palette.label")} — ${t(`palette.group.${activeGroup.id}`)}`}>
          {activeGroup.colorIds.map((colorId) => {
            const item = COLOR_PALETTE[colorId];
            return <button key={colorId} aria-label={t("palette.select", { color: item })} aria-pressed={color === item} onClick={() => selectColor(item)} style={{ "--swatch": item } as CSSProperties} className={color === item ? "selected" : ""} />;
          })}
        </div>
      </div>
    </div>
  );
}

export function CellCard({ cell, onClose, onReport }: { cell: GridCell; onClose: () => void; onReport: () => void }) {
  const { t } = useI18n();
  const [openedAt] = useState(() => Date.now());
  const protectedDays = cell.protectedUntil ? Math.max(1, Math.ceil((new Date(cell.protectedUntil).getTime() - openedAt) / 86400000)) : null;
  return (
    <aside className="cell-card" aria-label={t("cell.label")}>
      <button className="close-button" onClick={onClose} aria-label={t("cell.close")}><X size={17} /></button>
      <span className="eyebrow">{t("cell.selected")}</span>
      <div className="cell-title"><i style={{ background: cell.color }} /><strong>{cell.x} · {cell.y}</strong></div>
      <dl><div><dt>{t("cell.lastPaint")}</dt><dd>{cell.authorName ?? t("cell.unpainted")}</dd></div><div><dt>{t("cell.coordinate")}</dt><dd>{cell.lat.toFixed(2)}°, {cell.lng.toFixed(2)}°</dd></div></dl>
      {cell.protectedBy && <div className="protected-note"><LockKeyhole size={16} /><span>{t("cell.protectedBy")} <strong>{cell.protectedBy}</strong><small>{t("cell.daysRemaining", { days: protectedDays ?? 0 })}</small></span></div>}
      <button className="report-button" onClick={onReport}><Flag size={15} /> {t("cell.report")}</button>
    </aside>
  );
}

export function Modal({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const autofocus = dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>("button, select, textarea, input");
    (autofocus ?? firstFocusable ?? dialogRef.current)?.focus();
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => { document.removeEventListener("keydown", handleEscape); previousFocus?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section ref={dialogRef} className="modal-card" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label={t("modal.close")}><X size={19} /></button>{children}</section></div>;
}

export function ReportModal({ cell, submitting, submitError, onClose, onSubmit }: {
  cell: GridCell;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (category: ReportCategory, reason: string) => void;
}) {
  const { t } = useI18n();
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [reason, setReason] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validateReport(category, reason);
    setCategoryError(!validation.categoryValid);
    setReasonError(!validation.reasonValid);
    if (!validation.categoryValid || !validation.reasonValid || !category) return;
    onSubmit(category, validation.trimmedReason);
  };
  return <Modal onClose={onClose} label={t("report.label")}>
    <div className="modal-icon pink"><Flag size={24} /></div>
    <span className="eyebrow">{t("report.eyebrow")}</span>
    <h2>{t("report.title")}</h2>
    <p>{t("report.description")}</p>
    <div className="report-target" aria-label={`${cell.x}:${cell.y}`}>{cell.x}:{cell.y}</div>
    <form className="report-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="report-category">{t("report.category")}</label>
      <select id="report-category" name="category" value={category} data-autofocus required aria-required="true" aria-invalid={categoryError} aria-describedby={categoryError ? "report-category-error" : undefined} onChange={(event) => { setCategory(event.target.value as ReportCategory | ""); setCategoryError(false); }} disabled={submitting}>
        <option value="">{t("report.categoryPlaceholder")}</option>
        {reportCategories.map((item) => <option key={item.value} value={item.value}>{t(item.labelKey)}</option>)}
      </select>
      {categoryError && <p id="report-category-error" className="field-error">{t("report.error.category")}</p>}
      <label htmlFor="report-reason">{t("report.reason")}</label>
      <textarea id="report-reason" name="reason" value={reason} minLength={3} maxLength={500} rows={5} required aria-required="true" placeholder={t("report.reasonPlaceholder")} aria-invalid={reasonError} aria-describedby={reasonError ? "report-reason-error report-counter" : "report-counter"} onChange={(event) => { setReason(event.target.value); setReasonError(false); }} disabled={submitting} />
      <div id="report-counter" className="character-counter">{t("report.counter", { count: reason.length })}</div>
      {reasonError && <p id="report-reason-error" className="field-error">{t("report.error.reason")}</p>}
      {submitError && <div className="inline-error" role="alert">{submitError}</div>}
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>{t("report.cancel")}</button>
        <button type="submit" className="primary-button" disabled={submitting}>{submitting ? <><span className="spinner" /> {t("report.submitting")}</> : submitError ? t("report.retry") : t("report.submit")}</button>
      </div>
    </form>
  </Modal>;
}

export function LoginModal({ onClose, onSignIn, onSignUp, onRequestPasswordReset }: {
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<boolean>;
  onRequestPasswordReset: (email: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "signup" | "recovery">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const busyRef = useRef(false);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);
  const authError = (caught: unknown) => {
    if (caught instanceof ApiError && caught.code === "RATE_LIMITED") return t("login.error.rateLimit");
    if (caught instanceof ApiError && caught.code === "NETWORK_ERROR") return t("login.error.network");
    return mode === "login" ? t("login.error.credentials") : t("login.error.generic");
  };
  const submitCredentials = async () => {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) { setError(t("login.error.email")); return; }
    if (!isValidPassword(password)) { setError(t("login.error.password")); return; }
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true); setError(null);
    try {
      if (mode === "login") await onSignIn(normalized, password);
      else {
        const authenticated = await onSignUp(normalized, password);
        if (!authenticated) { setMessage(t("login.signupConfirmation")); return; }
      }
      onClose();
    }
    catch (caught) { setError(authError(caught)); }
    finally { busyRef.current = false; setLoading(false); }
  };
  const requestRecovery = async () => {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) { setError(t("login.error.email")); return; }
    if (busyRef.current || seconds > 0) return;
    busyRef.current = true;
    setLoading(true); setError(null);
    try { await onRequestPasswordReset(normalized); setMessage(t("login.recoverySent")); setSeconds(60); }
    catch (caught) { setError(authError(caught)); }
    finally { busyRef.current = false; setLoading(false); }
  };
  const switchMode = (next: typeof mode) => { setMode(next); setPassword(""); setError(null); setMessage(null); };
  return <Modal onClose={onClose} label={t("login.label")}><div className="modal-icon pink"><Brush size={24} /></div><span className="eyebrow">{t("login.eyebrow")}</span><h2>{t(`login.${mode}Title`)}</h2><p>{t(`login.${mode}Description`)}</p><form onSubmit={(event) => { event.preventDefault(); void (mode === "recovery" ? requestRecovery() : submitCredentials()); }}><label htmlFor="email">{t("login.email")}</label><input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("login.placeholder")} required data-autofocus aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} />{mode !== "recovery" && <><label htmlFor="password">{t("login.password")}</label><input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></>}<button className="primary-button wide" disabled={loading || (mode === "recovery" && seconds > 0)}>{loading ? t("login.loading") : mode === "login" ? t("login.signIn") : mode === "signup" ? t("login.signUp") : seconds > 0 ? t("login.resendIn", { seconds }) : t("login.recover")}</button></form>{error && <p id="login-error" className="inline-error" role="alert" aria-live="polite">{error}</p>}{message && <p className="inline-success" role="status" aria-live="polite">{message}</p>}<div className="login-secondary-actions">{mode !== "login" && <button type="button" className="text-button" onClick={() => switchMode("login")}>{t("login.haveAccount")}</button>}{mode === "login" && <><button type="button" className="text-button" onClick={() => switchMode("signup")}>{t("login.createAccount")}</button><button type="button" className="text-button" onClick={() => switchMode("recovery")}>{t("login.forgotPassword")}</button></>}</div><small className="fine-print">{t("login.passwordHint")}</small></Modal>;
}

export function ResetPasswordModal({ onSave }: { onSave: (password: string) => Promise<void> }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <Modal onClose={() => undefined} label={t("login.resetTitle")}><div className="modal-icon pink"><LockKeyhole size={24} /></div><h2>{t("login.resetTitle")}</h2><p>{t("login.resetDescription")}</p><form onSubmit={(event) => { event.preventDefault(); if (!isValidPassword(password)) { setError(t("login.error.password")); return; } if (password !== confirmation) { setError(t("login.error.passwordMatch")); return; } setLoading(true); setError(null); void onSave(password).catch(() => setError(t("login.error.generic"))).finally(() => setLoading(false)); }}><label htmlFor="new-password">{t("login.newPassword")}</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} data-autofocus required /><label htmlFor="confirm-password">{t("login.confirmPassword")}</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />{error && <p className="inline-error" role="alert">{error}</p>}<button className="primary-button wide" disabled={loading}>{loading ? t("login.savingPassword") : t("login.savePassword")}</button></form></Modal>;
}

export function ProfileModal({ profile, required, saving, error, onClose, onSave }: { profile: UserProfile; required: boolean; saving: boolean; error: string | null; onClose: () => void; onSave: (displayName: string) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState(profile.displayName.startsWith("Artista-") ? "" : profile.displayName);
  const [fieldError, setFieldError] = useState<string | null>(null);
  return <Modal onClose={required ? () => undefined : onClose} label={required ? t("profile.onboardingLabel") : t("profile.edit")}><span className="eyebrow">{t("profile.eyebrow")}</span><h2>{required ? t("profile.onboardingTitle") : t("profile.editTitle")}</h2><p>{t("profile.description")}</p><form onSubmit={(event) => { event.preventDefault(); const normalized = validateDisplayName(name); if (!normalized) { setFieldError(t("profile.error.name")); return; } setFieldError(null); onSave(normalized); }}><label htmlFor="display-name">{t("profile.name")}</label><input id="display-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} autoFocus aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? "profile-name-error" : undefined} />{fieldError && <p id="profile-name-error" className="field-error">{fieldError}</p>}{error && <p className="inline-error" role="alert">{error}</p>}<div className="modal-actions">{!required && <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>{t("report.cancel")}</button>}<button className="primary-button" disabled={saving}>{saving ? t("profile.saving") : t("profile.save")}</button></div></form></Modal>;
}

export function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return <Modal onClose={onClose} label={t("help.label")}><span className="eyebrow">{t("help.eyebrow")}</span><h2>{t("help.title")}</h2><div className="steps"><div><b>01</b><span><strong>{t("help.zoomTitle")}</strong><small>{t("help.zoomText")}</small></span></div><div><b>02</b><span><strong>{t("help.paintTitle")}</strong><small>{t("help.paintText")}</small></span></div><div><b>03</b><span><strong>{t("help.protectTitle")}</strong><small>{t("help.protectText")}</small></span></div></div><div className="rules"><strong>{t("help.rulesTitle")}</strong><p>{t("help.rulesText")}</p></div><Link className="institutional-link" href="/sobre">Sobre, termos, privacidade e regras</Link></Modal>;
}

export function ProtectionModal({ quote, status, onClose, onConfirm }: { quote: ProtectionQuote; status: "review" | "pending" | "confirmed" | "error"; onClose: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  return <Modal onClose={onClose} label={t("protection.label")}>
    {status === "confirmed" ? <><div className="modal-icon green"><LockKeyhole size={24} /></div><span className="eyebrow">{t("protection.confirmedEyebrow")}</span><h2>{t("protection.confirmedTitle")}</h2><p>{t("protection.confirmedText")}</p><button className="primary-button wide" onClick={onClose}>{t("protection.back")}</button></> : <>
      <div className="modal-icon yellow"><LockKeyhole size={24} /></div><span className="eyebrow">{t("protection.eyebrow")}</span><h2>{t("protection.title")}</h2><p>{t("protection.description")}</p>
      <div className="purchase-summary"><div><small>{t("protection.area")}</small><strong>{t("protection.pixels", { width: quote.width, height: quote.height, count: quote.pixelCount })}</strong></div><div><small>{t("protection.duration")}</small><strong>{t("protection.days")}</strong></div><div><small>{t("protection.coordinate")}</small><strong>{quote.originX} · {quote.originY}</strong></div><div className="price"><small>{t("protection.total")}</small><strong>{quote.priceCredits} créditos</strong></div></div>
      {status === "error" && <div className="inline-error">{t("protection.error")}</div>}
      <button className="primary-button wide" onClick={onConfirm} disabled={status === "pending"}>{status === "pending" ? t("protection.processing") : t("protection.confirm")}</button>
    </>}
  </Modal>;
}
