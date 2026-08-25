import { tabOf } from "../shared/components/layout/tabRoots";

export interface ScrollRouteLocation {
  pathname: string;
  search: string;
}

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

/**
 * Is this navigation just the SAME page re-stating its own query string?
 *
 * Every filter/tab/view control that lives in the URL (the local directory's
 * List/Map toggle, its category + search + vibe filters, the communities and
 * events tab params, the forum's page state) navigates to mutate its search
 * params, and react-router mints a brand-new `location.key` for each of those:
 * on `replace` exactly as on `push`. Without this check the navigation effect
 * below reads every one of them as a fresh page and glides the window back to
 * the top, so flipping the directory from map to list (or ticking a filter, or
 * typing one more letter into a search box) yanked the visitor away from the
 * rows they were reading.
 *
 * Same pathname + a different query string means the visitor is re-filtering the
 * page they are already on, so their scroll offset must survive it. A changed
 * pathname is a real navigation and still resets to the top.
 */
export function isSameRouteQueryChange(
  previous: ScrollRouteLocation | null,
  next: ScrollRouteLocation,
): boolean {
  if (!previous) return false;
  return previous.pathname === next.pathname && previous.search !== next.search;
}
