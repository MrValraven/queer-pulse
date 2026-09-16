import { beforeEach, describe, expect, it, vi } from "vitest";

// ENG-222: `apiPostWithMeta` is the opt-in variant of `apiPost` that also
// resolves the raw response `Headers`, so a caller (today: `messages.api.ts`'s
// `sendMessage`/`sendDocumentMessage`) can detect the backend's
// `Idempotent-Replayed: true` header without every other `apiPost` caller
// having to change shape. Mirrors client.test.ts's own module-reset pattern:
// client.ts holds module-level singletons, so every test gets a pristine
// module via vi.resetModules() + a fresh stubbed env before a dynamic import.

type ClientModule = typeof import("./client");

function res(
  status: number,
  body: unknown = {},
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    headers: new Headers(headers),
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

describe("apiPostWithMeta", () => {
  it("resolves both the parsed body and the response headers", async () => {
    const { apiPostWithMeta } = await loadClient();
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (String(url).includes("/csrf-token")) {
          return Promise.resolve(res(200, { csrfToken: "tok-1" }));
        }
        return Promise.resolve(
          res(200, { id: "msg-1" }, { "Idempotent-Replayed": "true" }),
        );
      }),
    );

    const result = await apiPostWithMeta<{ id: string }>("/messages", {
      body: "hi",
    });

    expect(result.data).toEqual({ id: "msg-1" });
    expect(result.headers.get("Idempotent-Replayed")).toBe("true");
  });

  it("omits the replay header on a genuine first create, same body shape either way", async () => {
    const { apiPostWithMeta } = await loadClient();
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (String(url).includes("/csrf-token")) {
          return Promise.resolve(res(200, { csrfToken: "tok-1" }));
        }
        return Promise.resolve(res(200, { id: "msg-2" }));
      }),
    );

    const result = await apiPostWithMeta<{ id: string }>("/messages", {
      body: "hi",
    });

    expect(result.data).toEqual({ id: "msg-2" });
    expect(result.headers.get("Idempotent-Replayed")).toBeNull();
  });

  it("apiPost keeps resolving the plain body, unaffected by the requestMeta refactor", async () => {
    const { apiPost } = await loadClient();
    stubFetch(
      vi.fn((url: string | URL | Request) => {
        if (String(url).includes("/csrf-token")) {
          return Promise.resolve(res(200, { csrfToken: "tok-1" }));
        }
        return Promise.resolve(
          res(200, { id: "msg-3" }, { "Idempotent-Replayed": "true" }),
        );
      }),
    );

    const result = await apiPost<{ id: string }>("/messages", { body: "hi" });

    expect(result).toEqual({ id: "msg-3" });
  });
});
