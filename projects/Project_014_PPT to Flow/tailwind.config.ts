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
        text: "#111827",
        muted: "#6B7280",
        accent: "#E11D2E",
        "soft-blue": "#DCEBFF",
        "warm-wood": "#E8D8C3",
        border: "#E5E7EB",
      },
      boxShadow: {
        subtle: "0 18px 50px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        app: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
