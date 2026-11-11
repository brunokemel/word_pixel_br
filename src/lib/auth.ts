export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8;
}

export function validateDisplayName(value: string): string | null {
  const normalized = value.trim();
  return normalized.length >= 1 && normalized.length <= 40 ? normalized : null;
}
