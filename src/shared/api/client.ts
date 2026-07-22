import { API_BASE_URL } from "./config";

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
    if (res.ok) csrfToken = (await res.json()).csrfToken ?? null;
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
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!SAFE.has(method)) {
    await ensureCsrf();
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    const ok = await refreshOnce();
    if (ok) return request<T>(method, path, body, false);
    onAuthLost?.();
    throw new ApiError(401, "Not authenticated");
  }

  if (!res.ok) {
    let message = res.statusText;
    let data: unknown;
    try {
      const j = await res.json();
      data = j;
      message = Array.isArray(j.message)
        ? j.message.join(", ")
        : (j.message ?? message);
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
      return request<T>(method, path, body, false);
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

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>("POST", path, body);
export const apiPatch = <T>(path: string, body?: unknown) =>
  request<T>("PATCH", path, body);
export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>("PUT", path, body);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
