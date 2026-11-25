import { cn } from "@/lib/utils";

/**
 * Crisp inline SVG country flags so flags render in full color on Windows
 * (where OS emoji fonts display monochrome 2-letter codes instead of flags).
 */
export function CountryFlag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const c = code.toUpperCase();
  const baseClass = cn(
    "inline-block h-[14px] w-[20px] shrink-0 overflow-hidden rounded-[2px] border border-black/10 align-middle",
    className
  );

  switch (c) {
    case "US":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#FFFFFF" />
          <rect y="0" width="20" height="1.1" fill="#B22234" />
          <rect y="2.2" width="20" height="1.1" fill="#B22234" />
          <rect y="4.4" width="20" height="1.1" fill="#B22234" />
          <rect y="6.6" width="20" height="1.1" fill="#B22234" />
          <rect y="8.8" width="20" height="1.1" fill="#B22234" />
          <rect y="11" width="20" height="1.1" fill="#B22234" />
          <rect y="13" width="20" height="1.1" fill="#B22234" />
          <rect width="8.5" height="7.7" fill="#3C3B6E" />
          <g fill="#FFFFFF">
            <circle cx="2" cy="1.8" r="0.55" />
            <circle cx="4.2" cy="1.8" r="0.55" />
            <circle cx="6.4" cy="1.8" r="0.55" />
            <circle cx="3.1" cy="3.8" r="0.55" />
            <circle cx="5.3" cy="3.8" r="0.55" />
            <circle cx="2" cy="5.8" r="0.55" />
            <circle cx="4.2" cy="5.8" r="0.55" />
            <circle cx="6.4" cy="5.8" r="0.55" />
          </g>
        </svg>
      );

    case "GB":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#012169" />
          <path d="M0 0 L20 14 M20 0 L0 14" stroke="#FFFFFF" strokeWidth="2.8" />
          <path d="M0 0 L20 14 M20 0 L0 14" stroke="#C8102E" strokeWidth="1.2" />
          <path d="M10 0 V14 M0 7 H20" stroke="#FFFFFF" strokeWidth="4.2" />
          <path d="M10 0 V14 M0 7 H20" stroke="#C8102E" strokeWidth="2.4" />
        </svg>
      );

    case "AU":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#00008B" />
          <path d="M0 0 L9 6 M9 0 L0 6" stroke="#FFFFFF" strokeWidth="1.2" />
          <path d="M4.5 0 V6 M0 3 H9" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M4.5 0 V6 M0 3 H9" stroke="#C8102E" strokeWidth="1.1" />
          <g fill="#FFFFFF">
            <circle cx="4.5" cy="10.2" r="1.2" />
            <circle cx="14.5" cy="3.5" r="0.8" />
            <circle cx="16.8" cy="6.2" r="0.7" />
            <circle cx="14.2" cy="8.5" r="0.8" />
            <circle cx="15.2" cy="11.2" r="0.8" />
            <circle cx="12.2" cy="6.5" r="0.6" />
          </g>
        </svg>
      );

    case "NZ":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#00247D" />
          <path d="M0 0 L9 6 M9 0 L0 6" stroke="#FFFFFF" strokeWidth="1.2" />
          <path d="M4.5 0 V6 M0 3 H9" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M4.5 0 V6 M0 3 H9" stroke="#CC142B" strokeWidth="1.1" />
          <g fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.4">
            <circle cx="14.8" cy="3.2" r="0.9" />
            <circle cx="17" cy="6.2" r="0.85" />
            <circle cx="12.6" cy="6.6" r="0.8" />
            <circle cx="14.8" cy="10.8" r="1" />
          </g>
        </svg>
      );

    case "CA":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#FFFFFF" />
          <rect width="5" height="14" fill="#D80621" />
          <rect x="15" width="5" height="14" fill="#D80621" />
          <path
            d="M10 3 L10.9 5.5 L12.8 4.8 L12 6.8 L13.4 7.5 L11.5 8.5 L11.8 9.7 L10.3 9.3 V11.2 H9.7 V9.3 L8.2 9.7 L8.5 8.5 L6.6 7.5 L8 6.8 L7.2 4.8 L9.1 5.5 Z"
            fill="#D80621"
          />
        </svg>
      );

    case "LK":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#FFBE29" />
          <rect x="1" y="1" width="2.6" height="12" fill="#00534E" />
          <rect x="3.6" y="1" width="2.6" height="12" fill="#EB7400" />
          <rect x="7" y="1" width="12" height="12" fill="#8D153A" />
          <path
            d="M10.2 8.6 C10.6 6.4 12.2 5.4 14.2 5.6 C15.2 5.7 15.8 6.5 15.6 7.5 C15.4 8.6 14.2 9.2 12.8 9.2 H10.2 Z"
            fill="#FFBE29"
          />
          <circle cx="15.3" cy="5.4" r="0.9" fill="#FFBE29" />
        </svg>
      );

    case "SG":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="7" fill="#EF3340" />
          <rect y="7" width="20" height="7" fill="#FFFFFF" />
          <circle cx="4.5" cy="3.5" r="2.2" fill="#FFFFFF" />
          <circle cx="5.3" cy="3.5" r="1.9" fill="#EF3340" />
          <g fill="#FFFFFF">
            <circle cx="6.8" cy="2.3" r="0.4" />
            <circle cx="7.9" cy="3.1" r="0.4" />
            <circle cx="7.5" cy="4.4" r="0.4" />
            <circle cx="6.1" cy="4.4" r="0.4" />
            <circle cx="5.8" cy="3.1" r="0.4" />
          </g>
        </svg>
      );

    case "AE":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="4.67" fill="#00732F" />
          <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
          <rect y="9.33" width="20" height="4.67" fill="#000000" />
          <rect width="5.2" height="14" fill="#FF0000" />
        </svg>
      );

    case "IE":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="6.67" height="14" fill="#169B62" />
          <rect x="6.67" width="6.67" height="14" fill="#FFFFFF" />
          <rect x="13.33" width="6.67" height="14" fill="#FF883E" />
        </svg>
      );

    case "MT":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="10" height="14" fill="#FFFFFF" />
          <rect x="10" width="10" height="14" fill="#CF142B" />
          <path d="M3.2 2 V4.6 M1.9 3.3 H4.5" stroke="#9CA3AF" strokeWidth="1.1" />
        </svg>
      );

    case "NL":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="4.67" fill="#AE1C28" />
          <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
          <rect y="9.33" width="20" height="4.67" fill="#21468B" />
        </svg>
      );

    case "SE":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#006AA7" />
          <rect x="6" width="2.8" height="14" fill="#FECC00" />
          <rect y="5.6" width="20" height="2.8" fill="#FECC00" />
        </svg>
      );

    case "NO":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#BA0C2F" />
          <rect x="5.4" width="3.8" height="14" fill="#FFFFFF" />
          <rect y="5.1" width="20" height="3.8" fill="#FFFFFF" />
          <rect x="6.3" width="2" height="14" fill="#00205B" />
          <rect y="6" width="20" height="2" fill="#00205B" />
        </svg>
      );

    case "DK":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#C60C30" />
          <rect x="6" width="2.4" height="14" fill="#FFFFFF" />
          <rect y="5.8" width="20" height="2.4" fill="#FFFFFF" />
        </svg>
      );

    case "FI":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#FFFFFF" />
          <rect x="5.8" width="3.2" height="14" fill="#003580" />
          <rect y="5.4" width="20" height="3.2" fill="#003580" />
        </svg>
      );

    case "DE":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="4.67" fill="#000000" />
          <rect y="4.67" width="20" height="4.67" fill="#DD0000" />
          <rect y="9.33" width="20" height="4.67" fill="#FFCE00" />
        </svg>
      );

    case "CH":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#D52B1E" />
          <rect x="8.5" y="3" width="3" height="8" fill="#FFFFFF" />
          <rect x="6" y="5.5" width="8" height="3" fill="#FFFFFF" />
        </svg>
      );

    case "AT":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="4.67" fill="#ED2939" />
          <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
          <rect y="9.33" width="20" height="4.67" fill="#ED2939" />
        </svg>
      );

    case "BE":
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="6.67" height="14" fill="#000000" />
          <rect x="6.67" width="6.67" height="14" fill="#FDDA24" />
          <rect x="13.33" width="6.67" height="14" fill="#EF3340" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 20 14" className={baseClass} aria-hidden="true">
          <rect width="20" height="14" fill="#E5E7EB" />
          <circle cx="10" cy="7" r="4" fill="#9CA3AF" />
        </svg>
      );
  }
}
