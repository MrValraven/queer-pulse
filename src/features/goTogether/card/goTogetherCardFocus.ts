import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";
import { GO_TOGETHER_CARD_ANCHOR } from "./goTogetherCard.data";

/**
 * Focus handling for the card's state changes. Most actions swap the panel
 * that holds the pressed button, which would drop focus to the page body.
 * Instead focus moves to the card heading (it stays mounted across states),
 * to the first control of a newly opened form, or back to the button that
 * opened a form once it closes.
 */

/** Focus without the browser's own jump, then scroll only as far as needed:
 *  smoothly, or instantly for members who prefer reduced motion. */
export function moveFocusTo(element: HTMLElement | null | undefined) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({
    block: "nearest",
    behavior: prefersReducedMotionNow() ? "auto" : "smooth",
  });
}

/** The first control a keyboard member would reach in a newly shown form:
 *  the tabbable radio of the first group, else the first enabled control. */
export function focusFirstControlIn(container: HTMLElement | null) {
  if (!container) return;
  const firstControl =
    container.querySelector<HTMLElement>('[role="radio"][tabindex="0"]') ??
    container.querySelector<HTMLElement>(
      "input:not([disabled]), button:not([disabled])",
    );
  moveFocusTo(firstControl);
}

const NO_OP = () => {};

/** Heading focus, provided by `GoTogetherCard`. `now` moves focus at once.
 *  `afterStateChange` waits for the card's next state and moves focus only
 *  if the swap dropped it to the page body (a refetch that replaced the
 *  panel under the pressed button). */
export interface HeadingFocusControls {
  now: () => void;
  afterStateChange: () => void;
}

export const GoTogetherHeadingFocusContext =
  createContext<HeadingFocusControls>({
    now: NO_OP,
    afterStateChange: NO_OP,
  });

export function useFocusCardHeading(): () => void {
  return useContext(GoTogetherHeadingFocusContext).now;
}

export function useFocusHeadingAfterStateChange(): () => void {
  return useContext(GoTogetherHeadingFocusContext).afterStateChange;
}

/**
 * The card's side of `afterStateChange`: a request is held until the card
 * state changes, then honoured only when focus was lost to the page body.
 */
export function useHeadingFocusControls(
  cardState: string | undefined,
  focusHeading: () => void,
): HeadingFocusControls {
  const isFocusRequestedRef = useRef(false);

  useEffect(() => {
    if (!isFocusRequestedRef.current) return;
    isFocusRequestedRef.current = false;
    const activeElement = document.activeElement;
    if (activeElement === null || activeElement === document.body)
      focusHeading();
  }, [cardState, focusHeading]);

  return useMemo(
    () => ({
      now: focusHeading,
      afterStateChange: () => {
        isFocusRequestedRef.current = true;
      },
    }),
    [focusHeading],
  );
}

/**
 * A form opened from a button inside the card. Closing it (Go back, or a
 * save that keeps the same card state) returns focus to that button once it
 * is back on screen.
 */
export function useFormOpener() {
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const shouldReturnFocusRef = useRef(false);

  useEffect(() => {
    if (isOpen || !shouldReturnFocusRef.current) return;
    shouldReturnFocusRef.current = false;
    moveFocusTo(openerRef.current);
  }, [isOpen]);

  return {
    isOpen,
    openerRef,
    open: () => setIsOpen(true),
    close: () => {
      shouldReturnFocusRef.current = true;
      setIsOpen(false);
    },
  };
}

/**
 * Arriving on the gathering with the card's anchor in the URL (the way back
 * from the questionnaire) brings the card to the top and focuses its heading.
 * The card loads after the page, so the app's own anchor jump finds nothing
 * and this effect does it once the section is on screen. Each navigation is
 * handled once, so later card states never pull the page back up.
 */
export function useArriveAtCardAnchor(
  sectionRef: RefObject<HTMLElement | null>,
  headingRef: RefObject<HTMLElement | null>,
  cardState: string | undefined,
) {
  const { hash, key } = useLocation();
  const handledLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (hash !== `#${GO_TOGETHER_CARD_ANCHOR}`) return;
    if (handledLocationKeyRef.current === key) return;
    const section = sectionRef.current;
    if (!section) return;
    handledLocationKeyRef.current = key;
    headingRef.current?.focus({ preventScroll: true });
    section.scrollIntoView({ block: "start", behavior: "instant" });
  }, [hash, key, cardState, sectionRef, headingRef]);
}
