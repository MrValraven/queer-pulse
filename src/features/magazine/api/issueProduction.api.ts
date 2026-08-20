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

/** One row of the members' digest — mirrors backend `IssueDigestItem`. */
export interface IssueDigestItemDto {
  pieceId: string;
  blurb: string;
  on: boolean;
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
  /** CNT-6 "Schedule with issue" toggle + send watermark. */
  digestSendOnPublish: boolean;
  digestSentAt: string | null;
  shipChecklist: PublishGateItemDto[];
  pages: { editorial: number; total: number; max: number };
}

// ── Admin request bodies ─────────────────────────────────────────────────
// Mirrors backend `dto/{update-run-order,update-digest,update-cover}.ts`.

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

/** Body of `PATCH /magazine/admin/issues/:number/cover`. */
export interface UpdateCoverDto {
  coverUrl?: string;
  coverlines?: string[];
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const getIssueProduction = (number: string) =>
  apiGet<IssueProductionDto>(`/magazine/admin/issues/${number}`);

export const updateRunOrder = (number: string, body: UpdateRunOrderDto) =>
  apiPatch<IssueProductionDto>(`/magazine/admin/issues/${number}/run-order`, body);

export const updateDigest = (number: string, body: UpdateDigestDto) =>
  apiPatch<IssueProductionDto>(`/magazine/admin/issues/${number}/digest`, body);

export const updateCover = (number: string, body: UpdateCoverDto) =>
  apiPatch<IssueProductionDto>(`/magazine/admin/issues/${number}/cover`, body);

export const shipIssue = (number: string) =>
  apiPost<IssueProductionDto>(`/magazine/admin/issues/${number}/ship`);

/** POST /magazine/admin/issues/:number/digest/test-send — CNT-6 "Send test":
 *  sends the current members' digest to the caller's own inbox. */
export const sendDigestTest = (number: string) =>
  apiPost<void>(`/magazine/admin/issues/${number}/digest/test-send`);
