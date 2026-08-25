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
import {
  ADMIN_VERIFICATIONS_DEMO,
  ADMIN_VERIFICATION_HISTORY,
} from "../adminVerifications.data";
import {
  DEMO_VERIFICATION_REQUESTS,
  DEMO_VERIFICATION_REQUEST_COUNTS,
} from "../verificationRequests.data";
// Statically imported (unlike the live-mode hooks below, which are
// re-imported per test via `loadLive()`) so this shares its module graph —
// and therefore its `DemoModeContext`/`I18nContext` instances — with
// `TestProviders`, which is also a static import. Both were resolved once, at
// this file's initial load, against vitest.config.ts's default env
// (`VITE_API_URL: ""`, `VITE_DEMO: "1"`), which is exactly what forces demo
// mode on (see `TestProviders`'s docblock). A `vi.resetModules()` call inside
// a later live-mode test only affects *future* dynamic `import()`s, not this
// already-bound top-level binding.
import {
  useAdminVerifications,
  useDecideVerificationRequest,
  useVerificationHistory,
  useVerificationRequests,
} from "./useAdminVerifications";

/**
 * LIVE-mode suite: proves the demo→live branch of useAdminVerifications
 * actually hits the network, passes `level`/`q`/`sort` as query params (and
 * omits `level` for the synthetic "all" tab), and surfaces `counts` from the
 * response — PLUS a demo-mode suite proving the inverse: that demo mode never
 * touches the network and filters/sorts the colocated fixture client-side.
 * Mirrors useAdminMembers.live.test.tsx / useAdminOverview.live.test.tsx.
 *
 * VITE_API_URL is stubbed to a real value in the live-mode tests so
 * `apiAvailable` is true (demo OFF) and MSW serves GET /admin/verifications.
 * Modules are reset + re-imported per test so config.ts re-freezes
 * API_BASE_URL from the stub.
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
  const {
    useAdminVerifications: useAdminVerificationsLive,
    useBulkDecideVerificationRequests: useBulkDecideVerificationRequestsLive,
    useDecideVerificationRequest: useDecideVerificationRequestLive,
    useVerificationHistory: useVerificationHistoryLive,
    useVerificationRequests: useVerificationRequestsLive,
  } = await import("./useAdminVerifications");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported
  // provider would hold a different I18nContext instance than the freshly
  // imported hooks resolve, so useTranslation/useFormat wouldn't find it.
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  // Dynamically imported for the same reason: a statically-imported
  // ToastProvider would carry its own copy of the i18n module and throw
  // "useTranslation must be used within an I18nProvider" from inside itself.
  const { ToastProvider } =
    await import("../../../shared/components/feedback/ToastProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // ToastProvider too: the bulk-decide hook reports its outcome through
  // `useToast`, which throws outside a provider.
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <DemoModeProvider>{children}</DemoModeProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return {
    useAdminVerifications: useAdminVerificationsLive,
    useBulkDecideVerificationRequests: useBulkDecideVerificationRequestsLive,
    useDecideVerificationRequest: useDecideVerificationRequestLive,
    useVerificationHistory: useVerificationHistoryLive,
    useVerificationRequests: useVerificationRequestsLive,
    wrapper,
  };
}

describe("useAdminVerifications (live mode via MSW)", () => {
  it("passes level/q/sort query params and returns rows + counts", async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`${API_V1}/admin/verifications`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({
          rows: [
            {
              userId: "user-1",
              member: {
                slug: "ana",
                firstName: "Ana",
                lastName: "Ribeiro",
                avatarUrl: null,
              },
              level: "phone",
              method: "phone_otp",
              provider: "dev_phone",
              providerRef: null,
              verifiedAt: "2026-08-01T10:00:00.000Z",
              updatedAt: "2026-08-01T10:00:00.000Z",
            },
          ],
          counts: { none: 1, email: 2, phone: 3, id_verified: 4 },
          nextCursor: null,
        });
      }),
    );

    const { useAdminVerifications: useAdminVerificationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(
      () =>
        useAdminVerificationsLive({
          level: "phone",
          query: "ana",
          sort: "oldest",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]!.userId).toBe("user-1");
    expect(result.current.counts).toEqual({
      none: 1,
      email: 2,
      phone: 3,
      id_verified: 4,
    });
    expect(capturedUrl?.searchParams.get("level")).toBe("phone");
    expect(capturedUrl?.searchParams.get("q")).toBe("ana");
    expect(capturedUrl?.searchParams.get("sort")).toBe("oldest");
  });

  it("omits the level param for the synthetic 'all' tab", async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`${API_V1}/admin/verifications`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({
          rows: [],
          counts: { none: 0, email: 0, phone: 0, id_verified: 0 },
          nextCursor: null,
        });
      }),
    );

    const { useAdminVerifications: useAdminVerificationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(
      () =>
        useAdminVerificationsLive({ level: "all", query: "", sort: "recent" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(capturedUrl?.searchParams.has("level")).toBe(false);
    expect(capturedUrl?.searchParams.has("q")).toBe(false);
  });
});

describe("useVerificationHistory (live mode via MSW)", () => {
  it("fetches GET /admin/verifications/:userId/history", async () => {
    server.use(
      http.get(`${API_V1}/admin/verifications/user-1/history`, () =>
        HttpResponse.json([
          {
            id: "event-1",
            action: "overridden",
            fromLevel: "phone",
            toLevel: "id_verified",
            reason: "Verified in person.",
            actor: {
              slug: "ana-ribeiro",
              firstName: "Ana",
              lastName: "Ribeiro",
              avatarUrl: null,
            },
            createdAt: "2026-08-07T17:00:00.000Z",
          },
        ]),
      ),
    );

    const { useVerificationHistory: useVerificationHistoryLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useVerificationHistoryLive("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]!.reason).toBe("Verified in person.");
  });
});

describe("useAdminVerifications (demo mode)", () => {
  it("filters the fixture client-side and issues no request", async () => {
    const { result } = renderHook(
      () =>
        useAdminVerifications({ level: "phone", query: "", sort: "recent" }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const expectedPhoneRows = ADMIN_VERIFICATIONS_DEMO.filter(
      (row) => row.level === "phone",
    );
    expect(result.current.rows).toHaveLength(expectedPhoneRows.length);
    expect(result.current.rows.every((row) => row.level === "phone")).toBe(
      true,
    );
    // counts are scoped by the (empty) search term but NOT by the active
    // level tab, so every level still reports its own real count here.
    expect(result.current.counts.id_verified).toBe(
      ADMIN_VERIFICATIONS_DEMO.filter((row) => row.level === "id_verified")
        .length,
    );
  });

  it("has no next page (the fixture is one synthetic page)", async () => {
    const { result } = renderHook(
      () => useAdminVerifications({ level: "all", query: "", sort: "recent" }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useVerificationHistory (demo mode)", () => {
  it("returns the fixture history for a member and issues no request", async () => {
    const [firstDemoUserId] = Object.keys(ADMIN_VERIFICATION_HISTORY);
    const { result } = renderHook(
      () => useVerificationHistory(firstDemoUserId!),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toEqual(
      ADMIN_VERIFICATION_HISTORY[firstDemoUserId!],
    );
    expect(result.current.events.length).toBeGreaterThan(0);
  });
});

/**
 * Phase 2 review-queue suite — mirrors the Phase 1 suites above exactly:
 * live-mode via MSW proves the wire params, demo-mode proves the colocated
 * fixture is filtered/sorted client-side with no network.
 */
