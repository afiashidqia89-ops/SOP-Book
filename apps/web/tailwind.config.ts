import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palet perkebunan sawit
        palm: {
          50: "#f2f8ee",
          100: "#e0efdb",
          500: "#3f7d20",
          600: "#2f6418",
          700: "#275115",
          800: "#1f4112",
          900: "#1a3611",
        },
      },
    },
  },
  plugins: [],
};
export default config;
