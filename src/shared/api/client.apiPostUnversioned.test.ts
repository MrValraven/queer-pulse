import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `apiPostUnversioned` posts JSON to a `VERSION_NEUTRAL` backend path (no
 * `/v1`), reads the body on both success and failure, and keeps a refusal that
 * carries a `reason` out of the stale-CSRF retry so a refused verify is never
 * replayed.
 *
 * client.ts holds module-level singletons (`csrfToken`, `refreshing`,
 * `sessionState`) plus a frozen `API_BASE_URL` from config.ts, so every test
 * loads a pristine module through `loadClient()` (same scaffolding as
 * client.test.ts).
 */

type ClientModule = typeof import("./client");

/** Minimal Response-like stub: client touches ok/status/statusText/json/text. */
function res(status: number, body: unknown = {}, statusText = ""): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(status === 204 ? "" : JSON.stringify(body)),
  } as unknown as Response;
}

/** The request URL as a string, for matching in fetch stubs. */
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

const REQUEST_PATH = "/auth/email-code/request";
const REQUEST_URL = `http://api.test${REQUEST_PATH}`;
const REQUEST_BODY = { email: "member@example.test", locale: "en" };

/** The POST calls made to the email-code path, in order. */
function postCalls(fetchFn: ReturnType<typeof vi.fn>): RequestInit[] {
  return fetchFn.mock.calls
    .filter((call) => requestUrl(call[0] as string) === REQUEST_URL)
    .map((call) => call[1] as RequestInit);
}

/** Stubs `/csrf-token` with an incrementing token and answers every POST to
 *  the email-code path from `postResponses`, in order. */
function stubWithPostResponses(
  postResponses: Response[],
): ReturnType<typeof vi.fn> {
  let csrfCalls = 0;
  let postIndex = 0;
  return stubFetch(
    vi.fn((url: string | URL | Request) => {
      const requestedUrl = requestUrl(url);
      if (requestedUrl.includes("/csrf-token")) {
        csrfCalls++;
        return Promise.resolve(res(200, { csrfToken: `tok-${csrfCalls}` }));
      }
      if (requestedUrl.includes("/auth/refresh")) {
        return Promise.resolve(res(200, {}));
      }
      const response = postResponses[postIndex] ?? res(500);
      postIndex++;
      return Promise.resolve(response);
    }),
  );
}

beforeEach(() => {
  vi.resetModules();
});

