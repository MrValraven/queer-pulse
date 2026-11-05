import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./QuizshowLobby.module.css";

/** The gap between the anchor and a viewport-pinned tip, in px. */
const TIP_GAP_PX = 10;

/**
 * The studio's version of a blocked button's reason: a small dark tooltip
 * under the button instead of text that pushes the top bar taller. Its parent
 * is the anchor (`.studioWrap`). The tip stays in the DOM so the button's
 * `aria-describedby` always resolves.
 *
 * WCAG 1.4.13: Escape dismisses it, and it is hoverable (the pointer can
 * cross onto it, since the gap is bridged and it takes pointer events).
 * On a narrow screen it pins to the viewport edges, `top` measured from the
 * anchor, so it never runs off either side whatever the anchor's position.
 */
export function QuizshowBlockedTip({
  id,
  isPinned,
  isDismissed,
  onDismiss,
  onReset,
  isShownOnFocus = true,
  children,
}: {
  id: string;
  isPinned: boolean;
  isDismissed: boolean;
  onDismiss: () => void;
  onReset: () => void;
  /**
   * False for a tip whose anchor takes focus on its own (a dialog's first
   * control): it then shows only when pinned or hovered, never on focus.
   */
  isShownOnFocus?: boolean;
  children: ReactNode;
}) {
  const tipRef = useRef<HTMLDivElement>(null);
  const measure = useCallback(() => {
    const tip = tipRef.current;
    const anchor = tip?.parentElement;
    if (!tip || !anchor) return;
    tip.style.setProperty(
      "--tip-top",
      `${anchor.getBoundingClientRect().bottom + TIP_GAP_PX}px`,
    );
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isShown = isPinned || isHovered || (isShownOnFocus && isFocused);

  useEffect(() => {
    const anchor = tipRef.current?.parentElement;
    if (!anchor) return undefined;
    const handleEnter = () => {
      measure();
      setIsHovered(true);
    };
    const handleLeave = () => {
      setIsHovered(false);
      onReset();
    };
    const handleFocusIn = () => {
      measure();
      setIsFocused(true);
    };
    const handleFocusOut = () => {
      setIsFocused(false);
      onReset();
    };
    anchor.addEventListener("pointerenter", handleEnter);
    anchor.addEventListener("focusin", handleFocusIn);
    anchor.addEventListener("pointerleave", handleLeave);
    anchor.addEventListener("focusout", handleFocusOut);
    return () => {
      anchor.removeEventListener("pointerenter", handleEnter);
      anchor.removeEventListener("focusin", handleFocusIn);
      anchor.removeEventListener("pointerleave", handleLeave);
      anchor.removeEventListener("focusout", handleFocusOut);
    };
  }, [measure, onReset]);

  // While the tip is up, keep it under its anchor as the page moves.
  useEffect(() => {
    if (!isShown) return undefined;
    measure();
    const options = { capture: true, passive: true } as const;
    window.addEventListener("resize", measure, options);
    window.addEventListener("scroll", measure, options);
    return () => {
      window.removeEventListener("resize", measure, options);
      window.removeEventListener("scroll", measure, options);
    };
  }, [isShown, measure]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isDismissed || !isShown) return;
      // Capture phase: the tip takes this Escape, so a dialog around it stays open.
      event.stopPropagation();
      event.preventDefault();
      onDismiss();
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [isDismissed, isShown, onDismiss]);

  const stateClass = [
    isPinned ? styles.tipPinned : "",
    isDismissed ? styles.tipDismissed : "",
    isShownOnFocus ? "" : styles.tipHoverOnly,
  ].join(" ");
  return (
    <div
      ref={tipRef}
      id={id}
      role="tooltip"
      className={`${styles.tip} ${stateClass}`}
    >
      {children}
    </div>
  );
}
