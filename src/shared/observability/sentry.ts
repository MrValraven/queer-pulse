/**
 * Error-monitoring abstraction (spec 01). Provider-agnostic so the rest of the
 * codebase never imports a vendor SDK directly — it calls `captureException`
 * and friends here.
 *
 * Wired to `@sentry/react`. The SDK is initialised at startup ONLY in a
 * production build that has a DSN configured; otherwise nothing is loaded and
 * every function is a safe no-op. Even when initialised, no event leaves the
 * browser until the member grants the `monitoring` consent category — the
 * `beforeSend` hook drops everything while `enabled` is false, and
 * `setMonitoringConsent` (called by the ConsentProvider, spec 07) flips it. This
 * keeps live consent toggles working with no re-init and no page reload.
 *
 * Errors only: no Session Replay, no performance tracing, no default PII. The
 * only user context ever attached is an opaque hashed id via `setMonitoringUser`.
 *
 * FOLLOW-UP (not done here — needs a build/secrets change, out of scope for a
 * source edit): add a source-map upload step so minified stack traces resolve.
 * Use `@sentry/vite-plugin` in `vite.config.ts` gated on an auth token secret
 * (SENTRY_AUTH_TOKEN) and set `release` to the same value as `VITE_RELEASE`, so
 * uploaded maps match the `release` tagged on events below. Until then, events
 * still report but frames stay minified.
 */

import * as Sentry from "@sentry/react";

type Extra = Record<string, unknown>;

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN as
  | string
  | undefined;

/** Flipped on only when DSN + PROD + analytics consent all hold. */
let enabled = false;

/** Guards against a double `Sentry.init` (StrictMode / hot reload). */
let initialised = false;

/** Called by the ConsentProvider (spec 07) once analytics consent is known. */
export function setMonitoringConsent(granted: boolean): void {
  enabled = granted && Boolean(DSN) && import.meta.env.PROD;
  // No re-init: `beforeSend` reads `enabled` on every event, so flipping this
  // is enough to start/stop transmission live.
}

/** Single init entry point, called from main.tsx before render. */
export function initObservability(): void {
  // Only stand up the SDK in a production build with a DSN. In dev, or with no
  // DSN, there is nothing to send — never load the transport or global handlers.
  if (initialised || !DSN || !import.meta.env.PROD) return;
  initialised = true;

  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE as string | undefined,
    // Errors only — keep the footprint minimal and consent-friendly.
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // Consent gate: initialised at startup so global handlers are installed, but
    // every event is dropped until the member grants `monitoring` consent
    // (setMonitoringConsent flips `enabled`). Returning null discards the event.
    beforeSend: (event) => (enabled ? event : null),
  });
}

/** Report an error to the monitor. No-op until wired / until consent. */
export function captureException(error: unknown, extra?: Extra): void {
  if (!enabled) return;
  Sentry.captureException(error, extra ? { extra } : undefined);
}

/** Attach an opaque, non-PII user id (never email/handle). Null clears it. */
export function setMonitoringUser(hashedId: string | null): void {
  if (!enabled) return;
  Sentry.setUser(hashedId ? { id: hashedId } : null);
}
