import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import zmp from "zmp-vite-plugin";
import { fileURLToPath, URL } from "url";

const requireEnv = (env, key, appName) => {
  if (!env[key]?.trim()) {
    throw new Error(`${appName} production build requires ${key}.`);
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (mode !== "development") {
    requireEnv(env, "VITE_API_URL", "Frontend");
    requireEnv(env, "VITE_ZALO_OA_ID", "Frontend");
  }

  return {
    plugins: [zmp(), react()],
    server: {
      port: 3000,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
