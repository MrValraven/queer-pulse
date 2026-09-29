import { apiPost } from "../../../shared/api/client";
import type { ReportDTO, ReportEvidence } from "../../safety/api/reports.api";
import type { ReasonCode } from "../../safety/reportReasons";

/**
 * Block and report one member of a formed Go together group (PRD-421). Both
 * routes take the member's opaque `memberRef` from the group payload, so no
 * slug or user id ever reaches the client. The server answers 404 when the
 * caller is not in the group or the ref is not seated there, and 400 for the
 * caller's own ref.
 */

/** `POST /go-together/groups/:groupId/members/:memberRef/report`: the
 *  `POST /reports` body without its subject, which the route resolves. */
export interface GoTogetherMemberReportBody {
  reasonCode: ReasonCode;
  detail?: string;
  anonymous?: boolean;
  evidence?: ReportEvidence[];
}

/** The created report, minus `subjectId`: nothing about the member comes
 *  back. */
export type GoTogetherMemberReportDTO = Omit<ReportDTO, "subjectId">;

function memberPath(groupId: string, memberRef: string): string {
  return `/go-together/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberRef)}`;
}

/** 204. The blocker moves out of the group, and the blocked member is not
 *  told why. */
export const blockGoTogetherGroupMember = (
  groupId: string,
  memberRef: string,
) => apiPost<void>(`${memberPath(groupId, memberRef)}/block`);

/** 201. A flood cap answers 429 `REPORT_FLOOD_CAP` with member-facing copy. */
export const reportGoTogetherGroupMember = (
  groupId: string,
  memberRef: string,
  body: GoTogetherMemberReportBody,
) =>
  apiPost<GoTogetherMemberReportDTO>(
    `${memberPath(groupId, memberRef)}/report`,
    body,
  );
