/** How a member knows a safe space they vouch for. Mirrors the backend
 *  `SafeSpaceVouchRelationship` union (queerpulse-backend
 *  src/safe-space-vouches/entities/safe-space-vouch.entity.ts). */
export type SafeSpaceVouchRelationship =
  | "regular"
  | "once_or_twice"
  | "work_or_volunteer"
  | "with_friend";

/** The vouch-modal relationship radio options. `key` is the i18n string key
 *  rendered to the member; `value` is the enum the live POST sends. Order here
 *  is the display order. */
export const VOUCH_RELATIONSHIP_OPTIONS: {
  key: string;
  value: SafeSpaceVouchRelationship;
}[] = [
  { key: "safety:vouchModal.relationship.regular", value: "regular" },
  {
    key: "safety:vouchModal.relationship.onceOrTwice",
    value: "once_or_twice",
  },
  {
    key: "safety:vouchModal.relationship.workOrVolunteer",
    value: "work_or_volunteer",
  },
  { key: "safety:vouchModal.relationship.withFriend", value: "with_friend" },
];
