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
      padding: "1.5rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        navy: "#03045E",
        ocean: "#0077B6",
        cyan: "#00B4D8",
        sky: "#90E0EF",
        ice: "#CAF0F8",

        background: "#FFFFFF",
        foreground: "#03045E",

        border: "rgba(0, 119, 182, 0.14)",
        input: "rgba(0, 119, 182, 0.16)",
        ring: "#00B4D8",

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#03045E",
        },

        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#03045E",
        },

        primary: {
          DEFAULT: "#0077B6",
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#CAF0F8",
          foreground: "#03045E",
        },

        muted: {
          DEFAULT: "#F4FBFD",
          foreground: "#4D7185",
        },

        accent: {
          // Nudged lighter than a first pass (#E6F8FC) so ocean text sitting
          // on this background clears WCAG AA (4.5:1) at normal text sizes.
          DEFAULT: "#ECFAFD",
          foreground: "#0077B6",
        },

        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
      },

      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: [
          "var(--font-space-grotesk)",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "monospace",
        ],
      },

      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },

      boxShadow: {
        card: "0 8px 30px rgba(3, 4, 94, 0.06)",
        elevated: "0 12px 40px rgba(0, 119, 182, 0.10)",
        button: "0 6px 18px rgba(0, 119, 182, 0.18)",
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

        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },

        "grid-fade": {
          "0%": { opacity: "0.15" },
          "50%": { opacity: "0.3" },
          "100%": { opacity: "0.15" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blink: "blink 1s step-end infinite",
        "grid-fade": "grid-fade 6s ease-in-out infinite",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;
