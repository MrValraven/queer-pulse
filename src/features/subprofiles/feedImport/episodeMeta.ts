import {
  formatEpisodeDuration,
  formatEpisodeSubtitle,
} from "../api/feedEpisodeMapping";
import type { FeedEpisodeFields } from "../api/subprofileFeeds.api";

/** The one-line facts about an episode: its date, its length and its season and
 *  episode number, in the same forms the published item will carry. A part
 *  the feed did not give is left out. */
export function episodeMetaLine(
  episode: Pick<
    FeedEpisodeFields,
    "publishedAt" | "durationSeconds" | "season" | "episode"
  >,
  formatDate: (date: Date) => string,
): string {
  const publishedAt = episode.publishedAt
    ? new Date(episode.publishedAt)
    : null;
  const hasValidDate = publishedAt && !Number.isNaN(publishedAt.getTime());
  return [
    hasValidDate ? formatDate(publishedAt) : null,
    formatEpisodeDuration(episode.durationSeconds),
    formatEpisodeSubtitle(episode.season, episode.episode),
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}
