import { useCallback, useEffect, useRef, useState } from "react";

/** Cmd+K on a Mac, Ctrl+K everywhere else. Shift and Alt variants are left to
 *  the browser and to assistive tech, which bind some of them. */
function isPaletteShortcut(event: KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "k"
  );
}

/**
 * Open state for the admin command palette, plus the console-wide shortcut.
 *
 * The listener sits on `window` and reads every keydown, so Cmd/Ctrl+K works
 * while focus is inside a search field or a form on any admin page. The member
 * `CommandPalette` steps aside under `/admin`, so the shortcut has one owner.
 *
 * Opening records the element that had focus; closing hands focus back to it,
 * so Esc returns an admin to the row or field they were working in.
 */
export function useAdminCommandPalette(): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
} {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    if (isOpenRef.current) return;
    const focused = document.activeElement;
    returnFocusRef.current =
      focused instanceof HTMLElement && focused !== document.body
        ? focused
        : null;
    isOpenRef.current = true;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    setIsOpen(false);
    const returnTarget = returnFocusRef.current;
    returnFocusRef.current = null;
    // A target that left the page while the palette was up (a row that
    // re-rendered away) has nowhere to take focus; the browser keeps it on
    // <body> then, which is where a fresh page load leaves it too.
    if (returnTarget?.isConnected) returnTarget.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPaletteShortcut(event)) return;
      event.preventDefault();
      if (isOpenRef.current) close();
      else open();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return { isOpen, open, close };
}
