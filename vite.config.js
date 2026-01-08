import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr"; // ✅ Import SVGR plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(), // ✅ Enable SVG as React components
  ],
});
