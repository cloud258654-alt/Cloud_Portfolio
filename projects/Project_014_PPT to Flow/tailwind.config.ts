import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F7F3",
        surface: "#FFFFFF",
        surfaceMuted: "#F3F1EC",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textMuted: "#9CA3AF",
        border: "#E5E7EB",
        toyotaRed: "#E11D2E",
        toyotaRedSoft: "#FDE8EA",
        softBlue: "#DCEBFF",
        softBlueText: "#1D4ED8",
        warmWood: "#E8D8C3",
        warmWoodDark: "#BFA98C",
        success: "#16A34A",
        successSoft: "#DCFCE7",
        warning: "#F59E0B",
        warningSoft: "#FEF3C7",
        danger: "#DC2626",
        dangerSoft: "#FEE2E2",
        dark: "#111827",
        text: "#111827",
        muted: "#6B7280",
        accent: "#E11D2E",
        "soft-blue": "#DCEBFF",
        "warm-wood": "#E8D8C3",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
        24: "96px",
      },
      boxShadow: {
        subtle: "0 18px 50px rgba(17, 24, 39, 0.08)",
        soft: "0 18px 48px rgba(17, 24, 39, 0.08)",
        glass: "0 24px 70px rgba(17, 24, 39, 0.12)",
        floating: "0 30px 90px rgba(17, 24, 39, 0.16)",
      },
      borderRadius: {
        app: "8px",
        "radius-sm": "8px",
        "radius-md": "12px",
        "radius-lg": "18px",
        "radius-xl": "24px",
        "radius-2xl": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
