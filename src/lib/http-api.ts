import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { cellToBounds, getChunkId } from "./grid";
import { colorIdToHex } from "./palette";
import { getSession, getSupabase } from "./supabase";
import { normalizeEmail, normalizeOtp } from "./auth";
import type { ReportPayload, ReportRecord } from "./reports";
import { ApiError, type ApiErrorCode, type GridCell, type MapBounds, type PixelChange, type PixelChunk, type ProtectedArea, type ProtectionQuote, type ProtectionSelection, type RealtimeEvent, type UserProfile, type WalletBalance, type WorldPixelApi } from "./types";

type SuccessEnvelope<T> = { ok: true; data: T; request_id?: string };
type ErrorEnvelope = { ok: false; error: { code?: string; message?: string; request_id?: string } };
type ApiPixel = { cell_x?: number; cell_y?: number; x?: number; y?: number; chunk_x?: number; chunk_y?: number; color: number; author_id?: string; authorId?: string; version?: number; updated_at?: string; updatedAt?: string };
type ApiProfile = { id: string; display_name: string; avatar_url: string | null; created_at: string; updated_at: string };

const API_URL = process.env.NEXT_PUBLIC_WORLD_PIXEL_API_URL?.replace(/\/$/, "") ?? "";
const TIMEOUT_MS = 60_000;

async function refreshSession() {
  const result = await getSupabase()?.auth.refreshSession();
  return result?.data.session ?? null;
}

function authApiError(error: { message: string; status?: number }): ApiError {
  if (error.status === 429) return new ApiError("RATE_LIMITED", error.message, undefined, 429);
  if (!error.status || /fetch|network|connection/i.test(error.message)) return new ApiError("NETWORK_ERROR", error.message);
  return new ApiError("UNAUTHENTICATED", error.message, undefined, error.status);
}

function apiCode(code: string | undefined): ApiErrorCode {
  const known: ApiErrorCode[] = ["UNAUTHENTICATED", "RATE_LIMITED", "CELL_NOT_LAND", "AREA_PROTECTED", "INSUFFICIENT_CREDITS", "AREA_CONFLICT", "IDEMPOTENCY_CONFLICT", "FORBIDDEN", "NOT_FOUND", "INTERNAL_ERROR", "VALIDATION_ERROR"];
  return known.includes(code as ApiErrorCode) ? code as ApiErrorCode : "INTERNAL_ERROR";
}

function toCell(pixel: ApiPixel): GridCell {
  const x = pixel.cell_x ?? pixel.x ?? 0;
  const y = pixel.cell_y ?? pixel.y ?? 0;
  const bounds = cellToBounds(x, y);
  return { x, y, lng: bounds.west, lat: bounds.north, color: colorIdToHex(pixel.color), colorId: pixel.color, authorId: pixel.author_id ?? pixel.authorId, version: pixel.version, updatedAt: pixel.updated_at ?? pixel.updatedAt };
}

function toProtection(raw: Record<string, unknown>): ProtectedArea {
  return {
    id: String(raw.id), originX: Number(raw.origin_x), originY: Number(raw.origin_y), width: Number(raw.width ?? 16), height: Number(raw.height ?? 16),
    ownerId: String(raw.owner_id), ownerName: "", status: String(raw.status) as ProtectedArea["status"], expiresAt: String(raw.expires_at),
  };
}

function toProfile(profile: ApiProfile): UserProfile {
  return { id: profile.id, displayName: profile.display_name, avatarUrl: profile.avatar_url ?? undefined, createdAt: profile.created_at, updatedAt: profile.updated_at };
}

export class HttpWorldPixelApi implements WorldPixelApi {
  private mapController: AbortController | null = null;

  constructor(
    private readonly apiUrl = API_URL,
    private readonly sessionProvider: typeof getSession = getSession,
    private readonly sessionRefresher = refreshSession,
  ) {}

