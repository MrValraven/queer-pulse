import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** The in-app "Reduce motion" preference, stamped on <html> by AccessibilityProvider. */
function inAppReduceMotion(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.reduceMotion === "true"
  );
}

/**
 * One-shot read of the same two signals `usePrefersReducedMotion` subscribes to.
 *
 * For imperative code that runs once and is gone — a scroll call inside a submit
 * handler, say — where subscribing to changes is meaningless. Components that
 * render differently under reduced motion must still use the hook, or they won't
 * re-render when the user flips the toggle.
 */
export function prefersReducedMotionNow(): boolean {
  return (
    (typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(QUERY).matches) ||
    inAppReduceMotion()
  );
}

/**
 * True when the user has requested reduced motion — either via the OS
 * `prefers-reduced-motion` setting or the in-app "Reduce motion" toggle
 * (AccessibilityProvider reflects the latter onto <html data-reduce-motion>).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(prefersReducedMotionNow);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const recompute = () =>
      setPrefersReduced(mediaQuery.matches || inAppReduceMotion());
    // Sync once on mount: the provider may set the attribute in a layout effect
    // after this consumer's first render.
    recompute();
    mediaQuery.addEventListener("change", recompute);
    // Watch the in-app toggle: the attribute changes when the user flips it.
    const observer = new MutationObserver(recompute);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-reduce-motion"],
    });
    return () => {
      mediaQuery.removeEventListener("change", recompute);
      observer.disconnect();
    };
  }, []);

  return prefersReduced;
}
