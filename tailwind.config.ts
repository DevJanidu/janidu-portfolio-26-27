import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1160px",
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Legacy aliases mapped onto the restrained off-white / near-black / single-blue palette
        // so preserved secondary routes (/pricing, /salon-details) stay harmonious.
        navy: "#091C44",
        ocean: "#091C44",
        cyan: "#091C44",
        sky: "#DBEAFE",
        ice: "#EFF6FF",

        background: "#FAF9F6",
        surface: "#FFFFFF",
        foreground: "#111827",

        border: "#E5E4DF",
        input: "#D6D5CE",
        ring: "#091C44",

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },

        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },

        primary: {
          DEFAULT: "#091C44",
          hover: "#112D66",
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#F2F1EC",
          foreground: "#111827",
        },

        muted: {
          DEFAULT: "#F3F2EE",
          foreground: "#4B5563",
        },

        accent: {
          DEFAULT: "#EDF2FA",
          foreground: "#091C44",
        },

        destructive: {
          DEFAULT: "#B91C1C",
          foreground: "#FFFFFF",
        },
      },

      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },

      fontSize: {
        body: ["1.0625rem", { lineHeight: "1.68" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
      },

      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },

      boxShadow: {
        card: "0 1px 3px rgba(17, 24, 39, 0.05), 0 1px 2px rgba(17, 24, 39, 0.03)",
        elevated: "0 12px 32px -8px rgba(17, 24, 39, 0.09), 0 2px 6px rgba(17, 24, 39, 0.04)",
        frame: "0 18px 44px -12px rgba(17, 24, 39, 0.12), 0 2px 8px rgba(17, 24, 39, 0.05)",
        button: "0 1px 2px rgba(17, 24, 39, 0.08)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;
