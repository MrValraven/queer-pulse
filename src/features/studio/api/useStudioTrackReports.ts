import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getModReports } from "../../admin/api/moderation.api";
import type { ReasonCode } from "../../safety/reportReasons";
import { pageOf } from "./studioFlagReview.adapters";
import {
  toAdminTrackView,
  toReviewTrackReportView,
  type StudioAdminTrackView,
  type StudioReviewTrackReportView,
} from "./studioSafety.adapters";
import {
  addStudioTrackWarnings,
  getAdminStudioTrack,
  markStudioTrackExplicit,
} from "./studioSafety.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { studioSafetyKeys } from "./studioSafetyQueryKeys";
import type { StudioContentWarningId } from "./studioSafety.types";
import {
  applyReviewOutcome,
  refreshReviewQueues,
  removeFromList,
  sendReviewAction,
  useReviewList,
  type StudioReviewList,
} from "./useStudioFlagReview";

const SILENT = { silentError: true } as const;
const loadDemo = () => import("./studioDemoSafety");

/** Open reports about single Studio tracks, from the shared moderation
 *  queue (a second list beside the release reports, contract). */
export function useStudioReviewTrackReports(): StudioReviewList<StudioReviewTrackReportView> {
  const { demoMode } = useDemoMode();
  return useReviewList(
    studioSafetyKeys.reviewTrackReports(demoMode),
    async (cursor) => {
      if (demoMode) return (await loadDemo()).demoTrackReportsPage();
      const response = await getModReports({
        tab: "open",
        subjectType: "studio_track",
        cursor: cursor ?? undefined,
      });
      return pageOf(
        response.data.map(toReviewTrackReportView),
        response.pageInfo,
      );
    },
  );
}

/** The staff read of one track: a report names only the track id. The
 *  card branches on `loadState`, so a failed read shows Retry in place. */
export function useStaffStudioTrackRead(trackId: string): {
  track: StudioAdminTrackView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: studioSafetyKeys.adminTrack(demoMode, trackId),
    meta: SILENT,
    queryFn: async () =>
      toAdminTrackView(
        demoMode
          ? (await loadDemo()).demoAdminTrack(trackId)
          : await getAdminStudioTrack(trackId),
      ),
  });
  return {
    track: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** The track alone, for callers that never show its failure. */
export function useStaffStudioTrack(
  trackId: string,
): StudioAdminTrackView | null {
  return useStaffStudioTrackRead(trackId).track;
}

export type StudioTrackReportAction =
  | { kind: "markExplicit"; reportId: string; trackId: string }
  | {
      kind: "addWarnings";
      reportId: string;
      trackId: string;
      warnings: StudioContentWarningId[];
    }
  | { kind: "dismiss"; reportId: string; reasonCode: ReasonCode }
  | { kind: "takeDown"; reportId: string; releaseId: string; reason: string };

async function sendTrackReportAction(
  action: StudioTrackReportAction,
): Promise<void> {
  switch (action.kind) {
    case "markExplicit":
      await markStudioTrackExplicit(action.trackId, {
        reportId: action.reportId,
      });
      return;
    case "addWarnings":
      await addStudioTrackWarnings(action.trackId, {
        warnings: action.warnings,
        reportId: action.reportId,
      });
      return;
    case "dismiss":
    case "takeDown":
      await sendReviewAction(action);
      return;
  }
}

async function demoTrackReportAction(
  action: StudioTrackReportAction,
): Promise<void> {
  const demo = await loadDemo();
  switch (action.kind) {
    case "markExplicit":
      demo.demoMarkExplicit(action.trackId, action.reportId);
      return;
    case "addWarnings":
      demo.demoAddWarnings(action.trackId, action.warnings, action.reportId);
      return;
    case "dismiss":
      demo.demoDismissTrackReport(action.reportId);
      return;
    case "takeDown":
      (await import("./studioDemoFlagReview")).demoApplyReviewAction({
        kind: "takeDown",
        reportId: action.reportId,
        releaseId: action.releaseId,
        reason: action.reason,
      });
      demo.demoDismissTrackReport(action.reportId);
      return;
  }
}

/** Mark explicit, add a content warning, dismiss, or take the release
 *  down. Each settles its report; the card leaves once the server said yes. */
export function useStudioTrackReportAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, StudioTrackReportAction>({
    meta: SILENT,
    mutationFn: (action) =>
      demoMode ? demoTrackReportAction(action) : sendTrackReportAction(action),
    onSuccess: (_result, action) => {
      removeFromList<StudioReviewTrackReportView>(
        queryClient,
        studioSafetyKeys.reviewTrackReports(demoMode),
        (item) => item.reportId === action.reportId,
      );
      void queryClient.invalidateQueries({
        queryKey: ["studio", "adminTrack", demoMode],
      });
      if (action.kind === "takeDown") {
        // The release takedown's own outcome: its queues, its pages.
        applyReviewOutcome(queryClient, demoMode, action);
        return;
      }
      refreshReviewQueues(queryClient, demoMode);
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["mod-report"] });
      if (action.kind === "dismiss") return;
      void queryClient.invalidateQueries({ queryKey: ["studio", "release"] });
      void queryClient.invalidateQueries({ queryKey: ["studio", "track"] });
    },
    onError: () => refreshReviewQueues(queryClient, demoMode),
  });
}
