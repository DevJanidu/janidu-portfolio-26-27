export const DEFAULT_COUNTRY = "USA";

export const COUNTRY_OPTIONS = [
  "USA",
  "UK",
  "Australia",
  "Sri Lanka",
  "Canada",
  "New Zealand",
  "Singapore",
  "UAE",
  "Other",
] as const;

export type CountryOption = (typeof COUNTRY_OPTIONS)[number];

export function normalizeCountry(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_COUNTRY;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80) return DEFAULT_COUNTRY;
  return trimmed;
}