  private async request<T>(path: string, init: RequestInit = {}, authenticated = false, retried = false): Promise<T> {
    if (!this.apiUrl) throw new ApiError("CONFIGURATION_ERROR", "NEXT_PUBLIC_WORLD_PIXEL_API_URL não configurada.");
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    headers.set("X-Request-Id", crypto.randomUUID());
    if (init.body) headers.set("Content-Type", "application/json");
    if (authenticated) {
      const session = await this.sessionProvider();
      if (!session) throw new ApiError("UNAUTHENTICATED", "Entre para continuar.", undefined, 401);
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
    const controller = new AbortController();
    const signal = init.signal ? AbortSignal.any([controller.signal, init.signal]) : controller.signal;
    const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${this.apiUrl}${path}`, { ...init, headers, signal });
      const payload = await response.json().catch(() => null) as SuccessEnvelope<T> | ErrorEnvelope | null;
      if (!response.ok || !payload || payload.ok !== true) {
        const error = payload && payload.ok === false ? payload.error : {};
        if (response.status === 401 && authenticated && !retried) {
          const refreshed = await this.sessionRefresher();
          if (refreshed) return this.request<T>(path, init, authenticated, true);
        }
        if (response.status === 401 && authenticated && retried) await getSupabase()?.auth.signOut({ scope: "local" });
        throw new ApiError(apiCode(error.code), error.message ?? `Falha HTTP ${response.status}.`, error.request_id, response.status);
      }
      return payload.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("NETWORK_ERROR", error instanceof DOMException && error.name === "AbortError" ? "A API demorou para responder." : "Não foi possível conectar à API.");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async getVisibleChunks(bounds: MapBounds, zoom: number): Promise<PixelChunk[]> {
    this.mapController?.abort();
    this.mapController = new AbortController();
    const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(",");
    const data = await this.request<{ chunks: Array<{ chunkX: number; chunkY: number; cells: ApiPixel[] }> }>(`/map/chunks?bbox=${encodeURIComponent(bbox)}&zoom=${Math.max(0, Math.min(22, Math.round(zoom)))}`, { signal: this.mapController.signal });
    return data.chunks.map((chunk) => ({ id: `chunk:${chunk.chunkX}:${chunk.chunkY}`, chunkX: chunk.chunkX, chunkY: chunk.chunkY, version: Math.max(0, ...chunk.cells.map((cell) => cell.version ?? 0)), cells: chunk.cells.map(toCell) }));
  }

  async paintPixel(change: PixelChange): Promise<GridCell> {
    const data = await this.request<{ pixel: ApiPixel }>("/pixels/paint", { method: "POST", body: JSON.stringify(change) }, true);
    return toCell(data.pixel);
  }

  async quoteProtection(selection: ProtectionSelection): Promise<ProtectionQuote> {
    const data = await this.request<{ quote: Record<string, unknown> }>("/protections/quote", { method: "POST", body: JSON.stringify({ originX: selection.originX, originY: selection.originY }) }, true);
    const quote = data.quote;
    return { id: String(quote.quote_id), originX: Number(quote.origin_x), originY: Number(quote.origin_y), width: 16, height: 16, pixelCount: 256, priceCredits: Number(quote.price_credits), durationDays: 30, validUntil: String(quote.expires_at) };
  }

  async purchaseProtection(selection: ProtectionSelection, idempotencyKey: string): Promise<ProtectedArea> {
    const data = await this.request<{ protection: Record<string, unknown> }>("/protections/purchase", { method: "POST", body: JSON.stringify({ originX: selection.originX, originY: selection.originY, idempotencyKey }) }, true);
    return toProtection(data.protection);
  }

  async getProtection(id: string): Promise<ProtectedArea | null> {
    try { const data = await this.request<{ protection: Record<string, unknown> }>(`/protections/${encodeURIComponent(id)}`, {}, true); return toProtection(data.protection); }
    catch (error) { if (error instanceof ApiError && error.code === "NOT_FOUND") return null; throw error; }
  }

  async getWallet(): Promise<WalletBalance> {
    const data = await this.request<{ wallet: { balance_credits: number } }>("/wallet", {}, true);
    return { credits: data.wallet.balance_credits, currency: "BRL" };
  }

  async submitReport(payload: ReportPayload): Promise<ReportRecord> {
    const data = await this.request<{ report: { id: string; category: ReportRecord["category"]; status: string; created_at: string } }>(
      "/reports",
      { method: "POST", body: JSON.stringify(payload) },
      true,
    );
    return { id: data.report.id, category: data.report.category, status: data.report.status, createdAt: data.report.created_at };
  }

  async getProfile() {
    const data = await this.request<{ profile: ApiProfile }>("/profile", {}, true);
    return toProfile(data.profile);
  }
  async updateProfile(input: { displayName?: string; avatarUrl?: string | null }) {
    const data = await this.request<{ profile: ApiProfile }>("/profile", { method: "PATCH", body: JSON.stringify(input) }, true);
    return toProfile(data.profile);
  }
  async requestOtp(email: string) {
    const supabase = getSupabase();
    if (!supabase) throw new ApiError("CONFIGURATION_ERROR", "Supabase não configurado.");
    const { error } = await supabase.auth.signInWithOtp({ email: normalizeEmail(email), options: { shouldCreateUser: true } });
    if (error) throw authApiError(error);
  }
  async verifyOtp(email: string, token: string) {
    const supabase = getSupabase();
    if (!supabase) throw new ApiError("CONFIGURATION_ERROR", "Supabase não configurado.");
    const { error } = await supabase.auth.verifyOtp({ email: normalizeEmail(email), token: normalizeOtp(token), type: "email" });
    if (error) throw authApiError(error);
  }
  async signOut() { await getSupabase()?.auth.signOut(); }
  isLandCell(x: number, y: number) { void x; void y; return true; }

  subscribe(chunkIds: string[], listener: (event: RealtimeEvent) => void) {
    const supabase = getSupabase();
    if (!supabase || chunkIds.length === 0) return () => undefined;
    const visible = new Set(chunkIds);
    const chunkXs = [...new Set(chunkIds.map((id) => id.split(":")[1]))];
    const channel = supabase.channel(`pixels:${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "pixel_cells", filter: `chunk_x=in.(${chunkXs.join(",")})` }, (payload: RealtimePostgresChangesPayload<ApiPixel>) => {
      const raw = payload.new as ApiPixel;
      const cell = toCell(raw);
      if (visible.has(getChunkId(cell.x, cell.y))) listener({ type: "pixel.updated", chunkId: getChunkId(cell.x, cell.y), cell });
    }).subscribe((status) => listener({ type: "connection.changed", connected: status === "SUBSCRIBED" }));
    return () => { void supabase.removeChannel(channel); };
  }
}
