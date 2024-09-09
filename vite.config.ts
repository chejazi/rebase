import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: "/src/components",
      constants: "/src/constants",
      styles: "/src/styles",
      utils: "/src/utils",
    },
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  server: {
    fs: {
      // Disable strict path checking to allow URLs with dots to be handled by HMR
      strict: false
    }
  }
});
