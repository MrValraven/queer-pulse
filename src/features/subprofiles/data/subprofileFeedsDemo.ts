import { ApiError } from "../../../shared/api/client";
import {
  byNewestFirst,
  entryToItem,
  feedItemId,
  sectionRoom,
} from "../api/feedEpisodeMapping";
import {
  FEED_ALREADY_CONNECTED_CODE,
  FEED_LIMIT_CODE,
  SECTION_FULL_CODE,
  SYNC_TOO_SOON_CODE,
} from "../api/feedImportErrors";
import { PERSONA_EDIT_CONFLICT_CODE } from "../api/personaEditConflict";
import {
  MAX_FEEDS_PER_PERSONA,
  type ConnectFeedInput,
  type FeedEntryDTO,
  type FeedEntryStatus,
  type FeedErrorCode,
  type FeedPreviewDTO,
  type PublishEntriesInput,
  type PublishEntriesResult,
  type SubprofileFeedDTO,
  type UpdateFeedInput,
} from "../api/subprofileFeeds.api";
import { feedImportSections } from "../feedImport/feedImportKinds";
import {
  DEMO_EPISODES,
  DEMO_FAILING_URL_HINTS,
  DEMO_FEED_ID,
  DEMO_FEED_URL,
  DEMO_FRESH_EPISODE,
  DEMO_PODCAST_SUBPROFILE_ID,
  DEMO_SHOW,
  buildSeedEntries,
  demoEntryId,
} from "./subprofileFeeds.data";
import {
  mockPrependSectionItems,
  mockSubprofileById,
} from "./subprofiles.data";

/**
 * The demo-mode backend for podcast feed import: an in-memory stand-in for the
 * feed endpoints, so the whole connect, review and publish flow runs with no
 * network. Loaded on demand by the feed hooks (never part of a live bundle).
 *
 * Publishing writes through `mockPrependSectionItems`, the same registry the
 * editor and the public page read, with the same episode-to-item mapping the
 * live server applies (`feedEpisodeMapping.ts`).
 */

interface DemoFeedState {
  feed: Omit<SubprofileFeedDTO, "pendingCount" | "publishedCount">;
  entries: FeedEntryDTO[];
  /** Whether a check has already found the demo's fresh episode. */
  hasFoundFreshEpisode: boolean;
}

const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
const PREVIEW_EPISODE_COUNT = 5;
/** A just-connected demo feed reads as last checked a while ago, so the first
 *  Check now is allowed and finds something new. */
const CONNECTED_LAST_SYNC_AGE_MS = 10 * 60 * 1000;

const stateBySubprofile = new Map<string, DemoFeedState[]>();
let feedSequence = 0;

/** Every call starts from the seeded demo persona's feed, once. */
function feedsOf(subprofileId: string): DemoFeedState[] {
  let feeds = stateBySubprofile.get(subprofileId);
  if (!feeds) {
    feeds =
      subprofileId === DEMO_PODCAST_SUBPROFILE_ID ? [seededFeedState()] : [];
    stateBySubprofile.set(subprofileId, feeds);
  }
  return feeds;
}

function seededFeedState(): DemoFeedState {
  return {
    feed: {
      id: DEMO_FEED_ID,
      subprofileId: DEMO_PODCAST_SUBPROFILE_ID,
      feedUrl: DEMO_FEED_URL,
      section: "episodes",
      title: DEMO_SHOW.title,
      author: DEMO_SHOW.author,
      imageUrl: null,
      autoPublish: false,
      status: "active",
      lastSyncedAt: "2026-09-22T07:00:00.000Z",
      lastError: null,
      createdAt: "2026-06-30T09:00:00.000Z",
    },
    entries: buildSeedEntries(),
    hasFoundFreshEpisode: false,
  };
}

function toFeedDto(state: DemoFeedState): SubprofileFeedDTO {
  return {
    ...state.feed,
    pendingCount: state.entries.filter((entry) => entry.status === "pending")
      .length,
    publishedCount: state.entries.filter(
      (entry) => entry.status === "published",
    ).length,
  };
}

function refusal(status: number, code: string): ApiError {
  return new ApiError(status, code, { code });
}

function findFeed(subprofileId: string, feedId: string): DemoFeedState {
  const state = feedsOf(subprofileId).find(
    (candidate) => candidate.feed.id === feedId,
  );
  if (!state) throw new ApiError(404, "Not Found");
  return state;
}

const normalizeUrl = (url: string) => url.trim().toLowerCase();

/** Hosts and paths a podcast feed plausibly lives at. */
const FEED_LOOKING_URL =
  /rss|feed|xml|atom|podcast|episodes|anchor|podbean|libsyn|buzzsprout|transistor|megaphone|simplecast|acast|spotify/i;

