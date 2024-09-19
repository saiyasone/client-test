// vite.config.ts
import react from "file:///D:/ts-app/vshareweb-client/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { defineConfig } from "file:///D:/ts-app/vshareweb-client/node_modules/vite/dist/node/index.js";
import svgr from "file:///D:/ts-app/vshareweb-client/node_modules/vite-plugin-svgr/dist/index.js";
import tsConfigPaths from "file:///D:/ts-app/vshareweb-client/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tsConfigPaths(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          console.log(id);

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
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx0cy1hcHBcXFxcdnNoYXJld2ViLWNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcdHMtYXBwXFxcXHZzaGFyZXdlYi1jbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3RzLWFwcC92c2hhcmV3ZWItY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHN2Z3IgZnJvbSBcInZpdGUtcGx1Z2luLXN2Z3JcIjtcclxuaW1wb3J0IHRzQ29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCksIHRzQ29uZmlnUGF0aHMoKSwgc3ZncigpXSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC9cIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwicmVhY3RcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC1kb20vXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInJlYWN0LWRvbVwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL2xvZGFzaC9cIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwibG9kYXNoXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1EsT0FBTyxXQUFXO0FBQ3hSLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG1CQUFtQjtBQUcxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFBQSxFQUMxQyxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxxQkFBcUIsR0FBRztBQUN0QyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyx5QkFBeUIsR0FBRztBQUMxQyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxzQkFBc0IsR0FBRztBQUN2QyxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
