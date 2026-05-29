import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1437",
          50: "#F5F6FB",
          100: "#E8EAF4",
          200: "#C5CADE",
          300: "#8B95B8",
          400: "#5A6691",
          500: "#3A4774",
          600: "#1F2A56",
          700: "#161F42",
          800: "#0F1734",
          900: "#0B1437",
          950: "#060A1F",
        },
        ember: {
          DEFAULT: "#FF7849",
          50: "#FFF3EE",
          100: "#FFE3D4",
          200: "#FFC4A8",
          300: "#FFA078",
          400: "#FF7849",
          500: "#F95A22",
          600: "#D9420F",
          700: "#A8320B",
          800: "#76230A",
          900: "#4A1606",
        },
        sky: {
          50: "#EEF6FF",
          100: "#D7EAFE",
          200: "#B0D4FD",
          300: "#7DB6F9",
          400: "#4D92F0",
          500: "#2972E3",
          600: "#1B57C0",
          700: "#1A459A",
          800: "#1B3B7D",
          900: "#1B3568",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -20px rgba(11, 20, 55, 0.35)",
        ember: "0 18px 40px -16px rgba(255, 120, 73, 0.55)",
        soft: "0 4px 24px -8px rgba(15, 23, 52, 0.12)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        noise:
          "radial-gradient(circle at 20% 10%, rgba(77,146,240,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,120,73,0.18), transparent 45%), radial-gradient(circle at 50% 100%, rgba(27,87,192,0.15), transparent 50%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "plane-drift": {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(6px) translateY(-3px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "plane-drift": "plane-drift 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
