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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import { MEMBERS } from "../adminMembers.data";
// Statically imported (unlike the live-mode hooks below, which are
// re-imported per test via `loadLive()`) so this shares its module graph —
// and therefore its `DemoModeContext`/`I18nContext` instances — with
// `TestProviders`, which is also a static import. Both were resolved once, at
// this file's initial load, against vitest.config.ts's default env
// (`VITE_API_URL: ""`, `VITE_DEMO: "1"`), which is exactly what forces demo
// mode on (see `TestProviders`'s docblock). A `vi.resetModules()` call inside
// a later live-mode test only affects *future* dynamic `import()`s, not this
// already-bound top-level binding.
import { useAdminMembers } from "./useAdminMembers";

/**
 * LIVE-mode suite: proves the demo→live branch of useAdminMembers actually
 * hits the network, adapts the DTO through `cardDtoToMember`, and paginates
 * off the server's real `total` — PLUS a demo-mode suite proving the
 * inverse: that demo mode never touches the network and stops after page 1
 * even though `MEMBERS.length` (5) is far below the vanity `ACTIVE_MEMBER_COUNT`
 * total the header shows. That second half is the whole point of the demo
 * pageSize trick — `page * pageSize === total` so `getNextPageParam` yields
 * `undefined` and a naive infinite-scroll consumer never triggers a second
 * fetch against fabricated data.
 *
 * VITE_API_URL is stubbed to a real value in the live-mode tests so
 * `apiAvailable` is true (demo OFF) and MSW serves GET /admin/members.
 * Modules are reset + re-imported per test so config.ts re-freezes
 * API_BASE_URL from the stub — see useAdminCommunities.live.test.tsx, which
 * this mirrors.
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
  const { useAdminMembers: useAdminMembersLive } = await import(
    "./useAdminMembers"
  );
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported
  // provider would hold a different I18nContext instance than the freshly
  // imported useAdminMembers resolves, so useTranslation/useFormat wouldn't
  // find it.
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
  return { useAdminMembers: useAdminMembersLive, wrapper };
}

describe("useAdminMembers (live mode via MSW)", () => {
  it("fetches GET /admin/members and returns adapted members", async () => {
    server.use(
      http.get(`${API_V1}/admin/members`, () =>
        HttpResponse.json({
          items: [
            {
              id: "marco",
              slug: "marco-vieira",
              name: "Marco Vieira",
              initials: "MV",
              tone: "coral",
              pronouns: "he/him",
              verified: true,
              role: "member",
              openReportCount: 0,
              joinedAt: "2024-05-01T00:00:00.000Z",
              tagline: "Photographer",
              communities: ["Queer Creatives"],
              avatarUrl: null,
              vouchCount: 6,
              vouchedBy: [],
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        }),
      ),
    );

    const { useAdminMembers: useAdminMembersLive, wrapper } = await loadLive();
    const { result } = renderHook(() => useAdminMembersLive("all"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.members).toHaveLength(1);
    expect(result.current.members[0]!.name).toBe("Marco Vieira");
    expect(result.current.total).toBe(1);
    // page (1) * pageSize (20) >= total (1), so a single page is enough.
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useAdminFlagged (live mode via MSW)", () => {
  it("fetches GET /admin/members/flagged and returns adapted members", async () => {
    server.use(
      http.get(`${API_V1}/admin/members/flagged`, () =>
        HttpResponse.json([
          {
            id: "anon_9001",
            slug: "anon-9001",
            handle: "@anon_9001",
            initials: "A",
            tone: "amber",
            avatarUrl: "https://cdn.example.com/anon-9001.jpg",
            openReportCount: 2,
            topReasonCode: "spam",
            moderationState: "limited",
            joinedAt: "2026-07-01T00:00:00.000Z",
            latestReportDetail: "Repeated link spam across threads",
          },
        ]),
      ),
    );

    const { wrapper } = await loadLive();
    // useAdminFlagged is re-imported alongside useAdminMembers from the same
    // freshly loaded module (no further `vi.resetModules()` happened in
    // between, so this hits the identical module instance `loadLive` just
    // loaded rather than a third, disconnected one).
    const { useAdminFlagged: useAdminFlaggedLive } = await import(
      "./useAdminMembers"
    );
    const { result } = renderHook(() => useAdminFlaggedLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const flagged = result.current.data ?? [];
    expect(flagged).toHaveLength(1);
    expect(flagged[0]!.handle).toBe("@anon_9001");
    expect(flagged[0]!.category).toEqual({ kind: "spam" });
    expect(flagged[0]!.statusId).toBe("limited");
  });
});

describe("useAdminMembers (demo mode)", () => {
  it("returns the mock fixture and issues no request in demo mode", async () => {
    // The whole point of the change: fabricated members must never appear as
    // platform truth unless the operator turned "Populate platform" on. No
    // handler is registered for GET /admin/members in this test —
    // `onUnhandledRequest: "error"` above means any request at all, mocked or
    // not, throws and fails the test, so a passing result here proves the
    // network was never touched.
    const { result } = renderHook(() => useAdminMembers("all"), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.members).toEqual(MEMBERS);
    // ACTIVE_MEMBER_COUNT (8412) as the vanity total, not MEMBERS.length.
    expect(result.current.total).toBe(8412);
    // page (1) * pageSize (8412) >= total (8412): no page-2 fetch is ever
    // scheduled, so an infinite-scroll consumer stays on a single page.
    expect(result.current.hasNextPage).toBe(false);
  });
});
