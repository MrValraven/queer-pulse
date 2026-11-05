import { useCallback, useRef, useState } from "react";
import type { QuizshowStudioMenuAnchor } from "./useStudioMenuPosition";

/** The open state of a menu and its opener; `close(true)` hands focus back to the opener. */
export function useStudioMenuAnchor() {
  const [anchor, setAnchor] = useState<QuizshowStudioMenuAnchor | null>(null);
  const anchorRef = useRef<QuizshowStudioMenuAnchor | null>(null);
  const openAt = useCallback(
    (element: HTMLElement, point: { x: number; y: number } | null = null) => {
      const next = { element, point };
      anchorRef.current = next;
      setAnchor(next);
    },
    [],
  );
  const close = useCallback((shouldReturnFocus: boolean) => {
    const current = anchorRef.current;
    anchorRef.current = null;
    setAnchor(null);
    if (shouldReturnFocus && current?.element.isConnected) {
      current.element.focus({ preventScroll: true });
    }
  }, []);
  /** A trigger press: opens from it, or closes when it is already open from it. */
  const toggleFrom = useCallback(
    (element: HTMLElement) => {
      if (anchorRef.current?.element === element) close(true);
      else openAt(element);
    },
    [close, openAt],
  );
  return { anchor, isOpen: anchor !== null, openAt, close, toggleFrom };
}
