import { feedItemId } from "../api/feedEpisodeMapping";
import type {
  FeedEntryDTO,
  FeedEpisodeFields,
} from "../api/subprofileFeeds.api";

/**
 * Demo-mode fixtures for podcast RSS import: one believable queer podcast,
 * "Late Bloomers", that every feed-shaped URL resolves to, plus the demo
 * persona it is connected to. Static facts only; the in-memory store that
 * connects, syncs and publishes them lives in `subprofileFeedsDemo.ts`.
 *
 * Dates are fixed ISO strings (never `new Date()` at module scope) so the
 * mock reads the same on every load. The show and its links use the reserved
 * `.example` domain, so nothing here points at a real site.
 */

/** The demo persona (owned by the demo viewer) the seeded feed belongs to. */
export const DEMO_PODCAST_SUBPROFILE_ID = "sp-tiago-late-bloomers";

/** The feed the demo persona starts with, and the URL the demo preview knows by name. */
export const DEMO_FEED_ID = "feed-demo-late-bloomers";
export const DEMO_FEED_URL = "https://feeds.latebloomers.example/podcast.xml";

export const DEMO_SHOW = {
  title: "Late Bloomers",
  author: "Inês Carvalho & Kai Duarte",
  description:
    "A podcast for people who found themselves later than they expected. Coming out at 43, dating again, chosen family, and the small rituals that get us through.",
} as const;

/** Stable entry id for one episode of one feed. */
export const demoEntryId = (feedId: string, guid: string): string =>
  `${feedId}:${guid}`;

function episode(
  slug: string,
  fields: Omit<FeedEpisodeFields, "guid" | "link">,
): FeedEpisodeFields {
  return {
    guid: `late-bloomers-${slug}`,
    link: `https://latebloomers.example/episodes/${slug}`,
    ...fields,
  };
}

/** The feed's twelve episodes, newest first. Some carry season and episode
 *  numbers, the bonus and the trailer do not. */
export const DEMO_EPISODES: FeedEpisodeFields[] = [
  episode("the-second-coming-out", {
    title: "The second coming out",
    description:
      "Kai on telling their parents twice: once at nineteen, and again at forty-three, when it finally stuck.",
    publishedAt: "2026-09-21T06:00:00.000Z",
    durationSeconds: 2880,
    season: 2,
    episode: 10,
  }),
  episode("bonus-your-voicemails", {
    title: "Bonus: your voicemails, answered",
    description:
      "You left us messages about first dates, second chances and the group chat that saved you. We listen and reply.",
    publishedAt: "2026-09-07T06:00:00.000Z",
    durationSeconds: 1260,
    season: null,
    episode: null,
  }),
  episode("dating-in-lisbon-in-the-rain", {
    title: "Dating in Lisbon, in the rain",
    description:
      "Where to go when the Bairro Alto plan falls through. Inês rates the cosiest wet-weather first dates.",
    publishedAt: "2026-08-24T06:00:00.000Z",
    durationSeconds: 3120,
    season: 2,
    episode: 9,
  }),
  episode("chosen-family-dinners", {
    title: "Chosen family dinners",
    description:
      "A long table, a borrowed flat and eleven people who are not related. How Sunday dinner became the week's anchor.",
    publishedAt: "2026-08-10T06:00:00.000Z",
    durationSeconds: 4320,
    season: 2,
    episode: 8,
  }),
  episode("what-i-wish-id-known-at-forty", {
    title: "What I wish I'd known at forty",
    description:
      "Three guests, one question. Gentle, funny and a little bit tearful.",
    publishedAt: "2026-07-27T06:00:00.000Z",
    durationSeconds: 2700,
    season: 2,
    episode: 7,
  }),
  episode("the-gym-changing-room", {
    title: "The gym changing room",
    description:
      "On bodies, belonging and finding a gym that does not make you rehearse your answer in advance.",
    publishedAt: "2026-07-13T06:00:00.000Z",
    durationSeconds: 2940,
    season: 2,
    episode: 6,
  }),
  episode("season-two-begins", {
    title: "Season two begins: late, loud, loved",
    description:
      "We are back with new guests, a new theme tune and the same slightly chaotic kitchen-table energy.",
    publishedAt: "2026-06-29T06:00:00.000Z",
    durationSeconds: 2100,
    season: 2,
    episode: 5,
  }),
  episode("coming-home-for-the-holidays", {
    title: "Coming home for the holidays",
    description:
      "Season one closes with the big question: which version of you goes home, and who gets to decide?",
    publishedAt: "2026-03-16T07:00:00.000Z",
    durationSeconds: 3540,
    season: 1,
    episode: 4,
  }),
  episode("my-first-pride-at-43", {
    title: "My first Pride, at 43",
    description:
      "Inês walks the Lisbon march for the first time, with a rainbow flag and her sister's hand.",
    publishedAt: "2026-03-02T07:00:00.000Z",
    durationSeconds: 3300,
    season: 1,
    episode: 3,
  }),
  episode("who-do-you-tell-first", {
    title: "Who do you tell first?",
    description:
      "Friends, family, the barista. We trade stories about the very first person we said it out loud to.",
    publishedAt: "2026-02-16T07:00:00.000Z",
    durationSeconds: 2640,
    season: 1,
    episode: 2,
  }),
  episode("hello-late-bloomers", {
    title: "Hello, late bloomers",
    description:
      "Who we are, why we started this, and what to expect from a podcast about arriving in your own life at your own pace.",
    publishedAt: "2026-02-02T07:00:00.000Z",
    durationSeconds: 2400,
    season: 1,
    episode: 1,
  }),
  episode("trailer", {
    title: "Trailer: meet Late Bloomers",
    description: "Ninety seconds of what this show is about.",
    publishedAt: "2026-01-19T07:00:00.000Z",
    durationSeconds: 95,
    season: null,
    episode: null,
  }),
];

/** How many of the oldest episodes the demo persona already has on its page. */
export const DEMO_PUBLISHED_EPISODE_COUNT = 7;

/** An episode that "arrives" the first time the demo feed is checked, so
 *  Check now has something to find. */
export const DEMO_FRESH_EPISODE: FeedEpisodeFields = episode("small-rituals", {
  title: "Small rituals",
  description:
    "The tiny, private things that hold us together: a kettle, a playlist, a text that says 'home safe'.",
  publishedAt: "2026-09-28T06:00:00.000Z",
  durationSeconds: 2520,
  season: 2,
  episode: 11,
});

/** Feed URLs the demo preview refuses, so the error states can be tried by hand. */
export const DEMO_FAILING_URL_HINTS = {
  unreachable: "unreachable",
  timeout: "timeout",
  http_error: "http-error",
  too_large: "too-large",
} as const;

/** The seeded feed's entries, newest first: the oldest
 *  `DEMO_PUBLISHED_EPISODE_COUNT` already published (their items sit on the
 *  demo persona), the rest waiting for review. Fresh objects on every call. */
export function buildSeedEntries(
  feedId: string = DEMO_FEED_ID,
  createdAt = "2026-09-22T08:00:00.000Z",
): FeedEntryDTO[] {
  const firstPublishedIndex =
    DEMO_EPISODES.length - DEMO_PUBLISHED_EPISODE_COUNT;
  return DEMO_EPISODES.map((fields, index) => {
    const id = demoEntryId(feedId, fields.guid);
    const isPublished = index >= firstPublishedIndex;
    return {
      ...fields,
      id,
      feedId,
      status: isPublished ? "published" : "pending",
      itemId: isPublished ? feedItemId(id) : null,
      createdAt,
    };
  });
}
