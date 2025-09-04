import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true
      },
      "/verify-email": {
        target: "http://localhost:3000/api/auth",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/verify-email/, "/verify-email")
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // api: "modern-compiler", // or "modern"
        silenceDeprecations: [
          "mixed-decls",
          "color-functions",
          "global-builtin",
          "import"
        ] // k hiện warning của thư viện gallery
      }
    }
  }
});
