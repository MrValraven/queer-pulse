/**
 * PRD-402. The free text a person wrote to explain a decision, carried on the
 * row as its own `reason` field so the row can show it in full under the
 * sentence. The row's `meta` line keeps the kind's short label in every case.
 *
 * Each entry names the one payload field that holds that text for its kind.
 * Kinds whose own sentence already quotes the reason (`community_banned`,
 * `community_post_removed`) are absent: their `.text` interpolates it.
 */
const REASON_FIELD: Record<string, string> = {
  // The admin's reason for declining a verification request.
  verification_update: "reason",
  // The moderator's member-facing note on a warning, suspension, ban or lift.
  moderation_outcome: "note",
  // DES-417. The moderator's word to a nominator on a declined nomination.
  safe_space_review: "reason",
  // The reviewer's note on a partner application, swap proposal or resource.
  submission_decided: "reviewNote",
  // A member's own explanation of why they asked staff to review an owner.
  community_owner_review_requested: "reason",
  forum_thread_reviewed: "reviewNote",
  governance_motion_rejected: "note",
  // The reviewer's word on a question or decline, and since PRD-463 the
  // required reason a moderator gives for hiding a published listing.
  group_listing_decided: "reason",
  landlord_suggestion_decided: "reason",
  landlord_intro_request_decided: "reason",
  reading_group_proposal_decided: "reason",
  housing_listing_decision: "reason",
  // PRD-433. The moderator's word on a listing the member suggested.
  listing_suggestion_needs_info: "reason",
  listing_suggestion_sent_back: "reason",
  listing_suggestion_removed: "reason",
};

/**
 * The kinds whose reason a member wrote. Every other reason in
 * `REASON_FIELD` comes from moderators, reviewers or platform staff, and the
 * row's lead-in says so.
 */
const MEMBER_WRITTEN_REASON_KINDS = new Set<string>([
  "community_owner_review_requested",
]);

/**
 * The trimmed reason on this row's payload, or `undefined` when the kind
 * carries none or the payload's value is missing, blank or not a string.
 * The text is returned as written: the row renders it as a text node.
 */
export function notificationReasonOf(
  type: string,
  payload: unknown,
): string | undefined {
  const field = Object.prototype.hasOwnProperty.call(REASON_FIELD, type)
    ? REASON_FIELD[type]
    : undefined;
  if (!field || typeof payload !== "object" || payload === null) {
    return undefined;
  }
  const value = (payload as Record<string, unknown>)[field];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Whether this kind's reason was written by a member. */
export function isMemberWrittenReason(type: string): boolean {
  return MEMBER_WRITTEN_REASON_KINDS.has(type);
}

/**
 * Kinds whose reason is a QUESTION for the member, so the row's lead-in says
 * so. `listing_suggestion_needs_info` written by `askQuestion` carries the
 * moderator's question to the member who suggested the listing (PRD-433).
 */
const REASON_LEAD_KEY: Record<string, string> = {
  listing_suggestion_needs_info: "notifications:row.reasonLeadQuestion",
};

/** The lead-in key this kind's reason reads under, when it has its own. */
export function reasonLeadKeyOf(type: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(REASON_LEAD_KEY, type)
    ? REASON_LEAD_KEY[type]
    : undefined;
}
