import { defineConfig } from "vite";

export default defineConfig({
  build: {
    assetsDir: "assets",
    sourcemap: false,
    chunkSizeWarningLimit: 700
  }
});
