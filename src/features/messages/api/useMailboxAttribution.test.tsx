import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { API } from "../../../test/msw/handlers";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import type { MailboxAttribution } from "./mailboxes.api";

const IDENTITY_ID = "5f0c2a4e-1d7b-4c1e-9a52-0b6f3f1c2a02";

const apiMocks = vi.hoisted(() => ({
  getMailboxAttribution: vi.fn(),
  setMailboxStaffNames: vi.fn(),
  setMyStaffNaming: vi.fn(),
}));

vi.mock("./mailboxes.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./mailboxes.api")>()),
  ...apiMocks,
}));

const cafe: MailboxSummary = {
  identityId: IDENTITY_ID,
  kind: "listing",
  displayName: "Café Lisboa",
  handle: "cafe-lisboa",
  avatarUrl: null,
  unreadCount: 0,
  isOwner: true,
  isReadOnly: false,
  shouldShowStaffNames: true,
  shouldAllowMyName: true,
};

const serverAttribution: MailboxAttribution = {
  shouldShowStaffNames: true,
  shouldAllowMyName: true,
  isOwner: true,
};

/** A deferred promise, so a test can read the optimistic value while the
 *  request is in flight. */
function deferred<Value>() {
  let resolve: (value: Value) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<Value>((resolveWith, rejectWith) => {
    resolve = resolveWith;
    reject = rejectWith;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  apiMocks.getMailboxAttribution.mockReset();
  apiMocks.setMailboxStaffNames.mockReset();
  apiMocks.setMyStaffNaming.mockReset();
  apiMocks.getMailboxAttribution.mockResolvedValue(serverAttribution);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Live mode (demo with `isLive` false): re-import every module that reads
 *  `VITE_API_URL`, so the hook sees the stubbed mode. */
async function renderAttribution(mailbox: MailboxSummary, isLive = true) {
  vi.resetModules();
  if (isLive) vi.stubEnv("VITE_API_URL", API);
  const { useMailboxAttribution, mailboxAttributionQueryKey } =
    await import("./useMailboxAttribution");
  const { MAILBOXES_QUERY_KEY_PREFIX } =
    await import("../../../shared/api/mailboxViewer");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const { ToastProvider } =
    await import("../../../shared/components/feedback/ToastProvider");
  const { useTranslation } =
    await import("../../../shared/i18n/useTranslation");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>
          <ToastProvider>{children}</ToastProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  const { result: probe } = renderHook(
    () => ({
      settings: useMailboxAttribution(mailbox),
      translate: useTranslation().t,
    }),
    { wrapper },
  );
  // The messages catalog loads lazily: wait for it, so each toast renders
  // its copy.
  await waitFor(() =>
    expect(probe.current.translate("messages:mailbox.settings.saved")).toBe(
      "Saved",
    ),
  );
  const result = {
    get current() {
      return probe.current.settings;
    },
  };
  const wasMailboxListRefreshed = () =>
    invalidateSpy.mock.calls.some(
      ([filters]) =>
        JSON.stringify(filters?.queryKey) ===
        JSON.stringify(MAILBOXES_QUERY_KEY_PREFIX),
    );
  return {
    result,
    client,
    queryKey: mailboxAttributionQueryKey(mailbox.identityId, !isLive),
    wasMailboxListRefreshed,
  };
}

describe("useMailboxAttribution (live)", () => {
  it("reads the mailbox's attribution and exposes its three fields", async () => {
    apiMocks.getMailboxAttribution.mockResolvedValue({
      shouldShowStaffNames: false,
      shouldAllowMyName: true,
      isOwner: false,
    });
    const { result } = await renderAttribution(cafe);
    await waitFor(() =>
      expect(result.current.attribution).toEqual({
        shouldShowStaffNames: false,
        shouldAllowMyName: true,
        isOwner: false,
      }),
    );
    expect(apiMocks.getMailboxAttribution).toHaveBeenCalledWith(IDENTITY_ID);
  });

  it("writes the owner switch, keeps the server's answer and refreshes the mailbox list", async () => {
    const request = deferred<MailboxAttribution>();
    apiMocks.setMailboxStaffNames.mockReturnValue(request.promise);
    const { result, wasMailboxListRefreshed } = await renderAttribution(cafe);
    await waitFor(() =>
      expect(apiMocks.getMailboxAttribution).toHaveBeenCalled(),
    );
    act(() => result.current.setShowStaffNames(false));
    await waitFor(() =>
      expect(result.current.attribution?.shouldShowStaffNames).toBe(false),
    );
    expect(apiMocks.setMailboxStaffNames).toHaveBeenCalledWith(
      IDENTITY_ID,
      false,
    );
    await act(async () => {
      request.resolve({
        shouldShowStaffNames: false,
        shouldAllowMyName: false,
        isOwner: true,
      });
      await request.promise;
    });
    await waitFor(() =>
      expect(result.current.attribution?.shouldAllowMyName).toBe(false),
    );
    expect(wasMailboxListRefreshed()).toBe(true);
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  it("writes the member's own switch through the staff preference", async () => {
    apiMocks.setMyStaffNaming.mockResolvedValue({
      ...serverAttribution,
      shouldAllowMyName: false,
    });
    const { result } = await renderAttribution(cafe);
    act(() => result.current.setAllowMyName(false));
    await waitFor(() =>
      expect(apiMocks.setMyStaffNaming).toHaveBeenCalledWith(
        IDENTITY_ID,
        false,
      ),
    );
    expect(apiMocks.setMailboxStaffNames).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(result.current.attribution?.shouldAllowMyName).toBe(false),
    );
  });

  it("rolls back and says so when the owner switch is refused", async () => {
    const { ApiError } = await import("../../../shared/api/client");
    const request = deferred<MailboxAttribution>();
    apiMocks.setMailboxStaffNames.mockReturnValue(request.promise);
    const { result } = await renderAttribution(cafe);
    await waitFor(() =>
      expect(apiMocks.getMailboxAttribution).toHaveBeenCalledTimes(1),
    );
    // The re-read after the refusal never answers, so only the rollback can
    // put the switch back.
    apiMocks.getMailboxAttribution.mockReturnValue(new Promise(() => {}));
    act(() => result.current.setShowStaffNames(false));
    await waitFor(() =>
      expect(result.current.attribution?.shouldShowStaffNames).toBe(false),
    );
    await act(async () => {
      request.reject(
        new ApiError(403, "Forbidden", { code: "IDENTITY_NOT_OWNER" }),
      );
      await request.promise.catch(() => {});
    });
    await waitFor(() =>
      expect(result.current.attribution?.shouldShowStaffNames).toBe(true),
    );
    expect(
      await screen.findByText("That didn't save. Try again."),
    ).toBeInTheDocument();
  });

  it("refreshes the mailbox list when the member no longer staffs it", async () => {
    const { ApiError } = await import("../../../shared/api/client");
    apiMocks.setMyStaffNaming.mockRejectedValue(
      new ApiError(403, "Forbidden", { code: "IDENTITY_NOT_STAFF" }),
    );
    const { result, wasMailboxListRefreshed } = await renderAttribution(cafe);
    act(() => result.current.setAllowMyName(false));
    await waitFor(() => expect(wasMailboxListRefreshed()).toBe(true));
  });
});

describe("useMailboxAttribution (demo)", () => {
  it("seeds from the mailbox summary, changes in the cache alone and makes no request", async () => {
    const teamMailbox: MailboxSummary = {
      ...cafe,
      isOwner: false,
      shouldShowStaffNames: false,
      shouldAllowMyName: true,
    };
    const { result, client, queryKey } = await renderAttribution(
      teamMailbox,
      false,
    );
    await waitFor(() =>
      expect(result.current.attribution).toEqual({
        shouldShowStaffNames: false,
        shouldAllowMyName: true,
        isOwner: false,
      }),
    );
    act(() => result.current.setAllowMyName(false));
    await waitFor(() =>
      expect(
        client.getQueryData<MailboxAttribution>(queryKey)?.shouldAllowMyName,
      ).toBe(false),
    );
    expect(apiMocks.getMailboxAttribution).not.toHaveBeenCalled();
    expect(apiMocks.setMailboxStaffNames).not.toHaveBeenCalled();
    expect(apiMocks.setMyStaffNaming).not.toHaveBeenCalled();
  });
});
