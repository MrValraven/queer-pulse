import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, vi } from "vitest";
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

// jsdom implements Element but not its layout-dependent scroll methods, so a
// component that calls `someRef.scrollTo(...)` on a real DOM node (e.g.
// FeaturedSpotlightCard's scroller in Discovery.tsx) throws
// "element.scrollTo is not a function" and trips the route error boundary.
// Stub it as a no-op on the prototype so every element inherits it. Only
// assigned when absent, mirroring the guarded window stubs above.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// Same gap, different method: a keyboard-navigable list that keeps the focused
// row in view (`rowRef.current?.scrollIntoView({ block: "nearest" })` in
// VerificationRequestRows) throws without this.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom ships `URL` but not the blob-URL helpers, so any component that turns a
// File/Blob into a preview URL (e.g. the list-a-business photo-upload wizard on
// /local/directory/list) throws "window.URL.createObjectURL is not a function"
// and trips the route error boundary. Stub the pair: a deterministic fake URL
// out, a no-op revoke. Guarded so a real implementation (or a per-test stub)
// wins.
if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:jsdom/stub";
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => {};
}

// ── MSW × jsdom × Node AbortSignal realm mismatch ────────────────────────────
// MSW v2's fetch interceptor (under Node + jsdom) validates `RequestInit.signal`
// against a *different* `AbortSignal` realm than the app's global one, so ANY
// signal the app attaches — including a native `new AbortController().signal` —
// is rejected with `Expected signal (...) to be an instance of AbortSignal`, and
// live route-render / request-budget tests never receive a response (see the
// timeout controller in src/shared/api/client.ts). The signal only drives fetch
// timeout/cancellation, which these tests don't exercise, so we strip it from
// fetch inits in the test env. Wrapped per-test (and restored after) so it sits
// OUTSIDE whatever `fetch` MSW installs in its own `beforeAll`, and never
// accumulates. Request URL/method — all the request-budget assertions observe —
// are untouched, so counts are unaffected.
let fetchBeforeStrip: typeof globalThis.fetch | undefined;
beforeEach(() => {
  fetchBeforeStrip = globalThis.fetch;
  const inner = fetchBeforeStrip;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (init && "signal" in init) {
      const { signal: _signal, ...withoutSignal } = init;
      return inner(input, withoutSignal);
    }
    return inner(input, init);
  };
});

afterEach(() => {
  if (fetchBeforeStrip) globalThis.fetch = fetchBeforeStrip;
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
