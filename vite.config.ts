import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "prompt", never "autoUpdate": every route in src/app/routes.tsx is
      // lazy-loaded, and an auto-claiming worker can swap mid-session, leaving
      // the running page importing chunks the new build no longer has.
      // PwaUpdatePrompt surfaces a toast and reloads on the user's say-so.
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
      workbox: {
        cleanupOutdatedCaches: true,
        // Without this, PrecacheRoute's default directoryIndex ("index.html")
        // matches navigations to "/" against the precached index.html BEFORE
        // the NetworkFirst runtimeCaching rule below ever runs (precacheAndRoute
        // is registered first). That left "/" served from the precache and
        // defeated NetworkFirst's job of keeping index.html fresh after a
        // deploy. Setting it to null removes that directory-index fallback, so
        // "/" falls through to the NetworkFirst navigation rule like every
        // other route. (`cleanURLs`, also suggested during review, is not a
        // workbox-build GenerateSWOptions field — it isn't threaded through to
        // the generated precacheAndRoute() call — and isn't needed here anyway:
        // it only appends ".html" to the request path, which doesn't affect
        // "/" matching "index.html".)
        directoryIndex: null,
        // DEVIATION FROM BRIEF (flagged for maintainer review): the app's main
        // entry chunk (index-*.js) is ~2.77 MB, over workbox's default 2 MiB
        // precache cap, and `pnpm build` fails outright without this. This is
        // unrelated to the registerType/NetworkFirst/cleanupOutdatedCaches
        // settings above; it's purely workbox's size gate on what gets listed
        // in the precache manifest. Value chosen with headroom over the
        // current largest chunk; revisit if bundle size grows further.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // No navigateFallback: offline support is explicitly out of scope, and
        // setting it would register a precache-backed navigation route that
        // competes with the NetworkFirst rule below. Deep links are already
        // rewritten server-side (vercel.json).
        navigateFallback: null,
        runtimeCaching: [
          {
            // Navigations go to the network first so a deploy's new index.html
            // is picked up immediately; the cache is only a fallback when the
            // network is slow or absent.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "qp-navigations",
              networkTimeoutSeconds: 4,
              // NetworkFirst caches each navigated URL as its own entry, and
              // this app has ~275 routes; without a cap the cache grows
              // unbounded as a user browses.
              expiration: {
                maxEntries: 20,
              },
            },
          },
        ],
      },
    }),
  ],
});
