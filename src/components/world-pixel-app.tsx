"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloudOff, LockKeyhole } from "lucide-react";
import { worldPixelApi } from "@/lib/api";
import { hexToColorId } from "@/lib/palette";
import { getSupabase } from "@/lib/supabase";
import type { ReportCategory } from "@/lib/reports";
import { ApiError, type GridCell, type ProtectedArea, type ProtectionQuote, type ProtectionSelection, type ToolMode, type UserProfile } from "@/lib/types";
import { MapBoard } from "./map-board";
import { CellCard, Header, HelpModal, LoginModal, ProfileModal, ProtectionModal, ReportModal, ResetPasswordModal, ToolDock } from "./ui";
import { type TranslationKey, useI18n } from "@/lib/i18n";
import { toErrorUi, type ErrorUiState } from "@/lib/error-ux";
import { ActionError, ErrorBanner, PaymentErrorPanel } from "./error-ui";

interface Toast { id: string; message: string; tone: "success" | "error" | "info"; }

export function WorldPixelApp() {
  const { t } = useI18n();
  const [mode, setMode] = useState<ToolMode>("navigate");
  const [color, setColor] = useState("#e50000");
  const [cells, setCells] = useState<Map<string, GridCell>>(new Map());
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [balance, setBalance] = useState(0);
  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);
  const [protectionDraft, setProtectionDraft] = useState<ProtectionSelection | null>(null);
  const [quote, setQuote] = useState<ProtectionQuote | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<"review" | "pending" | "confirmed" | "error">("review");
  const [loginOpen, setLoginOpen] = useState(false);
  const [passwordRecoveryOpen, setPasswordRecoveryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [reportCell, setReportCell] = useState<GridCell | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionError, setActionError] = useState<ErrorUiState | null>(null);
  const [serviceError, setServiceError] = useState<ErrorUiState | null>(null);
  const paintQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const lastPaintRequestRef = useRef(0);
  const reportSubmittingRef = useRef(false);

  const toast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  }, []);

  const errorMessage = useCallback((error: unknown, fallback: TranslationKey) => {
    if (!(error instanceof ApiError)) return t(fallback);
    return t(toErrorUi(error).messageKey);
  }, [t]);

  const presentError = useCallback((error: unknown) => {
    const ui = toErrorUi(error);
    if (ui.surface === "silent") return ui;
    if (ui.surface === "banner") setServiceError(ui);
    else setActionError(ui);
    return ui;
  }, []);

  const enqueuePaint = useCallback((change: Parameters<typeof worldPixelApi.paintPixel>[0]) => {
    const execute = async () => {
      const delay = Math.max(0, 360 - (Date.now() - lastPaintRequestRef.current));
      if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
      lastPaintRequestRef.current = Date.now();
      try {
        return await worldPixelApi.paintPixel(change);
      } catch (error) {
        if (!(error instanceof ApiError && error.code === "RATE_LIMITED")) throw error;
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        lastPaintRequestRef.current = Date.now();
        return worldPixelApi.paintPixel(change);
      }
    };
    const result = paintQueueRef.current.then(execute, execute);
    paintQueueRef.current = result.then(() => undefined, () => undefined);
    return result;
  }, []);

  const refreshPrivateState = useCallback(async () => {
    try {
      const currentProfile = await worldPixelApi.getProfile();
      setProfileLoadFailed(false);
      setProfile(currentProfile);
      setProfileOpen(!currentProfile.username);
      try { setBalance((await worldPixelApi.getWallet()).credits); } catch (error) {
        if (!(error instanceof ApiError && error.code === "UNAUTHENTICATED")) setConnected(false);
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "UNAUTHENTICATED") { setProfile(null); setBalance(0); setLoginOpen(true); }
      else { setProfileLoadFailed(true); toast(t("profile.error.load"), "error"); }
    } finally { setAuthReady(true); }
  }, [t, toast]);

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    void supabase?.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) void refreshPrivateState();
      else setAuthReady(true);
    });
    if (!supabase) window.setTimeout(() => setAuthReady(true), 0);
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { setPasswordRecoveryOpen(true); setAuthReady(true); return; }
      if (session) window.setTimeout(() => void refreshPrivateState(), 0);
      else { setProfile(null); setBalance(0); setProfileOpen(false); setAuthReady(true); }
    });
    const handleUnauthenticated = () => { setProfile(null); setBalance(0); setProfileOpen(false); setActionError(toErrorUi(new ApiError("UNAUTHENTICATED", "expired", undefined, 401))); setLoginOpen(true); setAuthReady(true); };
    window.addEventListener("world-pixel:unauthenticated", handleUnauthenticated);
    return () => { active = false; subscription?.data.subscription.unsubscribe(); window.removeEventListener("world-pixel:unauthenticated", handleUnauthenticated); };
  }, [refreshPrivateState]);

  useEffect(() => {
    const offline = () => setServiceError(toErrorUi(new ApiError("OFFLINE", "offline", undefined, 0, true)));
    const online = () => setServiceError((current) => current?.code === "OFFLINE" ? null : current);
    window.addEventListener("offline", offline); window.addEventListener("online", online);
    if (!navigator.onLine) offline();
    return () => { window.removeEventListener("offline", offline); window.removeEventListener("online", online); };
  }, []);

  const saveProfile = useCallback(async (input: { username: string; displayName: string }) => {
    if (profileSaving) return;
    setProfileSaving(true); setProfileError(null);
    try { const updated = await worldPixelApi.updateProfile(input); setProfile(updated); setProfileOpen(false); toast(t("profile.saved"), "success"); }
    catch (error) {
      if (error instanceof ApiError && error.code === "USERNAME_TAKEN") setProfileError(t("profile.error.usernameTaken"));
      else if (error instanceof ApiError && error.code === "VALIDATION_ERROR") setProfileError(t("profile.error.usernameValidation"));
      else setProfileError(errorMessage(error, "profile.error.save"));
    }
    finally { setProfileSaving(false); }
  }, [errorMessage, profileSaving, t, toast]);

  const mergeCells = useCallback((incoming: GridCell[]) => {
    setCells((current) => {
      const next = new Map(current);
      incoming.forEach((cell) => {
        const key = `${cell.x}:${cell.y}`;
        const currentCell = next.get(key);
        if ((currentCell?.version ?? -1) <= (cell.version ?? Number.MAX_SAFE_INTEGER)) next.set(key, cell);
      });
      return next;
    });
  }, []);

  const handlePaint = useCallback(async (paintedCells: GridCell[]) => {
    if (!profile) { setLoginOpen(true); toast(t("toast.loginToPaint"), "info"); return; }
    const protectedCell = paintedCells.find((cell) => cell.protectedBy && cell.protectedBy !== profile.displayName);
    if (protectedCell?.protectedBy) { toast(t("toast.protectedBy", { name: protectedCell.protectedBy }), "error"); return; }
    const previous = new Map(paintedCells.map((cell) => [`${cell.x}:${cell.y}`, cells.get(`${cell.x}:${cell.y}`)]));
    const optimistic = paintedCells.map((cell) => ({ ...cell, color, authorName: profile.displayName, updatedAt: new Date().toISOString() }));
    mergeCells(optimistic);
    if (optimistic.length > 0) setSelectedCell(optimistic[optimistic.length - 1]);

    const results = await Promise.allSettled(paintedCells.map((cell) => enqueuePaint({
      cellX: cell.x,
      cellY: cell.y,
      color: hexToColorId(color),
      idempotencyKey: crypto.randomUUID(),
    })));
    const saved = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    if (saved.length > 0) mergeCells(saved);
    const failedKeys = paintedCells.flatMap((cell, index) => results[index].status === "rejected" ? [`${cell.x}:${cell.y}`] : []);
    if (failedKeys.length > 0) {
      setCells((current) => {
        const next = new Map(current);
        failedKeys.forEach((key) => {
          const oldCell = previous.get(key);
          if (oldCell) next.set(key, oldCell);
          else next.delete(key);
        });
        return next;
      });
      const rejected = results.find((result) => result.status === "rejected");
      const error = rejected?.status === "rejected" ? rejected.reason : null;
      presentError(error);
      toast(errorMessage(error, "toast.paintFailed"), "error");
    }
  }, [cells, color, enqueuePaint, errorMessage, mergeCells, presentError, profile, t, toast]);

  const handleProtect = useCallback(async (selection: ProtectionSelection) => {
    if (!profile) { setLoginOpen(true); toast(t("toast.loginToProtect"), "info"); return; }
    try {
      const nextQuote = await worldPixelApi.quoteProtection(selection);
      setQuote(nextQuote); setPurchaseStatus("review");
    } catch (error) { presentError(error); toast(errorMessage(error, "toast.areaUnavailable"), "error"); }
  }, [errorMessage, presentError, profile, t, toast]);

  const openReport = useCallback((cell: GridCell) => {
    if (!profile) {
      toast(t("toast.reportLogin"), "info");
      setLoginOpen(true);
      return;
    }
    setReportError(null);
    setReportCell(cell);
  }, [profile, t, toast]);

  const submitReport = useCallback(async (category: ReportCategory, reason: string) => {
    if (!reportCell || reportSubmittingRef.current) return;
    if (!profile) {
      setReportCell(null);
      toast(t("toast.reportLogin"), "info");
      setLoginOpen(true);
      return;
    }
    reportSubmittingRef.current = true;
    setReportSubmitting(true);
    setReportError(null);
    try {
      await worldPixelApi.submitReport({ targetType: "pixel", targetId: `${reportCell.x}:${reportCell.y}`, category, reason: reason.trim() });
      setReportCell(null);
      toast(t("toast.reportSent"), "success");
    } catch (error) {
      presentError(error);
      if (error instanceof ApiError && error.status === 400) setReportError(t("report.error.validation"));
      else if (error instanceof ApiError && error.status === 401) setReportError(t("report.error.expired"));
      else if (error instanceof ApiError && error.status === 429) setReportError(t("report.error.rateLimited"));
      else setReportError(t("report.error.generic"));
    } finally {
      reportSubmittingRef.current = false;
      setReportSubmitting(false);
    }
  }, [presentError, profile, reportCell, t, toast]);

  const confirmProtection = useCallback(async () => {
    if (!quote) return;
    setPurchaseStatus("pending");
    try {
      const selection = { originX: quote.originX, originY: quote.originY, width: 16, height: 16, pixelCount: 256 };
      const area = await worldPixelApi.purchaseProtection(selection, crypto.randomUUID());
      setProtectedAreas((current) => [...current, area]);
      setProtectionDraft(null);
      setBalance((current) => current - quote.priceCredits);
      setPurchaseStatus("confirmed");
      toast(t("toast.areaProtected"), "success");
    } catch (error) { setPurchaseStatus("error"); presentError(error); toast(errorMessage(error, "protection.error"), "error"); }
  }, [errorMessage, presentError, quote, t, toast]);

  const selectionPreview = useMemo<ProtectedArea[]>(() => {
    if (mode !== "protect" || !protectionDraft) return protectedAreas;
    return [...protectedAreas, { id: "preview", ...protectionDraft, ownerId: profile?.id ?? "preview", ownerName: t("preview.selectedArea"), status: "active", expiresAt: "9999-12-31T23:59:59.999Z" }];
  }, [mode, profile, protectedAreas, protectionDraft, t]);

  return (
    <main className="app-shell">
      <Header profile={profile} balance={balance} authReady={authReady} onLogin={() => setLoginOpen(true)} onProfile={() => { setProfileError(null); setProfileOpen(true); }} onLogout={() => void worldPixelApi.signOut().then(() => { setProfile(null); toast(t("toast.loggedOut")); })} onHelp={() => setHelpOpen(true)} />
      {serviceError && <ErrorBanner error={serviceError} onRetry={() => { setServiceError(null); void refreshPrivateState(); }} />}
      <MapBoard mode={mode} cells={cells} protectedAreas={selectionPreview} selectedCell={selectedCell} brushColor={color} canPaint={Boolean(profile)} onCellSelect={setSelectedCell} onPaint={handlePaint} onProtectPreview={setProtectionDraft} onProtectSelect={handleProtect} onChunksLoaded={mergeCells} onConnectionChange={setConnected} />
      <div className="hero-copy"><span className="eyebrow">{t("hero.eyebrow")}</span><h1>{t("hero.titleStart")}<br /><em>{t("hero.titleEnd")}</em></h1><p>{t("hero.description")}</p></div>
      <ToolDock mode={mode} onMode={(nextMode) => { setMode(nextMode); if (nextMode !== "protect") setProtectionDraft(null); }} color={color} onColor={setColor} />
      {selectedCell && <CellCard cell={selectedCell} onClose={() => setSelectedCell(null)} onReport={() => openReport(selectedCell)} />}
      {!connected && <div className="connection-warning"><CloudOff size={17} /> {t("connection.reconnecting")}</div>}
      {profileLoadFailed && <div className="profile-retry" role="alert"><span>{t("profile.error.load")}</span><button onClick={() => void refreshPrivateState()}>{t("profile.retry")}</button></div>}
      {actionError && <div className="map-action-error">{actionError.surface === "payment" ? <PaymentErrorPanel error={actionError} balance={balance} cost={quote?.priceCredits} onBuyCredits={() => toast(t("credits.comingSoon"), "info")} /> : <ActionError error={actionError} onRetry={actionError.retryable ? () => setActionError(null) : undefined} />}<button type="button" className="error-dismiss" onClick={() => setActionError(null)} aria-label={t("errorUi.close")}>×</button></div>}
      <div className="map-legend"><span><i className="free" /> {t("legend.free")}</span><span><LockKeyhole size={13} /> {t("legend.protected")}</span></div>
      <div className="toast-region" aria-live="polite">{toasts.map((item) => <div key={item.id} className={`toast ${item.tone}`}>{item.message}</div>)}</div>
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSignIn={(email, password) => worldPixelApi.signInWithPassword(email, password)} onSignUp={(email, password, displayName, username) => worldPixelApi.signUpWithPassword(email, password, displayName, username)} onRequestPasswordReset={(email) => worldPixelApi.requestPasswordReset(email)} />}
      {passwordRecoveryOpen && <ResetPasswordModal onSave={async (password) => { await worldPixelApi.updatePassword(password); setPasswordRecoveryOpen(false); await refreshPrivateState(); toast(t("login.passwordUpdated"), "success"); }} />}
      {profile && profileOpen && <ProfileModal profile={profile} required={!profile.username} saving={profileSaving} error={profileError} onClose={() => setProfileOpen(false)} onSave={(input) => void saveProfile(input)} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {reportCell && <ReportModal cell={reportCell} submitting={reportSubmitting} submitError={reportError} onClose={() => { if (!reportSubmitting) { setReportCell(null); setReportError(null); } }} onSubmit={submitReport} />}
      {quote && <ProtectionModal quote={quote} status={purchaseStatus} onClose={() => { setQuote(null); setProtectionDraft(null); }} onConfirm={confirmProtection} />}
    </main>
  );
}
