import { REASON_LABEL_KEYS } from "../../safety/reportReasons";
import type { StudioReleaseView } from "./studio.adapters";
import { demoStudioRelease } from "./studioDemoApi";
import {
  toReviewReleaseView,
  type StudioReviewAction,
  type StudioReviewDisputeView,
  type StudioReviewPage,
  type StudioReviewReleaseView,
  type StudioReviewReportView,
  type StudioReviewWithdrawnView,
} from "./studioFlagReview.adapters";

// The demo's staff review queues, in memory for the session, so a decision
// changes what the next read of each queue shows. Artist notes are member
// content and stay as written.

function takenDownView(
  releaseId: string,
  takedownReason: string,
  takenDownAt: string,
): StudioReviewReleaseView {
  return toReviewReleaseView({
    ...demoStudioRelease(releaseId),
    status: "taken_down",
    takedownReason,
    takenDownAt,
  });
}

interface DemoReviewState {
  reports: StudioReviewReportView[];
  disputes: StudioReviewDisputeView[];
  withdrawn: StudioReviewWithdrawnView[];
}

const CORO_TAKEN_DOWN_AT = "2026-10-10T15:00:00.000Z";
const BAIRRO_TAKEN_DOWN_AT = "2025-12-01T10:00:00.000Z";

function seed(): DemoReviewState {
  const coro = takenDownView(
    "demo-release-home-3",
    "The second verse names a member and their workplace",
    CORO_TAKEN_DOWN_AT,
  );
  const bairro = takenDownView(
    "demo-release-taken-down-bairro",
    "A rights holder asked us to check the sample on this track",
    BAIRRO_TAKEN_DOWN_AT,
  );
  return {
    reports: [
      {
        reportId: "demo-studio-report-1",
        releaseId: "demo-release-cidade-dos-santos",
        reasonCode: "copyright",
        reasonLabelKey: REASON_LABEL_KEYS.copyright,
        createdAt: "2026-10-12T18:20:00.000Z",
      },
      {
        reportId: "demo-studio-report-2",
        releaseId: "demo-release-home-4",
        reasonCode: "impersonation",
        reasonLabelKey: REASON_LABEL_KEYS.impersonation,
        createdAt: "2026-10-11T09:05:00.000Z",
      },
      {
        reportId: "demo-studio-report-3",
        releaseId: "demo-release-cidade-dos-santos",
        reasonCode: "copyright",
        reasonLabelKey: REASON_LABEL_KEYS.copyright,
        createdAt: "2026-10-10T21:40:00.000Z",
      },
    ],
    disputes: [
      {
        disputeId: "demo-studio-dispute-1",
        note: "The name in the second verse is mine. I wrote it about myself and I'm happy for it to stay.",
        createdAt: "2026-10-12T08:30:00.000Z",
        takenDownAt: CORO_TAKEN_DOWN_AT,
        release: coro,
      },
    ],
    withdrawn: [
      {
        release: coro,
        takenDownAt: CORO_TAKEN_DOWN_AT,
        openDisputeId: "demo-studio-dispute-1",
      },
      {
        release: bairro,
        takenDownAt: BAIRRO_TAKEN_DOWN_AT,
        openDisputeId: null,
      },
    ],
  };
}

let state = seed();

/** Test seam: back to the seeded queues. */
export function resetDemoFlagReview(): void {
  state = seed();
}

export const demoReviewReportsPage =
  (): StudioReviewPage<StudioReviewReportView> => ({
    items: [...state.reports],
    nextCursor: null,
  });
export const demoReviewDisputesPage =
  (): StudioReviewPage<StudioReviewDisputeView> => ({
    items: [...state.disputes],
    nextCursor: null,
  });
export const demoReviewWithdrawnPage =
  (): StudioReviewPage<StudioReviewWithdrawnView> => ({
    items: [...state.withdrawn],
    nextCursor: null,
  });

/** As the server: an artist's dispute joins the Disputes queue at the top,
 *  and the release's Withdrawn row restores through it from now on. Takes the
 *  owner's release as the dispute answered it, so both share the dispute id. */
export function demoRecordDispute(
  release: StudioReleaseView,
  note: string,
): void {
  const withdrawnRow = state.withdrawn.find(
    (item) => item.release.id === release.id,
  );
  const disputeId = release.dispute?.id ?? `demo-dispute-${release.id}`;
  state.disputes = [
    {
      disputeId,
      note,
      createdAt: release.dispute?.createdAt ?? new Date().toISOString(),
      takenDownAt: withdrawnRow?.takenDownAt ?? null,
      release: withdrawnRow?.release ?? release,
    },
    ...state.disputes.filter((item) => item.release.id !== release.id),
  ];
  state.withdrawn = state.withdrawn.map((item) =>
    item.release.id === release.id
      ? { ...item, openDisputeId: disputeId }
      : item,
  );
}

/** As the server: a takedown resolves every open report about the release
 *  and lists it as withdrawn. */
function takeDown(releaseId: string, reason: string) {
  state.reports = state.reports.filter((item) => item.releaseId !== releaseId);
  if (state.withdrawn.some((item) => item.release.id === releaseId)) return;
  try {
    const takenDownAt = new Date().toISOString();
    state.withdrawn = [
      {
        release: takenDownView(releaseId, reason, takenDownAt),
        takenDownAt,
        openDisputeId: null,
      },
      ...state.withdrawn,
    ];
  } catch {
    // A report about a release the demo fixture does not hold: its reports
    // still close, and nothing joins Withdrawn.
  }
}

/** As the server: each decision changes the queues the next read shows. */
export function demoApplyReviewAction(action: StudioReviewAction): void {
  switch (action.kind) {
    case "takeDown":
      takeDown(action.releaseId, action.reason);
      return;
    case "dismiss":
      state.reports = state.reports.filter(
        (item) => item.reportId !== action.reportId,
      );
      return;
    case "uphold":
      state.disputes = state.disputes.filter(
        (item) => item.disputeId !== action.disputeId,
      );
      state.withdrawn = state.withdrawn.filter(
        (item) => item.release.id !== action.releaseId,
      );
      return;
    case "reject":
      state.disputes = state.disputes.filter(
        (item) => item.disputeId !== action.disputeId,
      );
      state.withdrawn = state.withdrawn.map((item) =>
        item.openDisputeId === action.disputeId
          ? { ...item, openDisputeId: null }
          : item,
      );
      return;
    case "restore":
      state.withdrawn = state.withdrawn.filter(
        (item) => item.release.id !== action.releaseId,
      );
      return;
  }
}
