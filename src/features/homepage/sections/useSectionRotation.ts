import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from "react";

/** How long each persona stays on screen before the showcase advances. */
export const PERSONA_ROTATION_INTERVAL_MS = 20_000;

/**
 * How long one "we built this" step holds the card. Longer than the persona
 * beat: the step plays a four-message conversation, which takes longer to read
 * than a persona card.
 */
export const BUILT_STEP_ROTATION_INTERVAL_MS = 22_000;

/** Fraction of the section that must be on screen for rotation to run. */
const VISIBILITY_THRESHOLD = 0.3;

type SectionRotationOptions<Key> = {
  /** Cycle order; rotation advances from the selected key and wraps around. */
  order: readonly Key[];
  selectedKey: Key;
  /** Called with the next key each time the timer fires. */
  onRotate: (key: Key) => void;
  /** Once true, rotation is over for the life of the page (the reader chose). */
  isStopped: boolean;
  /** False disables rotation entirely, e.g. under reduced motion. */
  isEnabled: boolean;
  /** How long each entry holds before the timer advances. */
  intervalMs?: number;
};

/**
 * Advances a homepage section's selection on a timer until the reader takes
 * over. Used by the personas showcase and by the "we built this" card.
 *
 * The timer only runs while the section is actually on screen and nobody is
 * hovering or keyboard-focused inside it, so the selection never swaps out
 * from under someone mid-read. Any interaction sets `isStopped` upstream and
 * rotation never resumes.
 *
 * Returns the ref to put on the section element plus the pause handlers to
 * spread onto it.
 */
export function useSectionRotation<Key>({
  order,
  selectedKey,
  onRotate,
  isStopped,
  isEnabled,
  intervalMs = PERSONA_ROTATION_INTERVAL_MS,
}: SectionRotationOptions<Key>) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isFocusInside, setIsFocusInside] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  // Kept in a ref so a new callback identity on every render does not restart
  // the interval (which would keep it from ever firing).
  const onRotateRef = useRef(onRotate);
  useEffect(() => {
    onRotateRef.current = onRotate;
  }, [onRotate]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setIsSectionVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry?.isIntersecting ?? false);
      },
      { threshold: VISIBILITY_THRESHOLD },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  const isRunning =
    isEnabled &&
    !isStopped &&
    isSectionVisible &&
    !isPointerInside &&
    !isFocusInside;

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      const currentIndex = order.indexOf(selectedKey);
      const nextKey = order[(currentIndex + 1) % order.length];
      if (nextKey !== undefined) onRotateRef.current(nextKey);
    }, intervalMs);
    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning, intervalMs, order, selectedKey]);

  // Touch pointers are ignored: a tap fires pointerenter with no matching
  // leave, which would pause rotation permanently on a phone.
  const onPointerEnter = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    setIsPointerInside(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setIsPointerInside(false);
  }, []);

  const onFocusCapture = useCallback(() => {
    setIsFocusInside(true);
  }, []);

  const onBlurCapture = useCallback((event: FocusEvent<HTMLElement>) => {
    // Focus moving between two controls inside the section stays "inside".
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsFocusInside(false);
  }, []);

  return {
    sectionRef,
    pauseHandlers: {
      onPointerEnter,
      onPointerLeave,
      onFocusCapture,
      onBlurCapture,
    },
  };
}
