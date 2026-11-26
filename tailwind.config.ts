import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        babtek: {
          navy: "#123B68",
          deep: "#0C2948",
          blue: "#2878BD",
          sky: "#65B4F3",
          ink: "#263442",
          pale: "#F3F6FA",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
