import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * client.ts holds module-level singletons (`csrfToken`, `refreshing`,
 * `onAuthLost`) plus a frozen `API_BASE_URL` from config.ts. So every test:
 *   1. vi.resetModules() to wipe those singletons + re-evaluate config,
 *   2. vi.stubEnv("VITE_API_URL", …) BEFORE the dynamic import (config reads it
 *      at module load),
 *   3. dynamic `import("./client")` to get a pristine module.
 * fetch is stubbed per-test; setup.ts's afterEach unstubs globals/envs.
 */

type ClientModule = typeof import("./client");

/**
 * Minimal Response-like stub — client touches ok/status/statusText/json/text.
 * `text()` matters: request() reads successful bodies via res.text() + JSON.parse
 * so that an empty 200 body doesn't throw, so the stub must serialise `body` the
 * way a real Response would. A 204 carries no body, hence the empty string.
 */
function res(status: number, body: unknown = {}, statusText = ""): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(status === 204 ? "" : JSON.stringify(body)),
  } as unknown as Response;
}

/** The request URL as a string, for matching in fetch stubs. client.ts always
 *  calls fetch with a string, so this is exact; the URL/Request arms just satisfy
 *  the `typeof fetch` signature without stringifying a base object. */
function requestUrl(input: string | URL | Request): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

async function loadClient(base = "http://api.test"): Promise<ClientModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", base);
  return import("./client");
}

function stubFetch(impl: typeof fetch): ReturnType<typeof vi.fn> {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.resetModules();
});

describe("ApiError", () => {
  it("carries the HTTP status and the ApiError name", async () => {
    const { ApiError } = await loadClient();
    const err = new ApiError(418, "teapot");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(418);
    expect(err.message).toBe("teapot");
  });
});

describe("probeBackend", () => {
  it("returns unreachable when no API base URL is configured", async () => {
    const { probeBackend } = await loadClient("");
    const fetchFn = stubFetch(vi.fn());
    expect(await probeBackend()).toEqual({ ok: false, reason: "unreachable" });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("returns offline when navigator reports no connection", async () => {
    const { probeBackend } = await loadClient();
    vi.stubGlobal("navigator", { onLine: false });
    stubFetch(vi.fn());
    expect(await probeBackend()).toEqual({ ok: false, reason: "offline" });
  });

  it("returns server with status on a 5xx response", async () => {
    const { probeBackend } = await loadClient();
    vi.stubGlobal("navigator", { onLine: true });
    stubFetch(vi.fn(() => Promise.resolve(res(503))));
    expect(await probeBackend()).toEqual({
      ok: false,
      reason: "server",
      status: 503,
    });
  });

  it("returns unreachable when fetch throws", async () => {
    const { probeBackend } = await loadClient();
    vi.stubGlobal("navigator", { onLine: true });
    stubFetch(vi.fn(() => Promise.reject(new Error("network down"))));
    expect(await probeBackend()).toEqual({ ok: false, reason: "unreachable" });
  });

  it("returns ok on a 2xx response", async () => {
    const { probeBackend } = await loadClient();
    vi.stubGlobal("navigator", { onLine: true });
    stubFetch(vi.fn(() => Promise.resolve(res(200, { csrfToken: "x" }))));
    expect(await probeBackend()).toEqual({ ok: true });
  });
});

describe("ensureCsrf", () => {
  it("fetches the token once and caches it (no second network call)", async () => {
    const { ensureCsrf, apiPost } = await loadClient();
    const fetchFn = stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (requestUrl(url).includes("/csrf-token"))
          return Promise.resolve(res(200, { csrfToken: "tok-1" }));
        return Promise.resolve(res(200, {})); // the POST
      }),
    );

    await ensureCsrf();
    await ensureCsrf();
    const csrfCalls = fetchFn.mock.calls.filter((c) =>
      String(c[0]).includes("/csrf-token"),
    );
    expect(csrfCalls).toHaveLength(1);

    // The cached token rides on the next mutation header.
    await apiPost("/thing", { a: 1 });
    const postCall = fetchFn.mock.calls.find(
      (c) => (c[1] as RequestInit | undefined)?.method === "POST",
    );
    const headers = (postCall?.[1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers["X-CSRF-Token"]).toBe("tok-1");
  });

  it("swallows a thrown fetch and leaves the token unset", async () => {
    const { ensureCsrf, apiPost } = await loadClient();
    const fetchFn = stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (requestUrl(url).includes("/csrf-token"))
          return Promise.reject(new Error("unreachable"));
        return Promise.resolve(res(200, {}));
      }),
    );

    await expect(ensureCsrf()).resolves.toBeUndefined();

    await apiPost("/thing"); // no token → no CSRF header
    const postCall = fetchFn.mock.calls.find(
      (c) => (c[1] as RequestInit | undefined)?.method === "POST",
    );
    const headers = (postCall?.[1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers["X-CSRF-Token"]).toBeUndefined();
  });
});

