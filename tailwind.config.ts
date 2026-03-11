import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        volare: {
          green: "#00a243",
          "green-hover": "#00923c",
          "green-dark": "#00712f",
          "green-deep": "#005122",
          "green-light": "#80d1a1",
          "green-mid": "#4dbe7b",
          "green-bg": "#e6f6ec",
          "green-bright": "#1aab56",
          "green-soft": "#b3e3c7",
        },
        gs: {
          50: "#F8FAFC",
          100: "#F2F5F9",
          200: "#E3E8EF",
          300: "#CDD5E0",
          400: "#97A3B6",
          500: "#677489",
          600: "#4A5567",
          700: "#364153",
          800: "#20293A",
          900: "#111729",
        },
        base: {
          white: "#F7F7F3",
          black: "#111111",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
