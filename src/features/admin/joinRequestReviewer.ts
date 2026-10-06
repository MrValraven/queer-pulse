import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * Who decided a join request, resolved once so every surface that names the
 * reviewer agrees on the order of fallbacks. Each caller picks its own words
 * for each kind: the quality sample says "You" as a fact value, the decided
 * tab says "by you" inside a sentence.
 *
 * - `self`: the signed-in reviewer made the call.
 * - `named`: the server resolved the reviewer's display name.
 * - `unnamed`: the row carries a reviewer id the server could not put a name
 *   to. `reference` is a short id-derived handle that still groups that
 *   reviewer's calls without claiming to identify them.
 * - `none`: the row carries no reviewer at all, which is also where a reviewer
 *   who has since erased their account lands (the id is NULLed with them).
 */
export type JoinRequestReviewer =
  | { kind: "self" }
  | { kind: "named"; name: string }
  | { kind: "unnamed"; reference: string }
  | { kind: "none" };

export function joinRequestReviewer(
  item: Pick<JoinRequestView, "reviewedBy" | "reviewedByName">,
  /** The signed-in reviewer, or null while the session is still loading. */
  currentUserId: string | null,
): JoinRequestReviewer {
  if (!item.reviewedBy) return { kind: "none" };
  if (item.reviewedBy === currentUserId) return { kind: "self" };
  if (item.reviewedByName) return { kind: "named", name: item.reviewedByName };
  return { kind: "unnamed", reference: item.reviewedBy.slice(0, 8) };
}
