import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Covers the platform-lockdown reporting path added to client.ts:
 * a 503 with `code: "PLATFORM_LOCKED"` fires `onPlatformLocked` with the
 * message, while any other error (a genuine upstream 503, or a 403) does not.
 * In every case the request still rejects with an `ApiError` — the client
 * reports the lockdown, it never swallows the failure.
 *
 * Follows the same module-singleton reset dance as client.test.ts: client.ts
 * holds `onPlatformLocked` as module state, so each test resets modules and
 * re-imports for a pristine callback registry.
 */

type ClientModule = typeof import("./client");

/** Minimal Response-like stub — mirrors the one in client.test.ts. */
function res(status: number, body: unknown = {}, statusText = ""): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(status === 204 ? "" : JSON.stringify(body)),
  } as unknown as Response;
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

describe("platform lockdown detection", () => {
  it("fires the registered callback with the message on a 503 PLATFORM_LOCKED", async () => {
    const { apiGet, setOnPlatformLocked, ApiError } = await loadClient();
    const locked = vi.fn();
    setOnPlatformLocked(locked);
    stubFetch(
      vi.fn(() =>
        Promise.resolve(
          res(503, {
            statusCode: 503,
            error: "Service Unavailable",
            code: "PLATFORM_LOCKED",
            message: "Down for maintenance",
          }),
        ),
      ),
    );

    await expect(apiGet("/thing")).rejects.toBeInstanceOf(ApiError);
    expect(locked).toHaveBeenCalledTimes(1);
    expect(locked).toHaveBeenCalledWith("Down for maintenance");
  });

  it("passes null when the lockdown body carries no message", async () => {
    const { apiGet, setOnPlatformLocked, ApiError } = await loadClient();
    const locked = vi.fn();
    setOnPlatformLocked(locked);
    stubFetch(
      vi.fn(() =>
        Promise.resolve(
          res(503, {
            statusCode: 503,
            error: "Service Unavailable",
            code: "PLATFORM_LOCKED",
          }),
        ),
      ),
    );

    await expect(apiGet("/thing")).rejects.toBeInstanceOf(ApiError);
    expect(locked).toHaveBeenCalledWith(null);
  });

  it("does NOT fire the callback on a genuine upstream 503 without the code", async () => {
    const { apiGet, setOnPlatformLocked, ApiError } = await loadClient();
    const locked = vi.fn();
    setOnPlatformLocked(locked);
    stubFetch(
      vi.fn(() => Promise.resolve(res(503, { message: "Upstream timed out" }))),
    );

    await expect(apiGet("/thing")).rejects.toBeInstanceOf(ApiError);
    await expect(apiGet("/thing")).rejects.toMatchObject({ status: 503 });
    expect(locked).not.toHaveBeenCalled();
  });

  it("does NOT fire the callback on a 403", async () => {
    const { apiGet, setOnPlatformLocked, ApiError } = await loadClient();
    const locked = vi.fn();
    setOnPlatformLocked(locked);
    stubFetch(vi.fn(() => Promise.resolve(res(403, { message: "Forbidden" }))));

    await expect(apiGet("/thing")).rejects.toBeInstanceOf(ApiError);
    expect(locked).not.toHaveBeenCalled();
  });

  it("still throws ApiError even when no callback has been registered", async () => {
    const { apiGet, ApiError } = await loadClient();
    stubFetch(
      vi.fn(() =>
        Promise.resolve(
          res(503, { code: "PLATFORM_LOCKED", message: "Locked" }),
        ),
      ),
    );

    await expect(apiGet("/thing")).rejects.toBeInstanceOf(ApiError);
  });
});
