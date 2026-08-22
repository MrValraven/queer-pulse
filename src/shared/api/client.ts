import { API_BASE_URL } from "./config";

// The backend serves its domain API under a URI version prefix
// (`app.enableVersioning({ type: URI, defaultVersion: '1' })`). Every call made
// through the generic `request()` builder below is prefixed with this so it
// resolves to `/v1/...`. The two DIRECT `fetch()` calls in this file —
// `/csrf-token` and `/auth/refresh` — deliberately DO NOT use this prefix:
// their backend controllers are `@Version(VERSION_NEUTRAL)` and keep answering
// at their original unversioned paths (they're referenced outside this builder,
// so their URLs are fixed). Bumping the API version = change this one constant.
//
// Exported so the rare caller that must build a versioned API URL WITHOUT going
// through `request()` — e.g. an `<img src>` pointed at the `/files/*` route —
// prepends the same prefix instead of hand-writing (and forgetting) `/v1`.
export const API_VERSION_PREFIX = "/v1";

// Fail-fast ceiling for every call made through `request()`. A hung backend must
// never strand the UI on an infinite skeleton — worst of all a hung
// `GET /auth/me`, which holds EVERY gated route behind the AuthLoader forever.
// 15s is generous for our JSON endpoints (the only bytes `request()` ever
// carries — binary uploads PUT straight to storage via XHR, never through here;
// see features/members/api/useUploadImage.ts) yet far short of "never". Callers
// with a legitimately long-running endpoint can pass a per-call override.
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * `fetch` with the same fail-fast ceiling `request()` enforces, for the direct
 * calls in this file that bypass the generic builder (`/csrf-token`,
 * `/auth/refresh`, the unversioned logout). Without it a single stalled backend
 * connection on one of those endpoints freezes authentication for the whole
 * browser profile: `runRefresh` runs inside a cross-tab Web Lock, and every
 * mutation awaits `ensureCsrf()` before its own timed fetch even starts.
 *
 * Returns the `AbortSignal` alongside the response promise so callers that need
 * to hand the same deadline to another API (the Web Lock below) can reuse it.
 */
