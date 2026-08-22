import type { Catalog } from "../../types";

/**
 * `topics` — hashtag feed pages (`/topic/:tag`). Per the extraction brief's
 * scope rule, the posts and each topic's curated `sub`/`resources.body`/
 * `resources.ctaLabel` are content: in live mode they come from
 * `GET /topics/:slug` + `GET /topics/:slug/posts` (see
 * `features/topics/api/topics.adapters.tsx`), so they stay English in both
 * catalogs. Only the page chrome around them — stat labels, section
 * headings, filter chips, badges, buttons — is translated here.
 */
export const topics: Catalog = {
  // Shared eyebrow above every topic's H1 (also the enum-label the live
  // adapter emits — see topics.adapters.tsx).
  "common.eyebrow": "Topic",

  // Stat-card labels (topic header). Values are numbers/compact counts and
  // stay untranslated data; only these labels are chrome.
  "stats.posts": "Posts",
  "stats.membersFollowing": "Members following",
  "stats.thisWeek": "This week",
  "stats.verifiedResources": "Verified resources",
  "stats.coopsForming": "Co-ops forming",
  "stats.saferSpaceVenues": "Safer-space venues",
  "stats.newValue": "New",

  // Header actions
  "header.followCta": "Follow topic",
  "header.followingCta": "Following",
  "header.writePostCta": "Write a post",
  "header.followToast": "Now following #{tag}",
  "header.unfollowToast": "No longer following #{tag}",
  "header.followFailedToast":
    "Couldn't update that follow. Try again in a moment.",
  "header.followCapToast":
    "You're following as many topics as an account can hold. Unfollow one to make room for this.",
  "header.followInvalidToast": "That tag isn't one we can follow.",

  // Feed filter chips
  "feed.filters.all": "All",
  "feed.filters.threads": "Threads",
  "feed.filters.recommendations": "Recommendations",
  "feed.filters.articles": "Articles",
  "feed.filters.events": "Events",
  "feed.filters.resources": "Resources",
  "feed.loadOlder_one": "Load {count} older post",
  "feed.loadOlder_other": "Load {count} older posts",
  "feed.loadingMore": "Loading…",
  "feed.loadMoreCta": "Load older posts",

  // Post-card kind badges (canonical `PostKind` id stays English; only the
  // rendered label is translated)
  "postKind.asking": "Asking",
  "postKind.recommend": "Recommend",
  "postKind.warn": "Warn",
  "postKind.article": "Article",
  "postKind.event": "Event",
  "postKind.thread": "Thread",

  // Sidebar
  "sidebar.relatedTitle": "Related topics",
  "sidebar.topVoicesTitle": "Top voices here",

  // Generic fallback for an uncurated/unknown tag (`getTopic()`'s fallback
  // branch) — platform-authored prompt copy, not fetched content, so it
  // translates like any other empty/starter state.
  "fallback.sub":
    "Posts, questions, and recommendations tagged <strong>#{tag}</strong> from across the QueerPulse community.",
  "fallback.postMeta": "Be the first here",
  "fallback.postTitle":
    "Nothing tagged <em>#{tag}</em> yet. Want to start the thread?",
  "fallback.postBody":
    "Topics grow when someone goes first. Post a question, a recommendation, or a resource with #{tag} and it will show up right here.",
  "fallback.postStats": "<b>0</b> posts · waiting for you",

  // Live-mode not-found state: the slug genuinely resolved to no topic (404).
  // Page chrome, not fetched content, so it translates.
  "notFound.title": "This topic isn't here",
  "notFound.description":
    "We couldn't find a topic for that tag. It may have been renamed or removed. Head back to the forum to find where the conversation moved.",
  "notFound.backCta": "Back to the forum",

  // Retryable failure (500 / network), kept distinct from "not found" so an
  // outage never reads as a deleted topic.
  "error.title": "Couldn't load this topic",
  "error.description":
    "Something went wrong on our end. This isn't your fault. Try again in a moment.",
  "error.retryCta": "Try again",

  // DISC-4 — the topics directory (`/topics`, `TopicsDirectoryPage`), listing
  // every topic with a follow toggle. Page chrome only; each topic's own
  // `label`/`description` are content (live: `GET /topics`) and stay
  // untranslated, same scope rule as the rest of this catalog.
  "directory.eyebrow": "Topics",
  "directory.title": "Every conversation, by tag.",
  "directory.sub":
    "Follow a topic and you'll hear about it the moment someone posts.",
  "directory.search.placeholder": "Search topics",
  "directory.search.ariaLabel": "Search topics",
  "directory.postsCount_one": "{count} post",
  "directory.postsCount_other": "{count} posts",
  "directory.empty.search.title": "No topics match",
  "directory.empty.search.description":
    "Try a different search term, or clear it to see every topic.",
  "directory.empty.search.cta": "Clear search",
  "directory.empty.none.title": "No topics yet",
  "directory.empty.none.description":
    "There's nothing in the directory yet. Check back soon.",
};