/** What the demo preview makes of a URL: a failure code, or null for a feed. */
function demoFeedFailure(url: string): FeedErrorCode | null {
  const lowered = url.trim().toLowerCase();
  for (const [code, hint] of Object.entries(DEMO_FAILING_URL_HINTS)) {
    if (lowered.includes(hint)) return code as FeedErrorCode;
  }
  try {
    const parsed = new URL(url.trim());
    const isWeb = parsed.protocol === "http:" || parsed.protocol === "https:";
    return isWeb && FEED_LOOKING_URL.test(parsed.host + parsed.pathname)
      ? null
      : "not_a_feed";
  } catch {
    return "not_a_feed";
  }
}

export function demoPreviewFeed(
  url: string,
  subprofileId?: string,
): FeedPreviewDTO {
  const failure = demoFeedFailure(url);
  if (failure) throw refusal(422, failure);
  const feedUrl = url.trim();
  return {
    feedUrl,
    title: DEMO_SHOW.title,
    author: DEMO_SHOW.author,
    description: DEMO_SHOW.description,
    episodeCount: DEMO_EPISODES.length,
    latest: DEMO_EPISODES.slice(0, PREVIEW_EPISODE_COUNT),
    alreadyConnected:
      subprofileId !== undefined &&
      feedsOf(subprofileId).some(
        (state) => normalizeUrl(state.feed.feedUrl) === normalizeUrl(feedUrl),
      ),
  };
}

export function demoListFeeds(subprofileId: string): SubprofileFeedDTO[] {
  return feedsOf(subprofileId).map(toFeedDto);
}

export function demoConnectFeed(
  subprofileId: string,
  input: ConnectFeedInput,
): SubprofileFeedDTO {
  const feeds = feedsOf(subprofileId);
  if (feeds.length >= MAX_FEEDS_PER_PERSONA) {
    throw refusal(422, FEED_LIMIT_CODE);
  }
  if (
    feeds.some(
      (state) => normalizeUrl(state.feed.feedUrl) === normalizeUrl(input.url),
    )
  ) {
    throw refusal(409, FEED_ALREADY_CONNECTED_CODE);
  }
  const failure = demoFeedFailure(input.url);
  if (failure) throw refusal(422, failure);
  const kind = mockSubprofileById(subprofileId)?.kind;
  if (kind && !feedImportSections(kind).includes(input.section)) {
    throw new ApiError(400, "Section not allowed for this kind");
  }

  feedSequence += 1;
  const feedId = `feed-demo-${feedSequence}`;
  const now = new Date();
  const createdAt = now.toISOString();
  const status: FeedEntryStatus =
    input.backfill === "all" ? "pending" : "dismissed";
  const state: DemoFeedState = {
    feed: {
      id: feedId,
      subprofileId,
      feedUrl: input.url.trim(),
      section: input.section,
      title: DEMO_SHOW.title,
      author: DEMO_SHOW.author,
      imageUrl: null,
      autoPublish: input.autoPublish ?? false,
      status: "active",
      lastSyncedAt: new Date(
        now.getTime() - CONNECTED_LAST_SYNC_AGE_MS,
      ).toISOString(),
      lastError: null,
      createdAt,
    },
    entries: DEMO_EPISODES.map((fields) => ({
      ...fields,
      id: demoEntryId(feedId, fields.guid),
      feedId,
      status,
      itemId: null,
      createdAt,
    })),
    hasFoundFreshEpisode: false,
  };
  feeds.push(state);
  return toFeedDto(state);
}

export function demoUpdateFeed(
  subprofileId: string,
  feedId: string,
  input: UpdateFeedInput,
): SubprofileFeedDTO {
  const state = findFeed(subprofileId, feedId);
  const kind = mockSubprofileById(subprofileId)?.kind;
  if (
    input.section !== undefined &&
    kind &&
    !feedImportSections(kind).includes(input.section)
  ) {
    throw new ApiError(400, "Section not allowed for this kind");
  }
  state.feed = {
    ...state.feed,
    ...(input.section === undefined ? {} : { section: input.section }),
    ...(input.autoPublish === undefined
      ? {}
      : { autoPublish: input.autoPublish }),
  };
  return toFeedDto(state);
}

/** Published items stay on the persona; everything else of the feed goes. */
export function demoDisconnectFeed(subprofileId: string, feedId: string): void {
  findFeed(subprofileId, feedId);
  stateBySubprofile.set(
    subprofileId,
    feedsOf(subprofileId).filter((state) => state.feed.id !== feedId),
  );
}

