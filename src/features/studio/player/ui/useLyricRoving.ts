import { useEffect, useMemo, useState, type RefObject } from "react";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";

/** The keys that move between lines, and where each one goes. */
const ROVING_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

function targetLineOf(
  key: string,
  textIndexes: readonly number[],
  fromIndex: number,
): number | undefined {
  const position = textIndexes.indexOf(fromIndex);
  if (key === "Home") return textIndexes[0];
  if (key === "End") return textIndexes.at(-1);
  if (key === "ArrowDown")
    return textIndexes[Math.min(position + 1, textIndexes.length - 1)];
  return textIndexes[Math.max(position - 1, 0)];
}

/**
 * One Tab stop for the whole list (DES-23): the current line, or the line
 * the member moved to, holds it. Arrow Up and Down step between lines,
 * Home and End jump to the ends, and the gaps are skipped. The keys go
 * through a native listener on the list, as the list itself is no control.
 */
export function useLyricRoving(
  listRef: RefObject<HTMLOListElement | null>,
  lines: readonly StudioSyncedLyricView[],
  activeIndex: number | null,
) {
  const [rovingIndex, setRovingIndex] = useState<number | null>(null);
  const textIndexes = useMemo(
    () => lines.flatMap((line, index) => (line.text ? [index] : [])),
    [lines],
  );
  const isActiveText =
    activeIndex !== null && textIndexes.includes(activeIndex);
  const tabStopIndex =
    rovingIndex ?? (isActiveText ? activeIndex : (textIndexes[0] ?? null));
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!ROVING_KEYS.has(event.key) || event.altKey || event.metaKey) return;
      const from = (event.target as Element).closest("[data-line-index]");
      if (!from) return;
      const target = targetLineOf(
        event.key,
        textIndexes,
        Number(from.getAttribute("data-line-index")),
      );
      const button = list.querySelector<HTMLElement>(
        `[data-line-index="${target}"] button`,
      );
      if (!button) return;
      event.preventDefault();
      setRovingIndex(target ?? null);
      button.focus();
    };
    // Focus leaving the list hands the Tab stop back to the current line.
    const onFocusOut = (event: FocusEvent) => {
      if (!list.contains(event.relatedTarget as Node | null))
        setRovingIndex(null);
    };
    list.addEventListener("keydown", onKeyDown);
    list.addEventListener("focusout", onFocusOut);
    return () => {
      list.removeEventListener("keydown", onKeyDown);
      list.removeEventListener("focusout", onFocusOut);
    };
  }, [listRef, textIndexes]);
  return { tabStopIndex, setRovingIndex };
}
