import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPost,
} from "../../../shared/api/client";
import type {
  StudioAccessGrantDTO,
  StudioAdminDisputeDTO,
  StudioAdminWithdrawnReleaseDTO,
  StudioDisputeDecisionBody,
  StudioPageDTO,
  StudioReleaseDTO,
  StudioTakedownBody,
} from "../../studio/api/studio.types";

const memberPath = (memberId: string) =>
  `/admin/members/${encodeURIComponent(memberId)}/studio-access`;
const releasePath = (releaseId: string) =>
  `/admin/studio/releases/${encodeURIComponent(releaseId)}`;
const disputePath = (disputeId: string) =>
  `/admin/studio/disputes/${encodeURIComponent(disputeId)}`;
const withCursor = (path: string, cursor: string | null) =>
  cursor ? `${path}&cursor=${encodeURIComponent(cursor)}` : path;

/** The member's grant, or null for none (an empty 200 body). */
export const getMemberStudioAccess = (memberId: string) =>
  apiGetNullable<StudioAccessGrantDTO>(memberPath(memberId));
/** Idempotent: granting twice answers the existing grant. */
export const grantMemberStudioAccess = (memberId: string) =>
  apiPost<StudioAccessGrantDTO>(memberPath(memberId));
/** Idempotent: revoking someone without a grant is a 204 too. */
export const revokeMemberStudioAccess = (memberId: string) =>
  apiDelete<void>(memberPath(memberId));
/** Staff view of any release in any status (owner-only fields filled). */
export const getStaffStudioRelease = (releaseId: string) =>
  apiGet<StudioReleaseDTO>(releasePath(releaseId));
/** Takes a release down with the reason its artist reads. Every takedown
 *  resolves every open studio_release report about the release; a named
 *  `reportId` must be one of them (422 studio_takedown_report_mismatch, 409
 *  studio_takedown_report_not_open, and nothing changes). */
export const takeDownStudioRelease = (
  releaseId: string,
  reason: string,
  reportId?: string,
) => {
  const body: StudioTakedownBody = reportId ? { reason, reportId } : { reason };
  return apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/takedown`, body);
};
/** Restores a release. A release with an open dispute is refused (409
 *  studio_release_has_open_dispute, and nothing changes): it restores through
 *  `upholdStudioDispute`, which closes the dispute too. */
export const restoreStudioRelease = (releaseId: string) =>
  apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/restore`);

// Studio open pages: the flag review's Disputes and Withdrawn queues
// (Studio page envelope, 20 a page, newest first).

/** GET /admin/studio/disputes?status=open */
export const getOpenStudioDisputes = (cursor: string | null) =>
  apiGet<StudioPageDTO<StudioAdminDisputeDTO>>(
    withCursor("/admin/studio/disputes?status=open", cursor),
  );
/** GET /admin/studio/releases?status=taken_down */
export const getWithdrawnStudioReleases = (cursor: string | null) =>
  apiGet<StudioPageDTO<StudioAdminWithdrawnReleaseDTO>>(
    withCursor("/admin/studio/releases?status=taken_down", cursor),
  );
/** Restores the release and marks the dispute upheld in one step; the
 *  artist reads `reply` on the release. 409 studio_dispute_not_open. */
export const upholdStudioDispute = (disputeId: string, reply: string) => {
  const body: StudioDisputeDecisionBody = { reply };
  return apiPost<StudioAdminDisputeDTO>(
    `${disputePath(disputeId)}/uphold`,
    body,
  );
};
/** Keeps the release down and marks the dispute rejected; the artist reads
 *  `reply` on the release. 409 studio_dispute_not_open. */
export const rejectStudioDispute = (disputeId: string, reply: string) => {
  const body: StudioDisputeDecisionBody = { reply };
  return apiPost<StudioAdminDisputeDTO>(
    `${disputePath(disputeId)}/reject`,
    body,
  );
};