describe("useVerificationRequests (live mode via MSW)", () => {
  it("passes status/type/q/sort query params and returns rows + counts", async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`${API_V1}/admin/verifications/requests`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({
          rows: [
            {
              id: "request-1",
              member: {
                slug: "ana",
                firstName: "Ana",
                lastName: "Ribeiro",
                avatarUrl: null,
              },
              type: "identity",
              requestedLevel: "phone",
              status: "pending",
              isAppeal: false,
              createdAt: "2026-08-10T09:20:00.000Z",
              updatedAt: "2026-08-10T09:20:00.000Z",
            },
          ],
          counts: {
            pending: 1,
            in_review: 2,
            approved: 3,
            rejected: 4,
            appealing: 5,
            withdrawn: 6,
          },
          nextCursor: null,
        });
      }),
    );

    const { useVerificationRequests: useVerificationRequestsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(
      () =>
        useVerificationRequestsLive({
          status: "pending",
          type: "identity",
          query: "ana",
          sort: "oldest",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]!.id).toBe("request-1");
    expect(result.current.counts.appealing).toBe(5);
    expect(capturedUrl?.searchParams.get("status")).toBe("pending");
    expect(capturedUrl?.searchParams.get("type")).toBe("identity");
    expect(capturedUrl?.searchParams.get("q")).toBe("ana");
    expect(capturedUrl?.searchParams.get("sort")).toBe("oldest");
  });

  it("omits the status param for the synthetic 'all' tab", async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`${API_V1}/admin/verifications/requests`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({
          rows: [],
          counts: {
            pending: 0,
            in_review: 0,
            approved: 0,
            rejected: 0,
            appealing: 0,
            withdrawn: 0,
          },
          nextCursor: null,
        });
      }),
    );

    const { useVerificationRequests: useVerificationRequestsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(
      () =>
        useVerificationRequestsLive({
          status: "all",
          query: "",
          sort: "recent",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(capturedUrl?.searchParams.has("status")).toBe(false);
    expect(capturedUrl?.searchParams.has("q")).toBe(false);
  });
});

