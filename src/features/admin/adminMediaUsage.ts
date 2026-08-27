import type { AdminMediaObject } from "./api/adminMedia.api";

/**
 * The media console's "is anything still pointing at this?" filter. Purely a
 * view filter over what has already been fetched: every listed object arrives
 * with its `references` resolved server-side, so narrowing to the unused ones
 * costs no extra request.
 *
 * It is deliberately NOT a server-side filter: the reference check runs per
 * listed page (~27 queries), so asking the backend for "every orphan in the
 * bucket" would mean sweeping the whole bucket inside one request. Instead the
 * console scans a page at a time, and `AdminMediaPage` keeps pulling the next
 * page while the filter hides everything loaded so far, so a partly-loaded
 * bucket can never answer "nothing here" when the next page holds a match.
 */
export type AdminMediaUsage = "all" | "in-use" | "unused";

/** Does this object satisfy the usage filter? "unused" means no row anywhere in
 *  the database still points at the key. When the console is `degraded` an
 *  empty reference set is UNVERIFIED, which the standing banner says. */
export function matchesUsage(
  object: AdminMediaObject,
  usage: AdminMediaUsage,
): boolean {
  if (usage === "all") return true;
  const isInUse = object.references.length > 0;
  return usage === "in-use" ? isInUse : !isInUse;
}
