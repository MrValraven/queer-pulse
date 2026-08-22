/**
 * A short tail of the in-app history stack, so a page can answer "where did
 * this visitor come from?" — something react-router itself never exposes
 * (`useLocation` only ever describes the entry you are on, and the browser's
 * real stack is opaque to script).
 *
 * Kept as a pure reducer here, driven by `NavHistoryProvider`, so the stack
 * bookkeeping is unit-testable in isolation the way `classifyNavDirection`
 * (NavDirectionProvider) and `scrollKeyForPath` (ScrollManager) are.
 */

/** One visited history entry. `key` is react-router's per-entry `location.key`. */
export interface NavEntry {
  pathname: string;
  search: string;
  key: string;
}

export type NavStack = readonly NavEntry[];

/**
 * How many entries the tail keeps. Only the previous entry is ever read, but
 * POP truncates back to a remembered key, so a few spare entries let a couple
 * of Back presses in a row still resolve rather than resetting the stack.
 * Small enough to stay negligible for a long PWA session.
 */
const MAX_TRACKED_ENTRIES = 12;

/**
 * Fold one navigation into the stack.
 *
 * - **PUSH** appends (the older tail is trimmed to `MAX_TRACKED_ENTRIES`).
 * - **REPLACE** swaps the top in place — a `navigate(to, { replace: true })`
 *   supersedes the current entry rather than stacking on it.
 * - **POP** truncates back to the entry being returned to. If that key isn't in
 *   our tail (a forward-pop, a jump several entries back, or a restored session
 *   whose stack predates this page load) we can no longer know what came
 *   before, so the stack resets to just this entry and callers correctly fall
 *   back to their default.
 *
 * Re-folding the entry already on top is a no-op, which keeps the provider's
 * render-time update idempotent under StrictMode's double render.
 */
export function foldNavigation(
  stack: NavStack,
  entry: NavEntry,
  navigationType: "PUSH" | "POP" | "REPLACE",
): NavStack {
  const top = stack[stack.length - 1];
  if (top?.key === entry.key) return stack;

  if (navigationType === "REPLACE") {
    return [...stack.slice(0, -1), entry];
  }

  if (navigationType === "POP") {
    const index = stack.findIndex((visited) => visited.key === entry.key);
    return index === -1 ? [entry] : stack.slice(0, index + 1);
  }

  return [...stack, entry].slice(-MAX_TRACKED_ENTRIES);
}

/** The entry visited immediately before the current one, if we still hold it. */
export function previousNavEntry(stack: NavStack): NavEntry | null {
  return stack[stack.length - 2] ?? null;
}
