import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

/** Where focus lands when the menu opens: the first enabled item (click,
 *  Enter, Space, ArrowDown on the trigger) or the last one (ArrowUp). */
export type OverflowMenuInitialFocus = "first" | "last";

/**
 * Roving focus for the listing overflow menu (APG menu pattern). Exactly one
 * item carries `tabIndex={0}`; ArrowDown and ArrowUp cycle through the enabled
 * items, Home and End jump to the ends, and disabled items are skipped. The
 * panel mounts on open, so the mount effect is the "focus on open" step.
 */
export function useOverflowMenuKeyboard(
  itemDisabledStates: boolean[],
  initialFocus: OverflowMenuInitialFocus,
) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledIndexes = itemDisabledStates.flatMap((isDisabled, index) =>
    isDisabled ? [] : [index],
  );
  // With every item disabled, focus still lands on the first one so it never
  // falls back to the page body.
  const firstIndex = enabledIndexes[0] ?? 0;
  const lastIndex = enabledIndexes[enabledIndexes.length - 1] ?? 0;
  const [focusedIndex, setFocusedIndex] = useState(
    initialFocus === "last" ? lastIndex : firstIndex,
  );
  const initialIndexRef = useRef(focusedIndex);

  useEffect(() => {
    itemRefs.current[initialIndexRef.current]?.focus();
  }, []);

  function focusItem(index: number) {
    setFocusedIndex(index);
    itemRefs.current[index]?.focus();
  }

  function stepFrom(direction: 1 | -1): number {
    if (enabledIndexes.length === 0) return focusedIndex;
    const position = enabledIndexes.indexOf(focusedIndex);
    if (position === -1) return direction === 1 ? firstIndex : lastIndex;
    const nextPosition =
      (position + direction + enabledIndexes.length) % enabledIndexes.length;
    return enabledIndexes[nextPosition] ?? focusedIndex;
  }

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    const targetIndexByKey: Record<string, () => number> = {
      ArrowDown: () => stepFrom(1),
      ArrowUp: () => stepFrom(-1),
      Home: () => firstIndex,
      End: () => lastIndex,
    };
    const resolveTarget = targetIndexByKey[event.key];
    if (!resolveTarget) return;
    event.preventDefault();
    focusItem(resolveTarget());
  }

  return {
    itemRefs,
    focusedIndex,
    onMenuKeyDown,
    onItemFocus: setFocusedIndex,
  };
}
