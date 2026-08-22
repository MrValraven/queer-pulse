import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  build: {
    // No source maps in the production bundle.
    //
    // This used to be `"hidden"`, which still WRITES a .map next to every chunk
    // and only omits the `//# sourceMappingURL` comment. Vercel serves `dist/`
    // as static files before the SPA rewrite, so anyone could fetch
    // `/assets/index-<hash>.js.map` (the hash is right there in the page's own
    // <script> tag) and read the whole un-minified frontend, auth gate and
    // admin routing included. Nothing in the pipeline deleted them afterwards
    // and no monitor consumed them either: the Sentry source-map upload step
    // does not exist yet (see shared/observability/sentry.ts).
    //
    // Turn this back to "hidden" only together with `@sentry/vite-plugin`
    // configured with `sourcemaps.filesToDeleteAfterUpload: ["dist/**/*.map"]`,
    // so the maps reach the monitor and never the public bundle.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the stable, rarely-changing vendor libraries out of the app
        // entry chunk so their hashes (and the browser cache) survive app-code
        // edits. Kept deliberately coarse — a few big-ticket dependencies, not
        // one chunk per package — so we don't trade cache stability for a flood
        // of tiny requests. Everything else stays in the default vendor split.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-router|scheduler)[\\/]/.test(
              id,
            )
          ) {
            return "vendor-react";
          }
          if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) {
            return "vendor-query";
          }
          if (/[\\/]node_modules[\\/]socket\.io-client[\\/]/.test(id)) {
            return "vendor-realtime";
          }
          // maplibre-gl (WebGL map renderer) and the @visx/* charting family
          // are individually heavy and each reachable from more than one lazy
          // route (map picker + directory map view; analytics/charts) — give
          // them their own cacheable buckets instead of letting them land in
          // (and duplicate across) the default vendor split.
          if (/[\\/]node_modules[\\/]maplibre-gl[\\/]/.test(id)) {
            return "vendor-maplibre";
          }
          if (/[\\/]node_modules[\\/]@visx[\\/]/.test(id)) {
            return "vendor-visx";
          }
          // motion (LazyMotion's domAnimation feature bundle) is imported by
          // MotionProvider, which mounts app-wide — keep it out of the entry
          // chunk and in its own runtime-cached bucket instead (it is
          // deliberately absent from sw.ts's injectManifest.globPatterns
          // precache diet, so it downloads on first use, not on first visit).
          // `motion` is a thin shim re-exporting `framer-motion` — the actual
          // LazyMotion/domMax/drag implementation resolves under
          // node_modules/framer-motion/, not node_modules/motion/, so both
          // must match or framer-motion falls through into the entry chunk.
          if (/[\\/]node_modules[\\/](motion|framer-motion)[\\/]/.test(id)) {
            return "vendor-motion";
          }
          return undefined;
        },
      },
    },
  },
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
        // Discoverable in app stores / install dialogs that surface categories.
        categories: ["social", "lifestyle"],
        // Long-press / jump-list quick actions from the installed icon. Paths
        // mirror routeMap.ts — keep in sync if those slugs change. Icons are
        // intentionally omitted (the app icon is a poor per-shortcut glyph);
        // engines fall back gracefully.
        shortcuts: [
          {
            name: "Events",
            short_name: "Events",
            description: "Browse and RSVP to what's happening",
            url: "/events",
          },
          {
            name: "Messages",
            short_name: "Messages",
            description: "Open your conversations",
            url: "/messages",
          },
          {
            name: "Community feed",
            short_name: "Feed",
            description: "See the latest from your community",
            url: "/feed",
          },
          {
            name: "Local Business directory",
            short_name: "Directory",
            description: "Find queer-owned places and spaces",
            url: "/local/directory",
          },
        ],
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
        // Each precached file (see globPatterns below) must stay under
        // Workbox's default 2 MiB cap or `pnpm build` fails. (Was under
        // `workbox.maximumFileSizeToCacheInBytes` in generateSW mode.) This
        // comment previously claimed the main entry chunk was ~2.77 MB and
        // drove the override — that's stale: per `pnpm build`'s own chunk
        // table, the entry chunk is ~433 KB raw / ~126 KB gzip, and no
        // currently-precached file (entry chunk, vendor-react/-query, CSS,
        // fonts) comes close to 2 MiB either — the largest today is
        // vendor-react at ~409 KB raw. Leaving the override in place as
        // headroom for whichever precached file grows next, not a value
        // that's load-bearing against today's build; re-check `pnpm build`'s
        // chunk table before assuming a specific file justifies it.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Precache diet. The default globs would precache all ~470 built chunks
        // on the first visit (the whole app, ~13 MB). Instead precache only the
        // *app shell*: index.html, every CSS file, the entry chunk
        // (assets/index-*.js) and the core react/query vendor chunks, the
        // manifest, fonts, and icons. The lazy route chunks — including the
        // heavy vendor-maplibre / vendor-visx buckets (see manualChunks above)
        // and every per-page bundle — are left out and runtime-cached on first
        // use by src/sw.ts's script route. Keep this in sync with the vendor
        // chunk names in manualChunks.
        globPatterns: [
          "index.html",
          "manifest.webmanifest",
          "**/*.css",
          "assets/index-*.js",
          "assets/vendor-react-*.js",
          "assets/vendor-query-*.js",
          "**/*.woff2",
          "favicon.svg",
          "icons/*.png",
        ],
      },
    }),
  ],
});
