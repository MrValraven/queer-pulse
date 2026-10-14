import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { toCreditInboxView } from "./studioDiscovery.adapters";
import { resetDemoCreditLedger } from "./studioDemoCreditLedger";
import { demoStudioCreditInbox } from "./studioDemoCreditReads";
import { studioKeys } from "./studioQueryKeys";
import { useAcceptStudioCredit } from "./useStudioCreditInboxMutations";

const acceptStudioCredit = vi.hoisted(() =>
  vi.fn<(creditId: string) => Promise<unknown>>(),
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./studioDiscovery.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioDiscovery.api")>()),
  acceptStudioCredit: (creditId: string) => acceptStudioCredit(creditId),
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  resetDemoCreditLedger();
  acceptStudioCredit.mockReset();
});

describe("inbox writes (live)", () => {
  it("drops a request the server answers 404 for and lowers the count", async () => {
    const { queryClient, wrapper } = setup();
    // The demo inbox is only the wire-shaped fixture here.
    const inbox = toCreditInboxView(demoStudioCreditInbox());
    queryClient.setQueryData(studioKeys.creditInbox(false), inbox);
    queryClient.setQueryData(studioKeys.creditPendingCount(false), 2);
    const request = inbox.requests[0];
    if (!request) throw new Error("the fixture inbox has a request");
    acceptStudioCredit.mockRejectedValue(
      new ApiError(404, "Not found", {
        statusCode: 404,
        code: "studio_credit_not_found",
        message: "Not found",
      }),
    );
    const { result } = renderHook(() => useAcceptStudioCredit(), { wrapper });
    const error = await act(() =>
      result.current
        .mutateAsync({ row: request })
        .catch((caught: unknown) => caught),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(acceptStudioCredit).toHaveBeenCalledWith(request.id);
    const after = queryClient.getQueryData<typeof inbox>(
      studioKeys.creditInbox(false),
    );
    expect(after?.requests.map((row) => row.id)).not.toContain(request.id);
    expect(after?.accepted.map((row) => row.id)).not.toContain(request.id);
    expect(queryClient.getQueryData(studioKeys.creditPendingCount(false))).toBe(
      1,
    );
  });
});
