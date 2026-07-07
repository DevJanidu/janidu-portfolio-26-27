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
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Raw palette (use these directly when you want the exact swatch)
        ink: "#252422", // near-black base
        charcoal: "#403D39", // surfaces / borders
        sand: "#CCC5B9", // muted text
        cream: "#FFFCF2", // primary light text
        ember: "#EB5E28", // accent

        // Semantic tokens (shadcn-style)
        background: "#252422",
        foreground: "#FFFCF2",
        border: "rgba(204,197,185,0.14)",
        input: "rgba(204,197,185,0.14)",
        ring: "#EB5E28",
        card: {
          DEFAULT: "#2C2A28",
          foreground: "#FFFCF2",
        },
        popover: {
          DEFAULT: "#2C2A28",
          foreground: "#FFFCF2",
        },
        primary: {
          DEFAULT: "#EB5E28",
          foreground: "#FFFCF2",
        },
        secondary: {
          DEFAULT: "#403D39",
          foreground: "#FFFCF2",
        },
        muted: {
          DEFAULT: "#403D39",
          foreground: "#CCC5B9",
        },
        accent: {
          DEFAULT: "#403D39",
          foreground: "#FFFCF2",
        },
        destructive: {
          DEFAULT: "#B23A17",
          foreground: "#FFFCF2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
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
          "0%": { opacity: "0.35" },
          "50%": { opacity: "0.6" },
          "100%": { opacity: "0.35" },
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
