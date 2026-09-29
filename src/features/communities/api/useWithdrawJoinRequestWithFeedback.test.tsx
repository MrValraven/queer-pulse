import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { ApiError } from "../../../shared/api/client";
import { useWithdrawJoinRequestWithFeedback } from "./useWithdrawJoinRequestWithFeedback";

/**
 * The mutation is mocked so each case decides how the DELETE settles, and the
 * toast module is replaced with a spy so the assertions read exactly what the
 * applicant is told. `I18nProvider` is real: the toasts are asserted on their
 * English copy, the words the applicant actually sees. A real `QueryClient`
 * backs the hook, with `invalidateQueries` spied, so the 409 cases can assert
 * which cached reads get refreshed.
 */
const { mutateMock, toastSpy } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  toastSpy: vi.fn(),
}));

vi.mock("./useCommunityJoin", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useWithdrawJoinRequest: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastSpy }),
}));

type SettleHandlers = {
  onSuccess: () => void;
  onError: (error: Error) => void;
  onSettled: () => void;
};

/** Makes the next `mutate` call settle with `outcome`, the way react-query
 *  would: the success or error handler first, then `onSettled`. */
function settleWith(outcome: { error?: Error }) {
  mutateMock.mockImplementation(
    (_variables: undefined, handlers: SettleHandlers) => {
      if (outcome.error) handlers.onError(outcome.error);
      else handlers.onSuccess();
      handlers.onSettled();
    },
  );
}

function withdrawOnce() {
  const onSettled = vi.fn();
  const queryClient = new QueryClient();
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nProvider>{children}</I18nProvider>
      </QueryClientProvider>
    );
  }
  const { result } = renderHook(
    () => useWithdrawJoinRequestWithFeedback("closed-one"),
    { wrapper },
  );
  act(() => result.current.withdraw(onSettled));
  return { onSettled, invalidateSpy };
}

describe("useWithdrawJoinRequestWithFeedback", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    toastSpy.mockClear();
  });

  it("a withdrawal toasts done", () => {
    settleWith({});

    const { onSettled } = withdrawOnce();

    expect(toastSpy).toHaveBeenCalledWith("Request withdrawn.", "success");
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  // The declined line carries the server's reapply date, so the applicant
  // knows when asking again becomes possible.
  it("an already-answered 409 toasts the reapply date", () => {
    settleWith({
      error: new ApiError(409, "Conflict", {
        code: "JOIN_REQUEST_ALREADY_ANSWERED",
        reapplyAfter: "2026-12-01T12:00:00.000Z",
      }),
    });

    const { onSettled, invalidateSpy } = withdrawOnce();

    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /the moderators answered your request first.*you can apply again on .*2026/i,
      ),
      "info",
    );
    expect(onSettled).toHaveBeenCalledTimes(1);
    // The decline landed first, so the gate card and the detail hero both
    // drop the pending line and its Withdraw button.
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community-gate-card", "closed-one"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community", "closed-one"],
    });
  });

  // The server's "already a member" 409 carries no code, only Nest's default
  // body, so any uncoded 409 means the approval landed first.
  it("an already-approved 409 toasts that they are in", () => {
    settleWith({
      error: new ApiError(409, "Conflict", {
        statusCode: 409,
        message: "You are already a member of this community.",
        error: "Conflict",
      }),
    });

    const { invalidateSpy } = withdrawOnce();

    expect(toastSpy).toHaveBeenCalledWith(
      "Your request was approved first. You are in.",
      "success",
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community-gate-card", "closed-one"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community", "closed-one"],
    });
  });

  it("any other failure toasts the generic error", () => {
    settleWith({ error: new ApiError(500, "Server error", {}) });

    const { onSettled, invalidateSpy } = withdrawOnce();

    expect(toastSpy).toHaveBeenCalledWith(
      "Something went wrong. Try again in a moment.",
      "error",
    );
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
