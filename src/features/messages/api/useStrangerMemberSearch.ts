import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import { useDebouncedValue } from "../../../shared/hooks";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import { searchApi } from "../../members/api/search.api";
import { SEARCH_DATA } from "../../members/search.data";

/** Least query length that fans out — mirrors `useMessageSearch`'s own floor. */
export const STRANGER_SEARCH_MIN_LENGTH = 2;

export interface StrangerMemberResult {
  slug: string;
  name: string;
  sub: string;
  avatarUrl?: string;
  initials: string;
  tint: AvatarTint;
}

/** Splits a full name into initials the same way the rest of the messages
 *  feature does (`messages.adapters.ts`'s `splitName` + `initialsOf`). */
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts.at(-1)! : "";
  return initialsOf(first, last);
}

/**
 * Broader member search for `NewMessageModal`'s fall-through: unlike the
 * modal's primary People list (accepted connections only, via
 * `useConnectionsList`), this reaches every member on the platform — the
 * source a "message a stranger" entry point needs. Live mode calls the
 * shared cross-entity search scoped to members (`GET /search?type=member`,
 * the same endpoint the ⌘K palette uses); demo mode filters the identical
 * mock member corpus (`search.data.ts`) locally. `excludeSlugs` drops a
 * member already offered in the People section (or the signed-in member
 * themself) so nobody appears twice with two different actions.
 */
export function useStrangerMemberSearch(
  query: string,
  excludeSlugs: ReadonlySet<string>,
): {
  results: StrangerMemberResult[];
  loading: boolean;
  /** True when the live lookup failed. A typeahead fails quietly, but the flag
   *  is surfaced so a caller never reads "nobody by that name" off an outage
   *  (DES-22). */
  isError: boolean;
} {
  const { demoMode } = useDemoMode();
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, 200);
  const enabled = debounced.length >= STRANGER_SEARCH_MIN_LENGTH;

  const liveQuery = useQuery({
    queryKey: ["strangerMemberSearch", debounced, demoMode],
    enabled: enabled && !demoMode,
    queryFn: ({ signal }) => searchApi(debounced, "member", signal),
  });

  const demoResults = useMemo<StrangerMemberResult[]>(() => {
    if (!demoMode || !enabled) return [];
    const needle = debounced.toLowerCase();
    const results: StrangerMemberResult[] = [];
    for (const item of SEARCH_DATA) {
      if (item.t !== "member" || !item.slug) continue;
      if (!`${item.name} ${item.sub}`.toLowerCase().includes(needle)) continue;
      results.push({
        slug: item.slug,
        name: item.name,
        sub: item.sub,
        avatarUrl: item.avatarUrl,
        initials: initialsFor(item.name),
        tint: tintForSlug(item.slug),
      });
    }
    return results;
  }, [demoMode, enabled, debounced]);

  const liveResults = useMemo<StrangerMemberResult[]>(
    () =>
      (liveQuery.data?.results ?? [])
        .filter((result) => result.type === "member")
        .map((result) => ({
          slug: result.slug,
          name: result.name,
          sub: result.sub,
          avatarUrl: result.avatarUrl ?? undefined,
          initials: initialsFor(result.name),
          tint: tintForSlug(result.slug),
        })),
    [liveQuery.data],
  );

  const results = demoMode ? demoResults : liveResults;
  return {
    results: results.filter((result) => !excludeSlugs.has(result.slug)),
    loading: enabled && !demoMode && liveQuery.isFetching,
    isError: enabled && !demoMode && liveQuery.isError,
  };
}
