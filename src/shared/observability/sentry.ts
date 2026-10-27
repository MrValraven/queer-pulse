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
 * `beforeSend` gates on two things: the consent flag above, and the expected-
 * failure filter below, which drops the one HTTP status the whole app treats as
 * an answer rather than a fault.
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
  string | undefined;

/** Flipped on only when DSN + PROD + analytics consent all hold. */
let enabled = false;

/** Guards against a double `Sentry.init` (StrictMode / hot reload). */
let initialised = false;

/**
 * HTTP statuses discarded before transmission, whichever call site reported
 * them. Held to the single status the app treats as an expected answer
 * everywhere: 401 means the caller is signed out, an outcome the auth refresh /
 * `onAuthLost` path owns, and one that every member-scoped fetch living on a
 * public page would otherwise report on each signed-out load.
 *
 * `errorHandling.ts`, `consent.api.ts` and `nudges.api.ts` already filter this
 * at their own call sites. This is the second line of defence for the many
 * places that call `logError` directly, so a new one cannot quietly bring the
 * noise back.
 *
 * Deliberately narrow. Nothing here can drop a 5xx, a 4xx that signals a real
 * defect (400 / 403 / 409 / 422), or any non-HTTP error. 404 stays reportable
 * too: away from a page read it usually means a broken endpoint path.
 */
const SILENT_HTTP_STATUSES: readonly number[] = [401];

/**
 * Recognises `ApiError` (`shared/api/client.ts`) structurally, by its `name`
 * plus a numeric `status`, so this module keeps its promise of importing
 * neither a vendor SDK nor the api layer.
 */
function isExpectedHttpFailure(error: unknown): boolean {
  if (!(error instanceof Error) || error.name !== "ApiError") return false;
  const { status } = error as Error & { status?: unknown };
  return typeof status === "number" && SILENT_HTTP_STATUSES.includes(status);
}

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
 * Substrings matched against each breadcrumb URL, target and message. The
 * API entries cover stream, release, playlist, radio, format, episode,
 * preview and press kit reads (a radio read names the genre or mood a member listens to); the page
 * entries cover the routes a member opens to play a track, an album, a
 * playlist, a scene or a private preview, and the press kit pages (who opens
 * a preview link or a press kit is never recorded). The saved entry covers
 * a Studio like or save (`PUT`/`DELETE /me/saved/studio_track:<id>`), which
 * names the track a member liked, and the items entry covers adding a Studio
 * track, release or playlist to a saved list
 * (`/me/saved/lists/<id>/items/studio_<kind>:<id>`). The giving entries cover
 * a community's support section read and save and the page with its Support
 * tab open, so who opens or saves a support section is never recorded. The
 * dashboard and milestone entries cover a persona's stats, placements and
 * milestones reads, the milestone card read, the dashboard page and the
 * artist page a milestone link opens.
 */
