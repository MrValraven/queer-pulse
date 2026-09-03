import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/** The one file this plugin exists to keep OUT of the precache. */
const WEBMANIFEST = "manifest.webmanifest";

/** Shape of the entries workbox precaches, and of the plugin API we reach for. */
interface PrecacheEntry {
  url: string;
  revision?: string | null;
}
interface PwaPluginApi {
  extendManifestEntries?: (
    extend: (entries: PrecacheEntry[]) => PrecacheEntry[] | undefined,
  ) => void;
}

/**
 * Drop `manifest.webmanifest` from the service worker's precache.
 *
 * WHY. The webmanifest is the app's INSTALL IDENTITY: its name, icons,
 * start_url, and the `background_color` the OS paints its launch screen with.
 * It is read by the browser and the OS at install and update-check time, never
 * by the running app. Precached, it sits behind this worker's update gate, and
 * `registerType: "prompt"` leaves a new worker waiting until the member accepts
 * the update pill — so a phone whose owner never accepted it keeps being handed
 * the OLD manifest. That is not hypothetical: it is how an installed app went
 * on painting a cream launch screen after `background_color` had already
 * shipped as plum, and it would have re-baked cream on a reinstall too.
 *
 * WHY IT TAKES A PLUGIN. Leaving it out of `globPatterns` does nothing, and
 * neither does a `manifestTransforms` filter. vite-plugin-pwa appends the
 * manifest it generates to `additionalManifestEntries` itself (see
 * `configureStaticAssets` in its dist), and workbox concatenates those AFTER
 * transforms run. `extendManifestEntries` is the plugin's own hook for editing
 * that final list, and this is the only place it can be reached.
 *
 * Nothing is lost: the file is ~1 KB, Vercel serves it `max-age=0,
 * must-revalidate`, no route in src/sw.ts matches `destination: "manifest"`, so
 * it simply goes to the network — and installing an app does not work offline
 * anyway.
 */
function keepWebmanifestOffPrecache(): Plugin {
  let resolvedPlugins: readonly Plugin[] = [];
  return {
    name: "qp:webmanifest-off-precache",
    apply: "build",
    configResolved(config) {
      resolvedPlugins = config.plugins as readonly Plugin[];
    },
    // buildStart, not configResolved: the entry list is built inside
    // vite-plugin-pwa's own async configResolved, and Vite does not guarantee
    // one plugin's configResolved has settled before the next one's runs.
    // buildStart is the first hook that is definitively after all of them, and
    // it is still well before generateBundle/closeBundle write the worker.
    buildStart() {
      const api = resolvedPlugins.find(
        (plugin) => plugin.name === "vite-plugin-pwa",
      )?.api as PwaPluginApi | undefined;
      if (!api?.extendManifestEntries) {
        // Loud on purpose. A silent no-op here would put the stale-launch-screen
        // bug back invisibly, and it would only surface on someone's phone days
        // after a deploy. If a vite-plugin-pwa upgrade moved this API, port this
        // plugin to the new one rather than deleting the check.
        throw new Error(
          "qp:webmanifest-off-precache: vite-plugin-pwa no longer exposes " +
            "extendManifestEntries, so the webmanifest would be precached again " +
            "and installed apps could keep an out-of-date launch screen.",
        );
      }
      api.extendManifestEntries((entries) =>
        entries.filter((entry) => entry.url !== WEBMANIFEST),
      );
    },
  };
}

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
    // Position in this array is not load-bearing: it looks vite-plugin-pwa up
    // by name at buildStart, by which point every plugin's config has resolved.
    keepWebmanifestOffPrecache(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // "prompt", never "autoUpdate": every route is lazy-loaded and an
      // auto-claiming worker can swap mid-session. PwaUpdatePrompt reloads
      // on the user's say-so.
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "icons/apple-touch-icon-180-v3.png",
      ],
      // The manifest lives here rather than in public/manifest.json so it stays
      // in one place alongside the icon list. public/manifest.json is deleted.
      manifest: {
        name: "QueerPulse",
        short_name: "QueerPulse",
        description:
          "A quiet, vouched-for network for LGBTQ+ professionals, creatives and community in Lisbon.",
        // The ?mode=standalone marker is read by src/app/providers/
        // standaloneLaunch.ts: DisplayModeProvider latches its sticky
        // "installed" fallback from it, and authGate uses it to send a
        // signed-in launch to /feed instead of the homepage. Do not change it
        // without updating that module.
        start_url: "/?mode=standalone",
        scope: "/",
        display: "standalone",
        theme_color: "#2d1b3d",
        // The ground the OS draws the launch screen on before any JS runs:
        // Android/Chrome generates its splash from this plus the 512 icon, and
        // iOS falls back to the same treatment on a device whose CSS size
        // matches none of index.html's apple-touch-startup-image queries.
        // This was --cream (#f7f3ee), which is what produced the abrupt
        // cream-disc launch screen on an installed app — the OS frame opened on
        // cream and the app then painted on plum. Kept equal to --plum so the
        // OS frame IS the first frame of the AppLaunch boot sequence.
        background_color: "#2d1b3d",
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
            src: "/icons/icon-192-v3.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-v3.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-maskable-v3.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          // Android 13+ themed icons keep only the alpha channel of this one.
          {
            src: "/icons/icon-monochrome-512-v3.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "monochrome",
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
          // NOT "manifest.webmanifest": see keepWebmanifestOffPrecache above.
          // The file reaches the precache by TWO independent routes — this glob
          // over the emitted dist/, and the entry vite-plugin-pwa appends to
          // additionalManifestEntries — and closing only one leaves it cached.
          "**/*.css",
          "assets/index-*.js",
          "assets/vendor-react-*.js",
          "assets/vendor-query-*.js",
          "**/*.woff2",
          "favicon.svg",
          "favicon.ico",
          "icons/*.png",
        ],
      },
    }),
  ],
});
