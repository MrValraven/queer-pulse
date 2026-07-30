import { API_BASE_URL } from "./config";

// The backend serves its domain API under a URI version prefix
// (`app.enableVersioning({ type: URI, defaultVersion: '1' })`). Every call made
// through the generic `request()` builder below is prefixed with this so it
// resolves to `/v1/...`. The two DIRECT `fetch()` calls in this file —
// `/csrf-token` and `/auth/refresh` — deliberately DO NOT use this prefix:
// their backend controllers are `@Version(VERSION_NEUTRAL)` and keep answering
// at their original unversioned paths (they're referenced outside this builder,
// so their URLs are fixed). Bumping the API version = change this one constant.
const API_VERSION_PREFIX = "/v1";

// Fail-fast ceiling for every call made through `request()`. A hung backend must
// never strand the UI on an infinite skeleton — worst of all a hung
// `GET /auth/me`, which holds EVERY gated route behind the AuthLoader forever.
// 15s is generous for our JSON endpoints (the only bytes `request()` ever
// carries — binary uploads PUT straight to storage via XHR, never through here;
// see features/members/api/useUploadImage.ts) yet far short of "never". Callers
// with a legitimately long-running endpoint can pass a per-call override.
const DEFAULT_TIMEOUT_MS = 15_000;

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
    const res = await fetch(`${API_BASE_URL}/csrf-token`, {
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
    const res = await fetch(`${API_BASE_URL}/csrf-token`, {
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

/** Run `task` while holding the cross-tab refresh lock, or directly when the
 *  Web Locks API is unavailable. */
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = lockManager();
  if (!locks) return task();
  return locks.request(REFRESH_LOCK, task);
}

/** POST /auth/refresh once; resolves true on a 2xx, false on anything else. */
function runRefresh(): Promise<boolean> {
  return fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
  })
    .then((r) => r.ok)
    .catch(() => false);
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

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true,
  timeoutMs = DEFAULT_TIMEOUT_MS,
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
    // A timeout abort becomes a distinct 408 so the react-query layer and the
    // global error handler treat a hung backend as a genuine failure. It is kept
    // clear of the 401-refresh and 403-CSRF retry paths below (which key off an
    // HTTP status we never received here), so a timeout can never be misread as
    // an auth-refresh loop or a CSRF retry. Any other throw is a real network
    // fault (offline / DNS / CORS) and propagates unchanged.
    if (controller.signal.aborted) {
      throw new ApiError(408, "Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401 && retry) {
    const ok = await refreshOnce();
    if (ok) return request<T>(method, path, body, false, timeoutMs);
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

    // A 403 from a stale/missing CSRF token: drop the cached token, fetch a fresh
    // one, and retry the mutation once. Other 403s (e.g. quota) fall through.
    if (
      res.status === 403 &&
      retry &&
      !SAFE.has(method) &&
      /csrf/i.test(message)
    ) {
      csrfToken = null;
      await ensureCsrf();
      return request<T>(method, path, body, false, timeoutMs);
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
  return (text ? JSON.parse(text) : undefined) as T;
}

// The optional trailing `timeoutMs` is a per-call override of DEFAULT_TIMEOUT_MS
// for the rare legitimately long-running endpoint; omitting it (the norm) keeps
// the 15s ceiling. Passing `undefined` still falls through to the default, so
// the addition is fully backward-compatible with every existing call site.
export const apiGet = <T>(path: string, timeoutMs?: number) =>
  request<T>("GET", path, undefined, true, timeoutMs);
export const apiPost = <T>(path: string, body?: unknown, timeoutMs?: number) =>
  request<T>("POST", path, body, true, timeoutMs);
export const apiPatch = <T>(path: string, body?: unknown, timeoutMs?: number) =>
  request<T>("PATCH", path, body, true, timeoutMs);
export const apiPut = <T>(path: string, body?: unknown, timeoutMs?: number) =>
  request<T>("PUT", path, body, true, timeoutMs);
export const apiDelete = <T>(path: string, timeoutMs?: number) =>
  request<T>("DELETE", path, undefined, true, timeoutMs);
