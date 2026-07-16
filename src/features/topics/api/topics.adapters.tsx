import type { AvatarTint } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import {
  splitForTitle,
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

/** Relative "time ago" from an ISO timestamp — a local copy of the same tiny
 * helper `forum/api/forum.adapters.ts#relative` defines, per this repo's
 * convention of feature adapters keeping their own copies (see
 * `shared/api/refs.ts`'s note on `tintForSlug`). */
function relative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** `TopicPostResponse` → the mock's `TopicPost`, re-composing the flattened
 * `contextLabel`/`reactionLabel`+`replyLabel` back into the `meta`/`stats`
 * `ReactNode`s `TopicPostCard` renders. */
export function topicPostResponseToTopicPost(
  dto: TopicPostResponse,
): TopicPost {
  return {
    author: dto.author,
    initials: dto.authorInitials,
    tone: dto.authorTone as AvatarTint,
    meta: dto.contextLabel
      ? `${relative(dto.createdAt)} · ${dto.contextLabel}`
      : relative(dto.createdAt),
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
 * view-model. `writeHref` has no backend equivalent to vary by topic (the
 * mock always points every topic at `routes.forum`), so that stays fixed
 * too. */
export function topicDetailToTopic(
  detail: TopicDetailResponse,
  posts: TopicPostResponse[],
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
    writeHref: routes.forum,
    posts: posts.map(topicPostResponseToTopicPost),
    relatedTopics: detail.relatedTopics,
    topVoices: [],
    crisisCard: detail.crisisCard,
    totalPosts: detail.totalPosts,
  };
}