describe("single-flight refresh on 401", () => {
  it("shares ONE /auth/refresh for two concurrent 401s, then retries both", async () => {
    const { apiGet } = await loadClient();
    let refreshCalls = 0;
    let dataCalls = 0;
    const fetchFn = stubFetch(
      vi.fn((url: string | URL | Request) => {
        const requestedUrl = requestUrl(url);
        if (requestedUrl.includes("/auth/refresh")) {
          refreshCalls++;
          return Promise.resolve(res(200, {}));
        }
        if (requestedUrl.includes("/thing")) {
          dataCalls++;
          // The first two hits are the concurrent initial requests → 401;
          // the retries (after refresh) → 200.
          return Promise.resolve(
            dataCalls <= 2 ? res(401) : res(200, { id: dataCalls }),
          );
        }
        return Promise.resolve(res(200, {}));
      }),
    );

    const [a, b] = await Promise.all([
      apiGet<{ id: number }>("/thing"),
      apiGet<{ id: number }>("/thing"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(a.id).toBeGreaterThan(2);
    expect(b.id).toBeGreaterThan(2);
    expect(fetchFn).toHaveBeenCalledTimes(5); // 2 initial + 1 refresh + 2 retry
  });

  it("fires onAuthLost and throws ApiError(401) when refresh fails", async () => {
    const { apiGet, setOnAuthLost, ApiError } = await loadClient();
    const lost = vi.fn();
    setOnAuthLost(lost);
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (requestUrl(url).includes("/auth/refresh"))
          return Promise.resolve(res(401)); // refresh fails
        return Promise.resolve(res(401)); // data 401
      }),
    );

    await expect(apiGet("/thing")).rejects.toBeInstanceOf(ApiError);
    await expect(apiGet("/thing")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
    });
    expect(lost).toHaveBeenCalledTimes(2);
  });
});

describe("403 stale-CSRF retry", () => {
  it("evicts the token, re-fetches, and retries the mutation once", async () => {
    const { apiPost } = await loadClient();
    let csrfCalls = 0;
    let postCalls = 0;
    const fetchFn = stubFetch(
      vi.fn((url: string | URL | Request) => {
        const requestedUrl = requestUrl(url);
        if (requestedUrl.includes("/csrf-token")) {
          csrfCalls++;
          return Promise.resolve(res(200, { csrfToken: `tok-${csrfCalls}` }));
        }
        postCalls++;
        return Promise.resolve(
          postCalls === 1
            ? res(403, { message: "invalid csrf token" })
            : res(200, { ok: true }),
        );
      }),
    );

    await expect(apiPost("/thing", { a: 1 })).resolves.toEqual({ ok: true });
    expect(csrfCalls).toBe(2); // initial + after eviction
    expect(postCalls).toBe(2); // original + one retry
    // The retried POST carried the freshly-fetched token.
    const postHeaders = fetchFn.mock.calls
      .filter((c) => (c[1] as RequestInit | undefined)?.method === "POST")
      .map((c) => (c[1] as RequestInit).headers as Record<string, string>);
    expect(postHeaders[1]?.["X-CSRF-Token"]).toBe("tok-2");
  });

  // The retry is deliberately NOT keyed on the backend's error text: a
  // reworded, localized or non-JSON body would leave a stale token cached for
  // the rest of the tab's life and turn every subsequent write into what reads
  // as a permissions failure. So a genuine permission denial is retried once
  // too — harmless, because the CsrfGuard rejects BEFORE the controller runs,
  // so nothing was performed — and then surfaces as the ApiError it is.
  it("retries a non-CSRF 403 exactly once, then surfaces it", async () => {
    const { apiPost, ApiError } = await loadClient();
    let postCalls = 0;
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (requestUrl(url).includes("/csrf-token"))
          return Promise.resolve(res(200, { csrfToken: "tok" }));
        postCalls++;
        return Promise.resolve(
          res(403, { message: "You have hit your quota" }),
        );
      }),
    );

    await expect(apiPost("/thing")).rejects.toBeInstanceOf(ApiError);
    // Once, never a loop: the retried request carries `retry: false`.
    expect(postCalls).toBe(2);
  });
});

