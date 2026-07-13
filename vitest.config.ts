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
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    // Default: empty API URL => config.ts freezes apiAvailable=false => demo mode
    // is forced on, so route/provider suites are deterministic and network-free.
    // Suites that exercise the live path override this with vi.stubEnv.
    env: { VITE_API_URL: "" },
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
