import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // "prompt", never "autoUpdate": every route is lazy-loaded and an
      // auto-claiming worker can swap mid-session. PwaUpdatePrompt reloads
      // on the user's say-so.
      registerType: "prompt",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon-180-v2.png"],
      // The manifest lives here rather than in public/manifest.json so it stays
      // in one place alongside the icon list. public/manifest.json is deleted.
      manifest: {
        name: "QueerPulse",
        short_name: "QueerPulse",
        description:
          "A quiet, vouched-for network for LGBTQ+ professionals, creatives and community in Lisbon.",
        // The ?mode=standalone marker is DisplayModeProvider's sticky fallback
        // for engines where the display-mode query and navigator.standalone
        // both misfire. Do not remove it without updating that provider.
        start_url: "/?mode=standalone",
        scope: "/",
        display: "standalone",
        theme_color: "#2d1b3d",
        background_color: "#f7f3ee",
        icons: [
          {
            src: "/icons/icon-192-v2.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-v2.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-maskable-v2.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        // The main entry chunk (~2.77 MB) exceeds Workbox's default 2 MiB
        // precache cap; `pnpm build` fails without this. (Was under
        // `workbox.maximumFileSizeToCacheInBytes` in generateSW mode.)
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
});
