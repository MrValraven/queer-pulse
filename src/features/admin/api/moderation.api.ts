import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { ReasonCode, ReportSubjectType } from "../../safety/reportReasons";

/**
 * Moderator-facing half of the reporting → moderation contract (spec 04):
 * the queue (`GET /mod/reports`), a single report's detail, moderator actions
 * (`PATCH /mod/reports/:id`, bulk), the audit trail, and appeals. The
 * member-facing `POST /reports` lives in `safety/api/reports.api.ts`.
 */

export type ModSeverity = "emergency" | "high" | "medium" | "low";
export type ModStatus = "open" | "resolved" | "escalated";

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
    { anonymous: true } | { anonymous: false; id: string; name: string };
  reported: { id: string; handle: string; priorReports: number };
  community: string | null;
  createdAt: string;
  slaDueAt: string;
  status: ModStatus;
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
  };
}

export interface ModCounts {
  open: number;
  appeals: number;
  resolved: number;
}

export interface ModReportsResponse {
  items: ModReportDTO[];
  counts: ModCounts;
  page?: { cursor?: string | null };
}

export interface ModReportsParams {
  tab?: "open" | "appeals" | "resolved";
  filter?: "all" | "emergencies" | "mine";
  severity?: ModSeverity;
  subjectType?: ReportSubjectType;
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
}

export interface AuditEntryDTO {
  id: string;
  reportId: string;
  actorId: string;
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

/** Apply one action to many reports. */
export const bulkActOnReports = (body: ModBulkInput) =>
  apiPost<{ updated: string[] }>("/mod/reports/bulk", body);

/** Immutable audit log for a report. */
export const getReportAudit = (reportId: string) =>
  apiGet<AuditEntryDTO[]>(
    `/mod/reports/audit?reportId=${encodeURIComponent(reportId)}`,
  );

/** Appeals queue — routed to a different moderator than the decider (server-enforced). */
export const getAppeals = () => apiGet<AppealDTO[]>("/mod/appeals");

/** Uphold / overturn an appeal. Overturn reverses the original action + re-notifies. */
export const reviewAppeal = (id: string, body: AppealDecisionInput) =>
  apiPatch<AppealDTO>(`/mod/appeals/${encodeURIComponent(id)}`, body);
