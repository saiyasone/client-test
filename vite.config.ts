import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsConfigPaths(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/")) {
            return "react";
          }
          if (id.includes("node_modules/react-dom/")) {
            return "react-dom";
          }
          if (id.includes("node_modules/lodash/")) {
            return "lodash";
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173
  }
});
 