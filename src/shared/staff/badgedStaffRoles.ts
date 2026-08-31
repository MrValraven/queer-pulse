import type { StaffRoleId } from "../../features/admin/staffRoles.registry";
// Type-only, so nothing is emitted and the pair does not become a runtime
// import cycle with `StaffBadge`, which imports the labels below from here.
import type { StaffBadgeRole, StaffRole } from "../components/ui/StaffBadge";

/**
 * The additive staff grants that earn a public badge on a member's name.
 *
 * Mirrors `hasPublicStaffBadge` in the backend's `users/staff-roles.registry.ts`,
 * which is where the reasoning lives and where a new grant has to make the call:
 * a grant is badged when its holder exercises power over OTHER members' content
 * or membership, so the member on the receiving end of a declined listing or a
 * spiked piece can see from the name alone that the platform is acting. Two
 * grants stay off the list. `magazine_writer` reads only its own holder's work,
 * so it holds power over nobody. `partnerships` decides about organisations and
 * about changemaker nominations rather than about a member's own content or
 * their place here.
 *
 * `Extract` rather than a fresh union: this list can only ever narrow the ids
 * the admin registry already defines, so a typo or a renamed grant fails to
 * compile here instead of quietly badging nobody.
 */
export type BadgedStaffRoleId = Extract<
  StaffRoleId,
  | "magazine_editor"
  | "housing_moderator"
  | "directory_moderator"
  | "resource_curator"
  | "editorial"
  | "communities"
>;

/** Registry order, matching the backend's `BADGED_STAFF_ROLE_IDS`. */
export const BADGED_STAFF_ROLE_IDS: BadgedStaffRoleId[] = [
  "magazine_editor",
  "housing_moderator",
  "directory_moderator",
  "resource_curator",
  "editorial",
  "communities",
];

/**
 * The visible label for each badged grant, in the eagerly loaded `shared`
 * namespace. It has to be `shared` rather than `admin`: this badge renders on
 * member surfaces all over the app (profile heroes, forum bylines, community
 * rows), and the admin catalog is a lazily loaded chunk those routes never ask
 * for, so an `admin:` key there would paint as a raw translation code.
 *
 * The labels say what the person does in plain words, because the reader is a
 * member deciding how to read a decision that landed on them.
 */
export const BADGED_STAFF_ROLE_LABEL_KEY: Record<BadgedStaffRoleId, string> = {
  magazine_editor: "shared:staffBadge.grant.magazineEditor",
  housing_moderator: "shared:staffBadge.grant.housingModerator",
  directory_moderator: "shared:staffBadge.grant.directoryModerator",
  resource_curator: "shared:staffBadge.grant.resourceCurator",
  editorial: "shared:staffBadge.grant.editorial",
  communities: "shared:staffBadge.grant.communities",
};

/**
 * Whether a raw string off the wire is a grant this build knows how to badge.
 * A backend that shipped a new grant before this build did sends an id with no
 * label here; dropping it shows no badge rather than a raw key like
 * `housing_moderator` on someone's profile.
 */
export function isBadgedStaffRoleId(value: string): value is BadgedStaffRoleId {
  return (BADGED_STAFF_ROLE_IDS as string[]).includes(value);
}

/**
 * Which badges one person actually wears, given what the roster says about
 * them. The account tier WINS where there is one: "QueerPulse Mod" already
 * tells the reader the platform is acting, and hanging the moderator's domain
 * grants off their name in every directory row would add pills without adding
 * meaning. Someone on the ordinary member tier has no tier badge to say it for
 * them, so their grants are what the reader sees, all of them and in registry
 * order, because holding two is a real difference from holding one.
 *
 * The admin staff-roster page is the place that lists a moderator's grants
 * alongside their tier; that page asks a different, admin-only endpoint for
 * every grant a person holds, badged or not.
 *
 * Takes plain strings so callers can hand it whatever the wire gave them; ids
 * this build has no label for are dropped rather than painted as raw keys.
 */
export function staffBadgeRolesFor(
  accountTier: StaffRole | null | undefined,
  badgedStaffRoles: readonly string[] | undefined,
): StaffBadgeRole[] {
  if (accountTier) return [accountTier];
  const held = (badgedStaffRoles ?? []).filter(isBadgedStaffRoleId);
  return BADGED_STAFF_ROLE_IDS.filter((staffRoleId) =>
    held.includes(staffRoleId),
  );
}
