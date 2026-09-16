import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Open state for the "Media, links and docs" sheet (PRD-373), with focus
 * returned to whatever opened it. The shared `Modal` restores focus to the
 * element focused when it mounted, which for a menu item is gone by the time
 * the sheet closes, so the opener passes the element that stays (the header
 * kebab's trigger) and this hook focuses it after a plain dismissal.
 *
 * `closeForNavigation` closes WITHOUT that restore, for the moments the sheet
 * hands over to the photo viewer or the thread: the viewer takes focus on
 * mount, and yanking it back to the kebab would strand a keyboard user.
 */
export function useConversationMediaGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  const open = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    setIsOpen(false);
  }, []);

  const closeForNavigation = useCallback(() => {
    shouldRestoreFocusRef.current = false;
    setIsOpen(false);
  }, []);

  // Runs after the Modal's own unmount cleanup, so this focus is the last word.
  useEffect(() => {
    if (isOpen || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    const trigger = triggerRef.current;
    if (trigger?.isConnected) trigger.focus();
  }, [isOpen]);

  return { isOpen, open, close, closeForNavigation };
}
