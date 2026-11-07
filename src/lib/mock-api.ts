import { cellToBounds, CHUNK_SIZE, getChunkId, isInsideProtection, MAX_PROTECTION_PIXELS, protectionAreasOverlap } from "./grid";
import type {
  GridCell,
  MapBounds,
  PixelChange,
  PixelChunk,
  ProtectedArea,
  ProtectionSelection,
  ProtectionQuote,
  RealtimeEvent,
  UserProfile,
  WalletBalance,
  WorldPixelApi,
} from "./types";
import { ApiError } from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const landRegions = [
  [-168, 10, -52, 72], [-82, -56, -34, 13], [-10, 35, 42, 71], [-18, -35, 52, 37],
  [26, 5, 180, 77], [110, -46, 155, -10], [43, -26, 51, -11], [-74, 59, -12, 84],
] as const;

function seededColor(x: number, y: number) {
  const palette = ["#ff5c8a", "#ffc857", "#37d6a3", "#6ca8ff", "#9b7bff", "#f6f3ea"];
  return palette[Math.abs((x * 17 + y * 31) % palette.length)];
}

export class MockWorldPixelApi implements WorldPixelApi {
  private cells = new Map<string, GridCell>();
  private listeners = new Set<(event: RealtimeEvent) => void>();
  private profile: UserProfile | null = null;
  private wallet: WalletBalance = { credits: 500, currency: "BRL" };
  private protections: ProtectedArea[] = [];
  private quotes = new Map<string, ProtectionQuote>();

  constructor() {
    for (let x = 296; x < 329; x++) {
      for (let y = 204; y < 236; y++) {
        if ((x * 7 + y * 11) % 9 < 3 && this.isLandCell(x, y)) {
          const bounds = cellToBounds(x, y);
          this.cells.set(`${x}:${y}`, {
            x, y, lng: bounds.west, lat: bounds.north, color: seededColor(x, y),
            authorName: ["Lia", "Caio", "Bia", "Noah"][(x + y) % 4],
            updatedAt: new Date(Date.now() - ((x + y) % 20) * 60000).toISOString(),
          });
        }
      }
    }
    this.protections.push({
      id: "protected-demo", originX: 304, originY: 208, width: 16, height: 16,
      ownerId: "artist-demo", ownerName: "Ateliê Aurora", status: "active",
      expiresAt: new Date(Date.now() + 12 * 86400000).toISOString(),
    });
  }

  isLandCell(x: number, y: number): boolean {
    const { west, north } = cellToBounds(x, y);
    const lng = west + 0.25;
    const lat = north - 0.25;
    const insideBox = landRegions.some(([minLng, minLat, maxLng, maxLat]) => lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat);
    if (!insideBox) return false;
    // Recortes simples tornam a máscara mock menos retangular; a API real usará PostGIS.
    if (lng > -30 && lng < 15 && lat > -5 && lat < 30) return false;
    if (lng > 58 && lng < 108 && lat < 5) return false;
    return true;
  }

  async getVisibleChunks(bounds: MapBounds, zoom: number): Promise<PixelChunk[]> {
    await sleep(zoom > 4 ? 80 : 140);
    const chunks = new Map<string, PixelChunk>();
    for (const cell of this.cells.values()) {
      if (cell.lng < bounds.west || cell.lng > bounds.east || cell.lat < bounds.south || cell.lat > bounds.north) continue;
      const id = getChunkId(cell.x, cell.y);
      const [, chunkX, chunkY] = id.split(":");
      if (!chunks.has(id)) chunks.set(id, { id, chunkX: Number(chunkX), chunkY: Number(chunkY), version: 1, cells: [] });
      chunks.get(id)!.cells.push(this.withProtection(cell));
    }
    return [...chunks.values()];
  }

