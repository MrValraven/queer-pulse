import { useEffect, useRef } from "react";
import {
  NavigationType,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { scrollBus } from "./scrollBus";
import { paneScrollRegistry } from "./paneScrollRegistry";
import { tabOf } from "../shared/components/layout/tabRoots";
import { routes } from "./routeMap";
import { isScrollLocked } from "../shared/hooks/useScrollLock";
import {
  isSameRouteQueryChange,
  scrollKeyForPath,
  type ScrollRouteLocation,
} from "./scrollRouting";

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
 * How many entries the map keeps. Each navigation adds one `location.key`, and
 * keys already popped past can never be restored to, so without a cap a long
 * PWA session grows this forever and holds stale offsets for entries that are
 * unreachable. A hundred is far more history than any Back gesture walks.
 */
const MAX_REMEMBERED_POSITIONS = 100;

/**
 * Record an offset, evicting the oldest entries once the map is full. `Map`
 * iterates in insertion order and `set` on an existing key keeps its original
 * position, so re-recording the CURRENT route (which happens on every scroll
 * event) never refreshes its place in the queue — delete first so the entry
 * being actively written is always the youngest and can never be evicted while
 * the member is still on it.
 */
function rememberPosition(key: string, offset: number): void {
  scrollPositions.delete(key);
  scrollPositions.set(key, offset);
  while (scrollPositions.size > MAX_REMEMBERED_POSITIONS) {
    const oldest = scrollPositions.keys().next();
    if (oldest.done) break;
    scrollPositions.delete(oldest.value);
  }
}

export function ScrollManager() {
  const { pathname, search, hash, key } = useLocation();
  const navigationType = useNavigationType();
  // What the PREVIOUS navigation landed on, so the effect below can tell a real
  // page change from the same page re-stating its query string. Null until the
  // first navigation completes, which keeps the initial load resetting to top.
  const previousRouteRef = useRef<ScrollRouteLocation | null>(null);

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
      rememberPosition(scrollMapKey, window.scrollY);
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
    const previousRoute = previousRouteRef.current;
    previousRouteRef.current = { pathname, search };

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

    // In-page anchor links (e.g. "/#discovery") always win — jump to the target.
    // Gliding to it is only right when the visitor is ALREADY on that page and
    // asked to travel down it (a jump-link in the page or its nav). Arriving
    // with a hash from a DIFFERENT page is a page change like any other, so it
    // lands instantly rather than animating the whole new page past them.
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        const isSamePage = previousRoute?.pathname === pathname;
        target.scrollIntoView({
          behavior: isSamePage ? "smooth" : "instant",
          block: "start",
        });
        return;
      }
    }

    // Back/forward: restore where the visitor left this entry, instantly.
    // `behavior: "instant"`, not "auto": the "auto" value defers to the global
    // `html { scroll-behavior: smooth }` (base.css), which would ANIMATE the
    // restore — a visible glide from the top down to the saved offset on every
    // Back. Forcing "instant" overrides that CSS so the landing is immediate.
    if (navigationType === NavigationType.Pop) {
      const savedPosition = scrollPositions.get(
        scrollKeyForPath(pathname, key),
      );
      if (savedPosition !== undefined) {
        window.scrollTo({ top: savedPosition, behavior: "instant" });
        return;
      }
    }

    // Re-filtering the page you are already on (List/Map, a category chip, a
    // sort, a keystroke in a search field) only rewrites the query string. Leave
    // the visitor exactly where they were reading. See isSameRouteQueryChange.
    if (isSameRouteQueryChange(previousRoute, { pathname, search })) return;

    // A fresh navigation with no hash target — including opening a bottom tab
    // (PUSH or tab-switch) — starts at the top. We intentionally do NOT resume
    // the tab's last offset here: on a tall page (e.g. `/events`, whose hero is
    // ~80svh) that silently scrolled visitors into the middle of the page.
    // Only browser Back/forward (POP, handled above) restores a prior offset.
    //
    // `behavior: "instant"`, not "auto" (which would defer to the global
    // `html { scroll-behavior: smooth }` in base.css): a page change must land
    // at the top immediately. Animating it scrolled the OUTGOING page's full
    // height past the visitor — from the bottom of a long list like the
    // listings directory to a profile, that is a long, disorienting glide, and
    // any tap during it (a nav item, the new page's own controls) fought the
    // running animation. Only the deliberate tap-the-active-tab gesture, where
    // you stay on the page you are looking at, still glides.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search, hash, key, navigationType]);

  return null;
}
