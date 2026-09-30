import type { Member } from "./members";

/** Full display name for a member object. Lives outside `members.ts` so an
 *  always-mounted caller (the account chip, the tab bar) can name the member
 *  without pulling the whole registry into first paint. `members.ts`
 *  re-exports it for every existing importer. */
export function fullName(member: Pick<Member, "first" | "last">): string {
  return `${member.first} ${member.last}`;
}
