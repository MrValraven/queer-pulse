import { useCallback, useEffect, useMemo, useRef } from "react";

/** Joins ids into one dependency key; no id carries a control character. */
const ID_SEPARATOR = "\u0000";

/**
 * One callback per row id, for memoised `StudioTrackRow`s. Each keeps its
 * identity while the list's ids and `run` stay the same, so pass a `run`
 * from `useCallback`: the player's clock ticks in its own context, and a
 * row then re-renders only when the list, or what `run` reads, changes.
 */
export function useStudioRowHandlers<Argument = void>(
  ids: readonly string[],
  run: (id: string, argument: Argument) => void,
): ReadonlyMap<string, (argument: Argument) => void> {
  const idsKey = ids.join(ID_SEPARATOR);
  return useMemo(() => {
    const handlers = new Map<string, (argument: Argument) => void>();
    if (idsKey === "") return handlers;
    for (const id of idsKey.split(ID_SEPARATOR))
      handlers.set(id, (argument: Argument) => run(id, argument));
    return handlers;
  }, [idsKey, run]);
}

/**
 * A callback that keeps one identity for the component's life and always
 * runs the latest `run`. For event handlers only (a click, a drop, a toast
 * action), never during render: hand it to `useStudioRowHandlers` when
 * `run` closes over state that changes every render.
 */
export function useStudioLatestCallback<Arguments extends unknown[]>(
  run: (...args: Arguments) => void,
): (...args: Arguments) => void {
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);
  return useCallback((...args: Arguments) => runRef.current(...args), []);
}
