import type { TFunction } from "../../shared/i18n/types";
import type { AuditEntryDTO } from "./api/moderation.api";

/**
 * Audit-trail action code → catalog key (FE-ADM-26). The drawer used to render
 * `action.replace(/_/g, " ")`, which surfaced raw server codes as lowercase
 * English fragments ("hide content", "appeal overturned") in every locale.
 *
 * The `admin:members.timeline.action.*` family already labels every
 * `ModActionCode` for the member drawer's timeline, so those keys are reused
 * verbatim. Only the two codes the audit trail adds on top of the action set
 * (`created`, `appeal_overturned`) get their own `admin:moderation.action.*`
 * keys. Kept `Partial` because the DTO's `action` may widen server-side.
 */
export const AUDIT_ACTION_LABEL_KEY: Partial<Record<string, string>> = {
  created: "admin:moderation.action.created",
  dismiss: "admin:members.timeline.action.dismiss",
  warn: "admin:members.timeline.action.warn",
  hide_content: "admin:members.timeline.action.hideContent",
  remove_content: "admin:members.timeline.action.removeContent",
  restrict: "admin:members.timeline.action.restrict",
  suspend: "admin:members.timeline.action.suspend",
  ban: "admin:members.timeline.action.ban",
  shield: "admin:members.timeline.action.shield",
  escalate: "admin:members.timeline.action.escalate",
  appeal_upheld: "admin:members.timeline.action.appealUpheld",
  appeal_overturned: "admin:moderation.action.appealOverturned",
  // PRD-360: a moderator opened the conversation around a message report.
  conversation_context_viewed:
    "admin:moderation.action.conversationContextViewed",
  // ENG-245: a staff "delete for everyone" on a member's message.
  message_deleted_by_staff: "admin:moderation.action.messageDeletedByStaff",
  // PRD-361: a moderator opened the file attached to a reported message.
  report_message_attachment_viewed:
    "admin:moderation.action.reportMessageAttachmentViewed",
  // Studio v1: grants name the member; takedown and restore name only the
  // release (the note carries its id), so the trail never ties a persona to
  // its owner.
  studio_access_granted: "admin:moderation.action.studioAccessGranted",
  studio_access_revoked: "admin:moderation.action.studioAccessRevoked",
  studio_release_taken_down: "admin:moderation.action.studioReleaseTakenDown",
  studio_release_restored: "admin:moderation.action.studioReleaseRestored",
  // Studio v3: staff removed a reported persona post. Names the persona
  // only, like the release takedown rows.
  persona_post_removed: "admin:moderation.action.personaPostRemoved",
};

/** The moderator-facing label for one audit entry. An unmapped code falls
 *  through to the raw code, so a new server action reads as an honest unknown
 *  rather than a fabricated label. */
export function auditActionLabel(
  action: AuditEntryDTO["action"],
  t: TFunction,
): string {
  const labelKey = AUDIT_ACTION_LABEL_KEY[action];
  return labelKey ? t(labelKey) : action;
}
