/**
 * True only when the current app instance is a dev-only simulation sandbox.
 *
 * A sandbox instance is booted inside the `/simulations/:id` device-frame
 * iframe (tagged `data-sandbox="1"`) or opened full-screen with a `?sandbox=1`
 * query param. When true, `DemoModeProvider` forces locked demo mode, so the
 * instance renders mock data and makes zero backend calls, even if the parent
 * app is in live mode. Hard-gated to dev so the demo admin-guard bypass in
 * `authGate.ts` can never be reached in production.
 *
 * The iframe is same-origin, so `window.frameElement` is readable. Reading it
 * (rather than only the query param) means the flag survives a hard reload
 * inside the frame, where the param could be dropped.
 */
export function isSandbox(): boolean {
  if (!import.meta.env.DEV) return false;
  const framed =
    typeof window !== "undefined" &&
    window.frameElement?.getAttribute("data-sandbox") === "1";
  const flagged =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("sandbox");
  return Boolean(framed || flagged);
}
