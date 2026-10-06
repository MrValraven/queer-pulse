import { currentUser } from "../../members/data/members";
import type { Thread } from "../forum.data";

// DEMO: the persona owns the threads it wrote. Read only on the demo branch.
function isDemoAuthor(thread: Thread): boolean {
  return thread.author.slug === currentUser.slug || !!thread.author.isMine;
}

/** The author or a moderator may correct a call's or a fundraiser's details.
 *  `canEditTitle` is the thread author's flag; `canLock`/`canPin` mirror the
 *  moderator's (see `canMoveThreadCategory`). */
export function canEditFundingDetails(
  thread: Thread,
  demoMode: boolean,
): boolean {
  if (demoMode) return isDemoAuthor(thread);
  return !!(thread.canEditTitle || thread.canLock || thread.canPin);
}

/** Only the author ends a fundraiser: the end route is author-only. */
export function isFundingAuthor(thread: Thread, demoMode: boolean): boolean {
  if (demoMode) return isDemoAuthor(thread);
  return !!thread.canEditTitle;
}
