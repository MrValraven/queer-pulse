import { API_BASE_URL } from "./config";

/** Normalized API failure carrying the HTTP status. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let csrfToken: string | null = null;
let onAuthLost: (() => void) | null = null;

/** Register a callback fired when a 401 cannot be recovered by refresh. */
export function setOnAuthLost(cb: () => void): void {
  onAuthLost = cb;
}

/** Fetch + cache the CSRF token once. Call on app load before any mutation. */
export async function ensureCsrf(): Promise<void> {
  if (csrfToken) return;
  try {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: "include",
    });
    if (res.ok) csrfToken = (await res.json()).csrfToken ?? null;
  } catch {
    /* backend unreachable — leave token null; mutations will surface the error */
  }
}

let refreshing: Promise<boolean> | null = null;
/** Single-flight refresh: concurrent 401s share one POST /auth/refresh. */
function refreshOnce(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
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
    try {
      const j = await res.json();
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

    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>("POST", path, body);
export const apiPatch = <T>(path: string, body?: unknown) =>
  request<T>("PATCH", path, body);
export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>("PUT", path, body);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
