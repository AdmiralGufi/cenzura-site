import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",      // основной чёрный
        paper: "#ffffff",    // фон
        sand: "#f4f1ec",     // тёплый бежевый для секций
        line: "#e5e2dd",     // тонкие разделители
        muted: "#8a8782",    // вторичный текст
      },
      letterSpacing: {
        brand: "0.35em",
        wide2: "0.18em",
      },
      maxWidth: {
        site: "80rem",
      },
    },
  },
  plugins: [],
};

export default config;