export function demoSyncFeed(
  subprofileId: string,
  feedId: string,
): SubprofileFeedDTO {
  const state = findFeed(subprofileId, feedId);
  const lastSyncedAt = state.feed.lastSyncedAt;
  if (
    lastSyncedAt &&
    Date.now() - Date.parse(lastSyncedAt) < SYNC_COOLDOWN_MS
  ) {
    throw new ApiError(429, SYNC_TOO_SOON_CODE, {
      code: SYNC_TOO_SOON_CODE,
      retryAfterSeconds: Math.ceil(
        (SYNC_COOLDOWN_MS - (Date.now() - Date.parse(lastSyncedAt))) / 1000,
      ),
    });
  }
  state.feed = {
    ...state.feed,
    lastSyncedAt: new Date().toISOString(),
    status: "active",
    lastError: null,
  };
  if (!state.hasFoundFreshEpisode) {
    state.hasFoundFreshEpisode = true;
    const entry: FeedEntryDTO = {
      ...DEMO_FRESH_EPISODE,
      id: demoEntryId(feedId, DEMO_FRESH_EPISODE.guid),
      feedId,
      status: "pending",
      itemId: null,
      createdAt: new Date().toISOString(),
    };
    state.entries = [entry, ...state.entries];
    // A feed set to auto-publish puts what it finds straight on the page.
    if (state.feed.autoPublish) {
      publishInto(state, [entry.id]);
    }
  }
  return toFeedDto(state);
}

export function demoListEntries(
  subprofileId: string,
  feedId: string,
  status: FeedEntryStatus,
): FeedEntryDTO[] {
  return findFeed(subprofileId, feedId)
    .entries.filter((entry) => entry.status === status)
    .sort(byNewestFirst);
}

/** Publish the pending entries among `entryIds`, newest first, as many as fit
 *  in the section. Returns how many went live and how many requested ids did
 *  not (they did not fit, or were not waiting), as the server counts them. */
function publishInto(
  state: DemoFeedState,
  entryIds: string[],
): { published: number; skipped: number } {
  const { subprofileId, section } = state.feed;
  const wanted = new Set(entryIds);
  const candidates = state.entries
    .filter((entry) => entry.status === "pending" && wanted.has(entry.id))
    .sort(byNewestFirst);
  const itemsInSection =
    mockSubprofileById(subprofileId)?.items.filter(
      (item) => item.section === section,
    ).length ?? 0;
  const room = sectionRoom(itemsInSection);
  const toPublish = candidates.slice(0, room);
  if (toPublish.length === 0) return { published: 0, skipped: wanted.size };

  const now = new Date().toISOString();
  const items = toPublish.map((entry) => entryToItem(entry, section, now));
  mockPrependSectionItems(subprofileId, section, items);
  const publishedIds = new Set(toPublish.map((entry) => entry.id));
  state.entries = state.entries.map((entry) =>
    publishedIds.has(entry.id)
      ? { ...entry, status: "published", itemId: feedItemId(entry.id) }
      : entry,
  );
  return {
    published: toPublish.length,
    skipped: wanted.size - toPublish.length,
  };
}

export function demoPublishEntries(
  subprofileId: string,
  feedId: string,
  input: PublishEntriesInput,
): PublishEntriesResult {
  const state = findFeed(subprofileId, feedId);
  const persona = mockSubprofileById(subprofileId);
  if (!persona) throw new ApiError(404, "Not Found");
  if (
    input.expectedEditVersion !== undefined &&
    input.expectedEditVersion !== (persona.editVersion ?? 0)
  ) {
    throw new ApiError(409, PERSONA_EDIT_CONFLICT_CODE, {
      code: PERSONA_EDIT_CONFLICT_CODE,
      currentEditVersion: persona.editVersion ?? 0,
    });
  }
  const itemsInSection = persona.items.filter(
    (item) => item.section === state.feed.section,
  ).length;
  if (sectionRoom(itemsInSection) === 0) {
    throw refusal(422, SECTION_FULL_CODE);
  }
  const { published, skipped } = publishInto(state, input.entryIds);
  const subprofile = mockSubprofileById(subprofileId);
  if (!subprofile) throw new ApiError(404, "Not Found");
  return { published, skipped, subprofile };
}

function moveEntries(
  subprofileId: string,
  feedId: string,
  entryIds: string[],
  from: FeedEntryStatus,
  to: FeedEntryStatus,
): number {
  const state = findFeed(subprofileId, feedId);
  const wanted = new Set(entryIds);
  let moved = 0;
  state.entries = state.entries.map((entry) => {
    if (entry.status !== from || !wanted.has(entry.id)) return entry;
    moved += 1;
    return { ...entry, status: to };
  });
  return moved;
}

export function demoDismissEntries(
  subprofileId: string,
  feedId: string,
  entryIds: string[],
): { dismissed: number } {
  return {
    dismissed: moveEntries(
      subprofileId,
      feedId,
      entryIds,
      "pending",
      "dismissed",
    ),
  };
}

export function demoRestoreEntries(
  subprofileId: string,
  feedId: string,
  entryIds: string[],
): { restored: number } {
  return {
    restored: moveEntries(
      subprofileId,
      feedId,
      entryIds,
      "dismissed",
      "pending",
    ),
  };
}

/** Test-only: forget every demo feed so the next read re-seeds. */
export function resetDemoFeedsForTests(): void {
  stateBySubprofile.clear();
  feedSequence = 0;
}
