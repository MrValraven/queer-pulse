import { useEffect, useRef } from "react";

/**
 * Where focus goes after a card leaves a review queue: the next card's title,
 * or the active tab when none is left. `markLeaving` runs when staff
 * confirm; the move happens once the card is gone from `items`, which is
 * only after the server said yes. It waits a frame, so the closing dialog
 * has handed focus back first. The frame survives the re-renders that
 * follow (a list hook hands over a fresh `items` array on each one) and is
 * cancelled only on unmount.
 */
export function useReviewFocus<Item>(
  items: Item[],
  getKey: (item: Item) => string,
  tabButtonId: string,
) {
  const titleElements = useRef(new Map<string, HTMLElement>());
  const leaving = useRef<{ key: string; index: number } | null>(null);
  const focusFrame = useRef<number | null>(null);

  useEffect(() => {
    const pending = leaving.current;
    if (!pending || items.some((item) => getKey(item) === pending.key)) return;
    leaving.current = null;
    const next = items[Math.min(pending.index, items.length - 1)];
    const nextKey = next ? getKey(next) : null;
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null;
      // The active tab when no card is left, or when the next card's title
      // has not registered (yet).
      const target =
        nextKey !== null ? titleElements.current.get(nextKey) : undefined;
      (target ?? document.getElementById(tabButtonId))?.focus();
    });
  }, [items, getKey, tabButtonId]);

  useEffect(
    () => () => {
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    },
    [],
  );

  return {
    registerTitle: (key: string) => (element: HTMLElement | null) => {
      if (element) titleElements.current.set(key, element);
      else titleElements.current.delete(key);
    },
    markLeaving: (key: string) => {
      leaving.current = {
        key,
        index: items.findIndex((item) => getKey(item) === key),
      };
    },
    clearLeaving: () => {
      leaving.current = null;
    },
  };
}
