import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { THREADS, type Thread } from "../forum.data";
import { getThread, getThreadPosts, getThreads } from "./forum.api";
import { slugForThreadId, threadDetail, threadToCard } from "./forum.adapters";

/**
 * Thread list. Demo mode returns the full `THREADS` mock (the ForumPage keeps
 * doing its own client-side category/sort split, so demo is byte-identical);
 * live mode calls GET /forum/threads?category= and adapts each card. `queryKey`
 * includes `demoMode` so caches never cross the boundary.
 */
export function useThreads(category: string) {
  const { demoMode } = useDemoMode();
  return useQuery<Thread[]>({
    queryKey: ["forum-threads", demoMode, category],
    queryFn: async () => {
      if (demoMode) return THREADS;
      const res = await getThreads(category);
      return res.data.map(threadToCard);
    },
  });
}

/**
 * A single thread with its posts. Demo returns the scripted mock; live fetches
 * the thread meta + first posts page and merges them into the `Thread` detail
 * view-model. Live resolution needs the backend slug, which the list step
 * remembers by numeric id — so deep-linking a thread the list hasn't produced
 * yet returns undefined (loading/empty), a documented prototype limitation.
 */
export function useThread(id: number) {
  const { demoMode } = useDemoMode();
  const slug = demoMode ? undefined : slugForThreadId(id);
  return useQuery<Thread | undefined>({
    queryKey: ["forum-thread", demoMode, id],
    enabled: demoMode || !!slug,
    queryFn: async () => {
      if (demoMode) return THREADS.find((t) => t.id === id) ?? THREADS[0];
      if (!slug) return undefined;
      const [meta, posts] = await Promise.all([
        getThread(slug),
        getThreadPosts(slug),
      ]);
      return threadDetail(meta, posts.data);
    },
  });
}