const PRIVATE_BREADCRUMB_PATHS = [
  "/studio/tracks/",
  "/studio/releases/",
  "/studio/playlists/",
  "/studio/previews/",
  "/studio/radio",
  // Studio artist kinds: the format list a member browses and the episode
  // shelf (POST /studio/tracks/:id/publish is covered by "/studio/tracks/").
  "/studio/formats",
  "/studio/episodes/",
  "/press-kit",
  "/studio/track?id=",
  "/studio/album?id=",
  "/studio/collection?id=",
  "/studio/scene",
  "/studio/preview/",
  "/studio/press?id=",
  "/studio/press/print?id=",
  "/studio/press/edit",
  // Studio dashboard Part 1: the owner's numbers, placements and milestones
  // (API and page) and the milestone card read, and the artist page a
  // milestone link opens.
  "/studio/dashboard",
  "/studio/artists/",
  "/studio/milestones/",
  "/studio/artist?id=",
  // Studio dashboard Part 2: the play count, the listener's own history,
  // summary, supporting list and Clear (API and page). The artist's plays,
  // supporter and supporters reads ride on "/studio/artists/".
  "/studio/plays",
  "/me/studio-listening",
  "/studio/listening",
  "/me/saved/studio_",
  "/items/studio_",
  // Community support section: who opens or saves a community's support
  // section is never recorded. The API path covers the GET and the PUT, the
  // query covers the page URL with the Support tab open.
  "/giving",
  "tab=giving",
  // Creator drafts: a member's own autosave and the Admin-only staff views
  // (API path and page URL alike) stay out of every breadcrumb. The
  // listing drafts read matches the backend helper.
  "/me/creator-drafts",
  "/admin/creator-drafts",
  "/admin/listing-drafts",
  // Mention name lookups: the refs a page asks to name (a bio's, a thread's,
  // a persona hero's) stay out of every breadcrumb, so a staff preview of a
  // draft persona never leaves its slugs on a later error event.
  "/mentions/names",
  // Landing visit counter: the anonymous count records nothing about a
  // visitor, so its POST (and the admin read of the totals) stays out of
  // every breadcrumb too.
  "/landing/visits",
  // Email code sign-in: the request, verify and step-up routes stay out of
  // every breadcrumb, so no later error event says when someone asked for a
  // code or how often they tried one.
  "/auth/email-code",
];

/**
 * Drops the SDK's default fetch, xhr and navigation breadcrumbs that name a
 * Studio track, release or playlist URL (a stream request, radio read or
 * page visit there would show up on a later error event as a play history).
 * While the page is in Studio it also drops every `ui.*` breadcrumb (clicks
 * and key presses): their element text and labels name the tracks, warnings
 * and reports a member pressed. The same holds while a community's Support
 * tab (`tab=giving`) is open: the copy, move and remove buttons there carry
 * the owner's method labels. The player mounts app-wide, so on every other
 * page a `ui.*` breadcrumb is dropped too when the SDK's hint names a DOM
 * event whose target sits inside a `data-studio-player` surface (the bar,
 * the mini player, Now playing, the queue panel and the dialogs they open):
 * a Like, a Play it or a track row there names what the member listens to.
 * The same holds for a click on a toast's dismiss button (`data-toast-dismiss`
 * in the global toast region): the toast can come from a player action and
 * outlive the page that raised it, and a dismiss click has no diagnostic value.
 * The same holds on the staff utilities hub and the PDF tool under it: every
 * `ui.*` breadcrumb (its text carries file names) and every `console`
 * breadcrumb (qpdf writes to stdout and stderr) is dropped there.
 * A missing hint, a missing event or a target that is no Element (a text
 * node, the window, the document) leaves the breadcrumb to the rules above.
 * Every other breadcrumb passes through unchanged.
 */
export function dropStudioPlayBreadcrumb(
  breadcrumb: Sentry.Breadcrumb,
  hint?: Sentry.BreadcrumbHint,
): Sentry.Breadcrumb | null {
  if (
    breadcrumb.category?.startsWith("ui.") &&
    (isOnStudioPage() ||
      isOnCommunityGivingTab() ||
      isFromStudioPlayerSurface(hint) ||
      isFromToastDismiss(hint))
  ) {
    return null;
  }
  if (
    (breadcrumb.category?.startsWith("ui.") ||
      breadcrumb.category === "console") &&
    isOnStaffUtilitiesPage()
  ) {
    return null;
  }
  const candidates = [
    breadcrumb.data?.url,
    breadcrumb.data?.to,
    breadcrumb.data?.from,
    breadcrumb.message,
  ];
  const isPrivate = candidates.some(isPrivateObservabilityUrl);
  return isPrivate ? null : breadcrumb;
}

/** True while the page's path is under /studio (outside a browser, false). */
function isOnStudioPage(): boolean {
  const pathname =
    typeof window === "undefined" ? "" : (window.location?.pathname ?? "");
  return pathname === "/studio" || pathname.startsWith("/studio/");
}

/** True while the page's path is the staff utilities hub or under it (outside
 *  a browser, false). The literal mirrors `routes.adminUtilities`; routeMap is
 *  not imported here to avoid an import cycle. */
