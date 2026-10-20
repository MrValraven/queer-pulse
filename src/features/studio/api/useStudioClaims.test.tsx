import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioReleaseView } from "./studio.adapters";
import { resetDemoSafety } from "./studioDemoSafety";
import { DEMO_CLAIMED_TRACK_ID } from "./studioDemoSafety.data";
import { studioKeys } from "./studioQueryKeys";
import { studioSafetyErrorCodeOf } from "./studioSafety.api";
import { toOwnerClaimView } from "./studioSafetyFields";
import {
  useFileStudioClaim,
  useStudioMyClaims,
  useWithdrawStudioClaim,
} from "./useStudioClaims";
import { useCounterStudioClaim } from "./useStudioOwnerClaimMutations";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
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

beforeEach(() => resetDemoSafety());

describe("claimant hooks (demo)", () => {
  it("lists the demo member's claim", async () => {
    const { wrapper } = setup();
    const hook = renderHook(() => useStudioMyClaims(), { wrapper });
    await waitFor(() => expect(hook.result.current.items).toHaveLength(1));
    expect(hook.result.current.items[0]?.track.id).toBe(DEMO_CLAIMED_TRACK_ID);
  });

  it("refuses a second claim on the same track with the contract code", async () => {
    const { wrapper } = setup();
    const hook = renderHook(() => useFileStudioClaim(), { wrapper });
    await act(async () => {
      await hook.result.current
        .mutateAsync({
          trackId: DEMO_CLAIMED_TRACK_ID,
          body: {
            claimantRole: "rights_holder",
            originalWork: "Kitchen light",
            details: "Again",
            goodFaith: true,
          },
        })
        .catch(() => undefined);
    });
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(studioSafetyErrorCodeOf(hook.result.current.error)).toBe(
      "studio_claim_exists",
    );
  });

  it("patches a withdrawn claim into the list", async () => {
    const { wrapper } = setup();
    const list = renderHook(() => useStudioMyClaims(), { wrapper });
    await waitFor(() => expect(list.result.current.items).toHaveLength(1));
    const withdraw = renderHook(() => useWithdrawStudioClaim(), { wrapper });
    const claim = list.result.current.items[0];
    if (!claim) throw new Error("demo claim missing");
    await act(async () => {
      await withdraw.result.current.mutateAsync({ claim });
    });
    await waitFor(() =>
      expect(list.result.current.items[0]?.status).toBe("withdrawn"),
    );
  });
});

describe("owner hooks (demo)", () => {
  it("patches the countered claim into the cached release", async () => {
    const { queryClient, wrapper } = setup();
    const held = toOwnerClaimView({
      id: "demo-claim-held",
      trackId: "demo-track-mariana-3-02",
      status: "accepted",
      originalWork: "Candeia",
      originalLink: null,
      details: "0:40",
      claimantRole: "rights_holder",
      counterNote: null,
      claimantReply: null,
      staffNote: null,
      acceptedAt: "2026-10-10T14:00:00.000Z",
      counteredAt: null,
      decidedAt: null,
      canCounter: true,
    });
    queryClient.setQueryData(
      studioKeys.release(true, "demo-release-mariana-3"),
      {
        id: "demo-release-mariana-3",
        claims: [held],
      },
    );
    const hook = renderHook(() => useCounterStudioClaim(), { wrapper });
    await act(async () => {
      await hook.result.current.mutateAsync({
        claim: held,
        releaseId: "demo-release-mariana-3",
        note: "I wrote it",
      });
    });
    const release = queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, "demo-release-mariana-3"),
    );
    expect(release?.claims?.[0]?.status).toBe("countered");
    expect(release?.claims?.[0]?.canCounter).toBe(false);
  });
});
