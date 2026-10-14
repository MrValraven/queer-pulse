import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { toReleaseView, type StudioReleaseView } from "./studio.adapters";
import { demoStudioRelease } from "./studioDemoApi";
import { demoFileDispute } from "./studioDemoDisputes";
import {
  demoReviewDisputesPage,
  demoReviewWithdrawnPage,
  resetDemoFlagReview,
} from "./studioDemoFlagReview";
import { studioKeys } from "./studioQueryKeys";
import {
  applyReviewOutcome,
  useStudioReviewAction,
  useStudioReviewDisputes,
  useStudioReviewReports,
  useStudioReviewWithdrawn,
} from "./useStudioFlagReview";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

function renderQueues() {
  return renderHook(
    () => ({
      reports: useStudioReviewReports(),
      disputes: useStudioReviewDisputes(),
      withdrawn: useStudioReviewWithdrawn(),
      action: useStudioReviewAction(),
    }),
    { wrapper },
  );
}

beforeEach(() => resetDemoFlagReview());

describe("Studio review queues (demo)", () => {
  it("lists three reports, one dispute and two withdrawn releases", async () => {
    const { result } = renderQueues();
    await waitFor(() => expect(result.current.reports.items).toHaveLength(3));
    await waitFor(() => expect(result.current.disputes.items).toHaveLength(1));
    await waitFor(() => expect(result.current.withdrawn.items).toHaveLength(2));
    expect(result.current.reports.items[0]).toEqual({
      reportId: "demo-studio-report-1",
      releaseId: "demo-release-cidade-dos-santos",
      reasonCode: "copyright",
      reasonLabelKey: "safety:reason.copyright",
      createdAt: "2026-10-12T18:20:00.000Z",
    });
    expect(
      result.current.withdrawn.items.map((item) => item.openDisputeId),
    ).toEqual(["demo-studio-dispute-1", null]);
  });

  it("takes a release down: every report about it leaves and it joins Withdrawn", async () => {
    const { result } = renderQueues();
    await waitFor(() => expect(result.current.reports.items).toHaveLength(3));
    await act(() =>
      result.current.action.mutateAsync({
        kind: "takeDown",
        reportId: "demo-studio-report-1",
        releaseId: "demo-release-cidade-dos-santos",
        reason: "The opening track samples a recording with no permission",
      }),
    );
    expect(result.current.reports.items.map((item) => item.reportId)).toEqual([
      "demo-studio-report-2",
    ]);
    await waitFor(() =>
      expect(
        result.current.withdrawn.items.map((item) => item.release.id),
      ).toContain("demo-release-cidade-dos-santos"),
    );
  });

  it("restores a release on an upheld dispute and drops it from both lists", async () => {
    const { result } = renderQueues();
    await waitFor(() => expect(result.current.disputes.items).toHaveLength(1));
    const releaseId = result.current.disputes.items[0]?.release.id ?? "";
    await act(() =>
      result.current.action.mutateAsync({
        kind: "uphold",
        disputeId: "demo-studio-dispute-1",
        releaseId,
        reply: "You're right, the name is yours to share",
      }),
    );
    expect(result.current.disputes.items).toHaveLength(0);
    expect(
      result.current.withdrawn.items.map((item) => item.release.id),
    ).not.toContain(releaseId);
  });
});

const BAIRRO_ID = "demo-release-taken-down-bairro";

function bairroOwnerView(): StudioReleaseView {
  return toReleaseView({
    ...demoStudioRelease(BAIRRO_ID),
    status: "taken_down",
    takedownReason: "A rights holder asked us to check the sample",
    publishedAt: "2025-11-02T10:00:00.000Z",
    isOwner: true,
    dispute: {
      id: "demo-dispute-bairro",
      status: "open",
      note: "The sample is cleared, here is the licence",
      staffReply: null,
      createdAt: "2026-10-12T09:00:00.000Z",
      decidedAt: null,
    },
    canDispute: false,
  });
}

