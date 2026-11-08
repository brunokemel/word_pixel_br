"use client";

import { Brush, Compass, Globe2, HelpCircle, LockKeyhole, LogIn, LogOut, Map, Palette as PaletteIcon, Pipette, Wallet, X } from "lucide-react";
import { useRef, type CSSProperties, type ReactNode } from "react";
import type { GridCell, ProtectionQuote, ToolMode, UserProfile } from "@/lib/types";
import { localeLabels, type Locale, useI18n } from "@/lib/i18n";

export const COLORS = ["#f6f3ea", "#ffc857", "#ff7b54", "#ff4f87", "#a86bff", "#5f8cff", "#28c9d8", "#37d6a3", "#17283a", "#0a111c"];

interface EyeDropperResult { sRGBHex: string; }
interface EyeDropperInstance { open: () => Promise<EyeDropperResult>; }
type EyeDropperConstructor = new () => EyeDropperInstance;

export function Header({ profile, balance, onLogin, onLogout, onHelp }: {
  profile: UserProfile | null; balance: number; onLogin: () => void; onLogout: () => void; onHelp: () => void;
}) {
  const { locale, setLocale, t, formatCurrency } = useI18n();
  return (
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Map size={19} /></span><span>WORLD<strong>PIXEL</strong></span><em>beta</em></div>
      <div className="topbar-actions">
        <div className="live-pill"><span /> {t("header.live")}</div>
        <label className="language-select" aria-label={t("language.label")}><Globe2 size={16} /><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>{Object.entries(localeLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
        <button className="icon-button" onClick={onHelp} aria-label={t("header.help")}><HelpCircle size={19} /></button>
        <div className="balance"><Wallet size={17} /><span><small>{t("header.balance")}</small> {formatCurrency(balance)}</span></div>
        {profile ? (
          <button className="profile-button" onClick={onLogout} title={t("header.logout")}><span>{profile.displayName.slice(0, 1).toUpperCase()}</span><b>{profile.displayName}</b><LogOut size={16} /></button>
        ) : (
          <button className="primary-button compact" onClick={onLogin}><LogIn size={17} /> {t("header.login")}</button>
        )}
      </div>
    </header>
  );
}

export function ToolDock({ mode, onMode, color, onColor }: { mode: ToolMode; onMode: (mode: ToolMode) => void; color: string; onColor: (color: string) => void }) {
  const { t } = useI18n();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const selectColor = (nextColor: string) => { onColor(nextColor.toLowerCase()); onMode("paint"); };
  const pickScreenColor = async () => {
    const EyeDropper = (window as typeof window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!EyeDropper) { colorInputRef.current?.click(); return; }
    try {
      const result = await new EyeDropper().open();
      selectColor(result.sRGBHex);
    } catch {
      // O usuário pode cancelar o conta-gotas sem alterar a cor atual.
    }
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
      <div className={`palette ${mode !== "paint" ? "muted" : ""}`} aria-label={t("palette.label")}>
        {COLORS.map((item) => <button key={item} aria-label={t("palette.select", { color: item })} aria-pressed={color === item} onClick={() => selectColor(item)} style={{ "--swatch": item } as CSSProperties} className={color === item ? "selected" : ""} />)}
        <label className={`color-tool custom-color ${!COLORS.includes(color) ? "selected" : ""}`} aria-label={t("palette.custom")} title={t("palette.custom")}>
          <PaletteIcon size={13} />
          <input ref={colorInputRef} type="color" value={color} onChange={(event) => selectColor(event.target.value)} />
        </label>
        <button className="color-tool eyedropper" aria-label={t("palette.eyedropper")} title={t("palette.eyedropper")} onClick={() => void pickScreenColor()}><Pipette size={13} /></button>
      </div>
    </div>
  );
}

export function CellCard({ cell, onClose }: { cell: GridCell; onClose: () => void }) {
  const { t } = useI18n();
  const protectedDays = cell.protectedUntil ? Math.max(1, Math.ceil((new Date(cell.protectedUntil).getTime() - Date.now()) / 86400000)) : null;
  return (
    <aside className="cell-card" aria-label={t("cell.label")}>
      <button className="close-button" onClick={onClose} aria-label={t("cell.close")}><X size={17} /></button>
      <span className="eyebrow">{t("cell.selected")}</span>
      <div className="cell-title"><i style={{ background: cell.color }} /><strong>{cell.x} · {cell.y}</strong></div>
      <dl><div><dt>{t("cell.lastPaint")}</dt><dd>{cell.authorName ?? t("cell.unpainted")}</dd></div><div><dt>{t("cell.coordinate")}</dt><dd>{cell.lat.toFixed(2)}°, {cell.lng.toFixed(2)}°</dd></div></dl>
      {cell.protectedBy && <div className="protected-note"><LockKeyhole size={16} /><span>{t("cell.protectedBy")} <strong>{cell.protectedBy}</strong><small>{t("cell.daysRemaining", { days: protectedDays ?? 0 })}</small></span></div>}
    </aside>
  );
}

export function Modal({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const { t } = useI18n();
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label={t("modal.close")}><X size={19} /></button>{children}</section></div>;
}

export function LoginModal({ onClose, onSubmit, loading }: { onClose: () => void; onSubmit: (email: string) => void; loading: boolean }) {
  const { t } = useI18n();
  return <Modal onClose={onClose} label={t("login.label")}><div className="modal-icon pink"><Brush size={24} /></div><span className="eyebrow">{t("login.eyebrow")}</span><h2>{t("login.title")}</h2><p>{t("login.description")}</p><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit(String(data.get("email"))); }}><label htmlFor="email">{t("login.email")}</label><input id="email" name="email" type="email" placeholder={t("login.placeholder")} required autoFocus /><button className="primary-button wide" disabled={loading}>{loading ? t("login.loading") : t("login.continue")}</button></form><small className="fine-print">{t("login.prototype")}</small></Modal>;
}

export function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return <Modal onClose={onClose} label={t("help.label")}><span className="eyebrow">{t("help.eyebrow")}</span><h2>{t("help.title")}</h2><div className="steps"><div><b>01</b><span><strong>{t("help.zoomTitle")}</strong><small>{t("help.zoomText")}</small></span></div><div><b>02</b><span><strong>{t("help.paintTitle")}</strong><small>{t("help.paintText")}</small></span></div><div><b>03</b><span><strong>{t("help.protectTitle")}</strong><small>{t("help.protectText")}</small></span></div></div><div className="rules"><strong>{t("help.rulesTitle")}</strong><p>{t("help.rulesText")}</p></div></Modal>;
}

