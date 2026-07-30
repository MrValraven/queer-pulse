import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll behaviour across navigations:
 *
 * - **PUSH / REPLACE** (a fresh navigation — clicking a link, submitting) start
 *   at the top of the new page, honouring an in-page `#hash` target when present.
 * - **POP** (browser back/forward) restore the exact scroll position the visitor
 *   left that history entry at, so a list → detail → back loop lands them right
 *   where they were instead of jumping to the top.
 *
 * Positions are keyed by react-router's per-entry `location.key`, so each history
 * entry keeps its own remembered offset. We also take over the browser's native
 * scroll restoration (`history.scrollRestoration = "manual"`) so it can't fight
 * this logic. Reduced-motion visitors never get a smooth animation; restores are
 * always instant so back feels immediate and lands precisely.
 */
const scrollPositions = new Map<string, number>();

export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // Own scroll restoration ourselves; the browser's guess fights our restore.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // Keep this entry's scroll offset fresh so it's accurate the moment we leave
  // it. The cleanup records the final position when `key` changes (navigation
  // away), and the passive scroll listener keeps it current in between.
  useEffect(() => {
    const recordPosition = () => {
      scrollPositions.set(key, window.scrollY);
    };
    window.addEventListener("scroll", recordPosition, { passive: true });
    return () => {
      recordPosition();
      window.removeEventListener("scroll", recordPosition);
    };
  }, [key]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";

    // In-page anchor links (e.g. "/#discovery") always win — jump to the target.
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior, block: "start" });
        return;
      }
    }

    // Back/forward: restore where the visitor left this entry, instantly.
    if (navigationType === "POP") {
      const savedPosition = scrollPositions.get(key);
      if (savedPosition !== undefined) {
        window.scrollTo({ top: savedPosition, behavior: "auto" });
        return;
      }
    }

    // A fresh navigation with no hash target: start at the top.
    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash, key, navigationType]);

  return null;
}
