import { API_VERSION_PREFIX } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";

/**
 * Whether this engine knows the `keepalive` request option. Detected up front
 * so the choice is made before anything is sent; a missing `Request` global
 * or a throwing getter reads as unsupported.
 */
function isKeepaliveSupported(): boolean {
  try {
    return "keepalive" in Request.prototype;
  } catch {
    return false;
  }
}

/**
 * Counts one anonymous landing visit (`POST /v1/landing/visits`). It skips
 * the shared api client on purpose: that client attaches the CSRF header and
 * the session cookies, and this request carries neither (`credentials:
 * "omit"`), only the source label. `keepalive` lets the request outlive a
 * visitor who leaves at once. Support for it is detected before sending, and
 * an engine without it gets a plain request. Exactly one request is ever
 * attempted, so a failure (network, CORS, an ad blocker) is never retried and
 * a visit that reached the server is never counted twice. Best effort, so it
 * never throws.
 */
export async function sendLandingVisit(source: string): Promise<void> {
  const url = `${API_BASE_URL}${API_VERSION_PREFIX}/landing/visits`;
  const init: RequestInit = {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  };
  const requestInit: RequestInit = isKeepaliveSupported()
    ? { ...init, keepalive: true }
    : init;
  try {
    await fetch(url, requestInit);
  } catch {
    // The counter is best effort: a failed count is simply not counted.
  }
}
