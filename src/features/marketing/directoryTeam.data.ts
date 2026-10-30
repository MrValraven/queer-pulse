import {
  LISTING_TEAM_LIMITS,
  type ListingTeamMemberView,
} from "./listBusiness/api/listingTeam.types";

/** Splits the public team into the cards shown first and the folded rest. */
export function splitTeamAtFold(members: ListingTeamMemberView[]): {
  visible: ListingTeamMemberView[];
  folded: ListingTeamMemberView[];
} {
  return {
    visible: members.slice(0, LISTING_TEAM_LIMITS.visibleBeforeFold),
    folded: members.slice(LISTING_TEAM_LIMITS.visibleBeforeFold),
  };
}

/** Stable list key: the kind plus the persona id or the member slug, so a
 *  persona and a member can never collide. */
export function teamEntryKey(entry: ListingTeamMemberView): string {
  return entry.kind === "member"
    ? `member:${entry.member.slug}`
    : `persona:${entry.persona.id}`;
}

/** True when every card would repeat the same craft: a team of two or more
 *  made only of personas of one kind. Any member entry turns it off, since a
 *  member card carries its own "Member" chip. */
export function isTeamKindShared(members: ListingTeamMemberView[]): boolean {
  if (members.length < 2) return false;
  const firstEntry = members[0];
  if (!firstEntry || firstEntry.kind !== "persona") return false;
  const sharedKind = firstEntry.persona.kind;
  return members.every(
    (entry) => entry.kind === "persona" && entry.persona.kind === sharedKind,
  );
}

/** False when the persona is named after its kind ("Game master (DM/GM)"),
 *  so a card does not print the same words twice. */
export function shouldShowKindLabel(
  displayName: string,
  kindLabel: string,
): boolean {
  return (
    displayName.trim().toLocaleLowerCase() !==
    kindLabel.trim().toLocaleLowerCase()
  );
}
