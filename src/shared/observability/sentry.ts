/**
 * Error-monitoring abstraction (spec 01). Provider-agnostic so the rest of the
 * codebase never imports a vendor SDK directly — it calls `captureException`
 * and friends here.
 *
 * NOTE: `@sentry/react` is intentionally NOT yet a dependency, so these are
 * build-safe no-ops. Activating monitoring is a one-file change:
 *   1. `pnpm add @sentry/react`
 *   2. implement the TODOs below (init/capture/user) against it
 *   3. add the Sentry Vite plugin for source-map upload, gated on
 *      `process.env.SENTRY_AUTH_TOKEN`
 * Everything is gated on a DSN being present, a production build, AND analytics
 * consent (spec 07) via `setMonitoringConsent`, so nothing runs until a member
 * opts in.
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
  // TODO(spec-01): when @sentry/react is installed, init or close the client
  // here so it only ever runs behind consent.
}

/** Single init entry point, called from main.tsx before render. No-op for now. */
export function initObservability(): void {
  // TODO(spec-01): Sentry.init({ dsn: DSN, environment: import.meta.env.MODE,
  //   release: import.meta.env.VITE_RELEASE, tracesSampleRate: 0.1,
  //   replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0,
  //   beforeSend: scrubPII }) — but only after setMonitoringConsent(true).
  void DSN;
}

/** Report an error to the monitor (no-op until wired / until consent). */
export function captureException(error: unknown, extra?: Extra): void {
  if (!enabled) return;
  // TODO(spec-01): Sentry.captureException(error, { extra })
  void error;
  void extra;
}

/** Attach an opaque, non-PII user id (never email/handle). Null clears it. */
export function setMonitoringUser(hashedId: string | null): void {
  if (!enabled) return;
  // TODO(spec-01): Sentry.setUser(hashedId ? { id: hashedId } : null)
  void hashedId;
}