describe("apiPostUnversioned", () => {
  it("posts JSON to the unversioned path with credentials and the CSRF header", async () => {
    const { apiPostUnversioned } = await loadClient();
    const fetchFn = stubWithPostResponses([res(200, { challengeId: "c1" })]);

    await apiPostUnversioned(REQUEST_PATH, REQUEST_BODY);

    expect(requestUrl(fetchFn.mock.calls[0]?.[0] as string)).toBe(
      "http://api.test/csrf-token",
    );
    const posts = postCalls(fetchFn);
    expect(posts).toHaveLength(1);
    const init = posts[0];
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    const headers = init?.headers as Record<string, string>;
    expect(headers["X-CSRF-Token"]).toBe("tok-1");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify(REQUEST_BODY));
    expect(
      fetchFn.mock.calls.some((call) =>
        requestUrl(call[0] as string).includes("/v1"),
      ),
    ).toBe(false);
  });

  it("resolves the parsed body through the validator", async () => {
    const { apiPostUnversioned } = await loadClient();
    const responseBody = {
      challengeId: "c1",
      expiresAt: "2026-10-26T10:10:00.000Z",
      resendAvailableAt: "2026-10-26T10:01:00.000Z",
    };
    stubWithPostResponses([res(200, responseBody)]);
    const validate = vi.fn((data: unknown) => data as typeof responseBody);

    await expect(
      apiPostUnversioned(REQUEST_PATH, REQUEST_BODY, validate),
    ).resolves.toEqual(responseBody);
    expect(validate).toHaveBeenCalledWith(responseBody);
  });

  it("throws ApiError carrying the reason body on a 400", async () => {
    const { apiPostUnversioned, ApiError } = await loadClient();
    stubWithPostResponses([
      res(400, { reason: "code_incorrect", attemptsLeft: 4 }),
    ]);

    const error: unknown = await apiPostUnversioned(
      REQUEST_PATH,
      REQUEST_BODY,
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as InstanceType<typeof ApiError>;
    expect(apiError.status).toBe(400);
    expect((apiError.data as { reason: string }).reason).toBe("code_incorrect");
    expect((apiError.data as { attemptsLeft: number }).attemptsLeft).toBe(4);
  });

  it("does not retry a 403 that carries a reason", async () => {
    const { apiPostUnversioned, ApiError } = await loadClient();
    const statusUrl = "http://app.test/join/status";
    const fetchFn = stubWithPostResponses([
      res(403, { reason: "invite_required", statusUrl }),
      res(200, {}),
    ]);

    const error: unknown = await apiPostUnversioned(
      REQUEST_PATH,
      REQUEST_BODY,
    ).catch((caught: unknown) => caught);

    expect(postCalls(fetchFn)).toHaveLength(1);
    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as InstanceType<typeof ApiError>;
    expect(apiError.status).toBe(403);
    expect((apiError.data as { statusUrl: string }).statusUrl).toBe(statusUrl);
  });

  it("refreshes the CSRF token and retries once on a 403 without a reason", async () => {
    const { apiPostUnversioned } = await loadClient();
    const fetchFn = stubWithPostResponses([
      res(403, { message: "Invalid or missing CSRF token" }),
      res(200, { challengeId: "c2" }),
    ]);

    await expect(
      apiPostUnversioned(REQUEST_PATH, REQUEST_BODY),
    ).resolves.toEqual({ challengeId: "c2" });
    const posts = postCalls(fetchFn);
    expect(posts).toHaveLength(2);
    const retryHeaders = posts[1]?.headers as Record<string, string>;
    expect(retryHeaders["X-CSRF-Token"]).toBe("tok-2");
  });

  it("refreshes the session once on a 401 and retries", async () => {
    const { apiPostUnversioned, setSessionState } = await loadClient();
    setSessionState("active");
    const fetchFn = stubWithPostResponses([
      res(401, { message: "Unauthorized" }),
      res(200, { challengeId: "c3" }),
    ]);

    await expect(
      apiPostUnversioned(REQUEST_PATH, REQUEST_BODY),
    ).resolves.toEqual({ challengeId: "c3" });
    const refreshCalls = fetchFn.mock.calls.filter((call) =>
      requestUrl(call[0] as string).includes("/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
    expect(postCalls(fetchFn)).toHaveLength(2);
  });

  it("throws ApiError(408) when the request times out", async () => {
    const { apiPostUnversioned } = await loadClient();
    let markPostSent: () => void = () => {};
    const postSent = new Promise<void>((resolve) => {
      markPostSent = resolve;
    });
    stubFetch(
      vi.fn((url: string | URL | Request, init?: RequestInit) => {
        if (requestUrl(url).includes("/csrf-token")) {
          return Promise.resolve(res(200, { csrfToken: "tok" }));
        }
        markPostSent();
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted", "AbortError"));
          });
        });
      }),
    );
    vi.useFakeTimers();
    try {
      const pending = apiPostUnversioned(REQUEST_PATH, REQUEST_BODY);
      const assertion = expect(pending).rejects.toMatchObject({
        name: "ApiError",
        status: 408,
      });
      await postSent;
      await vi.advanceTimersByTimeAsync(15_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws ApiError(422) on a malformed success body", async () => {
    const { apiPostUnversioned } = await loadClient();
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (requestUrl(url).includes("/csrf-token")) {
          return Promise.resolve(res(200, { csrfToken: "tok" }));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.reject(new SyntaxError("Unexpected token <")),
          text: () => Promise.resolve("<html>proxy error</html>"),
        } as unknown as Response);
      }),
    );

    await expect(
      apiPostUnversioned(REQUEST_PATH, REQUEST_BODY),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: `Malformed JSON in response from ${REQUEST_PATH}`,
    });
  });
});
