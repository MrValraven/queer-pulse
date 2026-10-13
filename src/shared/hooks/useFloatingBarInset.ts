import { useCallback, useEffect, useRef } from "react";

export const FLOATING_BAR_INSET_PROPERTY = "--floating-bar-inset";

/**
 * Publishes how much of the viewport bottom a floating action bar covers, from
 * its top edge down, as --floating-bar-inset on the root. base.css turns that
 * into the root's `scroll-padding-bottom`, so tabbing and `scrollIntoView`
 * keep their target above the bar.
 *
 * A bar appears the moment a member changes something, often right over the
 * control they just used, so on mount the focused element is scrolled clear
 * of it too. Returns the ref callback for the bar element; the property is
 * removed when the bar unmounts.
 */
export function useFloatingBarInset() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const barRef = useCallback((bar: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    const style = document.documentElement.style;
    if (!bar) {
      style.removeProperty(FLOATING_BAR_INSET_PROPERTY);
      return;
    }
    const publish = () =>
      style.setProperty(
        FLOATING_BAR_INSET_PROPERTY,
        `${Math.max(0, window.innerHeight - bar.getBoundingClientRect().top)}px`,
      );
    publish();

    // A frame later, so the browser's own scroll that keeps a typing caret in
    // view has already run. A text field jumps rather than glides: the next
    // keystroke's caret scroll would cancel a smooth one halfway.
    const frame = requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (!(focused instanceof HTMLElement) || focused === document.body)
        return;
      const barTop = bar.getBoundingClientRect().top;
      if (focused.getBoundingClientRect().bottom <= barTop) return;
      const isTextField =
        focused.isContentEditable || focused.matches("input, textarea");
      focused.scrollIntoView({
        block: "nearest",
        behavior: isTextField ? "instant" : "smooth",
      });
    });

    window.addEventListener("resize", publish);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(publish);
    observer?.observe(bar);
    cleanupRef.current = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", publish);
      observer?.disconnect();
    };
  }, []);

  useEffect(
    () => () => {
      cleanupRef.current?.();
      document.documentElement.style.removeProperty(
        FLOATING_BAR_INSET_PROPERTY,
      );
    },
    [],
  );

  return barRef;
}
