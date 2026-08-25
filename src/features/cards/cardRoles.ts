import type { CommunityRole } from "../communities/membership.types";

/**
 * The i18n key a card prints for each roster role.
 *
 * Kept in one place, and `satisfies`-checked against the roster's own role
 * union, so a role added to a community (`co_owner` was) surfaces here as a
 * type error instead of as a card quietly printing "Member" for someone who
 * is not one. Every surface that names the role on a card reads this: the
 * card's back face (screen and print), the issuer's holder modal, and the
 * public verify page.
 */
const ROLE_LABEL_KEY = {
  owner: "cards:role.owner",
  co_owner: "cards:role.coOwner",
  mod: "cards:role.mod",
  member: "cards:role.member",
} satisfies Record<CommunityRole, string>;

/**
 * The label key for the role string that arrived on a card DTO. The wire type
 * is `string`, so an unrecognised value falls back to `member`: a card is read
 * at a door, and the smallest claim is the safe one to print.
 */
export function cardRoleLabelKey(role: string): string {
  return (
    (ROLE_LABEL_KEY as Record<string, string | undefined>)[role] ??
    ROLE_LABEL_KEY.member
  );
}
