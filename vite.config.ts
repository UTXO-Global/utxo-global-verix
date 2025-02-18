import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: {
      key: path.resolve(__dirname, ".certs/hson-dev.local-key.pem"),
      cert: path.resolve(__dirname, ".certs/hson-dev.local.pem"),
    },
  },
});
