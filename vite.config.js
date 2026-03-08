import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(`v${version}`),
  },
});
