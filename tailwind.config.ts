import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        chalk: "#EFF1EC",
        ink: "#182019",
        forest: "#344A38",
        beacon: "#E75B3D",
        sky: "#B7D1D4",
        ochre: "#C7A04A",
        mist: "#DDE2DA",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-fira)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
