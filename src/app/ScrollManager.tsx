import { useEffect } from "react";
import { NavigationType, useLocation, useNavigationType } from "react-router-dom";
import { scrollBus } from "./scrollBus";
import { paneScrollRegistry } from "./paneScrollRegistry";
import { tabOf } from "../shared/components/layout/tabRoots";
import { routes } from "./routeMap";
import { isScrollLocked } from "../shared/hooks/useScrollLock";

/**
 * A `fullHeight` AppShell route (`<AppShell fullHeight>`) scrolls its content
 * inside its OWN pane, not the window — today that is only Messages. For those
 * routes the window never moves, so every `window.scrollY` read is ~0 and every
 * `window.scrollTo` is a no-op that only risks the window's remembered offset
 * fighting the pane. We therefore skip all window-scroll work for them.
 *
 * We key off the path rather than the ShellFrameProvider registry because
 * ScrollManager is mounted ABOVE that provider in App.tsx (it must own scroll
 * restoration before the shells exist), so it can't read the registry via
 * context. The pane's own scroll (per-navigation restore/reset + tap-to-top) is
 * driven through `paneScrollRegistry`: the Messages pane registers its scroll
 * container there, and the effects below hand it the same reset/restore/
 * tap-to-top signals they apply to the window on every other route.
 */
function isInternallyScrolledPath(pathname: string): boolean {
  return tabOf(pathname) === routes.messages;
}

/**
 * Scroll behaviour across navigations:
 *
 * - **PUSH / REPLACE / tab-switch** (any fresh navigation — clicking a link,
 *   submitting, tapping a bottom tab) start at the top of the new page,
 *   honouring an in-page `#hash` target when present. Opening a tab always
 *   lands at the top; it does NOT resume where you last left that tab (that
 *   silently dumped visitors into the middle of a tall page like `/events`).
 * - **POP** (browser back/forward) restore the exact scroll position the visitor
 *   left that history entry at, so a list → detail → back loop lands them right
 *   where they were instead of jumping to the top.
 *
 * Positions are keyed by `scrollKeyForPath`: a path that IS a tab root itself
 * (e.g. `/members`) keys on that root, shared across every visit to the tab —
 * so a Back from a detail page one level under it (e.g. `/members/42` → Back)
 * restores the tab's last offset. That child page is NOT collapsed into the
 * root's slot — it keeps its own react-router `location.key`, so a detail
 * page's scroll never clobbers the tab root's remembered offset. Pages outside
 * any tab likewise keep their per-entry `location.key`. We also take over the
 * browser's native
 * scroll restoration (`history.scrollRestoration = "manual"`) so it can't
 * fight this logic. Reduced-motion visitors never get a smooth animation;
 * restores are always instant so back/tab-switch feels immediate and lands
 * precisely.
 */
const scrollPositions = new Map<string, number>();

/**
 * The scroll-map key for a pathname: the tab-root key ONLY when `pathname` IS
 * a tab root itself (so a Back navigation onto the tab restores its remembered
 * offset), else the per-history-entry key. A detail page one level under a tab
 * root (e.g. `/members/42`) must keep its own `historyKey` — collapsing it into
 * the tab root's slot would let it clobber the root's remembered offset.
 */
export function scrollKeyForPath(pathname: string, historyKey: string): string {
  return tabOf(pathname) === pathname ? pathname : historyKey;
}

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
    // The window isn't this route's scroll container — recording window.scrollY
    // would just stamp ~0 over its slot. The pane's registered container records
    // its OWN offset via paneScrollRegistry instead (see isInternallyScrolledPath).
    if (isInternallyScrolledPath(pathname)) return;
    const scrollMapKey = scrollKeyForPath(pathname, key);
    const recordPosition = () => {
      // While a modal/sheet holds the body-scroll lock the body is pinned
      // `position: fixed` and the window sits at scrollY 0. Recording that would
      // clobber this entry's real offset with 0, and the sheet's closing
      // `history.back()` (a POP) would then restore the page to the top. Skip
      // until the lock releases (which restores the true offset first).
      if (isScrollLocked()) return;
      scrollPositions.set(scrollMapKey, window.scrollY);
    };
    window.addEventListener("scroll", recordPosition, { passive: true });
    return () => {
      recordPosition();
      window.removeEventListener("scroll", recordPosition);
    };
  }, [pathname, key]);

  // "Tap the active tab" signal: scroll the window to top, honouring
  // reduced-motion. Pages that also want tap-to-refresh subscribe to the same
  // bus themselves and call their own refetch (see scrollBus.ts).
  useEffect(() => {
    return scrollBus.onScrollToTop(() => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      // On an internally-scrolled route the window can't scroll to top — scroll
      // the pane's registered container instead (see paneScrollRegistry). Don't
      // swallow the tap with a no-op window.scrollTo. (Re-subscribed per path so
      // this stays current; Set add/remove is negligible.)
      if (isInternallyScrolledPath(pathname)) {
        paneScrollRegistry.scrollToTop(!prefersReduced);
        return;
      }
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }, [pathname]);

  useEffect(() => {
    // The window isn't this route's scroller — don't drive window.scrollTo (top,
    // pop-restore, or tab-restore) or it fights the pane. Hand the same intent
    // to the pane's registered scroll container instead: POP restores the
    // remembered offset, any fresh navigation resets it to the top. Applied now
    // if the pane is already mounted, else stashed until its container registers
    // (its register effect runs after this one on entry). Keyed identically to
    // the window map so a tab-root Back restores the tab's own offset.
    if (isInternallyScrolledPath(pathname)) {
      paneScrollRegistry.onNavigate(
        scrollKeyForPath(pathname, key),
        navigationType === NavigationType.Pop ? "restore" : "reset",
      );
      return;
    }

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
    // `behavior: "instant"`, not "auto": the "auto" value defers to the global
    // `html { scroll-behavior: smooth }` (base.css), which would ANIMATE the
    // restore — a visible glide from the top down to the saved offset on every
    // Back. Forcing "instant" overrides that CSS so the landing is immediate.
    if (navigationType === NavigationType.Pop) {
      const savedPosition = scrollPositions.get(scrollKeyForPath(pathname, key));
      if (savedPosition !== undefined) {
        window.scrollTo({ top: savedPosition, behavior: "instant" });
        return;
      }
    }

    // A fresh navigation with no hash target — including opening a bottom tab
    // (PUSH or tab-switch) — starts at the top. We intentionally do NOT resume
    // the tab's last offset here: on a tall page (e.g. `/events`, whose hero is
    // ~80svh) that silently scrolled visitors into the middle of the page.
    // Only browser Back/forward (POP, handled above) restores a prior offset.
    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash, key, navigationType]);

  return null;
}
