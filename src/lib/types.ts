import type { ReportPayload, ReportRecord } from "./reports";

export type ToolMode = "navigate" | "paint" | "protect";

export interface GridCell {
  x: number;
  y: number;
  lng: number;
  lat: number;
  color: string;
  colorId?: number;
  version?: number;
  authorId?: string;
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
  color: number;
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
  createdAt?: string;
  updatedAt?: string;
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
  priceCredits: number;
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
  | "AREA_CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "CONFIGURATION_ERROR"
  | "VALIDATION_ERROR";

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string, public requestId?: string, public status?: number) {
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
  purchaseProtection(selection: ProtectionSelection, idempotencyKey: string): Promise<ProtectedArea>;
  getProtection(id: string): Promise<ProtectedArea | null>;
  getWallet(): Promise<WalletBalance>;
  submitReport(payload: ReportPayload): Promise<ReportRecord>;
  getProfile(): Promise<UserProfile | null>;
  updateProfile(input: { displayName?: string; avatarUrl?: string | null }): Promise<UserProfile>;
  requestOtp(email: string): Promise<void>;
  verifyOtp(email: string, token: string): Promise<void>;
  signOut(): Promise<void>;
  subscribe(chunkIds: string[], listener: (event: RealtimeEvent) => void): Unsubscribe;
  isLandCell(x: number, y: number): boolean;
}