describe("useVerificationRequests (demo mode)", () => {
  it("filters the fixture client-side by status and issues no request", async () => {
    const { result } = renderHook(
      () =>
        useVerificationRequests({
          status: "pending",
          query: "",
          sort: "recent",
        }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const expectedPendingRows = DEMO_VERIFICATION_REQUESTS.filter(
      (row) => row.status === "pending",
    );
    expect(result.current.rows).toHaveLength(expectedPendingRows.length);
    expect(result.current.rows.every((row) => row.status === "pending")).toBe(
      true,
    );
    // counts are scoped by the (empty) search term but NOT by the active
    // status tab, so every status still reports its real fixture count here.
    expect(result.current.counts).toEqual(DEMO_VERIFICATION_REQUEST_COUNTS);
  });

  it("has no next page (the fixture is one synthetic page)", async () => {
    const { result } = renderHook(
      () =>
        useVerificationRequests({ status: "all", query: "", sort: "recent" }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useDecideVerificationRequest (live mode via MSW)", () => {
  it("PATCHes the request with { action, reason } and resolves the decided row", async () => {
    let capturedBody: unknown;
    server.use(
      http.patch(
        `${API_V1}/admin/verifications/requests/request-1`,
        async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            id: "request-1",
            member: {
              slug: "ana",
              firstName: "Ana",
              lastName: "Ribeiro",
              avatarUrl: null,
            },
            type: "identity",
            requestedLevel: "phone",
            status: "rejected",
            isAppeal: false,
            createdAt: "2026-08-10T09:20:00.000Z",
            updatedAt: "2026-08-11T09:20:00.000Z",
          });
        },
      ),
    );

    const {
      useDecideVerificationRequest: useDecideVerificationRequestLive,
      wrapper,
    } = await loadLive();
    const { result } = renderHook(() => useDecideVerificationRequestLive(), {
      wrapper,
    });

    let resolved: { status?: string } | undefined;
    result.current.decide(
      {
        id: "request-1",
        action: "reject",
        reason: "The reference link did not resolve.",
      },
      { onSuccess: (data) => (resolved = data) },
    );

    await waitFor(() => expect(resolved).toBeDefined());
    expect(resolved?.status).toBe("rejected");
    expect(capturedBody).toEqual({
      action: "reject",
      reason: "The reference link did not resolve.",
    });
  });
});

/**
 * Fix round 1: `useBulkDecideVerificationRequests`'s live-mode
 * `onLiveSuccess` must only invalidate the level-console (`useAdminVerifications`)
 * + level-history caches for a bulk APPROVE, mirroring
 * `useDecideVerificationRequest.onSuccess`'s `updated.status === "approved"`
 * gate — a bulk reject or mark-in-review has nothing for the level console to
 * reflect. The request-queue invalidation, by contrast, is unconditional on
 * any successful bulk action. Live-only: demo mode never invalidates
 * anything (the per-id cache patch IS the result), so there's no demo-mode
 * counterpart to this gate to test.
 *
 * Asserted by mounting `useAdminVerificationsLive` (an active subscriber to
 * the level-console query) alongside the bulk mutation in the same
 * `QueryClient`/wrapper, and counting `GET /admin/verifications` calls: an
 * `invalidateQueries` against an ACTIVE query triggers an immediate refetch,
 * so a fetch-count bump is direct proof the invalidation fired (and its
 * absence is direct proof it didn't).
 */
describe("useBulkDecideVerificationRequests (live mode via MSW)", () => {
  it("invalidates the level console only for a successful bulk approve, not reject/in_review — but always invalidates the request queue", async () => {
    let levelConsoleFetchCount = 0;
    let requestQueueFetchCount = 0;
    server.use(
      http.get(`${API_V1}/admin/verifications`, () => {
        levelConsoleFetchCount += 1;
        return HttpResponse.json({
          rows: [],
          counts: { none: 0, email: 0, phone: 0, id_verified: 0 },
          nextCursor: null,
        });
      }),
      http.get(`${API_V1}/admin/verifications/requests`, () => {
        requestQueueFetchCount += 1;
        return HttpResponse.json({
          rows: [],
          counts: {
            pending: 0,
            in_review: 0,
            approved: 0,
            rejected: 0,
            appealing: 0,
            withdrawn: 0,
          },
          nextCursor: null,
        });
      }),
      http.post(
        `${API_V1}/admin/verifications/requests/bulk`,
        async ({ request }) => {
          const body = (await request.json()) as { ids: string[] };
          return HttpResponse.json({ succeeded: body.ids, failed: [] });
        },
      ),
    );

    const {
      useAdminVerifications: useAdminVerificationsLive,
      useBulkDecideVerificationRequests: useBulkDecideVerificationRequestsLive,
      useVerificationRequests: useVerificationRequestsLive,
      wrapper,
    } = await loadLive();

    const { result } = renderHook(
      () => ({
        levelConsole: useAdminVerificationsLive({
          level: "all",
          query: "",
          sort: "recent",
        }),
        requestQueue: useVerificationRequestsLive({
          status: "all",
          query: "",
          sort: "recent",
        }),
        bulk: useBulkDecideVerificationRequestsLive(),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.levelConsole.isLoading).toBe(false),
    );
    await waitFor(() =>
      expect(result.current.requestQueue.isLoading).toBe(false),
    );
    expect(levelConsoleFetchCount).toBe(1);
    expect(requestQueueFetchCount).toBe(1);

    // A bulk REJECT succeeds — the request queue refetches, but the level
    // console must NOT.
    await result.current.bulk.bulkDecide(
      ["request-1"],
      "reject",
      "Couldn't confirm the reference.",
    );
    await waitFor(() => expect(requestQueueFetchCount).toBe(2));
    expect(levelConsoleFetchCount).toBe(1);

    // A bulk MARK IN-REVIEW succeeds — same expectation.
    await result.current.bulk.bulkDecide(["request-2"], "in_review");
    await waitFor(() => expect(requestQueueFetchCount).toBe(3));
    expect(levelConsoleFetchCount).toBe(1);

    // A bulk APPROVE succeeds — NOW the level console also refetches.
    await result.current.bulk.bulkDecide(["request-3"], "approve");
    await waitFor(() => expect(requestQueueFetchCount).toBe(4));
    await waitFor(() => expect(levelConsoleFetchCount).toBe(2));
  });
});

describe("useDecideVerificationRequest (demo mode)", () => {
  it("resolves a decided row from the fixture with no network", async () => {
    const { result } = renderHook(() => useDecideVerificationRequest(), {
      wrapper: TestProviders,
    });

    let resolved: { id?: string; status?: string } | undefined;
    result.current.decide(
      { id: "request-pending-1", action: "approve" },
      { onSuccess: (data) => (resolved = data) },
    );

    await waitFor(() => expect(resolved).toBeDefined());
    expect(resolved?.id).toBe("request-pending-1");
    expect(resolved?.status).toBe("approved");
  });
});
