import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  useCommunityRules,
  useIsWithdrawingJoinRequest,
  useJoinCommunityWithRules,
  useWithdrawJoinRequest,
} from "./useCommunityJoin";

/**
 * The live branch of the join hooks. `useDemoMode` is forced to live so the
 * network path runs, and `./communityJoin.api` is mocked so each case asserts
 * what the hook does with a given response. The wrapper is a bare
 * `QueryClientProvider` around one client per test, which lets the
 * invalidation cases spy on exactly the client the hook uses.
 */
const { getCommunityRulesMock, joinCommunityWithRulesMock, withdrawMock } =
  vi.hoisted(() => ({
    getCommunityRulesMock: vi.fn(),
    joinCommunityWithRulesMock: vi.fn(),
    withdrawMock: vi.fn(),
  }));

vi.mock("./communityJoin.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getCommunityRules: getCommunityRulesMock,
  joinCommunityWithRules: joinCommunityWithRulesMock,
  withdrawMyJoinRequest: withdrawMock,
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({ demoMode: false, setDemoMode: vi.fn() }),
}));

const SLUG = "queer-youth";
const GATE_CARD_KEY = ["community-gate-card", SLUG];
const DETAIL_KEY = ["community", SLUG];
const MY_INVITES_KEY = ["my-community-invites"];

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useCommunityJoin (live mode)", () => {
  it("useCommunityRules maps rules, version and accepted version from the rules route", async () => {
    getCommunityRulesMock.mockResolvedValue({
      rules: ["communities:rules.preset.kindness", "Bring snacks"],
      rulesVersion: 3,
      rulesAcceptedVersion: 2,
    });

    const { result } = renderHook(() => useCommunityRules(SLUG), {
      wrapper: wrapperFor(createClient()),
    });

    await waitFor(() => expect(result.current.hasRules).toBe(true));
    expect(getCommunityRulesMock).toHaveBeenCalledWith(SLUG);
    expect(result.current.rules).toEqual([
      "communities:rules.preset.kindness",
      "Bring snacks",
    ]);
    expect(result.current.rulesVersion).toBe(3);
    expect(result.current.acceptedVersion).toBe(2);
    expect(result.current.isLoading).toBe(false);
  });

  it("useJoinCommunityWithRules refreshes the gate card after a join", async () => {
    joinCommunityWithRulesMock.mockResolvedValue({
      outcome: "requested",
      role: null,
      request: null,
    });
    const queryClient = createClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useJoinCommunityWithRules(SLUG), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({ involvement: "active" });
    });

    expect(joinCommunityWithRulesMock).toHaveBeenCalledWith(SLUG, {
      involvement: "active",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: GATE_CARD_KEY });
  });

  it("useJoinCommunityWithRules refreshes the viewer's invitations after a join", async () => {
    joinCommunityWithRulesMock.mockResolvedValue({
      outcome: "joined",
      role: "member",
      request: null,
    });
    const queryClient = createClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useJoinCommunityWithRules(SLUG), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({ involvement: "active" });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: MY_INVITES_KEY });
  });

  it("an already-pending refusal refreshes the gate card and the detail", async () => {
    joinCommunityWithRulesMock.mockRejectedValue(
      new ApiError(409, "Request already pending", {
        code: "COMMUNITY_JOIN_REQUEST_PENDING",
      }),
    );
    const queryClient = createClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useJoinCommunityWithRules(SLUG), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ involvement: "active" }),
      ).rejects.toBeInstanceOf(ApiError);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: GATE_CARD_KEY });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: DETAIL_KEY });
  });

  it("an uncoded join failure leaves every query as it was", async () => {
    joinCommunityWithRulesMock.mockRejectedValue(
      new ApiError(400, "note must be shorter", {}),
    );
    const queryClient = createClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useJoinCommunityWithRules(SLUG), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ involvement: "active" }),
      ).rejects.toBeInstanceOf(ApiError);
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("useWithdrawJoinRequest refreshes the gate card after a withdrawal", async () => {
    withdrawMock.mockResolvedValue(undefined);
    const queryClient = createClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useWithdrawJoinRequest(SLUG), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(withdrawMock).toHaveBeenCalledWith(SLUG);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: GATE_CARD_KEY });
  });

  it("a withdraw in flight shows through useIsWithdrawingJoinRequest to a surface mounted later, for its slug only", async () => {
    let resolveWithdraw: () => void = () => {};
    withdrawMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveWithdraw = resolve;
        }),
    );
    const queryClient = createClient();
    const { result } = renderHook(() => useWithdrawJoinRequest(SLUG), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => result.current.mutate());

    const laterMount = renderHook(() => useIsWithdrawingJoinRequest(SLUG), {
      wrapper: wrapperFor(queryClient),
    });
    const otherSlugMount = renderHook(
      () => useIsWithdrawingJoinRequest("another-community"),
      { wrapper: wrapperFor(queryClient) },
    );
    await waitFor(() => expect(laterMount.result.current).toBe(true));
    expect(otherSlugMount.result.current).toBe(false);

    await act(async () => {
      resolveWithdraw();
      await Promise.resolve();
    });

    await waitFor(() => expect(laterMount.result.current).toBe(false));
  });
});
