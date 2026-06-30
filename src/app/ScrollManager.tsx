import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the hash target on navigation, or to the top when there is no hash.
 * Keeps in-page anchor links (e.g. "/#discovery") working across routes.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";

    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior, block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash]);

  return null;
}
