import { apiGet, apiPatch } from "../../../shared/api/client";
import type { Paginated } from "../../../shared/contracts/contracts";
import type { ReasonCode, ReportSubjectType } from "../../safety/reportReasons";

/**
 * Moderator-facing half of the reporting → moderation contract (spec 04):
 * the queue (`GET /mod/reports`), a single report's detail, moderator actions
 * (`PATCH /mod/reports/:id`, bulk), the audit trail, and appeals. The
 * member-facing `POST /reports` lives in `safety/api/reports.api.ts`.
 */

export type ModSeverity = "emergency" | "high" | "medium" | "low";
export type ModStatus = "open" | "resolved" | "escalated";

/** Which parties a resolved report's outcome was communicated to. */
export type ResolutionNotifiedParty = "member" | "reporter" | "affected";

/** Moderator action codes. `hide_content`/`remove_content` map to hide/remove. */
export type ModActionCode =
  | "dismiss"
  | "warn"
  | "hide_content"
  | "remove_content"
  | "restrict"
  | "suspend"
  | "ban"
  | "shield"
  | "escalate";

export interface ModReportDTO {
  id: string;
  severity: ModSeverity;
  reasonCode: ReasonCode;
  subjectType: ReportSubjectType;
  subjectId: string;
  reporter:
    | { anonymous: true }
    | {
        anonymous: false;
        id: string;
        name: string;
        /**
         * ADM-22: reporter credibility, mirroring `reported.priorReports`'s
         * pattern on the filer's side. Counted over the reporter's PAST
         * RESOLVED reports only (an open report has no verdict yet), so
         * these two never drift out of sync with each other — `priorReports`
         * is always every resolved report this reporter has filed;
         * `priorDismissed` is the subset that resolved to `dismiss` (the
         * unfounded outcome). Raw counts, deliberately not a derived score.
         */
        priorReports: number;
        priorDismissed: number;
      };
  reported: { id: string; handle: string; priorReports: number };
  community: string | null;
  createdAt: string;
  slaDueAt: string;
  status: ModStatus;
  /** Null when unassigned. Compare against the signed-in moderator's id for
   *  the "Assigned to me" filter and the drawer's claim/release action. */
  assignedModeratorId?: string | null;
  /** Only present when `assignedModeratorId` is set. */
  assignedModeratorName?: string;
  /**
   * Only present on resolved-tab items (`GET /mod/reports?tab=resolved`). Carries
   * the resolution metadata a `ResolvedItem` row shows — the outcome badge, the
   * deciding moderator, when it closed, the member-facing note, and who was
   * notified. The base DTO can't hold this (it lives in the audit trail), so the
   * backend denormalizes it onto the resolved queue rather than forcing a
   * per-row audit fetch. Absent → the adapter renders a generic "Resolved" row.
   */
  resolution?: {
    /** Canonical action taken — drives the outcome badge tone. */
    action: ModActionCode;
    /** Server-formatted outcome badge, e.g. "Restricted · 7 days" / "Dismissed". */
    outcomeLabel: string;
    /** Deciding moderator's display name; "Deleted member" after erasure. */
    actorName: string;
    closedAt: string;
    /** The exact member-facing resolution note (never a vague summary). */
    note: string;
    notified: ResolutionNotifiedParty[];
  };
  /** Only present on `GET /mod/reports/:id`. */
  detail?: {
    contentAuthor: string;
    excerpt: string;
    redactionNote?: string;
    thread: {
      author: string;
      initials: string;
      time: string;
      body: string;
      flagged?: boolean;
    }[];
    people: { role: string; name: string; handle?: string; meta: string }[];
    /**
     * Listing-report enrichment — only present on a `listing`-subject report's
     * detail (hand-mapped server-side; see queerpulse-backend
     * `moderation-response.ts` / `buildListingEnrichment`). `disputeReason` is
     * the free-text a disputer/claimer typed (`POST /listings/:ref/dispute`);
     * `listingEvidence` is the ownership/claim proof the lister pasted into the
     * listing itself — surfaced so a moderator can weigh a claim in the drawer.
     * `contactEmail` is an optional off-account address the disputer left so a
     * moderator can reach them (they may not be reachable via their member DMs).
     */
    disputeReason?: string;
    listingEvidence?: string;
    contactEmail?: string;
  };
}

export interface ModCounts {
  open: number;
  appeals: number;
  resolved: number;
}

/**
 * The moderation queue answers with the app's canonical cursor-page envelope
 * (`Paginated<T>` = `{ data, pageInfo: { nextCursor, hasMore } }`, the same
 * shape the feed/forum/messages lists use), with the real per-tab `counts`
 * carried alongside — counts are queue-header domain data with no home in the
 * pagination envelope, so they ride along rather than being dropped. This
 * replaces the former one-off `{ items, counts, page: { cursor } }` shape;
 * `useModReports` reads `.data` (not `.items`) and `.counts`.
 */
