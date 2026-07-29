import "@testing-library/jest-dom/vitest";
import { afterEach, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as axeMatchers from "vitest-axe/matchers.js";

// ── axe-core matcher ─────────────────────────────────────────────────────────
// Registers `expect(results).toHaveNoViolations()` for every suite. The `axe()`
// runner itself is imported per-test from "vitest-axe" — see the a11y suites in
// src/test/a11y.test.tsx. Imported with the explicit `.js` because vitest-axe
// 0.1.0 ships no "exports" map, so extensionless subpath resolution is only a
// bundler nicety rather than a guarantee.
expect.extend(axeMatchers);

// Declaration merging: the type parameter must match @vitest/expect's own
// `interface Matchers<T = any>` exactly, or TS rejects the merge.
declare module "vitest" {
  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
  interface Matchers<T = any> extends axeMatchers.AxeMatchers {}
  /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
}

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
