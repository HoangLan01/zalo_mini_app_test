import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zmp from "zmp-vite-plugin";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [zmp(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
