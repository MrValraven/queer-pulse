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