  async paintPixel(change: PixelChange): Promise<GridCell> {
    await sleep(180);
    if (!this.profile) throw new ApiError("UNAUTHENTICATED", "Entre para deixar sua marca no mapa.");
    if (!this.isLandCell(change.cellX, change.cellY)) throw new ApiError("CELL_NOT_LAND", "Este pixel fica no oceano.");
    const area = this.protections.find((item) => isInsideProtection({ x: change.cellX, y: change.cellY }, item));
    if (area && area.ownerId !== this.profile.id) throw new ApiError("AREA_PROTECTED", `Área protegida por ${area.ownerName}.`);
    const bounds = cellToBounds(change.cellX, change.cellY);
    const cell: GridCell = {
      x: change.cellX, y: change.cellY, lng: bounds.west, lat: bounds.north,
      color: change.color, authorName: this.profile.displayName, updatedAt: new Date().toISOString(),
    };
    this.cells.set(`${cell.x}:${cell.y}`, cell);
    const authoritative = this.withProtection(cell);
    this.emit({ type: "pixel.updated", chunkId: getChunkId(cell.x, cell.y), cell: authoritative });
    return authoritative;
  }

  async quoteProtection(selection: ProtectionSelection): Promise<ProtectionQuote> {
    await sleep(140);
    if (!this.profile) throw new ApiError("UNAUTHENTICATED", "Entre para proteger uma área.");
    const { originX, originY, width, height, pixelCount } = selection;
    if (width < 1 || height < 1 || pixelCount !== width * height || pixelCount > MAX_PROTECTION_PIXELS) {
      throw new ApiError("VALIDATION_ERROR", `Selecione entre 1 e ${MAX_PROTECTION_PIXELS} pixels.`);
    }
    for (let x = originX; x < originX + width; x++) {
      for (let y = originY; y < originY + height; y++) {
        if (!this.isLandCell(x, y)) throw new ApiError("CELL_NOT_LAND", "A área selecionada deve ficar inteiramente em terra.");
      }
    }
    const candidate = { originX, originY, width, height };
    const conflict = this.protections.some((area) => area.status === "active" && protectionAreasOverlap(candidate, area));
    if (conflict) throw new ApiError("CONFLICT", "Este bloco já está protegido.");
    const quote: ProtectionQuote = {
      id: crypto.randomUUID(), originX, originY, width, height, pixelCount,
      priceInCents: pixelCount, durationDays: 30, validUntil: new Date(Date.now() + 10 * 60000).toISOString(),
    };
    this.quotes.set(quote.id, quote);
    return quote;
  }

  async purchaseProtection(quoteId: string): Promise<ProtectedArea> {
    await sleep(1200);
    if (!this.profile) throw new ApiError("UNAUTHENTICATED", "Sua sessão expirou.");
    const quote = this.quotes.get(quoteId);
    if (!quote) throw new ApiError("VALIDATION_ERROR", "Orçamento expirado.");
    if (this.wallet.credits < quote.priceInCents) throw new ApiError("INSUFFICIENT_CREDITS", "Saldo insuficiente.");
    this.wallet.credits -= quote.priceInCents;
    const area: ProtectedArea = {
      id: crypto.randomUUID(), originX: quote.originX, originY: quote.originY,
      width: quote.width, height: quote.height, ownerId: this.profile.id,
      ownerName: this.profile.displayName, status: "active",
      expiresAt: new Date(Date.now() + quote.durationDays * 86400000).toISOString(),
    };
    this.protections.push(area);
    this.emit({ type: "protection.created", area });
    return area;
  }

  async getProtection(id: string) { return this.protections.find((area) => area.id === id) ?? null; }
  async getWallet() { await sleep(80); return { ...this.wallet }; }
  async getProfile() { await sleep(80); return this.profile ? { ...this.profile } : null; }
  async signIn(email: string) {
    await sleep(500);
    this.profile = { id: "demo-user", displayName: email.split("@")[0] || "Artista" };
    return { ...this.profile };
  }
  async signOut() { this.profile = null; }
  subscribe(_chunkIds: string[], listener: (event: RealtimeEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private emit(event: RealtimeEvent) { this.listeners.forEach((listener) => listener(event)); }
  private withProtection(cell: GridCell): GridCell {
    const area = this.protections.find((item) => isInsideProtection(cell, item));
    return area ? { ...cell, protectedBy: area.ownerName, protectedUntil: area.expiresAt } : cell;
  }
}

export const worldPixelApi = new MockWorldPixelApi();
