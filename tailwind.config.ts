import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          ivory: "#FFFFFF",
          cream: "#FFFFFF",
          blush: "#E8C9C5",
          plum: "#452638",
          gold: "#B69A62",
          charcoal: "#282522",
          white: "#FFFFFF",
          "plum-light": "#5D354D",
          "plum-dark": "#321A29",
          "gold-light": "#CBB380",
          "gold-dark": "#9A804B",
          sand: "#EAE0D5",
          muted: "#766E65",
        },
      },
      fontFamily: {
        serif: ["var(--font-heading)", "'Playfair Display'", "Georgia", "serif"],
        display: ["var(--font-heading)", "'Italiana'", "'Playfair Display'", "serif"],
        cinzel: ["'Cinzel'", "serif"],
        italiana: ["'Italiana'", "serif"],
        cormorant: ["'Cormorant Garamond'", "Georgia", "serif"],
        montserrat: ["'Montserrat'", "sans-serif"],
        sans: ["var(--font-body)", "'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.2em",
        subtle: "0.08em",
      },
      boxShadow: {
        subtle: "0 4px 20px -2px rgba(40, 37, 34, 0.05)",
        card: "0 10px 30px -4px rgba(40, 37, 34, 0.07)",
        elevated: "0 20px 40px -6px rgba(40, 37, 34, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
