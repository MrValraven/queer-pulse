import { renderHook, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw/server";

/**
 * LIVE-mode suite for the published-identity sets. The regression it guards:
 * `available` is server-derived from the member's stored `identities`, and the
 * pane used to read it exactly once on mount — so an identity added in the
 * chips above and saved had no switch until a full page reload.
 */

// The backend ORIGIN — what the client reads as its base from VITE_API_URL.
const API = "http://api.test";
// That origin under the client's URI version prefix. The client prefixes every
// call through its generic `request()` builder with `/v1`, so the handler must
// be registered there to match the real GET it fires (see client.ts).
const API_V1 = `${API}/v1`;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useDiscoverableIdentities } = await import(
    "./useDiscoverableIdentities"
  );
  const { DemoModeProvider } = await import(
    "../../../app/providers/DemoModeProvider"
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DemoModeProvider>{children}</DemoModeProvider>
  );
  return { useDiscoverableIdentities, wrapper };
}

describe("useDiscoverableIdentities (live mode via MSW)", () => {
  it("re-reads the server's sets when the save counter changes", async () => {
    // What the server would return before, then after, the member saves
    // "Bisexual" into their private identities.
    const responses = [
      { available: ["Lesbian"], published: ["Lesbian"] },
      { available: ["Lesbian", "Bisexual"], published: ["Lesbian"] },
    ];
    let reads = 0;
    server.use(
      http.get(`${API_V1}/me/discoverable-identities`, () =>
        HttpResponse.json(responses[Math.min(reads++, 1)]),
      ),
    );

    const { useDiscoverableIdentities, wrapper } = await loadLive();
    const { result, rerender } = renderHook(
      ({ key }: { key: number }) => useDiscoverableIdentities([], key),
      { wrapper, initialProps: { key: 0 } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.available).toEqual(["Lesbian"]);

    // The profile save lands: the counter bumps, the pane asks again.
    rerender({ key: 1 });

    await waitFor(() =>
      expect(result.current.available).toEqual(["Lesbian", "Bisexual"]),
    );
    // The already-visible switches never blanked out while the re-read ran.
    expect(result.current.loading).toBe(false);
    expect(result.current.published).toEqual(["Lesbian"]);
    expect(reads).toBe(2);
  });
});
