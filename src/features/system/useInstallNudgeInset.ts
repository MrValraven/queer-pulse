import { useCallback, useEffect, useRef } from "react";

export const INSTALL_NUDGE_INSET_PROPERTY = "--install-nudge-inset";

/**
 * Publishes how much of the viewport bottom the install nudge covers, from its
 * top edge down, as --install-nudge-inset on the root. Other fixed bottom
 * cards (the push recovery banner) add it to their own offset so they stack
 * above the nudge instead of overlapping it. The height comes from layout
 * (offsetHeight plus the computed bottom offset), so the nudge's entrance
 * animation does not skew it. Returns the ref callback for the nudge element;
 * the property is removed when the nudge unmounts.
 */
export function useInstallNudgeInset() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const nudgeRef = useCallback((nudge: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    const style = document.documentElement.style;
    if (!nudge) {
      style.removeProperty(INSTALL_NUDGE_INSET_PROPERTY);
      return;
    }
    const publish = () => {
      const bottomOffset = parseFloat(getComputedStyle(nudge).bottom) || 0;
      style.setProperty(
        INSTALL_NUDGE_INSET_PROPERTY,
        `${Math.round(nudge.offsetHeight + bottomOffset)}px`,
      );
    };
    publish();
    window.addEventListener("resize", publish);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(publish);
    observer?.observe(nudge);
    cleanupRef.current = () => {
      window.removeEventListener("resize", publish);
      observer?.disconnect();
    };
  }, []);

  useEffect(
    () => () => {
      cleanupRef.current?.();
      document.documentElement.style.removeProperty(
        INSTALL_NUDGE_INSET_PROPERTY,
      );
    },
    [],
  );

  return nudgeRef;
}
