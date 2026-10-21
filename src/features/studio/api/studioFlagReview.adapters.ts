import type { ModReportDTO, ModSeverity } from "../../admin/api/moderation.api";
import { REASON_LABEL_KEYS, type ReasonCode } from "../../safety/reportReasons";
import {
  STUDIO_RELEASE_STATUS_LABEL_KEY,
  toReleaseCardView,
  type StudioReleaseCardView,
} from "./studio.adapters";
import type {
  StudioAdminDisputeDTO,
  StudioAdminReleaseSummaryDTO,
  StudioAdminWithdrawnReleaseDTO,
  StudioReleaseStatus,
} from "./studio.types";

// View models for the staff flag review (spec 7.2, PLAN-1). Reports come from
// the shared moderation queue (no title, no reporter note on a list row);
// disputes and withdrawn releases from the Studio admin routes. Demo fixtures
// are built in these shapes too.

export type StudioReviewTab = "reports" | "claims" | "disputes" | "withdrawn";

/** A release as a review card shows it: the card plus the takedown facts. */
export type StudioReviewReleaseView = StudioReleaseCardView & {
  status: StudioReleaseStatus;
  statusLabelKey: string;
  takedownReason: string | null;
};

/** What the shared moderation queue says about a report's urgency. Both are
 *  optional: demo rows and older answers carry neither, and a card shows
 *  each only when it is there. */
export interface StudioReviewUrgency {
  severity?: ModSeverity | null;
  /** When the moderation SLA falls due (ISO). */
  slaDueAt?: string | null;
}

export interface StudioReviewReportView extends StudioReviewUrgency {
  reportId: string;
  releaseId: string;
  reasonCode: ReasonCode;
  reasonLabelKey: string;
  createdAt: string;
}

/** The urgency fields of a moderation row, kept only when present. */
export function reviewUrgencyOf(dto: ModReportDTO): StudioReviewUrgency {
  return {
    severity: dto.severity ?? null,
    slaDueAt: dto.slaDueAt ?? null,
  };
}

export interface StudioReviewDisputeView {
  disputeId: string;
  /** The artist's note to our team. */
  note: string;
  createdAt: string;
  takenDownAt: string | null;
  release: StudioReviewReleaseView;
}

export interface StudioReviewWithdrawnView {
  takenDownAt: string | null;
  /** The open dispute, if any: restoring goes through its uphold. */
  openDisputeId: string | null;
  release: StudioReviewReleaseView;
}

/** One page of a review queue; `nextCursor` is null on the last one. */
export interface StudioReviewPage<Item> {
  items: Item[];
  nextCursor: string | null;
}

/** What a staff member decided on a card. Uphold and reject carry the
 *  release so its Withdrawn row leaves at once too. */
export type StudioReviewAction =
  | { kind: "takeDown"; reportId: string; releaseId: string; reason: string }
  | { kind: "dismiss"; reportId: string; reasonCode: ReasonCode }
  | { kind: "uphold"; disputeId: string; releaseId: string; reply: string }
  | { kind: "reject"; disputeId: string; releaseId: string; reply: string }
  | { kind: "restore"; releaseId: string };

export function toReviewReleaseView(
  dto: StudioAdminReleaseSummaryDTO,
): StudioReviewReleaseView {
  return {
    ...toReleaseCardView(dto),
    status: dto.status,
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[dto.status],
    takedownReason: dto.takedownReason,
  };
}

export function toReviewReportView(dto: ModReportDTO): StudioReviewReportView {
  return {
    reportId: dto.id,
    releaseId: dto.subjectId,
    reasonCode: dto.reasonCode,
    reasonLabelKey: REASON_LABEL_KEYS[dto.reasonCode],
    createdAt: dto.createdAt,
    ...reviewUrgencyOf(dto),
  };
}

export function toReviewDisputeView(
  dto: StudioAdminDisputeDTO,
): StudioReviewDisputeView {
  return {
    disputeId: dto.id,
    note: dto.note,
    createdAt: dto.createdAt,
    takenDownAt: dto.release.takenDownAt,
    release: toReviewReleaseView(dto.release),
  };
}

export function toReviewWithdrawnView(
  dto: StudioAdminWithdrawnReleaseDTO,
): StudioReviewWithdrawnView {
  return {
    takenDownAt: dto.takenDownAt,
    openDisputeId: dto.openDisputeId,
    release: toReviewReleaseView(dto),
  };
}

export function pageOf<Item>(
  items: Item[],
  pageInfo: { nextCursor: string | null; hasMore: boolean },
): StudioReviewPage<Item> {
  return { items, nextCursor: pageInfo.hasMore ? pageInfo.nextCursor : null };
}
