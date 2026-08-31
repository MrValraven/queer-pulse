import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { THREADS } from "../forum.data";
import { getThreads } from "./forum.api";

export interface ThreadMentionOption {
  /** Route-param the `t/` mention links via `thread(slug)` → `/thread/:param`.
   *  Live: the backend `ForumThreadResponse.slug`. Demo: `String(id)`, since
   *  demo mock threads have no `slug` and `useThread` resolves them by
   *  numeric id — using the (absent) slug here would 404 the mention link. */
  slug: string;
  name: string;
}

/**
 * `t/thread` mention-typeahead corpus, dual-mode. Used only by
 * `useMentionSuggestions` — not any forum page.
 *
 * Live mode calls `getThreads()` with NO category argument, so the backend
 * returns its default (all/recent, newest-first) rather than a single
 * category's threads — the first cursor page is a sufficient corpus. Demo
 * mode maps the `THREADS` mock, keying by `String(id)` per the slug/id split
 * above. Never calls the live API in demo mode.
 */
export function useThreadMentionOptionsQuery() {
  const { demoMode } = useDemoMode();
  const query = useQuery<ThreadMentionOption[]>({
    queryKey: ["thread-mention-options", demoMode],
    queryFn: async () => {
      if (demoMode) {
        return THREADS.map((thread) => ({
          slug: String(thread.id),
          name: thread.title,
        }));
      }
      const page = await getThreads();
      return page.data.map((dto) => ({ slug: dto.slug, name: dto.title }));
    },
  });
  return {
    options: query.data ?? [],
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** The thread mention corpus on its own, for `useMentionSuggestions`. A failed corpus
 *  fetch degrades to an empty typeahead rather than an error panel inside a
 *  dropdown; callers that need the failure read `useThreadMentionOptionsQuery`. */
export function useThreadMentionOptions(): ThreadMentionOption[] {
  return useThreadMentionOptionsQuery().options;
}