export function ProtectionModal({ quote, status, onClose, onConfirm }: { quote: ProtectionQuote; status: "review" | "pending" | "confirmed" | "error"; onClose: () => void; onConfirm: () => void }) {
  const { t, formatCurrency } = useI18n();
  return <Modal onClose={onClose} label={t("protection.label")}>
    {status === "confirmed" ? <><div className="modal-icon green"><LockKeyhole size={24} /></div><span className="eyebrow">{t("protection.confirmedEyebrow")}</span><h2>{t("protection.confirmedTitle")}</h2><p>{t("protection.confirmedText")}</p><button className="primary-button wide" onClick={onClose}>{t("protection.back")}</button></> : <>
      <div className="modal-icon yellow"><LockKeyhole size={24} /></div><span className="eyebrow">{t("protection.eyebrow")}</span><h2>{t("protection.title")}</h2><p>{t("protection.description")}</p>
      <div className="purchase-summary"><div><small>{t("protection.area")}</small><strong>{t("protection.pixels", { width: quote.width, height: quote.height, count: quote.pixelCount })}</strong></div><div><small>{t("protection.duration")}</small><strong>{t("protection.days")}</strong></div><div><small>{t("protection.coordinate")}</small><strong>{quote.originX} · {quote.originY}</strong></div><div className="price"><small>{t("protection.total")}</small><strong>{formatCurrency(quote.priceInCents)}</strong></div></div>
      {status === "error" && <div className="inline-error">{t("protection.error")}</div>}
      <button className="primary-button wide" onClick={onConfirm} disabled={status === "pending"}>{status === "pending" ? t("protection.processing") : t("protection.confirm")}</button>
    </>}
  </Modal>;
}
