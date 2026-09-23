import { memberRefToPerson } from "../../shared/api/refs";
import type { MemberRefDTO } from "../../shared/api/refs";

/**
 * The display name for somebody named on the delegation panel.
 *
 * Built on the shared `memberRefToPerson`, which is the canonical way this
 * codebase turns a `MemberRef` into something renderable. Two things are
 * layered on top of its `Person`:
 *
 * - Every `MemberRef` on this domain is nullable, because the account behind
 *   an offer or a seat may have been erased since the row was written. The row
 *   survives that, so the panel needs an honest `fallback` to print.
 * - A ref can carry a slug with an empty name, which is the shape a demo
 *   mutation builds from a typed slug. The slug stands in for the name there.
 */
export function delegationMemberName(
  member: MemberRefDTO | null,
  fallback: string,
): string {
  const person = memberRefToPerson(member);
  if (!person) return fallback;
  return person.name || person.slug || fallback;
}
