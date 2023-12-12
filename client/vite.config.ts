import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        // changeOrigin: false,
      },
    },
  },
});
