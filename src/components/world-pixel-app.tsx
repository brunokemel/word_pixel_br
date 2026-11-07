"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudOff, LockKeyhole } from "lucide-react";
import { worldPixelApi } from "@/lib/mock-api";
import { ApiError, type GridCell, type ProtectedArea, type ProtectionQuote, type ProtectionSelection, type ToolMode, type UserProfile } from "@/lib/types";
import { MapBoard } from "./map-board";
import { CellCard, Header, HelpModal, LoginModal, ProtectionModal, ToolDock } from "./ui";
import { type TranslationKey, useI18n } from "@/lib/i18n";

interface Toast { id: string; message: string; tone: "success" | "error" | "info"; }

export function WorldPixelApp() {
  const { t } = useI18n();
  const [mode, setMode] = useState<ToolMode>("navigate");
  const [color, setColor] = useState("#ff4f87");
  const [cells, setCells] = useState<Map<string, GridCell>>(new Map());
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(500);
  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);
  const [protectionDraft, setProtectionDraft] = useState<ProtectionSelection | null>(null);
  const [quote, setQuote] = useState<ProtectionQuote | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<"review" | "pending" | "confirmed" | "error">("review");
  const [loginOpen, setLoginOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [connected, setConnected] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  }, []);

  useEffect(() => {
    void Promise.all([worldPixelApi.getProfile(), worldPixelApi.getWallet()]).then(([currentProfile, wallet]) => {
      setProfile(currentProfile); setBalance(wallet.credits);
    });
  }, []);

  const mergeCells = useCallback((incoming: GridCell[]) => {
    setCells((current) => {
      const next = new Map(current);
      incoming.forEach((cell) => next.set(`${cell.x}:${cell.y}`, cell));
      return next;
    });
  }, []);

  const handlePaint = useCallback(async (cell: GridCell) => {
    if (!profile) { setLoginOpen(true); toast(t("toast.loginToPaint"), "info"); return; }
    if (cell.protectedBy && cell.protectedBy !== profile.displayName) { toast(t("toast.protectedBy", { name: cell.protectedBy }), "error"); return; }
    const key = `${cell.x}:${cell.y}`;
    const previous = cells.get(key);
    const optimistic: GridCell = { ...cell, color, authorName: profile.displayName, updatedAt: new Date().toISOString() };
    mergeCells([optimistic]);
    setSelectedCell(optimistic);
    try {
      const saved = await worldPixelApi.paintPixel({ cellX: cell.x, cellY: cell.y, color, idempotencyKey: crypto.randomUUID() });
      mergeCells([saved]); setSelectedCell(saved); toast(t("toast.pixelPainted"), "success");
    } catch (error) {
      setCells((current) => { const next = new Map(current); previous ? next.set(key, previous) : next.delete(key); return next; });
      const message = error instanceof ApiError ? t(`error.${error.code}` as TranslationKey) : t("toast.paintFailed");
      toast(message, "error");
    }
  }, [cells, color, mergeCells, profile, t, toast]);

  const handleProtect = useCallback(async (selection: ProtectionSelection) => {
    if (!profile) { setLoginOpen(true); toast(t("toast.loginToProtect"), "info"); return; }
    try {
      const nextQuote = await worldPixelApi.quoteProtection(selection);
      setQuote(nextQuote); setPurchaseStatus("review");
    } catch (error) { toast(error instanceof ApiError ? t(`error.${error.code}` as TranslationKey) : t("toast.areaUnavailable"), "error"); }
  }, [profile, t, toast]);

  const confirmProtection = useCallback(async () => {
    if (!quote) return;
    setPurchaseStatus("pending");
    try {
      const area = await worldPixelApi.purchaseProtection(quote.id);
      setProtectedAreas((current) => [...current, area]);
      setProtectionDraft(null);
      setBalance((current) => current - quote.priceInCents);
      setPurchaseStatus("confirmed");
      toast(t("toast.areaProtected"), "success");
    } catch { setPurchaseStatus("error"); }
  }, [quote, t, toast]);

  const selectionPreview = useMemo<ProtectedArea[]>(() => {
    if (mode !== "protect" || !protectionDraft) return protectedAreas;
    return [...protectedAreas, { id: "preview", ...protectionDraft, ownerId: profile?.id ?? "preview", ownerName: t("preview.selectedArea"), status: "active", expiresAt: new Date(Date.now() + 86400000).toISOString() }];
  }, [mode, profile, protectedAreas, protectionDraft, t]);

  return (
    <main className="app-shell">
      <Header profile={profile} balance={balance} onLogin={() => setLoginOpen(true)} onLogout={() => void worldPixelApi.signOut().then(() => { setProfile(null); toast(t("toast.loggedOut")); })} onHelp={() => setHelpOpen(true)} />
      <MapBoard mode={mode} cells={cells} protectedAreas={selectionPreview} selectedCell={selectedCell} onCellSelect={setSelectedCell} onPaint={handlePaint} onProtectPreview={setProtectionDraft} onProtectSelect={handleProtect} onChunksLoaded={mergeCells} onConnectionChange={setConnected} />
      <div className="hero-copy"><span className="eyebrow">{t("hero.eyebrow")}</span><h1>{t("hero.titleStart")}<br /><em>{t("hero.titleEnd")}</em></h1><p>{t("hero.description")}</p></div>
      <ToolDock mode={mode} onMode={(nextMode) => { setMode(nextMode); if (nextMode !== "protect") setProtectionDraft(null); }} color={color} onColor={setColor} />
      {selectedCell && <CellCard cell={selectedCell} onClose={() => setSelectedCell(null)} />}
      {!connected && <div className="connection-warning"><CloudOff size={17} /> {t("connection.reconnecting")}</div>}
      <div className="map-legend"><span><i className="free" /> {t("legend.free")}</span><span><LockKeyhole size={13} /> {t("legend.protected")}</span></div>
      <div className="toast-region" aria-live="polite">{toasts.map((item) => <div key={item.id} className={`toast ${item.tone}`}>{item.message}</div>)}</div>
      {loginOpen && <LoginModal loading={loginLoading} onClose={() => setLoginOpen(false)} onSubmit={(email) => { setLoginLoading(true); void worldPixelApi.signIn(email).then((user) => { setProfile(user); setLoginOpen(false); toast(t("toast.welcome", { name: user.displayName }), "success"); }).finally(() => setLoginLoading(false)); }} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {quote && <ProtectionModal quote={quote} status={purchaseStatus} onClose={() => { setQuote(null); setProtectionDraft(null); }} onConfirm={confirmProtection} />}
    </main>
  );
}
