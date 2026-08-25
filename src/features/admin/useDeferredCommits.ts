import { useEffect, useRef } from "react";
import { UNDO_COMMIT_MS } from "./moderationQueue.types";

/**
 * Deferred-commit scheduler for the Undo pattern (audit P1-1). `scheduleCommit`
 * holds a destructive action back until the undo window closes and returns a
 * handle; `cancelCommit(handle)` drops it outright (the Undo path). On unmount
 * every still-pending commit is flushed — the moderator confirmed it by not
 * undoing — and its timer cleared so nothing fires against a dead component.
 * Handles are monotonic so bulk (many ids) and per-row actions cancel alone.
 */
export function useDeferredCommits() {
  const pending = useRef(
    new Map<number, { commit: () => void; timer: number }>(),
  );
  const nextHandle = useRef(0);

  const cancelCommit = (handle: number) => {
    const entry = pending.current.get(handle);
    if (!entry) return;
    window.clearTimeout(entry.timer);
    pending.current.delete(handle);
  };

  const scheduleCommit = (commit: () => void): number => {
    const handle = nextHandle.current++;
    const timer = window.setTimeout(() => {
      pending.current.delete(handle);
      commit();
    }, UNDO_COMMIT_MS);
    pending.current.set(handle, { commit, timer });
    return handle;
  };

  useEffect(() => {
    const commits = pending.current;
    return () => {
      commits.forEach(({ commit, timer }) => {
        window.clearTimeout(timer);
        commit();
      });
      commits.clear();
    };
  }, []);

  return { scheduleCommit, cancelCommit };
}
