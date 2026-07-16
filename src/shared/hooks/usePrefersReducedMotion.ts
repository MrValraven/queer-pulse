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
 * True when the user has requested reduced motion — either via the OS
 * `prefers-reduced-motion` setting or the in-app "Reduce motion" toggle
 * (AccessibilityProvider reflects the latter onto <html data-reduce-motion>).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () =>
      (typeof window !== "undefined" && window.matchMedia(QUERY).matches) ||
      inAppReduceMotion(),
  );

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