export interface ModReportsResponse extends Paginated<ModReportDTO> {
  counts: ModCounts;
}

export interface ModReportsParams {
  tab?: "open" | "appeals" | "resolved";
  filter?: "all" | "emergencies" | "mine";
  severity?: ModSeverity;
  subjectType?: ReportSubjectType;
  /** Filters to reports about this exact subject — the same literal value
   *  `reported.priorReports` is counted against. Powers the "view this
   *  member's report history" click-through from the prior-reports chip. */
  subjectId?: string;
  sort?: "priority" | "age";
  cursor?: string;
}

/** Body for `PATCH /mod/reports/:id` — one action against one report. */
export interface ModActionInput {
  action: ModActionCode;
  reasonCode: ReasonCode;
  /** The exact member-facing text — the reason the member reads. */
  note: string;
  /** e.g. "7d" for restrict/suspend. */
  duration?: string;
}

export interface ModBulkInput {
  ids: string[];
  action: ModActionCode;
  reasonCode: ReasonCode;
  note?: string;
  /** e.g. "7d" — required for a bulk `suspend`/`restrict`. */
  duration?: string;
}

/** `POST /mod/reports/bulk` response. Continue-on-error (P0-16): one report
 *  failing (e.g. `ban` against a non-member-subject report) no longer aborts
 *  the whole batch — `updated` and `failed` partition the selection. */
export interface ModBulkResult {
  updated: string[];
  failed: { id: string; reason: string }[];
}

export interface AuditEntryDTO {
  id: string;
  reportId: string;
  /**
   * NULL once the acting moderator has exercised their right to erasure — the
   * audit row deliberately outlives the account (see the backend's
   * AddDeletionErasureSupport migration), so the action trail survives even
   * though the actor no longer does. `actorName` reads "Deleted member" then.
   */
  actorId: string | null;
  actorName: string;
  action: ModActionCode | "created" | "appeal_upheld" | "appeal_overturned";
  reasonCode?: ReasonCode;
  note?: string;
  at: string;
}

export interface AppealDTO {
  id: string;
  reportId: string;
  actionId: string;
  severity: ModSeverity;
  appellant: { handle: string; pronoun?: string };
  community: string | null;
  argument: string;
  original: { action: string; by: string; when: string; reason: string };
  createdAt: string;
  status: "awaiting" | "upheld" | "overturned";
}

export interface AppealDecisionInput {
  decision: "uphold" | "overturn";
  note: string;
}

function qs(params: ModReportsParams): string {
  const p = new URLSearchParams();
  if (params.tab) p.set("tab", params.tab);
  if (params.filter) p.set("filter", params.filter);
  if (params.severity) p.set("severity", params.severity);
  if (params.subjectType) p.set("subjectType", params.subjectType);
  if (params.subjectId) p.set("subjectId", params.subjectId);
  if (params.sort) p.set("sort", params.sort);
  if (params.cursor) p.set("cursor", params.cursor);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** The moderation queue with real tab counts (Mod/Staff only). */
export const getModReports = (params: ModReportsParams = {}) =>
  apiGet<ModReportsResponse>(`/mod/reports${qs(params)}`);

/** Full detail for the drawer (excerpt, thread, people). Deadnames redacted server-side. */
export const getModReport = (id: string) =>
  apiGet<ModReportDTO>(`/mod/reports/${encodeURIComponent(id)}`);

/** Take one moderation action. Backend writes the audit entry + notifications. */
export const actOnReport = (id: string, body: ModActionInput) =>
  apiPatch<ModReportDTO>(`/mod/reports/${encodeURIComponent(id)}`, body);

/** Apply one action to many reports. Backend expects PATCH (was POST).
 *  Continue-on-error: check `failed` — a partial batch is not a thrown error. */
export const bulkActOnReports = (body: ModBulkInput) =>
  apiPatch<ModBulkResult>("/mod/reports/bulk", body);

/** Self-assign (`assign: true`) or unassign (`assign: false`) a report —
 *  backs the queue's "Assigned to me" filter and the drawer's claim action. */
export const setReportAssignment = (id: string, assign: boolean) =>
  apiPatch<ModReportDTO>(
    `/mod/reports/${encodeURIComponent(id)}/assignment`,
    { assign },
  );

/** Immutable audit log for a report. */
export const getReportAudit = (reportId: string) =>
  apiGet<AuditEntryDTO[]>(
    `/mod/reports/audit?reportId=${encodeURIComponent(reportId)}`,
  );

/** Appeals queue. */
export const getAppeals = () => apiGet<AppealDTO[]>("/mod/appeals");

/** Uphold / overturn an appeal. Overturn reverses the original action + re-notifies.
 *  Server rejects (403) a moderator reviewing the appeal of their own original
 *  decision — a conflict-of-interest guard, not a routing/assignment scheme. */
export const reviewAppeal = (id: string, body: AppealDecisionInput) =>
  apiPatch<AppealDTO>(`/mod/appeals/${encodeURIComponent(id)}`, body);
