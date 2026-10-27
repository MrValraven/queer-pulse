// Studio dashboard upgrade, Part 1: the view models the dashboard reads in
// both modes. This file wraps studio.adapters.ts (toArtistStatsView and the
// card adapters) and leaves it untouched, since peer sessions edit it.
// Part 2 adds plays: all-time and 28-day plays on each release and track,
// floored, and hasPlays, which mounts the plays surfaces on a server that
// sends them and for a persona with no releases.
import { studioReleasePath, studioTrackPath } from "../studioPaths";
import {
  toArtistRefView,
  toArtistStatsView,
  toCountView,
  toPlaylistCardView,
  type StudioArtistRefView,
  type StudioArtistStatsView,
  type StudioCountView,
  type StudioPlaylistCardView,
  type StudioStatsReleaseView,
  type StudioStatsTrackView,
} from "./studio.adapters";
import type {
  StudioArtistStatsDTO,
  StudioCountDTO,
  StudioPageDTO,
  StudioReleaseType,
} from "./studio.types";
import {
  STUDIO_MILESTONE_KINDS,
  STUDIO_MILESTONE_NEW_DAYS,
  STUDIO_OPTIONAL_HEALTH_KEYS,
  STUDIO_PLACEMENT_TRACKS_SHOWN,
  STUDIO_RELEASE_HEALTH_KEYS,
  type StudioFollowerGrowthWeekDTO,
  type StudioMilestoneCardDTO,
  type StudioMilestoneDTO,
  type StudioMilestoneKind,
  type StudioMilestonesResponseDTO,
  type StudioNextReleaseDTO,
  type StudioPlacementDTO,
  type StudioPlacementsPageDTO,
  type StudioReleaseHealthItemDTO,
  type StudioReleaseHealthKey,
} from "./studioDashboard.types";

export interface StudioReleaseHealthItemView {
  key: StudioReleaseHealthKey;
  isDone: boolean;
  isOptional: boolean;
}

export interface StudioReleaseHealthView {
  items: StudioReleaseHealthItemView[];
  doneCount: number;
  totalCount: number;
  hasOpenItems: boolean;
}

export interface StudioDashboardTrackView extends StudioStatsTrackView {
  /** All-time plays, floored. */
  plays: StudioCountView;
  /** The 28 UTC days ending today, floored. */
  plays28d: StudioCountView;
}

export interface StudioDashboardReleaseView extends StudioStatsReleaseView {
  health: StudioReleaseHealthView;
  /** All-time plays, floored; 0 on a server that predates plays. */
  plays: StudioCountView;
  /** The 28 UTC days ending today, floored. */
  plays28d: StudioCountView;
  tracks: StudioDashboardTrackView[];
}

export interface StudioFollowerGrowthWeekView {
  /** The YYYY-MM-DD the server sent; a stable key. */
  weekKey: string;
  /** UTC midnight of the week's Monday. */
  weekStart: Date;
  newFollowers: number;
  isCurrentWeek: boolean;
}

export interface StudioNextReleaseView {
  releaseId: string;
  title: string;
  publishAt: Date;
  reminders: StudioCountView;
  href: string;
}

export interface StudioDashboardStatsView extends Omit<
  StudioArtistStatsView,
  "releases"
> {
  releases: StudioDashboardReleaseView[];
  followerGrowth: StudioFollowerGrowthWeekView[];
  nextRelease: StudioNextReleaseView | null;
  /** True when the server sent plays on any release, or the persona has no
   *  releases (credited plays still feed the trend). The Plays column, the
   *  plays trend and Top supporters mount only on it. */
  hasPlays: boolean;
}

export interface StudioPlacementView {
  playlist: StudioPlaylistCardView;
  tracks: { id: string; title: string; href: string }[];
  /** trackCount minus the titles shown, floored at 0. */
  hiddenTrackCount: number;
  latestAddedAt: Date;
}

export interface StudioMilestoneView {
  id: string;
  kind: StudioMilestoneKind;
  threshold: number;
  track: { id: string; title: string } | null;
  reachedAt: Date;
}

export interface StudioMilestoneCardView {
  milestone: StudioMilestoneView;
  artist: StudioArtistRefView;
}

