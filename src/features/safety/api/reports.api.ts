import { apiGet, apiPost } from "../../../shared/api/client";
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

/**
 * One option as `GET /reports/reasons` returns it.
 *
 * `code` is typed `string`, NOT `ReasonCode`, on purpose. The whole reason to
 * ask the server is that it may know a code this build does not, and typing it
 * as the local union would make the compiler agree that cannot happen right
 * where it is most likely to.
 *
 * `label` is server-authored and ENGLISH: it comes from `REASON_LABELS` in the
 * backend's `reason-catalogue.ts`, which has no localization of its own. See
 * `useReportReasons` for why a known code renders the local translated label
 * instead.
 */
export interface ServerReasonOption {
  code: string;
  label: string;
}

/** The server-owned reason taxonomy for one subject type. */
export const fetchReportReasons = (subjectType: ReportSubjectType) =>
  apiGet<ServerReasonOption[]>(
    `/reports/reasons?subjectType=${encodeURIComponent(subjectType)}`,
  );

export type { ReasonOption };