describe("stale-CSRF retry on /auth/refresh", () => {
  // Regression: a cross-tab CSRF-cookie rotation used to 403 the silent token
  // refresh and surface a spurious "session expired" (a page reload always
  // recovered). refreshSession must self-heal the CSRF desync the same way a
  // mutation does — evict, re-bootstrap, retry once — before giving up.
  it("evicts CSRF, re-fetches, and retries the refresh once on a 403", async () => {
    const { refreshSession } = await loadClient();
    let csrfCalls = 0;
    let refreshCalls = 0;
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        const requestedUrl = requestUrl(url);
        if (requestedUrl.includes("/csrf-token")) {
          csrfCalls++;
          return Promise.resolve(res(200, { csrfToken: `tok-${csrfCalls}` }));
        }
        if (requestedUrl.includes("/auth/refresh")) {
          refreshCalls++;
          // Stale token on the first presentation → 403; the fresh token the
          // client re-bootstraps after eviction → 200.
          return Promise.resolve(
            refreshCalls === 1
              ? res(403, { message: "Invalid or missing CSRF token" })
              : res(200, {}),
          );
        }
        return Promise.resolve(res(200, {}));
      }),
    );

    await expect(refreshSession()).resolves.toBe(true);
    expect(refreshCalls).toBe(2); // stale 403, then a fresh retry
    expect(csrfCalls).toBeGreaterThanOrEqual(1); // re-bootstrapped after eviction
  });

  it("still resolves false when the retried refresh genuinely fails (401)", async () => {
    const { refreshSession } = await loadClient();
    let refreshCalls = 0;
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        const requestedUrl = requestUrl(url);
        if (requestedUrl.includes("/csrf-token"))
          return Promise.resolve(res(200, { csrfToken: "tok" }));
        if (requestedUrl.includes("/auth/refresh")) {
          refreshCalls++;
          return Promise.resolve(res(401)); // a truly dead session, not a CSRF blip
        }
        return Promise.resolve(res(200, {}));
      }),
    );

    await expect(refreshSession()).resolves.toBe(false);
    expect(refreshCalls).toBe(1); // a 401 is authoritative — no CSRF retry
  });
});

describe("request behaviours", () => {
  it("does not fetch a CSRF token for safe verbs (GET)", async () => {
    const { apiGet } = await loadClient();
    const fetchFn = stubFetch(
      vi.fn(() => Promise.resolve(res(200, { hi: true }))),
    );
    await apiGet("/thing");
    expect(
      fetchFn.mock.calls.some((c) => String(c[0]).includes("/csrf-token")),
    ).toBe(false);
  });

  it("resolves undefined on 204 No Content", async () => {
    const { apiDelete } = await loadClient();
    stubFetch(
      vi.fn((url: string | URL | Request) =>
        Promise.resolve(
          requestUrl(url).includes("/csrf-token")
            ? res(200, { csrfToken: "t" })
            : res(204),
        ),
      ),
    );
    await expect(apiDelete("/thing")).resolves.toBeUndefined();
  });

  it("joins an array error message with commas", async () => {
    const { apiPost, ApiError } = await loadClient();
    stubFetch(
      vi.fn((url: string | URL | Request) =>
        Promise.resolve(
          requestUrl(url).includes("/csrf-token")
            ? res(200, { csrfToken: "t" })
            : res(400, { message: ["name required", "email required"] }),
        ),
      ),
    );
    await expect(apiPost("/thing")).rejects.toMatchObject({
      status: 400,
      message: "name required, email required",
    });
    // and it really is an ApiError
    await apiPost("/thing").catch((e: unknown) =>
      expect(e).toBeInstanceOf(ApiError),
    );
  });

  it("falls back to statusText when the error body is not JSON", async () => {
    const { apiGet } = await loadClient();
    stubFetch(
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          json: () => Promise.reject(new Error("not json")),
        }),
      ) as unknown as typeof fetch,
    );
    await expect(apiGet("/thing")).rejects.toMatchObject({
      status: 500,
      message: "Internal Server Error",
    });
  });
});
