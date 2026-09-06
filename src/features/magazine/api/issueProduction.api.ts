import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { PieceListItemDto, PublishGateItemDto } from "./pieces.api";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Mirrors `queerpulse-backend/src/magazine/magazine-piece-response.ts`'s
// `IssueProductionResponse` (Phase 5 Task 2) verbatim. `number` is the
// issue's public display number (e.g. `"14"`) — a string, not a numeric
// type, matching `MagazineIssue.number` and the existing `IssueResponse`
// convention (see the Task 2 report).

/** One row of the running order — mirrors backend `IssueRunOrderEntry`. */
export interface IssueRunOrderEntryDto {
  piece: PieceListItemDto;
  pages: string;
  laidOut: boolean;
}

/**
 * One curated entry on the issue panel — mirrors backend `IssueDigestItem`.
 * The `digest` name is historical (CON-05 retired the members' email digest);
 * these rows now feed the reader-facing "In this issue" panel.
 */
export interface IssueDigestItemDto {
  pieceId: string;
  blurb: string;
  on: boolean;
}

/** One piece a ship refused to publish, with every reason it was held. */
export interface IssueHeldPieceDto {
  pieceId: string;
  title: string;
  /** Human-readable reasons, already resolved by the backend (a stage that is
   *  not `ready`, open care-gate items, a format readiness failure). */
  reasons: string[];
}

/**
 * What the most recent ship of this issue actually did (ENG-110). Absent or
 * `null` on an issue that has never shipped, so every reader has to treat it
 * as optional.
 */
export interface IssueLastShipDto {
  /** ISO instant the ship ran. */
  shippedAt: string;
  /** ISO instant the published pieces go live. Equals `shippedAt` for an
   *  immediate ship; a future issue date makes this 09:00 Europe/Lisbon on
   *  that date, which is how a ship schedules rather than publishes. */
  publishAt: string;
  publishedPieceIds: string[];
  held: IssueHeldPieceDto[];
}

/**
 * Full issue-production detail from GET /magazine/admin/issues/:number —
 * mirrors backend `IssueProductionResponse`.
 */
export interface IssueProductionDto {
  number: string;
  theme: string;
  title: string;
  publishedOn: string | null;
  coverUrl: string;
  coverlines: string[];
  runOrder: IssueRunOrderEntryDto[];
  digest: IssueDigestItemDto[];
  /** "Announce with the issue" toggle + the watermark stamped once the
   *  in-app announcement has gone out. */
  digestSendOnPublish: boolean;
  digestSentAt: string | null;
  shipChecklist: PublishGateItemDto[];
  pages: { editorial: number; total: number; max: number };
  /** Optional rather than `| null` on purpose: the demo fixture and any build
   *  older than ENG-110 answer without the key at all. */
  lastShip?: IssueLastShipDto | null;
}

/**
 * One row of the desk's issue switcher, from GET /magazine/admin/issues —
 * mirrors backend `IssueSummaryResponse`. Carries `id`, which the public
 * `GET /magazine/issues` deliberately omits and which is exactly what the
 * desk writes onto `magazine_piece.issueId`.
 */
export interface IssueSummaryDto {
  id: string;
  number: string;
  title: string;
  theme: string;
  /** `YYYY-MM-DD`, or `null` while the issue is still unscheduled. */
  publishedOn: string | null;
  filled: number;
  slots: number;
}

// ── Admin request bodies ─────────────────────────────────────────────────
// Mirrors backend `dto/{update-run-order,update-digest,update-cover}.ts`.

/** Body of `POST /magazine/admin/issues`. `number` may be sent unpadded
 *  ("1"); the backend normalizes it to the stored two-digit form ("01"). */
export interface CreateIssueDto {
  number: string;
  title: string;
  theme: string;
  /** `YYYY-MM-DD`, straight from the date picker. Optional: an issue is opened
   *  before it is scheduled, and an omitted date leaves it unscheduled until
   *  someone sets one (or until shipping stamps today's date). */
  publishedOn?: string;
  dek?: string;
}

/** Body of `PATCH /magazine/admin/issues/:number/run-order`. */
export interface UpdateRunOrderDto {
  items: { pieceId: string; pages: string }[];
}

/** Body of `PATCH /magazine/admin/issues/:number/digest`. */
export interface UpdateDigestDto {
  items: { pieceId: string; blurb: string; on: boolean }[];
  /** CNT-6 "Schedule with issue" toggle — omitted leaves it untouched. */
  sendOnPublish?: boolean;
}

/** Body of `PATCH /magazine/admin/issues/:number/schedule`. `null` clears the
 *  date and puts the issue back to unscheduled, so the field is required and
 *  nullable rather than optional. */
export interface UpdateIssueScheduleDto {
  publishedOn: string | null;
}

/** Body of `PATCH /magazine/admin/issues/:number/cover`. */
export interface UpdateCoverDto {
  coverUrl?: string;
  coverlines?: string[];
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const getIssues = () =>
  apiGet<IssueSummaryDto[]>("/magazine/admin/issues");

export const createIssue = (body: CreateIssueDto) =>
  apiPost<IssueSummaryDto>("/magazine/admin/issues", body);

export const getIssueProduction = (number: string) =>
  apiGet<IssueProductionDto>(`/magazine/admin/issues/${number}`);

export const updateRunOrder = (number: string, body: UpdateRunOrderDto) =>
  apiPatch<IssueProductionDto>(
    `/magazine/admin/issues/${number}/run-order`,
    body,
  );

export const updateDigest = (number: string, body: UpdateDigestDto) =>
  apiPatch<IssueProductionDto>(`/magazine/admin/issues/${number}/digest`, body);

export const updateCover = (number: string, body: UpdateCoverDto) =>
  apiPatch<IssueProductionDto>(`/magazine/admin/issues/${number}/cover`, body);

export const updateIssueSchedule = (
  number: string,
  body: UpdateIssueScheduleDto,
) =>
  apiPatch<IssueProductionDto>(
    `/magazine/admin/issues/${number}/schedule`,
    body,
  );

export const shipIssue = (number: string) =>
  apiPost<IssueProductionDto>(`/magazine/admin/issues/${number}/ship`);
