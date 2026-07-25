/**
 * Options for the "vouch for a member" modal. Values are the backend
 * relationship enum keys (`vouches_relationship_enum`), sent verbatim as the
 * `relationship` field; labels resolve through i18n.
 */
export const RELATIONSHIPS = [
  "collaborated",
  "friends",
  "group",
  "met_through",
  "neighbours",
] as const;

export type VouchRelationship = (typeof RELATIONSHIPS)[number];

export const RELATIONSHIP_LABEL_KEY: Record<VouchRelationship, string> = {
  collaborated: "members:vouch.relationship.collaborated",
  friends: "members:vouch.relationship.friends",
  group: "members:vouch.relationship.group",
  met_through: "members:vouch.relationship.metThroughQueerPulse",
  neighbours: "members:vouch.relationship.neighbours",
};
