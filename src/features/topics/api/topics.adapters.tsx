import type { AvatarTint } from "../../../shared/components/ui";
import type { Formatters } from "../../../shared/i18n/format";
import {
  splitForTitle,
  writeHrefForTag,
  type PostCategory,
  type PostKind,
  type Topic,
  type TopicPost,
} from "../topics.data";
import type { TopicDetailResponse, TopicPostResponse } from "./topics.api";

// Map the backend DTOs onto the EXISTING rich `Topic`/`TopicPost` view-models
// (../topics.data.tsx) so TopicHeader/TopicFeed/TopicPostCard/TopicSidebar
// render unchanged. Mirrors forum/api/forum.adapters.ts's approach for the
// forum feature's Thread/Reply view-models.
//
// FIELDS WITH NO BACKEND SHAPE (documented gap, not a fake success — same
// idiom as `useMyEventsData`'s notifications): `topVoices` (empty array) and
// the curated `resources` panel (undefined) have no backend contract yet —
// see `queerpulse-backend/src/content/entities/topic.entity.ts`. Both render
// conditionally in TopicSidebar/TopicHeader, so omitting them just hides
// those sections rather than showing broken/fake content.

/** "1.2k"-style compact count, matching the mock's stat formatting
 * (`topics.data.tsx`'s hardcoded "1.2k", "2.1k", ...). */
function compactCount(n: number): string {
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  const rounded = Math.round(thousands * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}k`;
}

/**
 * Relative "time ago" from an ISO timestamp, through `fmt.relativeTime` —
 * previously a hand-rolled `"3h ago"` string that never localized for pt-PT
 * (a legacy `Intl` site flagged for this sweep). Beyond 30 days it falls back
 * to a short absolute date, also through `fmt`, never `toLocaleDateString`.
 */
function relative(iso: string, fmt: Formatters): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return fmt.relativeTime(-diffSeconds, "second");
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return fmt.relativeTime(-diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return fmt.relativeTime(-diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return fmt.relativeTime(-diffDays, "day");
  return fmt.date(date, { day: "numeric", month: "short" });
}

/** `TopicPostResponse` → the mock's `TopicPost`, re-composing the flattened
 * `contextLabel`/`reactionLabel`+`replyLabel` back into the `meta`/`stats`
 * `ReactNode`s `TopicPostCard` renders. */
export function topicPostResponseToTopicPost(
  dto: TopicPostResponse,
  fmt: Formatters,
): TopicPost {
  return {
    author: dto.author,
    initials: dto.authorInitials,
    tone: dto.authorTone as AvatarTint,
    meta: dto.contextLabel
      ? `${relative(dto.createdAt, fmt)} · ${dto.contextLabel}`
      : relative(dto.createdAt, fmt),
    kind: dto.kind as PostKind,
    category: dto.category as PostCategory,
    title: dto.title,
    body: dto.body,
    stats: (
      <>
        <b>{dto.reactionCount}</b> {dto.reactionLabel}
        {dto.replyLabel && (
          <>
            {" · "}
            <b>{dto.replyCount}</b> {dto.replyLabel}
          </>
        )}
      </>
    ),
    tags: dto.tags,
    href: dto.href,
  };
}

/** `TopicDetailResponse` + its first post-feed page → the mock's `Topic`
 * view-model. `writeHref` deep-links into forum thread creation with this
 * topic's own tag pre-filled (DISC-5) via `writeHrefForTag`, the same helper
 * the demo-mode topics in `topics.data.tsx` use. */
export function topicDetailToTopic(
  detail: TopicDetailResponse,
  posts: TopicPostResponse[],
  fmt: Formatters,
): Topic {
  return {
    tag: detail.tag,
    eyebrowKey: "topics:common.eyebrow",
    title: splitForTitle(detail.label),
    sub: detail.description,
    stats: [
      {
        value: String(detail.totalPosts),
        em: true,
        labelKey: "topics:stats.posts",
      },
      {
        value: compactCount(detail.followerCount),
        labelKey: "topics:stats.membersFollowing",
      },
      {
        value: String(detail.postsThisWeek),
        labelKey: "topics:stats.thisWeek",
      },
    ],
    writeHref: writeHrefForTag(detail.tag),
    posts: posts.map((dto) => topicPostResponseToTopicPost(dto, fmt)),
    relatedTopics: detail.relatedTopics,
    topVoices: [],
    totalPosts: detail.totalPosts,
  };
}
