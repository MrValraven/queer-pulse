/**
 * Error-monitoring abstraction (spec 01). Provider-agnostic so the rest of the
 * codebase never imports a vendor SDK directly — it calls `captureException`
 * and friends here.
 *
 * Wired to `@sentry/react`. The SDK module itself is only fetched/parsed via a
 * dynamic `import("@sentry/react")` inside the guarded `initObservability()`
 * path — never at module scope — so dev builds and prod builds with no DSN
 * configured never pay for downloading or parsing the SDK at all. It is
 * initialised at startup ONLY in a production build that has a DSN
 * configured; otherwise nothing is loaded and every function is a safe
 * no-op. Even when initialised, no event leaves the browser until the member
 * grants the `monitoring` consent category — the `beforeSend` hook drops
 * everything while `enabled` is false, and `setMonitoringConsent` (called by
 * the ConsentProvider, spec 07) flips it. This keeps live consent toggles
 * working with no re-init and no page reload.
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

import type * as Sentry from "@sentry/react";

type Extra = Record<string, unknown>;

/**
 * Holds the resolved SDK module once `initObservability()` has dynamically
 * imported it. Every other exported function reads through this instead of a
 * static binding, so nothing here forces the module to be fetched/parsed
 * outside the guarded (DSN + PROD) path.
 */
let sentryModule: typeof Sentry | null = null;

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN as
  | string
  | undefined;

/** Flipped on only when DSN + PROD + analytics consent all hold. */
let enabled = false;

/** Guards against a double `Sentry.init` (StrictMode / hot reload). */
let initialised = false;

/**
 * Errors raised while the SDK chunk is still downloading.
 *
 * `initObservability()` is fire-and-forget and `sentryModule` only lands after
 * `await import("@sentry/react")` resolves, so without this every boot-time
 * crash — provider initializers, a first-render throw routed through
 * `ErrorBoundary` — was dropped on the floor. Those are exactly the failures
 * most worth seeing. Buffer them instead and flush once `Sentry.init` returns.
 *
 * Bounded, so a boot loop that throws on every frame cannot grow this without
 * limit before the chunk arrives.
 */
const MAX_BUFFERED_EVENTS = 20;
let bufferedEvents: { error: unknown; extra?: Extra }[] = [];

/** True once `ConsentProvider` has told us the member's monitoring choice. */
let isConsentKnown = false;

/**
 * Send (or discard) the boot buffer. Called from both sides of the race, since
 * either the SDK chunk or the consent decision can land first:
 *  - neither settled yet → hold the buffer, this runs again;
 *  - settled and granted → send;
 *  - settled and refused → discard, exactly as `beforeSend` would have.
 * The consent gate is load-bearing: nothing here may transmit before the member
 * has said yes.
 */
function flushBufferedEvents(): void {
  if (!sentryModule || !isConsentKnown) return;
  const pending = bufferedEvents;
  bufferedEvents = [];
  if (!enabled) return;
  for (const event of pending) {
    sentryModule.captureException(
      event.error,
      event.extra ? { extra: event.extra } : undefined,
    );
  }
}

/** Called by the ConsentProvider (spec 07) once analytics consent is known. */
export function setMonitoringConsent(granted: boolean): void {
  enabled = granted && Boolean(DSN) && import.meta.env.PROD;
  isConsentKnown = true;
  // No re-init: `beforeSend` reads `enabled` on every event, so flipping this
  // is enough to start/stop transmission live.
  flushBufferedEvents();
}

/**
 * Single init entry point, called from main.tsx before render. Async so the
 * `@sentry/react` module is only fetched once the DSN+PROD guard passes —
 * the call site fires this without awaiting it, so first paint never blocks
 * on the dynamic import.
 */
export async function initObservability(): Promise<void> {
  // Only stand up the SDK in a production build with a DSN. In dev, or with no
  // DSN, there is nothing to send — never load the transport or global handlers.
  if (initialised || !DSN || !import.meta.env.PROD) return;
  initialised = true;

  const Sentry = await import("@sentry/react");
  sentryModule = Sentry;

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

  // Anything thrown while the chunk was in flight goes out now.
  flushBufferedEvents();
}

/** Report an error to the monitor. No-op until wired / until consent. */
export function captureException(error: unknown, extra?: Extra): void {
  if (!sentryModule) {
    // The SDK chunk is still loading (or was never going to load). Buffer only
    // while an init is actually in flight; with no DSN, or outside a production
    // build, `initialised` stays false and this correctly stays a no-op.
    if (!initialised) return;
    if (bufferedEvents.length >= MAX_BUFFERED_EVENTS) return;
    bufferedEvents.push({ error, extra });
    return;
  }
  if (!enabled) return;
  sentryModule.captureException(error, extra ? { extra } : undefined);
}

/** Attach an opaque, non-PII user id (never email/handle). Null clears it. */
export function setMonitoringUser(hashedId: string | null): void {
  if (!enabled || !sentryModule) return;
  sentryModule.setUser(hashedId ? { id: hashedId } : null);
}
