import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { FEATURED_TOPIC_TAGS, TOPICS } from "../topics.data";
import { getTopics, type TopicResponse } from "./topics.api";

/**
 * Human label for each demo topic tag. `Topic.title`/`.sub` are JSX (authored
 * for `TopicPage`'s serif heading), not the plain string `TopicResponse.label`
 * needs, so labels are hand-written here rather than adapted from the JSX.
 * Any tag added to `TOPICS` without an entry here falls back to a
 * capitalize-first-letter rendering of the raw tag.
 */
const DEMO_TOPIC_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  trans: "Trans",
  mentalhealth: "Mental health",
  housing: "Housing",
  nightlife: "Nightlife",
};

function labelForTag(tag: string): string {
  return DEMO_TOPIC_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}

/**
 * The full topic directory, dual-mode. Used by mention-suggestion sources
 * (`useMentionSuggestions`) rather than any topic page — pages are always
 * deep-linked by tag and use `useTopic`/the `topics.data` mock directly.
 *
 * Demo mode synthesizes a `TopicResponse[]` corpus from the demo topic
 * registry (`topics.data.tsx`'s `TOPICS`/`FEATURED_TOPIC_TAGS`) — only `tag`
 * and `totalPosts` are usable from `Topic` (`title`/`sub` are JSX), so
 * `label` comes from `DEMO_TOPIC_LABELS` above and `description` is left
 * blank. Live mode calls `GET /topics`. Never calls the live API in demo mode.
 */
export interface TopicsResult {
  items: TopicResponse[];
  isLoading: boolean;
  /** True when the request failed, so a caller can say so instead of
   *  rendering "no topics yet" over an outage (DES-22). */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

export function useTopics(): TopicsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<TopicResponse[]>({
    queryKey: ["topics", demoMode],
    queryFn: async () => {
      if (demoMode) {
        return FEATURED_TOPIC_TAGS.map((tag) => ({
          tag,
          label: labelForTag(tag),
          description: "",
          totalPosts: TOPICS[tag]!.totalPosts,
        }));
      }
      return getTopics();
    },
  });
  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
