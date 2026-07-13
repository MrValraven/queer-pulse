import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// ── jsdom polyfills ──────────────────────────────────────────────────────────
// jsdom has no layout engine, so APIs the app touches during render must be
// stubbed or provider/page mounts throw. Keep these permissive no-ops; suites
// that assert on their behaviour stub them per-test instead.

// jsdom types these APIs as always-present, so `"x" in window` narrows the
// false branch to `never`. Assign through a loosely-typed alias instead.
const win = window as unknown as Record<string, unknown>;

if (!win.matchMedia) {
  win.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

class MockObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

if (!win.IntersectionObserver) win.IntersectionObserver = MockObserver;
if (!win.ResizeObserver) win.ResizeObserver = MockObserver;
if (!win.scrollTo) win.scrollTo = () => {};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
