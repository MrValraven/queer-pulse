import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Separate from vite.config.ts so the production build config stays clean, but
// reuses @vitejs/plugin-react so JSX/TSX compiles identically to the app.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Treat CSS-module imports as no-ops: we assert behaviour, not class strings.
    css: false,
    // scripts/**/*.test.mjs covers the build-time generators (sitemap,
    // prerender, the shared public-path list). They are plain .mjs run under
    // node, not app code, but their correctness gates what ships to crawlers —
    // a gated path leaking into the sitemap is a privacy bug, so they are
    // tested alongside everything else rather than left unverified.
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.test.mjs"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    // Default: demo mode explicitly opted into (VITE_DEMO=1) with no API URL =>
    // config.ts freezes apiAvailable=false => demo is forced on, so route and
    // provider suites are deterministic and network-free. Demo is NEVER inferred
    // from an empty VITE_API_URL any more (see src/shared/api/config.ts), so the
    // opt-in has to be stated here or every suite would flip to the live path.
    // Suites that exercise the live path stub VITE_API_URL with vi.stubEnv; with
    // an API URL present demo defaults back OFF, so they need no VITE_DEMO change.
    env: { VITE_API_URL: "", VITE_DEMO: "1" },
    coverage: {
      provider: "v8",
      include: [
        "src/shared/api/**",
        "src/features/**/api/**",
        "src/app/providers/**",
      ],
      // Gate ONLY the critical auth client; no global threshold (see spec:
      // ~290 mostly-static pages would make a global line-% gate meaningless).
      thresholds: {
        "src/shared/api/client.ts": { statements: 90, branches: 85 },
      },
    },
  },
});