function timedFetch(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

/**
 * What this tab knows about the member's session, used to keep anonymous
 * visitors off the authenticated recovery paths.
 *
 * - `unknown` — before `/auth/me` settles. A 401 here still tries a refresh:
 *   this is the returning member whose 15-minute access cookie lapsed while the
 *   refresh cookie is perfectly good.
 * - `active`  — `/auth/me` confirmed a session.
 * - `none`    — `/auth/me` came back 401. Every other 401 in the app is then
 *   just "you are not signed in": no POST /auth/refresh round trip, no
 *   `onAuthLost` reconcile, no error telemetry for a visitor who simply never
 *   signed in.
 */
export type SessionState = "unknown" | "active" | "none";

let sessionState: SessionState = "unknown";

/** Told by `AuthProvider` once `GET /auth/me` settles. */
export function setSessionState(next: SessionState): void {
  sessionState = next;
}

/** Whether a 401 should attempt the refresh + reconcile recovery at all. */
function shouldAttemptRecovery(): boolean {
  return sessionState !== "none";
}

/** Normalized API failure carrying the HTTP status. */
export class ApiError extends Error {
  status: number;
  /** The parsed JSON error body, when the response had one. Lets callers read
   *  structured fields (e.g. a 422 `{ unmet: string[] }`) beyond `message`. */
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * A runtime validator for a *successful* response body. It receives the parsed
 * JSON (typed `unknown`) and must either return it narrowed to `T` or throw.
 * Supplied per-call through the `api*` helpers; when a body fails validation the
 * client raises `ApiError(422, "Malformed response …")` instead of handing a
 * mis-shaped object back to the caller as `T` — closing the P1-12 gap where a
 * backend field rename shipped as silent `undefined` UI with no error. Omitting
 * it keeps the legacy `JSON.parse(text) as T` behaviour, so every existing call
 * site is byte-for-byte unchanged and fully backward compatible.
 */
export type ResponseValidator<T> = (data: unknown) => T;

let csrfToken: string | null = null;
let onAuthLost: (() => void) | null = null;
let onPlatformLocked: ((message: string | null) => void) | null = null;

/** Register a callback fired when a 401 cannot be recovered by refresh. */
export function setOnAuthLost(cb: () => void): void {
  onAuthLost = cb;
}

/** Register a callback fired when the backend reports a platform lockdown. */
export function setOnPlatformLocked(
  cb: (message: string | null) => void,
): void {
  onPlatformLocked = cb;
}

/**
 * Result of a pre-sign-in reachability probe. `ok` means we can safely hand off
 * to the auth redirect; otherwise `reason` says what went wrong so the UI can
 * tell the member specifically rather than showing one catch-all notice.
 */
export type BackendProbe =
  | { ok: true }
  | {
      ok: false;
      reason: "offline" | "unreachable" | "server";
      status?: number;
    };

/**
 * Probe the backend before a full-page auth redirect so we can fail gracefully
 * in-app instead of stranding the browser on its own error page. Distinguishes:
 * - `offline`     — the device has no network connection at all
 * - `server`      — the backend answered but with a 5xx (the fault is on us)
 * - `unreachable` — the backend didn't answer (down / DNS / CORS / misconfigured)
 */
export async function probeBackend(): Promise<BackendProbe> {
  if (!API_BASE_URL) return { ok: false, reason: "unreachable" };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, reason: "offline" };
  }
  try {
    const res = await timedFetch(`${API_BASE_URL}/csrf-token`, {
      credentials: "include",
    });
    if (res.status >= 500) {
      return { ok: false, reason: "server", status: res.status };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

let csrfFetch: Promise<void> | null = null;

async function fetchCsrf(): Promise<void> {
  try {
    const res = await timedFetch(`${API_BASE_URL}/csrf-token`, {
      credentials: "include",
    });
    if (res.ok) {
      const body = (await res.json()) as { csrfToken?: string | null };
      csrfToken = body.csrfToken ?? null;
    }
  } catch {
    /* backend unreachable — leave token null; mutations will surface the error */
  }
}

/**
 * Fetch + cache the CSRF token once. Call on app load before any mutation.
 *
 * Single-flight, the same way `refreshOnce` below is: caching only the *result*
 * isn't enough, because callers that arrive while the first request is still in
 * flight all see a null token and all go to the network. That happens for real —
 * two concurrent mutations on a cold cache, and on every dev-mode load, where
 * StrictMode runs AuthProvider's bootstrap effect twice. Holding the promise
 * collapses them into one request; it's cleared afterwards so a failed attempt
 * (which resolves rather than rejects — the token just stays null) can be retried.
 */
export function ensureCsrf(): Promise<void> {
  if (csrfToken) return Promise.resolve();
  if (!csrfFetch) {
    csrfFetch = fetchCsrf().finally(() => {
      csrfFetch = null;
    });
  }
  return csrfFetch;
}

// A cross-tab mutex name. Refresh tokens ROTATE on every use, and the backend
// treats a second presentation of an already-rotated token as theft: it revokes
// the member's ENTIRE token family (see auth.service `rotateRefreshToken` +
// `revokeFamily`), logging every session out. The in-memory single-flight below
// only dedupes refreshes WITHIN one tab; two tabs sharing the one refresh-token
// cookie would still double-spend it once the 15-minute access token lapses and
// both fire a request. Serialising every tab's refresh through one Web Lock
// means each POST /auth/refresh runs against the cookie the previous holder just
// rotated in, so a token is never replayed and the family is never nuked.
const REFRESH_LOCK = "qp.auth.refresh";

/** The Web Locks manager, or undefined where unsupported (SSR/prerender, jsdom,
 *  very old Safari). Callers fall back to the in-tab single-flight alone. */
function lockManager(): LockManager | undefined {
  if (typeof navigator === "undefined") return undefined;
  return navigator.locks;
}

/**
 * Run `task` while holding the cross-tab refresh lock, or directly when the Web
 * Locks API is unavailable.
 *
 * The wait for the lock is itself bounded: `locks.request(name, { signal }, …)`
 * rejects with an `AbortError` once the signal fires, so a tab whose holder is
 * wedged (a browser killed mid-refresh, a lock the previous page never released)
 * gives up instead of queueing forever behind it. A caller that loses the race
 * gets `false` — the same answer a failed refresh gives — rather than a promise
 * that never settles and pins every gated route on its loader.
 */
function withRefreshLock(task: () => Promise<boolean>): Promise<boolean> {
  const locks = lockManager();
  if (!locks) return task();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  return locks
    .request(REFRESH_LOCK, { signal: controller.signal }, task)
    .catch(() => false)
    .finally(() => {
      clearTimeout(timeout);
    });
}

/**
 * POST /auth/refresh once; resolves true on a 2xx, false on anything else.
 *
 * A 403 here is almost always a STALE CSRF token, not a dead session. Every
 * GET /csrf-token mints a fresh random token and overwrites the shared,
 * non-httpOnly `csrf_token` cookie, so a second tab (or a reload in another tab)
 * rotates that cookie out from under THIS tab's cached `csrfToken`. The
 * backend's double-submit CsrfGuard then rejects our header/cookie mismatch with
 * a 403 — and it does so in the guard, BEFORE the controller runs, so the
 * rotating refresh token is never spent and a retry is safe. Mirror the
 * self-heal `request()` already does on a CSRF 403: evict the cached token,
 * re-bootstrap a fresh one, and retry ONCE. Without this, a cross-tab CSRF
 * desync reads as an expired session and forces a spurious "session expired" —
 * even though a page reload (which re-bootstraps CSRF from scratch) recovers
 * cleanly. That gap is exactly the "logged out, but refreshing signs me back
 * in" symptom.
 */
async function runRefresh(): Promise<boolean> {
  const attempt = () =>
    timedFetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
    });
  try {
    let res = await attempt();
    if (res.status === 403) {
      csrfToken = null;
      await ensureCsrf();
      res = await attempt();
    }
    return res.ok;
  } catch {
    return false;
  }
}

let refreshing: Promise<boolean> | null = null;
/**
 * Coalesce refreshes into a single network call across two layers:
 *  - `refreshing` collapses concurrent 401s in THIS tab into one request;
 *  - `withRefreshLock` serialises that request against OTHER tabs so the
 *    rotating refresh token is never double-spent (see REFRESH_LOCK).
 */
function refreshOnce(): Promise<boolean> {
  if (!refreshing) {
    refreshing = withRefreshLock(runRefresh).finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/**
 * Perform a single, cross-tab-coordinated token refresh. Exposed so the auth
 * layer's explicit `refresh()` (after a role change, vouch, genesis bootstrap,
 * etc.) shares the very same single-flight + lock as the automatic on-401
 * refresh — rather than firing an independent POST /auth/refresh that would race
 * it and double-spend the rotating token. Resolves true on success.
 */
export function refreshSession(): Promise<boolean> {
  return refreshOnce();
}

/**
 * POST to an UNVERSIONED backend path — i.e. one whose controller is
 * `@Version(VERSION_NEUTRAL)` and therefore answers at `/auth/...` rather than
 * `/v1/auth/...`. The only mutating caller is `logout`, and it MUST be
 * unversioned: the refresh-token cookie is scoped to `path=/auth`, so the
 * browser attaches it only to requests under `/auth`. Hitting the versioned
 * `/v1/auth/logout` would send no refresh cookie, so the backend's
 * revoke-row + force-disconnect-sockets step silently no-ops. Mirrors
 * `runRefresh`'s direct fetch: credentials included, CSRF header attached, no
 * version prefix. Resolves true on a 2xx. Best-effort — never throws.
 */
export async function postUnversioned(path: string): Promise<boolean> {
  try {
    await ensureCsrf();
    const res = await timedFetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

/** Dev-only: paths already warned about, so the safety net logs once per path. */
const suspiciousBodyWarned = new Set<string>();

/**
 * Dev-only safety net for the *un-validated* path. Almost every endpoint answers
 * with a JSON object or array; a top-level `null` or primitive where the caller
 * will treat it as an object is exactly the silent-`undefined`-UI shape P1-12 is
 * about. Without a validator we can't know the caller's expected type, so this
 * only flags the unambiguous cases, warns once per path, and NEVER throws — a
 * cheap seam, not full coverage. An empty body (`undefined`, the legitimate
 * "no content" case) is left alone. Stripped from prod builds by the `DEV` gate.
 */
function warnOnSuspiciousBody(parsed: unknown, path: string): void {
  const isObjectOrArray = typeof parsed === "object" && parsed !== null;
  if (parsed === undefined || isObjectOrArray) return;
  if (suspiciousBodyWarned.has(path)) return;
  suspiciousBodyWarned.add(path);
  const describedType = parsed === null ? "null" : typeof parsed;
  console.warn(
    `[api] Response for "${path}" was ${describedType} where an object or array ` +
      "was expected — the backend shape may have changed (P1-12). Pass a " +
      "`validate` guard to the api* call to turn this into a hard error.",
  );
}

/**
 * Finalize a parsed *success* body. With a `validate` guard: run it, and on
 * failure raise a clear `ApiError(422)` rather than leaking a mis-shaped object
 * as `T`. Without one: fall through to the legacy cast, plus a dev-only warning
 * for obviously-wrong bodies. Prod with no validator is the exact old behaviour.
 */
function finalizeBody<T>(
  parsed: unknown,
  path: string,
  validate?: ResponseValidator<T>,
): T {
  if (validate) {
    try {
      return validate(parsed);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "response failed validation";
      throw new ApiError(
        422,
        `Malformed response from ${path}: ${detail}`,
        parsed,
      );
    }
  }
  if (import.meta.env.DEV) warnOnSuspiciousBody(parsed, path);
  return parsed as T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  validate?: ResponseValidator<T>,
  externalSignal?: AbortSignal,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!SAFE.has(method)) {
    await ensureCsrf();
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  // Fail-fast: abort the fetch if the backend doesn't answer within the ceiling,
  // so a hang surfaces as a real error instead of an eternal pending promise. A
  // FRESH controller + timer is created here per call, which means the recursive
  // retries below each get their own full window (never a share of an
  // already-aborted signal), and the timer is always cleared in `finally` so a
  // fast response never leaks a pending timeout.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // Forward a caller-supplied signal (react-query passes one into every
  // `queryFn`, tied to query cancellation on unmount/query-key change/navigation)
  // into our own controller — without this, react-query only stops WAITING on
  // the promise, but the underlying fetch keeps running against the backend to
  // completion and still bills its full duration. `externalAborted` records
  // WHICH signal fired, so the catch block below can tell "the caller walked
  // away" (propagate the abort, no error toast) apart from "the backend hung"
  // (surface a 408, see below).
  let externalAborted = false;
  const onExternalAbort = () => {
    externalAborted = true;
    controller.abort();
  };
  if (externalSignal) {
    if (externalSignal.aborted) onExternalAbort();
    else externalSignal.addEventListener("abort", onExternalAbort);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      // The caller (react-query) walked away — propagate the original
      // `AbortError` unchanged so react-query's own cancellation handling
      // takes over (no error toast, no retry); this is expected, not a fault.
      if (externalAborted) throw error;
      // Otherwise it was OUR timeout that fired: a distinct 408 so the
      // react-query layer and the global error handler treat a hung backend
      // as a genuine failure. Kept clear of the 401-refresh and 403-CSRF retry
      // paths below (which key off an HTTP status we never received here), so
      // a timeout can never be misread as an auth-refresh loop or a CSRF retry.
      throw new ApiError(408, "Request timed out");
    }
    // Any other throw is a real network fault (offline / DNS / CORS) and
    // propagates unchanged.
    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }

  // A 401 for a visitor we already know is signed out is not a recoverable
  // session loss, it is the expected answer. Skipping the refresh + reconcile
  // here keeps an anonymous page load from firing POST /auth/refresh (the most
  // expensive auth path on the backend) and from tripping `onAuthLost`.
  if (res.status === 401 && retry && !shouldAttemptRecovery()) {
    throw new ApiError(401, "Not authenticated");
  }

  if (res.status === 401 && retry) {
    const ok = await refreshOnce();
    if (ok) {
      return request<T>(
        method,
        path,
        body,
        false,
        timeoutMs,
        validate,
        externalSignal,
      );
    }
    onAuthLost?.();
    throw new ApiError(401, "Not authenticated");
  }

  if (!res.ok) {
    let message = res.statusText;
    let data: unknown;
    try {
      const parsed = (await res.json()) as { message?: string | string[] };
      data = parsed;
      message = Array.isArray(parsed.message)
        ? parsed.message.join(", ")
        : (parsed.message ?? message);
    } catch {
      /* non-JSON error body */
    }

    // A 403 on a mutation: drop the cached token, fetch a fresh one, and retry
    // ONCE. We deliberately do not key this on the backend's error text — a
    // reworded, localized or non-JSON body (in which case `message` is just
    // "Forbidden") would leave the stale token cached for the rest of the tab's
    // life, and every write would then fail with a toast that reads as a
    // permissions problem. Retrying any non-safe 403 once is safe for the same
    // reason `runRefresh` gives: the CsrfGuard rejects BEFORE the controller
    // runs, so nothing was performed. A genuine permission denial simply fails
    // the same way a second time and falls through to the throw below.
    if (res.status === 403 && retry && !SAFE.has(method)) {
      csrfToken = null;
      await ensureCsrf();
      return request<T>(
        method,
        path,
        body,
        false,
        timeoutMs,
        validate,
        externalSignal,
      );
    }

    // Platform lockdown. 503 rather than 403 precisely so it is distinguishable
    // from a permission denial: the platform is temporarily unavailable, not
    // this caller being unauthorised. The session and cookies are untouched, so
    // lifting the lockdown restores everyone with no re-authentication.
    if (
      res.status === 503 &&
      (data as { code?: string })?.code === "PLATFORM_LOCKED"
    ) {
      onPlatformLocked?.((data as { message?: string }).message ?? null);
    }

    throw new ApiError(res.status, message, data);
  }

  if (res.status === 204) return undefined as T;
  // Some endpoints answer 200 with an empty body (e.g. GET /me/affiliation when
  // the member has none). `res.json()` throws on empty input, so parse the text
  // ourselves and treat an empty body as "no content".
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    // A 2xx whose body isn't the JSON we promised the caller (a truncated
    // response, an HTML error page slipped past a proxy, a Content-Type lie).
    // Surface it as a typed ApiError(422) — the same failure channel as a
    // validator rejection below — instead of letting a raw SyntaxError escape
    // `request()` as an unhandled non-ApiError the toast/retry layers can't read.
    throw new ApiError(422, `Malformed JSON in response from ${path}`, text);
  }
  return finalizeBody<T>(parsed, path, validate);
}

// Three optional trailing params, all fully backward-compatible (every existing
// call omits them and behaves exactly as before):
//   • `timeoutMs` — a per-call override of DEFAULT_TIMEOUT_MS for the rare
//     legitimately long-running endpoint; omitting it keeps the 15s ceiling.
//   • `validate`  — a runtime guard for the success body (P1-12). When supplied
//     it runs after JSON.parse; a body that fails it raises ApiError(422,
//     "Malformed response …") instead of returning a mis-shaped object as `T`.
//   • `signal`    — an `AbortSignal` to cancel the underlying fetch, not just
//     the query-cache bookkeeping. React Query passes one into every `queryFn`
//     via its `QueryFunctionContext` (`queryFn: ({ signal }) => apiGet(path,
//     undefined, undefined, signal)`) that fires on unmount/query-key change/
//     navigation — wire it through on any request a user can realistically
//     navigate away from mid-flight (search-as-you-type, route-gated fetches).
// Passing `undefined` for any of these still falls through to the default
// behaviour.
export const apiGet = <T>(
  path: string,
  timeoutMs?: number,
  validate?: ResponseValidator<T>,
  signal?: AbortSignal,
) => request<T>("GET", path, undefined, true, timeoutMs, validate, signal);
export const apiPost = <T>(
  path: string,
  body?: unknown,
  timeoutMs?: number,
  validate?: ResponseValidator<T>,
  signal?: AbortSignal,
) => request<T>("POST", path, body, true, timeoutMs, validate, signal);
export const apiPatch = <T>(
  path: string,
  body?: unknown,
  timeoutMs?: number,
  validate?: ResponseValidator<T>,
  signal?: AbortSignal,
) => request<T>("PATCH", path, body, true, timeoutMs, validate, signal);
export const apiPut = <T>(
  path: string,
  body?: unknown,
  timeoutMs?: number,
  validate?: ResponseValidator<T>,
  signal?: AbortSignal,
) => request<T>("PUT", path, body, true, timeoutMs, validate, signal);
export const apiDelete = <T>(
  path: string,
  body?: unknown,
  timeoutMs?: number,
  validate?: ResponseValidator<T>,
  signal?: AbortSignal,
) => request<T>("DELETE", path, body, true, timeoutMs, validate, signal);
