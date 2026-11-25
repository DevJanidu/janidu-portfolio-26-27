export type CountryItem = {
  code: string;
  value: string;
  label: string;
  flag: string;
  aliases?: string[];
};

export const DEFAULT_COUNTRY = "USA";

export const COUNTRIES: CountryItem[] = [
  {
    code: "US",
    value: "USA",
    label: "United States",
    flag: "🇺🇸",
    aliases: ["USA", "America", "United States of America"],
  },
  {
    code: "GB",
    value: "UK",
    label: "United Kingdom",
    flag: "🇬🇧",
    aliases: ["UK", "Britain", "England", "Scotland", "Wales"],
  },
  {
    code: "AU",
    value: "Australia",
    label: "Australia",
    flag: "🇦🇺",
    aliases: ["Aus", "Aussie"],
  },
  {
    code: "NZ",
    value: "New Zealand",
    label: "New Zealand",
    flag: "🇳🇿",
    aliases: ["NZ"],
  },
  {
    code: "CA",
    value: "Canada",
    label: "Canada",
    flag: "🇨🇦",
  },
  {
    code: "LK",
    value: "Sri Lanka",
    label: "Sri Lanka",
    flag: "🇱🇰",
    aliases: ["SL", "Ceylon"],
  },
  {
    code: "SG",
    value: "Singapore",
    label: "Singapore",
    flag: "🇸🇬",
    aliases: ["SG"],
  },
  {
    code: "AE",
    value: "UAE",
    label: "United Arab Emirates",
    flag: "🇦🇪",
    aliases: ["UAE", "Dubai", "Abu Dhabi"],
  },
  // English-speaking & high-English-proficiency European countries
  {
    code: "IE",
    value: "Ireland",
    label: "Ireland",
    flag: "🇮🇪",
  },
  {
    code: "MT",
    value: "Malta",
    label: "Malta",
    flag: "🇲🇹",
  },
  {
    code: "NL",
    value: "Netherlands",
    label: "Netherlands",
    flag: "🇳🇱",
    aliases: ["Holland"],
  },
  {
    code: "SE",
    value: "Sweden",
    label: "Sweden",
    flag: "🇸🇪",
  },
  {
    code: "NO",
    value: "Norway",
    label: "Norway",
    flag: "🇳🇴",
  },
  {
    code: "DK",
    value: "Denmark",
    label: "Denmark",
    flag: "🇩🇰",
  },
  {
    code: "FI",
    value: "Finland",
    label: "Finland",
    flag: "🇫🇮",
  },
  {
    code: "DE",
    value: "Germany",
    label: "Germany",
    flag: "🇩🇪",
  },
  {
    code: "CH",
    value: "Switzerland",
    label: "Switzerland",
    flag: "🇨🇭",
  },
  {
    code: "AT",
    value: "Austria",
    label: "Austria",
    flag: "🇦🇹",
  },
  {
    code: "BE",
    value: "Belgium",
    label: "Belgium",
    flag: "🇧🇪",
  },
];

export const COUNTRY_OPTIONS = COUNTRIES.map((c) => c.value);

export function getCountryByValue(value: string): CountryItem {
  return (
    COUNTRIES.find(
      (c) =>
        c.value.toLowerCase() === value.trim().toLowerCase() ||
        c.label.toLowerCase() === value.trim().toLowerCase()
    ) ?? COUNTRIES[0]
  );
}

export function normalizeCountry(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_COUNTRY;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_COUNTRY;
  const match = COUNTRIES.find(
    (c) =>
      c.value.toLowerCase() === trimmed.toLowerCase() ||
      c.label.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? match.value : DEFAULT_COUNTRY;
}
