import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getTopic as getMockTopic, type Topic } from "../topics.data";
import { topicDetailToTopic } from "./topics.adapters";
import { getTopicDetail, getTopicPosts } from "./topics.api";

/**
 * A topic with its post feed, for `TopicPage`. Demo mode returns the
 * existing `getTopic()` mock unchanged — full fidelity (`topVoices`, the
 * curated `resources` panel, per-kind post styling), byte-for-byte with the
 * prototype. Live mode calls `GET /topics/:slug` (meta) + `GET
 * /topics/:slug/posts` (the first cursor page) and adapts them onto the same
 * `Topic` view-model so `TopicHeader`/`TopicFeed`/`TopicPostCard`/
 * `TopicSidebar` render unchanged — mirrors `forum/api/useForum.ts#useThread`'s
 * "demo inside queryFn" shape for a detail-plus-posts page.
 *
 * Live mode only fetches the post feed's first page — `TopicFeed`'s "Load N
 * older posts" affordance stays decorative there too (same as the mock: it
 * reveals no further page today), a documented gap rather than wiring a
 * second cursor round-trip into a component this task doesn't ask to
 * redesign.
 */
export function useTopic(tag: string) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<Topic>({
    queryKey: ["topic", demoMode, tag, language],
    queryFn: async () => {
      if (demoMode) return getMockTopic(tag, t);
      const [detail, posts] = await Promise.all([
        getTopicDetail(tag),
        getTopicPosts(tag),
      ]);
      return topicDetailToTopic(detail, posts.data, fmt);
    },
  });
}
