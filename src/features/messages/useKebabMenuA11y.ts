// src/features/messages/useKebabMenuA11y.ts
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * The open/close + roving-tabindex keyboard contract (APG menu-button
 * pattern) shared by every "⋯" popover in messaging — `ThreadRowMenu` and
 * `ConversationSafetyMenu`. Outside-pointer-down and Escape close the menu
 * and, for Escape, return focus to the trigger; opening moves focus to the
 * first item; Arrow Up/Down/Home/End move a roving focus among `itemCount`
 * items. Kept as a hook (not a shared component) so each caller still owns
 * its own trigger/menu markup and CSS classes.
 */
export function useKebabMenuA11y(itemCount: number) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    function onDocumentPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () =>
      document.removeEventListener("pointerdown", onDocumentPointerDown);
  }, [open]);

  // APG menu-button contract: move focus into the menu when it opens.
  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveTo = (index: number) => {
    const nextIndex = (index + itemCount) % itemCount;
    itemRefs.current[nextIndex]?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    const currentIndex = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(currentIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(itemCount - 1);
        break;
    }
  };

  return { open, setOpen, containerRef, triggerRef, itemRefs, onMenuKeyDown };
}
