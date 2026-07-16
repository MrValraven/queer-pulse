/**
 * Static options for the "vouch for a member" modal (VouchMemberModal).
 * Vouching for an existing member is a public co-sign — you publicly stand
 * behind someone you know. These are the ways you might know them.
 */
export const RELATIONSHIPS = [
  "We've collaborated",
  "We're friends",
  "Same collective or group",
  "Met through QueerPulse",
  "We're neighbours",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

/** Display label per relationship — a small, platform-defined vocabulary
 *  (chrome), resolved through `t()`. `Relationship` itself stays the English
 *  literal used as the radio's internal value/comparator. */
export const RELATIONSHIP_LABEL_KEY: Record<Relationship, string> = {
  "We've collaborated": "members:vouch.relationship.collaborated",
  "We're friends": "members:vouch.relationship.friends",
  "Same collective or group": "members:vouch.relationship.group",
  "Met through QueerPulse": "members:vouch.relationship.metThroughQueerPulse",
  "We're neighbours": "members:vouch.relationship.neighbours",
};
