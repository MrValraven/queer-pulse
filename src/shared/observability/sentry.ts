/**
 * Error-monitoring abstraction (spec 01). Provider-agnostic so the rest of the
 * codebase never imports a vendor SDK directly — it calls `captureException`
 * and friends here.
 *
 * INTENTIONAL NOT-YET-WIRED STUB. `@sentry/react` is deliberately NOT a
 * dependency yet, so every function below is a total, side-effect-free no-op
 * that can never throw — imports and calls are safe from any entry point today.
 * Consent + gating (DSN present, production build, analytics consent via spec
 * 07's `setMonitoringConsent`) are already tracked here so that, once a real
 * monitor is wired, nothing can run until a member opts in.
 *
 * Activating monitoring is a self-contained change: add the SDK, implement
 * these four functions against it (behind the existing `enabled` gate), and add
 * a source-map upload step to the build. No caller needs to change — none of
 * these functions returns a value, so behaviour stays identical when wired.
 */

type Extra = Record<string, unknown>;

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN as
  | string
  | undefined;

/** Flipped on only when DSN + PROD + analytics consent all hold. */
let enabled = false;

/** Called by the ConsentProvider (spec 07) once analytics consent is known. */
export function setMonitoringConsent(granted: boolean): void {
  enabled = granted && Boolean(DSN) && import.meta.env.PROD;
  // No-op stub: nothing to init/close until a real monitor is wired.
}

/** Single init entry point, called from main.tsx before render. No-op stub. */
export function initObservability(): void {
  // No-op stub: intentionally does nothing until a real monitor is wired.
  void DSN;
}

/** Report an error to the monitor. No-op stub until wired / until consent. */
export function captureException(error: unknown, extra?: Extra): void {
  if (!enabled) return;
  // No-op stub: swallow the report until a real monitor is wired.
  void error;
  void extra;
}

/** Attach an opaque, non-PII user id (never email/handle). Null clears it. */
export function setMonitoringUser(hashedId: string | null): void {
  if (!enabled) return;
  // No-op stub: intentionally does nothing until a real monitor is wired.
  void hashedId;
}
