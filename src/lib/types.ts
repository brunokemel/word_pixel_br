export type ToolMode = "navigate" | "paint" | "protect";

export interface GridCell {
  x: number;
  y: number;
  lng: number;
  lat: number;
  color: string;
  updatedAt?: string;
  authorName?: string;
  protectedBy?: string;
  protectedUntil?: string;
}

export interface PixelChunk {
  id: string;
  chunkX: number;
  chunkY: number;
  version: number;
  cells: GridCell[];
}

export interface PixelChange {
  cellX: number;
  cellY: number;
  color: string;
  idempotencyKey: string;
}

export interface ProtectedArea {
  id: string;
  originX: number;
  originY: number;
  width: number;
  height: number;
  ownerId: string;
  ownerName: string;
  status: "pending" | "active" | "expired" | "error";
  expiresAt: string;
}

export interface ProtectionSelection {
  originX: number;
  originY: number;
  width: number;
  height: number;
  pixelCount: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface WalletBalance {
  credits: number;
  currency: "BRL";
}

export interface ProtectionQuote {
  id: string;
  originX: number;
  originY: number;
  width: number;
  height: number;
  pixelCount: number;
  priceInCents: number;
  durationDays: 30;
  validUntil: string;
}

export interface RealtimeEvent {
  type: "pixel.updated" | "protection.created" | "connection.changed";
  chunkId?: string;
  cell?: GridCell;
  area?: ProtectedArea;
  connected?: boolean;
}

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "RATE_LIMITED"
  | "CELL_NOT_LAND"
  | "AREA_PROTECTED"
  | "INSUFFICIENT_CREDITS"
  | "CONFLICT"
  | "VALIDATION_ERROR";

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export type Unsubscribe = () => void;

export interface WorldPixelApi {
  getVisibleChunks(bounds: MapBounds, zoom: number): Promise<PixelChunk[]>;
  paintPixel(change: PixelChange): Promise<GridCell>;
  quoteProtection(selection: ProtectionSelection): Promise<ProtectionQuote>;
  purchaseProtection(quoteId: string): Promise<ProtectedArea>;
  getProtection(id: string): Promise<ProtectedArea | null>;
  getWallet(): Promise<WalletBalance>;
  getProfile(): Promise<UserProfile | null>;
  signIn(email: string): Promise<UserProfile>;
  signOut(): Promise<void>;
  subscribe(chunkIds: string[], listener: (event: RealtimeEvent) => void): Unsubscribe;
  isLandCell(x: number, y: number): boolean;
}
