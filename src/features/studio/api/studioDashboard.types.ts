import type {
  StudioArtistRefDTO,
  StudioCountDTO,
  StudioPlaylistCardDTO,
} from "./studio.types";
import type { StudioSupporterIdentityDTO } from "./studioListening.types";

// Studio dashboard upgrade, Part 1
// (QUEERPULSE-STUDIO-DASHBOARD-UPGRADE-CONTRACT-PART-1-2026-10-26.md).
export const STUDIO_RELEASE_HEALTH_KEYS = [
  "cover",
  "description",
  "genreAndMood",
  "creditsOnEveryTrack",
  "lyrics",
  "buyLink",
  "versionNote",
] as const;
export type StudioReleaseHealthKey =
  (typeof STUDIO_RELEASE_HEALTH_KEYS)[number];
export const STUDIO_OPTIONAL_HEALTH_KEYS: ReadonlySet<StudioReleaseHealthKey> =
  new Set(["lyrics", "buyLink"]);

export const STUDIO_MILESTONE_KINDS = [
  "followers",
  "first_placement",
  "track_plays",
  "artist_plays",
] as const;
export type StudioMilestoneKind = (typeof STUDIO_MILESTONE_KINDS)[number];

export const STUDIO_PLACEMENTS_PAGE_SIZE = 20;
export const STUDIO_PLACEMENT_TRACKS_SHOWN = 5;
export const STUDIO_MILESTONES_MAX = 50;
export const STUDIO_FOLLOWER_GROWTH_WEEKS = 12;
/** A milestone reached within this many days shows a quiet "New". */
export const STUDIO_MILESTONE_NEW_DAYS = 7;

/** One checklist row. Present on every release row, drafts and scheduled
 *  included, in contract order; [] for a taken down release. The key is typed
 *  string so a value from a newer server reaches the adapter, which drops it.
 *  versionNote appears on published releases only. */
export interface StudioReleaseHealthItemDTO {
  key: string;
  isDone: boolean;
  isOptional: boolean;
}

/** One Monday-start UTC week, 12 per response ending with the current
 *  partial week. Unfloored: a small count is shown as it is. */
export interface StudioFollowerGrowthWeekDTO {
  weekStart: string;
  newFollowers: number;
}

/** The earliest scheduled release (ties broken by id). */
export interface StudioNextReleaseDTO {
  releaseId: string;
  title: string;
  publishAt: string;
  reminders: StudioCountDTO;
}

/** A public playlist holding the persona's tracks. Tracks are distinct and
 *  trackCount counts distinct tracks; latestAddedAt has millisecond precision. */
export interface StudioPlacementDTO {
  playlist: StudioPlaylistCardDTO;
  tracks: { id: string; title: string; releaseId: string }[];
  trackCount: number;
  latestAddedAt: string;
}

export interface StudioPlacementsPageDTO {
  items: StudioPlacementDTO[];
  nextCursor: string | null;
}

/** The kind is typed string so a kind from a newer server reaches the
 *  adapter, which drops it. */
export interface StudioMilestoneDTO {
  id: string;
  kind: string;
  threshold: number;
  track: { id: string; title: string } | null;
  reachedAt: string;
}

export interface StudioMilestonesResponseDTO {
  items: StudioMilestoneDTO[];
}

/** GET /studio/milestones/:id, the card a shared milestone link reads. */
export interface StudioMilestoneCardDTO {
  milestone: StudioMilestoneDTO;
  artist: StudioArtistRefDTO;
}

// Studio dashboard upgrade, Part 2 (CONTRACT-PART-2 sections 7 and 8).

/** The trend always asks for the last 28 UTC days. */
export const STUDIO_PLAYS_DAYS = 28;
export const STUDIO_TOP_SUPPORTERS_MAX = 10;

/** `day` is YYYY-MM-DD (UTC); a 0 day reads value 0, 1 to 4 reads below the threshold. */
export interface StudioArtistPlaysDayDTO {
  day: string;
  plays: StudioCountDTO;
}

/** GET /studio/artists/:subprofileId/plays?days=28, oldest day first. */
export interface StudioArtistPlaysDTO {
  days: StudioArtistPlaysDayDTO[];
  total: StudioCountDTO;
  total28d: StudioCountDTO;
}

/** GET /studio/artists/:subprofileId/supporters, ranked, no counts. */
export interface StudioTopSupportersDTO {
  items: { identity: StudioSupporterIdentityDTO }[];
  optedInCount: StudioCountDTO;
}
