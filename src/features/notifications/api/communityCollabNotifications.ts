/**
 * Guest communities (spec 2026-10-08). The invite reaches the guest
 * community's owners, co-owners and mods; the answer reaches the
 * gathering's organisers with `payload.decision`. The answer reads one line
 * per decision, so both `formatNotification` (the plain line) and the
 * adapter (the line that names the responder) read its key here.
 */
export const COLLAB_RESPONSE_KIND = "event_community_invite_response";

/** `event_community_invite_response.accepted` or `.declined`, and the flat
 *  kind for a payload with no readable decision. */
export function collabResponseKey(payload: unknown): string {
  const decision = (payload as { decision?: unknown } | null)?.decision;
  if (decision === "accepted") return `${COLLAB_RESPONSE_KIND}.accepted`;
  if (decision === "declined") return `${COLLAB_RESPONSE_KIND}.declined`;
  return COLLAB_RESPONSE_KIND;
}
