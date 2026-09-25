import { apiGet } from "../../../../shared/api/client";
import type { MemberRefDTO } from "../../../../shared/api/refs";

/**
 * The owner's own view of what has happened to their listing:
 * `GET /listings/:ref/history`, readable by the owner and by any co-manager.
 *
 * Mirrors the backend's `OwnerListingHistoryDTO` field for field. It is a
 * narrower twin of the admin history (`adminListings.api.ts`): a moderator's
 * identity never reaches this row, and a moderator's typed reason is withheld
 * behind `hasModeratorNote`.
 */

/** Every action the backend's `ListingModerationAction` enum can carry. */
export type OwnerListingHistoryAction =
  | "status_changed"
  | "removed"
  | "question_asked"
  | "answered"
  | "bulk_status"
  | "ownership_transferred"
  | "owner_edited"
  | "co_manager_added"
  | "co_manager_removed"
  | "staff_created"
  | "suggestion_applied"
  | "directory_paused"
  | "directory_resumed";

/** The moderation lifecycle a status row moves between. */
export type OwnerListingHistoryStatus = "review" | "question" | "live";

/**
 * Who acted, as far as the owner is allowed to know. `team` is someone on the
 * listing's current team (`member` is null when their account is gone);
 * `previous_team` is someone who ran the listing before an ownership transfer;
 * `moderation` is QueerPulse staff, who stay anonymous.
 */
export type OwnerListingHistoryActor =
  | { kind: "team"; member: MemberRefDTO | null }
  | { kind: "previous_team" }
  | { kind: "moderation" };

export interface OwnerListingHistoryEventDTO {
  id: string;
  action: OwnerListingHistoryAction;
  actor: OwnerListingHistoryActor;
  fromStatus: OwnerListingHistoryStatus | null;
  toStatus: OwnerListingHistoryStatus | null;
  /** Platform-composed text, or null when the owner may not read it. */
  reason: string | null;
  /** `Listing` property names an edit or an applied suggestion touched. */
  changedFields: string[] | null;
  /** True when a moderator wrote a note the owner received in Messages. */
  hasModeratorNote: boolean;
  /** ISO 8601. */
  createdAt: string;
}

export interface OwnerListingHistoryQuestionDTO {
  id: string;
  body: string;
  answer: string | null;
  /** ISO 8601, or null while unanswered. */
  answeredAt: string | null;
  /** ISO 8601. */
  createdAt: string;
}

/** One page of events, newest first, plus the (unpaginated) Q&A thread. */
export interface OwnerListingHistoryDTO {
  events: OwnerListingHistoryEventDTO[];
  questions: OwnerListingHistoryQuestionDTO[];
  /** Total events on the listing, across every page. */
  totalEvents: number;
  page: number;
  pageSize: number;
}

/** GET /listings/:ref/history?page= */
export const getOwnerListingHistory = (
  listingRef: string,
  page: number,
  signal?: AbortSignal,
) =>
  apiGet<OwnerListingHistoryDTO>(
    `/listings/${listingRef}/history?page=${page}`,
    undefined,
    undefined,
    signal,
  );
