/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/assets/svg/**/*.svg", // optional if you use SVGR inline styling
  ],
  darkMode: "class", // enables dark mode with a class
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: "#8e4efc", // Main vivid purple
        secondary: "#4a90e2", // Electric blue
        accent: "#3b82f6", // A clean, professional blue (same as --color-accent-light)

        // Backgrounds
        bgDark: "#0f172a", // Dark mode background
        bgLight: "#f9f9fb", // Light mode background

        // Text Colors
        textDark: "#e1e1e1", // Text on dark background
        textLight: "#1a1a1a", // Text on light background
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"], // For headings/logo
        inter: ["Inter", "sans-serif"], // For body/UI
      },
    },
  },
};