const DAY_IN_MILLISECONDS = 86_400_000;
const WEEK_START_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** A show has no genre, mood or credits fields in the release editor, so
 *  its checklist holds the cover and the description. */
const PODCAST_HEALTH_KEYS: ReadonlySet<StudioReleaseHealthKey> = new Set([
  "cover",
  "description",
]);

/** Null for a value the Date constructor cannot read. */
export function parsedDate(text: string): Date | null {
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A whole number from 0: a negative, fractional or non-finite count reads
 *  as the nearest whole count at or above 0. */
export function wholeCountOf(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

/** A missing plays count (a server that predates plays) reads as 0; a sent
 *  one reads through the stats floor. */
function playsOf(count?: StudioCountDTO): StudioCountView {
  return count ? toCountView(count) : { value: 0, isBelowThreshold: false };
}

function isHealthKey(key: string): key is StudioReleaseHealthKey {
  return (STUDIO_RELEASE_HEALTH_KEYS as readonly string[]).includes(key);
}

function isMilestoneKind(kind: string): kind is StudioMilestoneKind {
  return (STUDIO_MILESTONE_KINDS as readonly string[]).includes(kind);
}

/** De-duplicates by key (first wins), drops keys this build does not know,
 *  sorts by the contract order and reads the optional flag from the fixed
 *  set, whatever the server flag says. */
export function toReleaseHealthView(
  items: StudioReleaseHealthItemDTO[] | undefined,
  releaseType: StudioReleaseType,
): StudioReleaseHealthView {
  const isPodcast = releaseType === "podcast";
  const itemByKey = new Map<
    StudioReleaseHealthKey,
    StudioReleaseHealthItemView
  >();
  for (const item of items ?? []) {
    const { key } = item;
    if (!isHealthKey(key) || itemByKey.has(key)) continue;
    if (isPodcast && !PODCAST_HEALTH_KEYS.has(key)) continue;
    itemByKey.set(key, {
      key,
      isDone: item.isDone === true,
      isOptional: STUDIO_OPTIONAL_HEALTH_KEYS.has(key),
    });
  }
  const orderedItems = STUDIO_RELEASE_HEALTH_KEYS.flatMap((key) => {
    const item = itemByKey.get(key);
    return item ? [item] : [];
  });
  const doneCount = orderedItems.filter((item) => item.isDone).length;
  return {
    items: orderedItems,
    doneCount,
    totalCount: orderedItems.length,
    hasOpenItems: doneCount < orderedItems.length,
  };
}

/** Drops a week whose start is unreadable and marks the last kept week as
 *  the current, partial one. Follower growth carries no floor. */
export function toFollowerGrowthViews(
  weeks: StudioFollowerGrowthWeekDTO[] | undefined,
): StudioFollowerGrowthWeekView[] {
  const readableWeeks = (weeks ?? []).flatMap((week) => {
    if (!WEEK_START_PATTERN.test(week.weekStart)) return [];
    const weekStart = parsedDate(`${week.weekStart}T00:00:00.000Z`);
    if (!weekStart) return [];
    return [
      {
        weekKey: week.weekStart,
        weekStart,
        newFollowers: wholeCountOf(week.newFollowers),
      },
    ];
  });
  return readableWeeks.map((week, index) => ({
    ...week,
    isCurrentWeek: index === readableWeeks.length - 1,
  }));
}

/** The reminder count reads through the stats floor (1 to 4 is withheld). */
export function toNextReleaseView(
  dto: StudioNextReleaseDTO | null | undefined,
): StudioNextReleaseView | null {
  if (!dto) return null;
  const publishAt = parsedDate(dto.publishAt);
  if (!publishAt) return null;
  return {
    releaseId: dto.releaseId,
    title: dto.title,
    publishAt,
    reminders: toCountView(dto.reminders),
    href: studioReleasePath(dto.releaseId),
  };
}

/** Your numbers plus the dashboard fields. A server that predates them
 *  reads as no checklist, no growth series, no next release and no plays. */
export function toDashboardStatsView(
  dto: StudioArtistStatsDTO,
): StudioDashboardStatsView {
  const statsView = toArtistStatsView(dto);
  return {
    ...statsView,
    releases: statsView.releases.map((releaseView, index) => {
      const releaseRow = dto.releases[index];
      return {
        ...releaseView,
        health: toReleaseHealthView(
          releaseRow?.health,
          releaseRow?.release.type ?? releaseView.release.type,
        ),
        plays: playsOf(releaseRow?.plays),
        plays28d: playsOf(releaseRow?.plays28d),
        // A podcast's view carries no track rows, so the index pairs each
        // track view with its own row.
        tracks: releaseView.tracks.map((trackView, trackIndex) => {
          const trackRow = releaseRow?.tracks[trackIndex];
          return {
            ...trackView,
            plays: playsOf(trackRow?.plays),
            plays28d: playsOf(trackRow?.plays28d),
          };
        }),
      };
    }),
    followerGrowth: toFollowerGrowthViews(dto.followerGrowth),
    nextRelease: toNextReleaseView(dto.nextRelease),
    hasPlays:
      dto.releases.length === 0 ||
      dto.releases.some((row) => row.plays !== undefined),
  };
}

export function toPlacementView(dto: StudioPlacementDTO): StudioPlacementView {
  const shownTracks = dto.tracks.slice(0, STUDIO_PLACEMENT_TRACKS_SHOWN);
  return {
    playlist: toPlaylistCardView(dto.playlist),
    tracks: shownTracks.map((track) => ({
      id: track.id,
      title: track.title,
      href: studioTrackPath(track.id),
    })),
    hiddenTrackCount: Math.max(
      0,
      wholeCountOf(dto.trackCount) - shownTracks.length,
    ),
    // An unreadable stamp falls back to the playlist's last update.
    latestAddedAt:
      parsedDate(dto.latestAddedAt) ??
      parsedDate(dto.playlist.updatedAt) ??
      new Date(0),
  };
}

/** The contract page ({ items, nextCursor }) as the Studio page shape the
 *  cursor hooks read. */
export function placementsPageOf(
  dto: StudioPlacementsPageDTO,
): StudioPageDTO<StudioPlacementDTO> {
  return {
    items: dto.items,
    pageInfo: {
      nextCursor: dto.nextCursor,
      hasMore: dto.nextCursor !== null,
    },
  };
}

/** Null for a kind this build does not know, an unreadable date, or a
 *  track_plays milestone without its track. Only track_plays keeps a track. */
export function toMilestoneView(
  dto: StudioMilestoneDTO,
): StudioMilestoneView | null {
  const { kind } = dto;
  if (!isMilestoneKind(kind)) return null;
  const reachedAt = parsedDate(dto.reachedAt);
  if (!reachedAt) return null;
  const isTrackMilestone = kind === "track_plays";
  if (isTrackMilestone && !dto.track) return null;
  return {
    id: dto.id,
    kind,
    threshold: wholeCountOf(dto.threshold),
    track:
      isTrackMilestone && dto.track
        ? { id: dto.track.id, title: dto.track.title }
        : null,
    reachedAt,
  };
}

export function toMilestoneViews(
  dto: StudioMilestonesResponseDTO,
): StudioMilestoneView[] {
  return dto.items.flatMap((item) => {
    const view = toMilestoneView(item);
    return view ? [view] : [];
  });
}

/** Null reads as the card's unavailable state. */
export function toMilestoneCardView(
  dto: StudioMilestoneCardDTO,
): StudioMilestoneCardView | null {
  const milestone = toMilestoneView(dto.milestone);
  if (!milestone) return null;
  return { milestone, artist: toArtistRefView(dto.artist) };
}

/** True for STUDIO_MILESTONE_NEW_DAYS after the milestone was reached. A
 *  reachedAt ahead of now (a skewed clock) also counts as recent. */
export function isRecentMilestone(
  milestone: StudioMilestoneView,
  now: Date,
): boolean {
  const elapsedMilliseconds = now.getTime() - milestone.reachedAt.getTime();
  return elapsedMilliseconds <= STUDIO_MILESTONE_NEW_DAYS * DAY_IN_MILLISECONDS;
}
