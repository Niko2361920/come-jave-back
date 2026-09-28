// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("firebase")) return "firebase";
          if (id.includes("@tanstack/react-router")) return "router";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("sonner")) return "ui";
          if (id.includes("recharts") || id.includes("embla-carousel") || id.includes("@dnd-kit")) return "visuals";
          if (id.includes("date-fns") || id.includes("react-day-picker")) return "dates";
          if (id.includes("react") || id.includes("react-dom")) return "react";
          return "vendor";
        },
      },
    },
  },
});
