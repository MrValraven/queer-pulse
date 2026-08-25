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
// Statically imported (unlike the live-mode hooks below, which are
// re-imported per test via `loadLive()`) so this shares its module graph —
// and therefore its `DemoModeContext`/`I18nContext` instances — with
// `TestProviders`, which is also a static import. Mirrors
// `useAdminVerifications.test.tsx`'s docblock on the same pattern.
import {
  useSubmitVerificationRequest,
  useVerificationStatus,
  useWithdrawVerificationRequest,
} from "./useVerification";
import type { VerificationRequestDTO } from "./verification.api";

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
    useAppealVerificationRequest: useAppealVerificationRequestLive,
    useSubmitVerificationRequest: useSubmitVerificationRequestLive,
    useWithdrawVerificationRequest: useWithdrawVerificationRequestLive,
  } = await import("./useVerification");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported
  // provider would hold a different I18nContext instance than the freshly
  // imported hooks resolve.
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
  return {
    useAppealVerificationRequest: useAppealVerificationRequestLive,
    useSubmitVerificationRequest: useSubmitVerificationRequestLive,
    useWithdrawVerificationRequest: useWithdrawVerificationRequestLive,
    wrapper,
  };
}

describe("useSubmitVerificationRequest (live mode via MSW)", () => {
  it("POSTs the submitted body to /verification/requests", async () => {
    let capturedBody: unknown;
    server.use(
      http.post(`${API_V1}/verification/requests`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "request-live-1",
          type: "identity",
          requestedLevel: "phone",
          status: "pending",
          context: "Please verify my phone, I host meetups.",
          decisionReason: null,
          isAppeal: false,
          createdAt: "2026-08-13T10:00:00.000Z",
          updatedAt: "2026-08-13T10:00:00.000Z",
        });
      }),
    );

    const { useSubmitVerificationRequest: useSubmitLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useSubmitLive(), { wrapper });

    let resolved: VerificationRequestDTO | undefined;
    result.current.mutate(
      {
        requestedLevel: "phone",
        context: "Please verify my phone, I host meetups.",
      },
      { onSuccess: (data) => (resolved = data) },
    );

    await waitFor(() => expect(resolved).toBeDefined());
    expect(resolved?.status).toBe("pending");
    expect(capturedBody).toEqual({
      requestedLevel: "phone",
      context: "Please verify my phone, I host meetups.",
    });
  });
});

describe("useWithdrawVerificationRequest (live mode via MSW)", () => {
  it("POSTs to /verification/requests/:id/withdraw", async () => {
    let capturedPath: string | undefined;
    server.use(
      http.post(
        `${API_V1}/verification/requests/request-live-1/withdraw`,
        ({ request }) => {
          capturedPath = new URL(request.url).pathname;
          return HttpResponse.json({
            id: "request-live-1",
            type: "identity",
            requestedLevel: "phone",
            status: "withdrawn",
            context: null,
            decisionReason: null,
            isAppeal: false,
            createdAt: "2026-08-13T10:00:00.000Z",
            updatedAt: "2026-08-13T11:00:00.000Z",
          });
        },
      ),
    );

    const { useWithdrawVerificationRequest: useWithdrawLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useWithdrawLive(), { wrapper });

    let resolved: VerificationRequestDTO | undefined;
    result.current.mutate("request-live-1", {
      onSuccess: (data) => (resolved = data),
    });

    await waitFor(() => expect(resolved).toBeDefined());
    expect(resolved?.status).toBe("withdrawn");
    expect(capturedPath).toContain(
      "/verification/requests/request-live-1/withdraw",
    );
  });
});

describe("useAppealVerificationRequest (live mode via MSW)", () => {
  it("POSTs to /verification/requests/:id/appeal", async () => {
    server.use(
      http.post(`${API_V1}/verification/requests/request-live-1/appeal`, () =>
        HttpResponse.json({
          id: "request-live-1",
          type: "identity",
          requestedLevel: "phone",
          status: "appealing",
          context: null,
          decisionReason: "Reference link didn't resolve.",
          isAppeal: true,
          createdAt: "2026-08-13T10:00:00.000Z",
          updatedAt: "2026-08-13T12:00:00.000Z",
        }),
      ),
    );

    const { useAppealVerificationRequest: useAppealLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAppealLive(), { wrapper });

    let resolved: VerificationRequestDTO | undefined;
    result.current.mutate("request-live-1", {
      onSuccess: (data) => (resolved = data),
    });

    await waitFor(() => expect(resolved).toBeDefined());
    expect(resolved?.status).toBe("appealing");
    expect(resolved?.isAppeal).toBe(true);
  });
});

describe("useSubmitVerificationRequest (demo mode)", () => {
  it("simulates a pending request with no network and writes it into the cached status", async () => {
    const { result } = renderHook(
      () => ({
        submit: useSubmitVerificationRequest(),
        status: useVerificationStatus(),
      }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.status.isLoading).toBe(false));
    expect(result.current.status.data?.latestRequest).toBeNull();

    let resolved: VerificationRequestDTO | undefined;
    result.current.submit.mutate(
      { requestedLevel: "phone", context: "Please verify my phone." },
      { onSuccess: (data) => (resolved = data) },
    );

    await waitFor(() => expect(resolved).toBeDefined());
    expect(resolved?.status).toBe("pending");
    expect(resolved?.context).toBe("Please verify my phone.");

    // The mutation writes the newly "created" request straight into the
    // cached /verification/me shape, so a mounted status reader updates
    // immediately without a refetch.
    await waitFor(() =>
      expect(result.current.status.data?.latestRequest?.id).toBe(resolved?.id),
    );
  });
});

describe("useWithdrawVerificationRequest (demo mode)", () => {
  it("re-stamps the cached latestRequest as withdrawn with no network", async () => {
    const { result } = renderHook(
      () => ({
        submit: useSubmitVerificationRequest(),
        withdraw: useWithdrawVerificationRequest(),
        status: useVerificationStatus(),
      }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.status.isLoading).toBe(false));

    let submitted: VerificationRequestDTO | undefined;
    result.current.submit.mutate(
      { requestedLevel: "phone" },
      { onSuccess: (data) => (submitted = data) },
    );
    await waitFor(() => expect(submitted).toBeDefined());

    let withdrawn: VerificationRequestDTO | undefined;
    result.current.withdraw.mutate(submitted!.id, {
      onSuccess: (data) => (withdrawn = data),
    });

    await waitFor(() => expect(withdrawn).toBeDefined());
    expect(withdrawn?.id).toBe(submitted!.id);
    expect(withdrawn?.status).toBe("withdrawn");
    await waitFor(() =>
      expect(result.current.status.data?.latestRequest?.status).toBe(
        "withdrawn",
      ),
    );
  });
});
