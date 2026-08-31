import { ApiError, apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { BanEvasionAssessmentDTO } from "./adminInvites.api";

/**
 * The staff queue for ban-evasion escalations raised by community moderators
 * (`/admin/ban-evasion/escalations`, PRD-31).
 *
 * THE PRINCIPLE BEHIND IT: the community moderator recognises, platform staff
 * investigates. A community's own owner, co-owners and moderators are told one
 * bit about an applicant, whether they match somebody THAT community banned,
 * and nothing more. Escalating is how a moderator who suspects more can ASK for
 * the cross-community judgement instead of being handed it, and this is the
 * console where that judgement is made.
 *
 * `@Roles(Moderator, Admin)` on the backend, unlike the admin-only legal
 * register: an escalation is operational moderation work, and it is somebody
 * waiting on an answer about an application.
 *
 * NOTHING HERE BANS ANYBODY. Resolving records that a staff member looked, and
 * releases the "one open escalation per (community, join request)" lock so the
 * community can ask again later. `resolutionNote` stays on this console and is
 * never returned on any community-scoped surface, which is what keeps the
 * one-bit boundary intact.
 */

export type BanEvasionEscalationStatus = "open" | "resolved";

/** One escalation as platform staff read it, with the FULL cross-community
 *  assessment of the applicant attached. Mirrors `BanEvasionEscalationDTO`
 *  (`queerpulse-backend/src/ban-evasion/community-ban-evasion-response.ts`). */
export interface BanEvasionEscalationDTO {
  id: string;
  status: BanEvasionEscalationStatus;
  /** ISO timestamp of when the escalation was raised. */
  createdAt: string;
  /** What the escalating moderator wrote, when they wrote anything. */
  note: string | null;
  communitySlug: string;
  communityName: string;
  joinRequestId: string;
  /** The applicant, or null once their account has been erased. */
  subject: MemberRefDTO | null;
  /** The moderator who escalated, or null once their account has been erased. */
  raisedBy: MemberRefDTO | null;
  /** The full assessment of the applicant. Null when the applicant's account
   *  has been erased, which leaves nothing to correlate. */
  assessment: BanEvasionAssessmentDTO | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  resolvedBy: MemberRefDTO | null;
}

/** The server's cap on a resolution note. */
export const MAX_ESCALATION_RESOLUTION_NOTE_LENGTH = 2000;

/** GET /admin/ban-evasion/escalations. Newest first. Defaults to the open
 *  queue, which is the thing staff are actually on shift for. */
export function getBanEvasionEscalations(
  status: BanEvasionEscalationStatus,
): Promise<BanEvasionEscalationDTO[]> {
  return apiGet<BanEvasionEscalationDTO[]>(
    `/admin/ban-evasion/escalations?status=${status}`,
  );
}

/** PATCH /admin/ban-evasion/escalations/:id. Closes one escalation, optionally
 *  with a note. 409 when somebody else has already closed it. */
export function resolveBanEvasionEscalation(
  id: string,
  resolutionNote: string | null,
): Promise<BanEvasionEscalationDTO> {
  return apiPatch<BanEvasionEscalationDTO>(
    `/admin/ban-evasion/escalations/${id}`,
    resolutionNote === null ? {} : { resolutionNote },
  );
}

/** True when the backend refused because the escalation had already been
 *  resolved underneath the open pane. A conflict, never a fault. */
export function isEscalationConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

/**
 * True when `AdminBanEvasionFlag` will actually render something for this
 * assessment.
 *
 * The flag renders nothing for a missing assessment, for `tier: "none"`, and
 * for an assessment with no signals, because on the invite queue those are the
 * ordinary case and a panel per applicant would be noise. On THIS queue they
 * are the answer somebody asked for, so the card states them in words instead
 * of leaving a blank where a panel would be. Kept beside the wire shape rather
 * than inside the component module so that file stays a component module.
 */
export function hasRenderableAssessment(
  assessment: BanEvasionAssessmentDTO | null,
): boolean {
  return (
    assessment !== null &&
    assessment.tier !== "none" &&
    assessment.signals.length > 0
  );
}
