import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/** Whether the hero's meta line has a count to show. A zero count tells a
 *  reader nothing they can act on, so it is left out on every skin. */
export function hasEngagementCounts(view: PublicSubprofileView): boolean {
  return view.endorsementCount > 0 || view.followerCount > 0;
}

/** Whether a linked persona's "Other persona of {owner}" line would only
 *  repeat the heading: a persona named after its owner already says whose it
 *  is in the title, so the line adds nothing there. Compared trimmed and
 *  case-insensitively, since both names are typed by people. */
export function isOwnerTieRedundant(
  titleName: string,
  ownerName: string | null | undefined,
): boolean {
  const trimmedOwnerName = ownerName?.trim();
  if (!trimmedOwnerName) return false;
  return (
    titleName.trim().localeCompare(trimmedOwnerName, undefined, {
      sensitivity: "accent",
    }) === 0
  );
}
