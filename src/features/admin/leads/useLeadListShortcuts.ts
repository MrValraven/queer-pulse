import { useEffect, useRef, type RefObject } from "react";
import { LEAD_LIST_SHORTCUT } from "./leadsList.data";

/** True when a key press belongs to a field, a menu or a dialog. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest('[role="dialog"], [role="menu"], [aria-modal="true"]')) {
    return true;
  }
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * The list page's keys: `/` moves focus to the search, `n` opens Add lead.
 * A press with a modifier, inside a field, or while a dialog or menu holds
 * focus is left alone, so the keys never take a typed letter.
 */
export function useLeadListShortcuts({
  searchRef,
  onAdd,
  isEnabled,
}: {
  searchRef: RefObject<HTMLInputElement | null>;
  onAdd: () => void;
  isEnabled: boolean;
}) {
  const savedOnAdd = useRef(onAdd);
  useEffect(() => {
    savedOnAdd.current = onAdd;
  });

  useEffect(() => {
    if (!isEnabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === LEAD_LIST_SHORTCUT.search) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key.toLowerCase() === LEAD_LIST_SHORTCUT.add) {
        event.preventDefault();
        savedOnAdd.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isEnabled, searchRef]);
}
