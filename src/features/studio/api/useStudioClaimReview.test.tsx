import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDemoSafety } from "./studioDemoSafety";
import { DEMO_REPORTED_TRACK_ID } from "./studioDemoSafety.data";
import {
  useStudioClaimCounts,
  useStudioClaimDecision,
  useStudioReviewClaims,
} from "./useStudioClaimReview";
import {
  useStaffStudioTrack,
  useStudioReviewTrackReports,
  useStudioTrackReportAction,
} from "./useStudioTrackReports";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

function wrapperFor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => resetDemoSafety());

describe("the Claims tab hooks (demo)", () => {
  it("lists the submitted and the countered claim, and badges both", async () => {
    const wrapper = wrapperFor();
    const list = renderHook(() => useStudioReviewClaims(), { wrapper });
    const counts = renderHook(() => useStudioClaimCounts(), { wrapper });
    await waitFor(() => expect(list.result.current.items).toHaveLength(2));
    await waitFor(() => expect(counts.result.current.waitingCount).toBe(2));
  });

  it("takes an accepted claim out of the queue and lowers the badge", async () => {
    const wrapper = wrapperFor();
    const list = renderHook(() => useStudioReviewClaims(), { wrapper });
    const counts = renderHook(() => useStudioClaimCounts(), { wrapper });
    const decision = renderHook(() => useStudioClaimDecision(), { wrapper });
    await waitFor(() => expect(list.result.current.items).toHaveLength(2));
    const submitted = list.result.current.items.find(
      (item) => item.status === "submitted",
    );
    if (!submitted) throw new Error("demo seed missing");
    await act(async () => {
      await decision.result.current.mutateAsync({
        claimId: submitted.id,
        decision: "accept",
        note: null,
      });
    });
    await waitFor(() => expect(list.result.current.items).toHaveLength(1));
    await waitFor(() => expect(counts.result.current.waitingCount).toBe(1));
  });
});

describe("the Track reports hooks (demo)", () => {
  it("marks the reported track explicit and closes its report", async () => {
    const wrapper = wrapperFor();
    const reports = renderHook(() => useStudioReviewTrackReports(), {
      wrapper,
    });
    const action = renderHook(() => useStudioTrackReportAction(), { wrapper });
    await waitFor(() => expect(reports.result.current.items).toHaveLength(1));
    const report = reports.result.current.items[0];
    if (!report) throw new Error("demo seed missing");
    await act(async () => {
      await action.result.current.mutateAsync({
        kind: "markExplicit",
        reportId: report.reportId,
        trackId: report.trackId,
      });
    });
    await waitFor(() => expect(reports.result.current.items).toHaveLength(0));
    const track = renderHook(
      () => useStaffStudioTrack(DEMO_REPORTED_TRACK_ID),
      {
        wrapper,
      },
    );
    await waitFor(() =>
      expect(track.result.current?.isExplicitLocked).toBe(true),
    );
  });
});
