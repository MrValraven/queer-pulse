import { renderHook, waitFor, act } from "@testing-library/react";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
// Statically imported so it shares its module graph (and therefore its
// DemoModeContext/I18nContext instances) with TestProviders, which is also a
// static import — mirrors useAdminMembers.live.test.tsx.
import { useVouchMember } from "./useVouchMember";

/**
 * LIVE-mode suite: proves the demo→live branch of useVouchMember actually
 * POSTs /members/:slug/vouch with the full { relationship, note, anonymous }
 * payload, PLUS a demo-mode suite proving the inverse: demo mode never
 * touches the network and resolves `undefined`.
 *
 * VITE_API_URL is stubbed to a real value in the live-mode test so
 * `apiAvailable` is true (demo OFF) and MSW serves POST /members/:slug/vouch.
 * Modules are reset + re-imported per test so config.ts re-freezes
 * API_BASE_URL from the stub — see useAdminMembers.live.test.tsx, which this
 * mirrors.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useVouchMember: useVouchMemberLive } = await import(
    "./useVouchMember"
  );
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>{children}</DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useVouchMember: useVouchMemberLive, wrapper };
}

describe("useVouchMember (live mode via MSW)", () => {
  it("POSTs /members/:slug/vouch with the relationships + note + anonymous payload", async () => {
    let receivedBody: unknown;
    server.use(
      // The API client prefixes every `request()`-based call with `/v1` (URI
      // versioning); the MSW handler must match that versioned path.
      http.post(`${API}/v1/members/marco-vieira/vouch`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ vouchCount: 7 });
      }),
    );

    const { useVouchMember: useVouchMemberLive, wrapper } = await loadLive();
    const { result } = renderHook(() => useVouchMemberLive(), { wrapper });

    act(() => {
      result.current.mutate({
        slug: "marco-vieira",
        relationships: ["friends", "collaborated"],
        note: "We met at a queer film night last year.",
        anonymous: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ vouchCount: 7 });
    expect(receivedBody).toEqual({
      note: "We met at a queer film night last year.",
      relationships: ["friends", "collaborated"],
      anonymous: true,
    });
  });
});

describe("useVouchMember (demo mode)", () => {
  it("resolves undefined and issues no request in demo mode", async () => {
    // No handler is registered for POST /members/:slug/vouch in this test —
    // `onUnhandledRequest: "error"` above means any request at all, mocked or
    // not, throws and fails the test, so a passing result here proves the
    // network was never touched.
    const { result } = renderHook(() => useVouchMember(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.mutate({
        slug: "marco-vieira",
        relationships: ["friends"],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
