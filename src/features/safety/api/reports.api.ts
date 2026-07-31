import { apiPost } from "../../../shared/api/client";
import type {
  ReasonCode,
  ReasonOption,
  ReportSubjectType,
} from "../reportReasons";

/**
 * Reporting → moderation contract (spec 04). The member-facing half:
 * `POST /reports` (create) and `GET /reports/reasons` (server-owned taxonomy).
 * The moderator half lives in `admin/api/moderation.api.ts`.
 */

/** A single piece of attached evidence on a report. */
export type ReportEvidence =
  { type: "url"; value: string } | { type: "screenshot"; uploadId: string };

/** `POST /reports` request body. Mirrors the spec's JSON contract exactly. */
export interface CreateReportInput {
  subjectType: ReportSubjectType;
  /** slug/uuid for member/community, content id for post/reply/message, safe-space id for venue. */
  subjectId: string;
  reasonCode: ReasonCode;
  detail?: string;
  /** Shields the reporter's identity from mods + the reported party. */
  anonymous?: boolean;
  /** Only for anonymous follow-up when the reporter has no account. */
  contactEmail?: string;
  evidence?: ReportEvidence[];
}

/**
 * The created report echoed back. Severity + SLA are derived server-side; the
 * reporter-acknowledgement notification is emitted by the backend, not here.
 */
export interface ReportDTO {
  id: string;
  subjectType: ReportSubjectType;
  subjectId: string;
  reasonCode: ReasonCode;
  severity: "emergency" | "high" | "medium" | "low";
  status: "open" | "resolved" | "escalated";
  createdAt: string;
  slaDueAt?: string;
  /** Human acknowledgement copy the surface may show. */
  acknowledgement?: string;
}

/** Create a report from any surface. Reporter may be anonymous. */
export const createReport = (body: CreateReportInput) =>
  apiPost<ReportDTO>("/reports", body);

export type { ReasonOption };