describe("Studio review decisions keep demo caches (demo)", () => {
  it("files an owner's dispute into the Disputes queue and its Withdrawn row", () => {
    const filed = demoFileDispute(
      { ...bairroOwnerView(), dispute: null, canDispute: true },
      "The sample is cleared, here is the licence",
    );
    const disputeId = filed.dispute?.id;
    expect(disputeId).toBeTruthy();
    expect(demoReviewDisputesPage().items[0]).toMatchObject({
      disputeId,
      note: "The sample is cleared, here is the licence",
      release: { id: BAIRRO_ID },
    });
    expect(
      demoReviewWithdrawnPage().items.find(
        (item) => item.release.id === BAIRRO_ID,
      )?.openDisputeId,
    ).toBe(disputeId);
  });

  it("patches the cached release on an uphold and re-reads no release", () => {
    const queryClient = new QueryClient();
    const releaseKey = studioKeys.release(true, BAIRRO_ID);
    queryClient.setQueryData(releaseKey, bairroOwnerView());
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    applyReviewOutcome(queryClient, true, {
      kind: "uphold",
      disputeId: "demo-dispute-bairro",
      releaseId: BAIRRO_ID,
      reply: "Thanks, the licence checks out",
    });
    const release = queryClient.getQueryData<StudioReleaseView>(releaseKey);
    expect(release).toMatchObject({
      status: "published",
      statusLabelKey: "studio:releaseStatus.published",
      takedownReason: null,
      canDispute: false,
      dispute: {
        id: "demo-dispute-bairro",
        status: "upheld",
        staffReply: "Thanks, the licence checks out",
      },
    });
    expect(release?.dispute?.decidedAt).toBeTruthy();
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["studio", "release"],
    });
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["admin-studio", "release"],
    });
  });

  it("lists a taken-down scheduled release nowhere upcoming, and a restore brings it back to draft", () => {
    const queryClient = new QueryClient();
    const releaseId = "demo-release-scheduled-night-bus";
    const scheduled = toReleaseView({
      ...demoStudioRelease(releaseId),
      isOwner: true,
    });
    queryClient.setQueryData(studioKeys.release(true, releaseId), scheduled);
    const artistKey = [...studioKeys.artist(true, scheduled.artist.id)];
    queryClient.setQueryData(artistKey, {
      artist: { id: scheduled.artist.id },
      allReleases: [],
      releases: [],
      singles: [],
      ownerReleases: [{ id: releaseId, status: "scheduled" }],
      upcoming: [{ id: releaseId, publishAt: scheduled.publishAt }],
    });
    applyReviewOutcome(queryClient, true, {
      kind: "takeDown",
      reportId: "demo-studio-report-1",
      releaseId,
      reason: "Needs a check",
    });
    const view = () =>
      queryClient.getQueryData<{
        upcoming: { id: string }[];
        ownerReleases: { id: string; status: string }[];
      }>(artistKey);
    expect(view()?.upcoming).toHaveLength(0);
    expect(view()?.ownerReleases[0]).toMatchObject({ status: "taken_down" });
    applyReviewOutcome(queryClient, true, { kind: "restore", releaseId });
    expect(view()?.ownerReleases[0]).toMatchObject({ status: "draft" });
    expect(view()?.upcoming).toHaveLength(0);
  });

  it("keeps a rejected release down with the reply on its dispute", () => {
    const queryClient = new QueryClient();
    const releaseKey = studioKeys.release(true, BAIRRO_ID);
    queryClient.setQueryData(releaseKey, bairroOwnerView());
    applyReviewOutcome(queryClient, true, {
      kind: "reject",
      disputeId: "demo-dispute-bairro",
      releaseId: BAIRRO_ID,
      reply: "The sample still needs a licence",
    });
    expect(
      queryClient.getQueryData<StudioReleaseView>(releaseKey),
    ).toMatchObject({
      status: "taken_down",
      takedownReason: "A rights holder asked us to check the sample",
      canDispute: true,
      dispute: {
        status: "rejected",
        staffReply: "The sample still needs a licence",
      },
    });
  });
});
