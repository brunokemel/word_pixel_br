import type { TranslationKey } from "./i18n";

export const reportCategories = [
  { value: "explicit_sexual", labelKey: "report.category.explicitSexual" },
  { value: "hate_extremism", labelKey: "report.category.hateExtremism" },
  { value: "racism_discrimination", labelKey: "report.category.racismDiscrimination" },
  { value: "harassment", labelKey: "report.category.harassment" },
  { value: "violence_threat", labelKey: "report.category.violenceThreat" },
  { value: "spam_vandalism", labelKey: "report.category.spamVandalism" },
  { value: "other", labelKey: "report.category.other" },
] as const satisfies ReadonlyArray<{ value: string; labelKey: TranslationKey }>;

export type ReportCategory = (typeof reportCategories)[number]["value"];

export interface ReportPayload {
  targetType: "pixel";
  targetId: string;
  category: ReportCategory;
  reason: string;
}

export interface ReportRecord {
  id: string;
  category: ReportCategory;
  status: "open" | string;
  createdAt: string;
}

export function validateReport(category: string, reason: string) {
  const trimmedReason = reason.trim();
  return {
    categoryValid: reportCategories.some((item) => item.value === category),
    reasonValid: trimmedReason.length >= 3 && trimmedReason.length <= 500,
    trimmedReason,
  };
}
