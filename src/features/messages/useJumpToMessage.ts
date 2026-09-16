import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  createMessageJumpHunter,
  type JumpThreadSnapshot,
} from "./messageJumpHunt";

/**
 * The ONE scroll-to + briefly-highlight-a-message mechanism for the open
 * thread. Owns a `createMessageJumpHunter` engine for the panel's lifetime,
 * feeds it the latest rows, virtualizer and load-older state after every
 * commit, and returns a stable `(messageId) => boolean` that starts a jump.
 *
 * A loaded message is scrolled to through the virtualizer and highlighted once
 * it has settled (`revealMessageRow`). An unloaded one pages back through the
 * thread's own load-older trigger until it appears, with a status over the log
 * (`MessageJumpStatus`), or reports why it could not be reached. The return
 * value is true when the message was already loaded; either way the jump is
 * underway and the member sees an outcome.
 *
 * Stable identity on purpose: it is handed to every memoized bubble as
 * `onJumpToMessage`, and to `useSearchJump`'s effect as a dependency.
 */
export function useJumpToMessage(
  snapshot: JumpThreadSnapshot,
): (messageId: string) => boolean {
  const [hunter] = useState(createMessageJumpHunter);

  // No dependency list: every commit can change rows or the loading flags, and
  // the hunt advances exactly when they change. Cheap when nothing is hunting.
  useLayoutEffect(() => {
    hunter.sync(snapshot);
  });

  useEffect(() => () => hunter.dispose(), [hunter]);

  return useCallback(
    (messageId: string): boolean => hunter.jump(messageId),
    [hunter],
  );
}
