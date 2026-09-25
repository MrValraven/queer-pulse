import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getThreads } from "../api/forum.api";
import { THREADS } from "../forum.data";

// ── Recent titles per category, for the category grid's popover ────────────
// Split out of `ComposeCategoryGrid`, which only reads the map.

/** How many titles the popover shows per category. */
const RECENT_TITLES_PER_CATEGORY = 2;

/** A thread reduced to the two fields the popover reads. */
interface RecentThread {
  title: string;
  category: string;
}

/**
 * Two recent titles per category, fetched ONCE for the whole grid.
 *
 * One `new`-sorted page covers every category, so this is a single request
 * rather than one per card on hover. It lives under its own query key, never
 * `["forum-threads", …]`, which the publish mutation invalidates: a decorative
 * popover must not make publishing refetch the forum list behind the composer.
 *
 * Demo mode reads the same `THREADS` corpus the forum list renders, so the
 * prototype still shows real titles with no API.
 */
export function useCategoryRecentTitles(): Map<string, string[]> {
  const { demoMode } = useDemoMode();
  const query = useQuery<RecentThread[]>({
    queryKey: ["forum-compose-category-recents", demoMode],
    queryFn: async () => {
      if (demoMode)
        return THREADS.map((thread) => ({
          title: thread.title,
          category: thread.category,
        }));
      const page = await getThreads(undefined, undefined, { sort: "new" });
      return page.data.map((dto) => ({
        title: dto.title,
        category: dto.category,
      }));
    },
  });

  return useMemo(() => {
    const byCategory = new Map<string, string[]>();
    for (const thread of query.data ?? []) {
      const titles = byCategory.get(thread.category) ?? [];
      if (titles.length >= RECENT_TITLES_PER_CATEGORY) continue;
      titles.push(thread.title);
      byCategory.set(thread.category, titles);
    }
    return byCategory;
  }, [query.data]);
}
