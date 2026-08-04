/**
 * Shared tab-root matching, extracted out of `bottomTabs.ts` consumers that
 * need to know "which installed tab owns this pathname" without caring about
 * tab metadata (label/icon/href) — e.g. `NavDirectionProvider` (push vs.
 * tab-switch classification) and, later, `ScrollManager` (per-tab scroll
 * restoration).
 */
import { MEMBER_TABS, PUBLIC_TABS } from "./bottomTabs";

/** Every path prefix that lights up some installed tab, member or public. */
export const TAB_PREFIXES: string[] = [...MEMBER_TABS, ...PUBLIC_TABS].flatMap(
  (tab) => tab.matchPrefixes,
);

/**
 * Which tab-root prefix (if any) owns a pathname — longest match wins, and
 * matching is segment-aware (`/members` matches `/members/123` but never
 * `/members-only`).
 */
export function tabOf(pathname: string): string | null {
  let match: string | null = null;
  let length = 0;
  for (const prefix of TAB_PREFIXES) {
    const hit = pathname === prefix || pathname.startsWith(`${prefix}/`);
    if (hit && prefix.length > length) {
      match = prefix;
      length = prefix.length;
    }
  }
  return match;
}
