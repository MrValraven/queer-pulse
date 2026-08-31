import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { gatheringDetails } from "../data";
import { getEvents } from "./events.api";

export interface EventMentionOption {
  /** Backend/demo slug — `e/` mentions link via `gatheringPath(slug)`, and the
   *  backend resolves by slug. */
  slug: string;
  name: string;
}

/**
 * `e/event` mention-typeahead corpus, dual-mode. Used only by
 * `useMentionSuggestions` — not any gatherings page.
 *
 * Demo mode reads `gatheringDetails` (`../data.ts`), the raw
 * `Record<slug, GatheringDetail>` registry that backs `/gatherings/:slug`
 * pages — unlike `CalendarEvent` (used by the calendar grid), each
 * `GatheringDetail` carries its own `slug` alongside `title`, so no
 * unsafe/untyped field access is needed. Live mode calls `GET /events` and
 * maps `EventCardDTO` directly (NOT via `cardToCalendarEvent`, which drops
 * the slug). Never calls the live API in demo mode.
 */
export function useEventMentionOptionsQuery() {
  const { demoMode } = useDemoMode();
  const query = useQuery<EventMentionOption[]>({
    queryKey: ["event-mention-options", demoMode],
    queryFn: async () => {
      if (demoMode) {
        return Object.values(gatheringDetails).map((gathering) => ({
          slug: gathering.slug,
          name: gathering.title,
        }));
      }
      const page = await getEvents();
      return page.items.map((dto) => ({ slug: dto.slug, name: dto.title }));
    },
  });
  return {
    options: query.data ?? [],
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** The event mention corpus on its own, for `useMentionSuggestions`. A failed corpus
 *  fetch degrades to an empty typeahead rather than an error panel inside a
 *  dropdown; callers that need the failure read `useEventMentionOptionsQuery`. */
export function useEventMentionOptions(): EventMentionOption[] {
  return useEventMentionOptionsQuery().options;
}
