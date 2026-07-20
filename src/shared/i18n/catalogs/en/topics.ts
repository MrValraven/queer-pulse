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
  "header.writePostCta": "Write a post",
  "header.followToast": "Now following #{tag}",

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
  "sidebar.crisis.body": "In crisis? Don't wait for the thread.",
  "sidebar.crisis.cta": "Crisis support",

  // Generic fallback for an uncurated/unknown tag (`getTopic()`'s fallback
  // branch) — platform-authored prompt copy, not fetched content, so it
  // translates like any other empty/starter state.
  "fallback.sub":
    "Posts, questions, and recommendations tagged <strong>#{tag}</strong> from across the QueerPulse community.",
  "fallback.postMeta": "Be the first here",
  "fallback.postTitle":
    "Nothing tagged <em>#{tag}</em> yet — want to start the thread?",
  "fallback.postBody":
    "Topics grow when someone goes first. Post a question, a recommendation, or a resource with #{tag} and it will show up right here.",
  "fallback.postStats": "<b>0</b> posts · waiting for you",
};
