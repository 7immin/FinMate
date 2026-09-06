import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: {
          DEFAULT: "#15151F",
          raised: "#1B1B27",
          sunken: "#0E0E15",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        primary: {
          DEFAULT: "#6C5CE7",
          hover: "#7B6DF0",
          muted: "rgba(108,92,231,0.16)",
        },
        foreground: {
          DEFAULT: "#F5F5F7",
          muted: "#A0A0AE",
          subtle: "#6E6E7C",
        },
        success: {
          DEFAULT: "#22C55E",
          muted: "rgba(34,197,94,0.14)",
        },
        warning: {
          DEFAULT: "#F5A623",
          muted: "rgba(245,166,35,0.14)",
        },
        danger: {
          DEFAULT: "#EF4444",
          muted: "rgba(239,68,68,0.14)",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
