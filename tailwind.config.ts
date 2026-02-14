import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", "class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};

export default config;
