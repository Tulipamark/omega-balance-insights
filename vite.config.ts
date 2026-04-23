import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [react()];

  if (mode === "development") {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger() as PluginOption);
  }

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return undefined;
            }

            if (id.includes("@supabase") || id.includes("@tanstack/react-query")) {
              return "data";
            }

            if (id.includes("recharts")) {
              return "charts";
            }

            if (
              id.includes("@radix-ui") ||
              id.includes("embla-carousel-react") ||
              id.includes("framer-motion") ||
              id.includes("react-day-picker") ||
              id.includes("sonner") ||
              id.includes("vaul")
            ) {
              return "ui";
            }

            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("react") ||
              id.includes("zod") ||
              id.includes("date-fns") ||
              id.includes("lucide-react")
            ) {
              return "vendor";
            }

            return "vendor";
          },
        },
      },
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: true,
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
