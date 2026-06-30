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
