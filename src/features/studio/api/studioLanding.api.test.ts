import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../shared/api/config";
import {
  StudioLandingRequestError,
  fetchStudioLanding,
  fetchStudioLandingPreviewStream,
  landingRequestReasonOf,
} from "./studioLanding.api";

const fetchMock = vi.fn();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function setOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

async function failureOf(request: Promise<unknown>) {
  try {
    await request;
  } catch (error) {
    return error;
  }
  return null;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  setOnline(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  setOnline(true);
});

describe("fetchStudioLanding", () => {
  it("reads the public route with credentials omitted and no custom header", async () => {
    const body = { counts: { artists: null } };
    fetchMock.mockResolvedValue(jsonResponse(200, body));
    await expect(fetchStudioLanding()).resolves.toEqual(body);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE_URL}/v1/studio/landing`);
    expect(init.credentials).toBe("omit");
    expect("headers" in init).toBe(false);
  });
});

describe("fetchStudioLandingPreviewStream", () => {
  it("encodes the preview id and returns url and expiry", async () => {
    const body = { url: "https://cdn.example/a.mp3", expiresAt: "2026-10-29" };
    fetchMock.mockResolvedValue(jsonResponse(200, body));
    await expect(fetchStudioLandingPreviewStream("preview 1")).resolves.toEqual(
      body,
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      `${API_BASE_URL}/v1/studio/landing/previews/preview%201/stream`,
    );
    expect(init.credentials).toBe("omit");
    expect("headers" in init).toBe(false);
  });

  it("reads a 404 with the unavailable code as unavailable", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(404, { code: "studio_landing_preview_unavailable" }),
    );
    const failure = await failureOf(fetchStudioLandingPreviewStream("a"));
    expect(failure).toBeInstanceOf(StudioLandingRequestError);
    expect(failure).toMatchObject({
      reason: "unavailable",
      status: 404,
      code: "studio_landing_preview_unavailable",
    });
  });

  it("reads a 429 as rateLimited and a 503 as server", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(429, {}));
    expect(await failureOf(fetchStudioLandingPreviewStream("a"))).toMatchObject(
      { reason: "rateLimited", status: 429, code: null },
    );
    fetchMock.mockResolvedValueOnce(
      new Response("<html>bad gateway</html>", { status: 503 }),
    );
    expect(await failureOf(fetchStudioLandingPreviewStream("a"))).toMatchObject(
      { reason: "server", status: 503, code: null },
    );
  });

  it("reads a rejected fetch as offline while the browser is offline", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    setOnline(false);
    expect(await failureOf(fetchStudioLandingPreviewStream("a"))).toMatchObject(
      { reason: "offline", status: null },
    );
  });

  it("reads a rejected fetch as server while the browser is online", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await failureOf(fetchStudioLandingPreviewStream("a"))).toMatchObject(
      { reason: "server", status: null },
    );
  });
});

describe("landingRequestReasonOf", () => {
  it("keeps a plain 404 on server and names the rest", () => {
    expect(landingRequestReasonOf(404, null, true)).toBe("server");
    expect(landingRequestReasonOf(500, "x", true)).toBe("server");
    expect(landingRequestReasonOf(null, null, false)).toBe("offline");
  });
});
