import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        astra: {
          dark: "#030712",
          card: "rgba(15, 23, 42, 0.65)",
          border: "rgba(139, 92, 246, 0.2)",
          accent: "#8b5cf6",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          pink: "#ec4899",
        },
      },
      backgroundImage: {
        "astra-glow":
          "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 35%, transparent 70%)",
        "astra-card-glow":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)" },
          "100%": { boxShadow: "0 0 35px rgba(6, 182, 212, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
