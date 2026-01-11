/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/assets/svg/**/*.svg",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Core Accent */
        brand: {
          DEFAULT: "#2563eb",
          hover: "#2563eb",
          soft: "#60a5fa",
        },

        /* Backgrounds */
        bgDark: "#000000",
        bgLight: "#ffffff",

        /* Text */
        textDark: "#e5e7eb",
        textLight: "#0f172a",

        /* Neutral UI */
        border: "#1f2933",
        muted: "#9ca3af",
      },

      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
};
