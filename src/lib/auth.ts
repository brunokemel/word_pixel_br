export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function normalizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function validateDisplayName(value: string): string | null {
  const normalized = value.trim();
  return normalized.length >= 1 && normalized.length <= 40 ? normalized : null;
}
