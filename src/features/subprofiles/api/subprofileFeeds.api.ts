import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { SubprofileDTO, SubprofileSection } from "./subprofiles.api";

/**
 * Podcast RSS import for personas ("feeds"): wire types and endpoint calls.
 * Mirrors the v1 feed-import API contract verbatim (camelCase JSON). Pending
 * episodes live in a staging table on the server; publishing one inserts a
 * normal persona item, so nothing here touches the section-replace PUT.
 *
 * Demo mode never reaches these calls: the hooks branch on `demoMode` and read
 * `data/subprofileFeedsDemo.ts` instead.
 */

/** Why a feed could not be read. Arrives as `{ code }` on a 422, and as a
 *  feed's `lastError` once a scheduled check has failed. */
export type FeedErrorCode =
  | "unreachable" // DNS / connect / TLS failure, or blocked (private address)
  | "timeout"
  | "http_error" // non-2xx/304
  | "too_large" // body over the cap
  | "not_a_feed"; // parsed, but no RSS <channel>

export type FeedStatus = "active" | "failing";

/** Whether the existing episodes of a feed are offered for review ("all") or
 *  set aside so only future episodes arrive as new ("none"). */
export type FeedBackfill = "all" | "none";

export type FeedEntryStatus = "pending" | "published" | "dismissed";

export interface SubprofileFeedDTO {
  id: string;
  subprofileId: string;
  /** Final URL after redirects. */
  feedUrl: string;
  /** The `SubprofileSection` the episodes publish into. */
  section: SubprofileSection;
  title: string | null;
  author: string | null;
  /** Resolved read URL of our stored copy of the show art, or null. */
  imageUrl: string | null;
  autoPublish: boolean;
  /** `failing` means the last 3+ checks failed. */
  status: FeedStatus;
  /** ISO, the last successful fetch. */
  lastSyncedAt: string | null;
  lastError: FeedErrorCode | null;
  pendingCount: number;
  publishedCount: number;
  createdAt: string;
}

export interface FeedEpisodeFields {
  guid: string;
  title: string;
  /** Plain text (HTML stripped), at most 2000 characters. */
  description: string | null;
  /** The episode's web page, else its enclosure URL. */
  link: string | null;
  /** ISO. */
  publishedAt: string | null;
  durationSeconds: number | null;
  season: number | null;
  episode: number | null;
}

export interface FeedPreviewDTO {
  feedUrl: string;
  title: string;
  author: string | null;
  description: string | null;
  episodeCount: number;
  /** The newest 5. Never carries remote images: third-party art is not hotlinked. */
  latest: FeedEpisodeFields[];
  /** This URL is already connected to THIS persona (only when `subprofileId` was sent). */
  alreadyConnected: boolean;
}

export interface FeedEntryDTO extends FeedEpisodeFields {
  id: string;
  feedId: string;
  status: FeedEntryStatus;
  /** `subprofile_items.id` once published. */
  itemId: string | null;
  createdAt: string;
}

export interface ConnectFeedInput {
  url: string;
  section: SubprofileSection;
  /** Defaults to false on the server. */
  autoPublish?: boolean;
  backfill: FeedBackfill;
}

export interface UpdateFeedInput {
  section?: SubprofileSection;
  autoPublish?: boolean;
}

export interface PublishEntriesInput {
  /** 1 to 100 entry ids. */
  entryIds: string[];
  /** The open editor's `editVersion`; the server answers 409
   *  `PERSONA_EDIT_CONFLICT` when the persona was saved after it loaded. */
  expectedEditVersion?: number;
}

export interface PublishEntriesResult {
  published: number;
  /** Entries that did not fit in the section (100-item cap); they stay pending. */
  skipped: number;
  /** The persona's owner view after the publish, carrying the raised `editVersion`. */
  subprofile: SubprofileDTO;
}

/** The most entries one publish call takes (contract: 1..100). */
export const MAX_ENTRIES_PER_PUBLISH = 100;

/** The most feeds one persona can connect. */
export const MAX_FEEDS_PER_PERSONA = 3;

const feedsPath = (subprofileId: string) =>
  `/subprofiles/${subprofileId}/feeds`;
const feedPath = (subprofileId: string, feedId: string) =>
  `${feedsPath(subprofileId)}/${feedId}`;

/** Read an episode feed without connecting it (POST, because it fetches a
 *  remote URL server-side). 422 `{ code: FeedErrorCode }` on failure. */
export const previewFeed = (url: string, subprofileId?: string) =>
  apiPost<FeedPreviewDTO>("/subprofiles/feeds/preview", {
    url,
    ...(subprofileId ? { subprofileId } : {}),
  });

export const listSubprofileFeeds = (
  subprofileId: string,
  signal?: AbortSignal,
) =>
  apiGet<SubprofileFeedDTO[]>(
    feedsPath(subprofileId),
    undefined,
    undefined,
    signal,
  );

export const connectFeed = (subprofileId: string, input: ConnectFeedInput) =>
  apiPost<SubprofileFeedDTO>(feedsPath(subprofileId), {
    url: input.url,
    section: input.section,
    autoPublish: input.autoPublish ?? false,
    backfill: input.backfill,
  });

export const updateFeed = (
  subprofileId: string,
  feedId: string,
  input: UpdateFeedInput,
) => apiPatch<SubprofileFeedDTO>(feedPath(subprofileId, feedId), input);

/** Published items stay on the persona; pending and dismissed entries go. */
export const disconnectFeed = (subprofileId: string, feedId: string) =>
  apiDelete<void>(feedPath(subprofileId, feedId));

/** 429 when the feed was checked less than 5 minutes ago. */
export const syncFeed = (subprofileId: string, feedId: string) =>
  apiPost<SubprofileFeedDTO>(`${feedPath(subprofileId, feedId)}/sync`);

export const listFeedEntries = (
  subprofileId: string,
  feedId: string,
  status: FeedEntryStatus,
  signal?: AbortSignal,
) =>
  apiGet<FeedEntryDTO[]>(
    `${feedPath(subprofileId, feedId)}/entries?status=${status}`,
    undefined,
    undefined,
    signal,
  );

export const publishFeedEntries = (
  subprofileId: string,
  feedId: string,
  input: PublishEntriesInput,
) =>
  apiPost<PublishEntriesResult>(
    `${feedPath(subprofileId, feedId)}/entries/publish`,
    {
      entryIds: input.entryIds,
      ...(input.expectedEditVersion === undefined
        ? {}
        : { expectedEditVersion: input.expectedEditVersion }),
    },
  );

export const dismissFeedEntries = (
  subprofileId: string,
  feedId: string,
  entryIds: string[],
) =>
  apiPost<{ dismissed: number }>(
    `${feedPath(subprofileId, feedId)}/entries/dismiss`,
    { entryIds },
  );

export const restoreFeedEntries = (
  subprofileId: string,
  feedId: string,
  entryIds: string[],
) =>
  apiPost<{ restored: number }>(
    `${feedPath(subprofileId, feedId)}/entries/restore`,
    { entryIds },
  );
