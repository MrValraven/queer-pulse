import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPost,
} from "../../../shared/api/client";
import type {
  StudioAccessGrantDTO,
  StudioReleaseDTO,
} from "../../studio/api/studio.types";

const memberPath = (memberId: string) =>
  `/admin/members/${encodeURIComponent(memberId)}/studio-access`;
const releasePath = (releaseId: string) =>
  `/admin/studio/releases/${encodeURIComponent(releaseId)}`;

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
export const takeDownStudioRelease = (releaseId: string, reason: string) =>
  apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/takedown`, { reason });
export const restoreStudioRelease = (releaseId: string) =>
  apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/restore`);
