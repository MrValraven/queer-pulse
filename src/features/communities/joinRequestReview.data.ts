import type { DeclineKind } from "./api/communityJoin.api";

/**
 * How long each kind of decline asks the applicant to wait before they may
 * file again.
 *
 * SOURCE OF TRUTH: `REAPPLY_WAIT_DAYS_NOT_NOW` and
 * `REAPPLY_WAIT_DAYS_NOT_A_FIT` in the backend's
 * `src/communities/communities.service.ts`. The backend enforces the wait (it
 * stamps `community_join_requests.reapply_after` and refuses an early retry
 * with `REAPPLY_TOO_SOON`); these numbers exist only so the moderator is told
 * what their choice actually does. Keep them in step with that file, and
 * interpolate them into the copy rather than writing "30" into a catalog
 * string, so a backend change is a one-line change here.
 */
export const REAPPLY_WAIT_DAYS: Record<DeclineKind, number> = {
  not_now: 30,
  not_a_fit: 180,
};

/**
 * i18n Pattern A — chrome list (the two kinds of "no" a decline can be).
 * `labelKey` names the kind; `descriptionKey` says what happens to the person,
 * with `{days}` filled from `REAPPLY_WAIT_DAYS`.
 */
export const DECLINE_KINDS: {
  value: DeclineKind;
  labelKey: string;
  descriptionKey: string;
}[] = [
  {
    value: "not_now",
    labelKey: "communities:detail.modtools.joinRequests.decline.notNow.label",
    descriptionKey:
      "communities:detail.modtools.joinRequests.decline.reapplyAfterDays",
  },
  {
    value: "not_a_fit",
    labelKey: "communities:detail.modtools.joinRequests.decline.notAFit.label",
    descriptionKey:
      "communities:detail.modtools.joinRequests.decline.reapplyAfterDays",
  },
];

/**
 * What a moderator decided about one request. A decline always carries its
 * kind, because the kind is what tells the applicant whether they are being
 * asked to come back later; `declineReason` is optional and is shown TO THE
 * APPLICANT (the backend persists it for exactly that).
 */
export type JoinRequestDecision =
  | { isApproved: true }
  | {
      isApproved: false;
      declineKind: DeclineKind;
      declineReason?: string;
    };

/** A decision → the PATCH body `triageJoinRequest` takes. Pure, so the mod
 *  hook stays a wiring layer. */
export function triagePayloadFor(decision: JoinRequestDecision): {
  action: "approve" | "decline";
  declineKind?: DeclineKind;
  declineReason?: string;
} {
  if (decision.isApproved) return { action: "approve" };
  return {
    action: "decline",
    declineKind: decision.declineKind,
    ...(decision.declineReason
      ? { declineReason: decision.declineReason }
      : {}),
  };
}
