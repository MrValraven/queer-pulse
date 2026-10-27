import { useLayoutEffect, type RefObject } from "react";

/** Because every admin page renders its own <AdminShell>, switching admin routes
 * unmounts and remounts the sidebar — which would reset the nav's internal
 * scroll to the top on every navigation. We stash the last offset in a
 * module-level variable (it survives the remount) and restore it before paint so
 * the rail stays exactly where the admin left it. */
let lastNavScrollTop = 0;

/** Record the nav's offset as it scrolls, so the next mount can restore it. */
export function rememberNavScroll(scrollTop: number) {
  lastNavScrollTop = scrollTop;
}

/**
 * Keeps the admin rail's internal scroll useful across remounts: restore where
 * the admin left it, then pull the current page's link into view if the restored
 * offset left it outside the visible box.
 *
 * The second part matters because the rail is taller than the viewport once a
 * few sections are open. A fresh session restores to the top, and landing on a
 * page inside a closed section auto-opens it further down the list — either way
 * the link marking "you are here" can sit past the fold.
 *
 * `isActiveSectionOpen` is a dependency rather than the whole open-state map on
 * purpose: expanding an unrelated section must not yank the scroll position out
 * from under the admin who just expanded it.
 */
export function useAdminNavScroll(
  navRef: RefObject<HTMLElement | null>,
  {
    pathname,
    isActiveSectionOpen,
  }: {
    pathname: string;
    isActiveSectionOpen: boolean;
  },
) {
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (nav) nav.scrollTop = lastNavScrollTop;
  }, [navRef]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const activeLink = nav?.querySelector<HTMLElement>(
      "a[aria-current='page']",
    );
    if (!nav || !activeLink) return;

    bringLinkIntoView(nav, activeLink);

    // A section that has just opened grows over its transition, so the rail is
    // still short when this effect measures and the browser clamps the scroll
    // above the link. Once the panel holding the link reaches full height,
    // measure again. Scoped to that panel, so an unrelated section opening
    // later leaves the admin's scroll alone.
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "grid-template-rows") return;
      const panel = event.target;
      if (!(panel instanceof Node) || !panel.contains(activeLink)) return;
      nav.removeEventListener("transitionend", handleTransitionEnd);
      bringLinkIntoView(nav, activeLink);
    };
    nav.addEventListener("transitionend", handleTransitionEnd);
    return () => nav.removeEventListener("transitionend", handleTransitionEnd);
  }, [navRef, pathname, isActiveSectionOpen]);
}

/** Centres `link` in the rail's visible box when it sits outside it. */
function bringLinkIntoView(nav: HTMLElement, link: HTMLElement) {
  const navBox = nav.getBoundingClientRect();
  const linkBox = link.getBoundingClientRect();
  // Zero height means the link is inside a collapsed section: there is nothing
  // to scroll to, and its empty box would compute a nonsense offset.
  if (linkBox.height === 0) return;
  if (linkBox.top >= navBox.top && linkBox.bottom <= navBox.bottom) return;

  // Centre it in the visible box; the browser clamps at both ends.
  nav.scrollTop +=
    linkBox.top - navBox.top - (nav.clientHeight - linkBox.height) / 2;
  lastNavScrollTop = nav.scrollTop;
}
