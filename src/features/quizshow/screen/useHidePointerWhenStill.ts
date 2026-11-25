import { useEffect, useState } from "react";

/** The pointer hides after this long without movement (item 40). */
const POINTER_HIDE_AFTER_MS = 2000;
/** Set on <html> while the pointer is hidden, so the portaled toolbar, chip and tally hide it too. */
const POINTER_STILL_ATTRIBUTE = "data-quizshow-pointer-still";

/**
 * Hides the pointer once it has been still for two seconds; any movement or
 * press shows it again. Native window listeners, so no element needs a
 * handler; the attribute on <html> leaves with the page.
 */
export function useHidePointerWhenStill(): void {
  const [isStill, setIsStill] = useState(false);
  useEffect(() => {
    let timeoutId = window.setTimeout(
      () => setIsStill(true),
      POINTER_HIDE_AFTER_MS,
    );
    const handleMove = () => {
      setIsStill(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(
        () => setIsStill(true),
        POINTER_HIDE_AFTER_MS,
      );
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
    };
  }, []);
  useEffect(() => {
    if (!isStill) return undefined;
    const root = document.documentElement;
    root.setAttribute(POINTER_STILL_ATTRIBUTE, "true");
    return () => {
      root.removeAttribute(POINTER_STILL_ATTRIBUTE);
    };
  }, [isStill]);
}