function isOnStaffUtilitiesPage(): boolean {
  const pathname =
    typeof window === "undefined" ? "" : (window.location?.pathname ?? "");
  return (
    pathname === "/admin/utilities" || pathname.startsWith("/admin/utilities/")
  );
}

/** True while the page's query has `tab=giving`, a community's Support tab
 *  and its editor (outside a browser, false). */
function isOnCommunityGivingTab(): boolean {
  const search =
    typeof window === "undefined" ? "" : (window.location?.search ?? "");
  return new URLSearchParams(search).get("tab") === "giving";
}

/** The marker on the outermost element of every player surface, portalled
 *  ones included (a portal escapes the bar's own marker). */
const STUDIO_PLAYER_SELECTOR = "[data-studio-player]";

/** The marker on every toast's dismiss button. */
const TOAST_DISMISS_SELECTOR = "[data-toast-dismiss]";

/** True when the breadcrumb's DOM event was aimed at a toast dismiss button
 *  (or the icon inside it). */
function isFromToastDismiss(hint?: Sentry.BreadcrumbHint): boolean {
  const domEvent: unknown = hint?.event;
  if (typeof domEvent !== "object" || domEvent === null) return false;
  if (!("target" in domEvent)) return false;
  const target = domEvent.target;
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }
  return target.closest(TOAST_DISMISS_SELECTOR) !== null;
}

/** True when the breadcrumb's DOM event (the SDK passes it as `hint.event`)
 *  was aimed at an element inside a player surface. False for a missing hint
 *  or event and for a target that is no Element (outside a browser, false). */
function isFromStudioPlayerSurface(hint?: Sentry.BreadcrumbHint): boolean {
  const domEvent: unknown = hint?.event;
  if (typeof domEvent !== "object" || domEvent === null) return false;
  if (!("target" in domEvent)) return false;
  const target = domEvent.target;
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }
  return target.closest(STUDIO_PLAYER_SELECTOR) !== null;
}

/**
 * The matcher behind every privacy scrub in this module: true when a value is
 * a string naming one of the {@link PRIVATE_BREADCRUMB_PATHS}.
 */
export function isPrivateObservabilityUrl(candidate: unknown): boolean {
  return (
    typeof candidate === "string" &&
    PRIVATE_BREADCRUMB_PATHS.some((path) => candidate.includes(path))
  );
}

/**
 * The browser SDK attaches `location.href` as `event.request.url` and the
 * page's `Referer` header to every error event, so an error thrown on a
 * playlist page would name the playlist. Removes the URL (and any query
 * string) when it names a private path, and every `Referer` header, in any
 * key casing, that does. Everything else on the event passes through.
 */
export function dropPrivateRequestUrl(
  event: Sentry.ErrorEvent,
): Sentry.ErrorEvent {
  const request = event.request;
  if (!request) return event;
  if (isPrivateObservabilityUrl(request.url)) {
    delete request.url;
    delete request.query_string;
  }
  const headers = request.headers;
  if (headers) {
    for (const headerName of Object.keys(headers)) {
      if (
        headerName.toLowerCase() === "referer" &&
        isPrivateObservabilityUrl(headers[headerName])
      ) {
        delete headers[headerName];
      }
    }
  }
  return event;
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
    // Two gates, both returning null to discard the event.
    // 1. Consent: initialised at startup so global handlers are installed, but
    //    every event is dropped until the member grants `monitoring` consent
    //    (setMonitoringConsent flips `enabled`).
    // 2. Expected failure: a signed-out 401 is an answer the app handles, so it
    //    never spends monitoring quota. See SILENT_HTTP_STATUSES.
    // Events that pass both gates lose a page URL or Referer naming a Studio
    // track, album or playlist (dropPrivateRequestUrl).
    beforeBreadcrumb: dropStudioPlayBreadcrumb,
    beforeSend: (event, hint) => {
      if (!enabled) return null;
      if (isExpectedHttpFailure(hint.originalException)) return null;
      return dropPrivateRequestUrl(event);
    },
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
