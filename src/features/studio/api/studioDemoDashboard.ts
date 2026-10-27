import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_OPTIONAL_HEALTH_KEYS,
  STUDIO_RELEASE_HEALTH_KEYS,
  type StudioFollowerGrowthWeekDTO,
  type StudioMilestoneCardDTO,
  type StudioMilestoneDTO,
  type StudioMilestonesResponseDTO,
  type StudioNextReleaseDTO,
  type StudioPlacementsPageDTO,
  type StudioReleaseHealthItemDTO,
} from "./studioDashboard.types";
import type { StudioCountDTO, StudioReleaseDTO } from "./studio.types";
import {
  DEMO_FOLLOWER_GROWTH_BY_PERSONA,
  DEMO_MILESTONE_SEEDS,
  DEMO_PLACEMENTS_PAGE_SIZE,
  DEMO_RELEASE_HEALTH_GAPS,
} from "./studioDemoDashboard.data";
import {
  demoPublishedReleasesOf,
  isDemoOwnedPersona,
} from "./studioDemoFormats.data";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
} from "./studioDemoMe.data";
import { demoArtistPlacements } from "./studioDemoPlaylists";

const CURSOR_PREFIX = "demo-placements:";
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const PODCAST_HEALTH_KEYS = STUDIO_RELEASE_HEALTH_KEYS.slice(0, 2);
const STANDARD_HEALTH_KEYS = STUDIO_RELEASE_HEALTH_KEYS.slice(0, 6);

/** An index cursor; anything else reads as page one, as the server does. */
function offsetOf(cursor: string | null): number {
  if (!cursor?.startsWith(CURSOR_PREFIX)) return 0;
  const offset = Number(cursor.slice(CURSOR_PREFIX.length));
  return Number.isInteger(offset) && offset > 0 ? offset : 0;
}

/** GET /studio/artists/:id/placements in the demo. */
export function demoStudioArtistPlacements(
  subprofileId: string,
  cursor: string | null,
): StudioPlacementsPageDTO {
  const all = demoArtistPlacements(subprofileId);
  const offset = offsetOf(cursor);
  const nextOffset = offset + DEMO_PLACEMENTS_PAGE_SIZE;
  return {
    items: all.slice(offset, nextOffset),
    nextCursor:
      nextOffset < all.length ? `${CURSOR_PREFIX}${nextOffset}` : null,
  };
}

/** A milestone's track as `{ id, title }`, the title from Mariana's catalogue. */
function trackRefOf(trackId: string): { id: string; title: string } | null {
  for (const release of demoPublishedReleasesOf(DEMO_ARTIST_MARIANA.id)) {
    const track = release.tracks.find((entry) => entry.id === trackId);
    if (track) return { id: track.id, title: track.title };
  }
  return null;
}

function milestoneOf(
  seed: (typeof DEMO_MILESTONE_SEEDS)[number],
): StudioMilestoneDTO {
  return {
    id: seed.id,
    kind: seed.kind,
    threshold: seed.threshold,
    track: seed.trackId ? trackRefOf(seed.trackId) : null,
    reachedAt: new Date(
      Date.now() - seed.daysAgo * MILLISECONDS_PER_DAY,
    ).toISOString(),
  };
}

/** GET /studio/artists/:id/milestones in the demo, newest first. */
export function demoStudioArtistMilestones(
  subprofileId: string,
): StudioMilestonesResponseDTO {
  if (!isDemoOwnedPersona(subprofileId)) throw new ApiError(404, "Not found");
  return {
    items: DEMO_MILESTONE_SEEDS.filter(
      (seed) => seed.subprofileId === subprofileId,
    )
      .map(milestoneOf)
      .sort((left, right) => right.reachedAt.localeCompare(left.reachedAt)),
  };
}

/** GET /studio/milestones/:id in the demo. */
export function demoStudioMilestoneCard(
  milestoneId: string,
): StudioMilestoneCardDTO {
  const seed = DEMO_MILESTONE_SEEDS.find((entry) => entry.id === milestoneId);
  if (!seed) {
    throw new ApiError(404, "This milestone is not available to you.", {
      statusCode: 404,
      code: "studio_milestone_not_found",
    });
  }
  return {
    milestone: milestoneOf(seed),
    artist:
      seed.subprofileId === DEMO_ARTIST_LATE_BLOOMERS.id
        ? DEMO_ARTIST_LATE_BLOOMERS
        : DEMO_ARTIST_MARIANA,
  };
}

/** The release checklist the server builds, in contract order. */
export function demoReleaseHealthOf(
  release: StudioReleaseDTO,
): StudioReleaseHealthItemDTO[] {
  if (release.status === "taken_down") return [];
  const hasNoTrack = release.tracks.length === 0;
  const gaps = DEMO_RELEASE_HEALTH_GAPS[release.id] ?? [];
  const keys =
    release.type === "podcast"
      ? PODCAST_HEALTH_KEYS
      : release.status === "published" && release.hasUnnotedChanges
        ? [...STANDARD_HEALTH_KEYS, "versionNote" as const]
        : STANDARD_HEALTH_KEYS;
  return keys.map((key) => ({
    key,
    isDone:
      key !== "versionNote" &&
      !gaps.includes(key) &&
      !(hasNoTrack && (key === "creditsOnEveryTrack" || key === "lyrics")),
    isOptional: STUDIO_OPTIONAL_HEALTH_KEYS.has(key),
  }));
}

/** 12 Monday-start UTC weeks ending with the week of `now`, from the
 *  persona's own series (Mariana's when the persona has none). */
export function demoFollowerGrowth(
  subprofileId: string,
  now: Date = new Date(),
): StudioFollowerGrowthWeekDTO[] {
  const series =
    DEMO_FOLLOWER_GROWTH_BY_PERSONA[subprofileId] ??
    DEMO_FOLLOWER_GROWTH_BY_PERSONA[DEMO_ARTIST_MARIANA.id] ??
    [];
  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const currentMonday = midnight - daysSinceMonday * MILLISECONDS_PER_DAY;
  const weekCount = series.length;
  return series.map((newFollowers, index) => ({
    weekStart: new Date(
      currentMonday - (weekCount - 1 - index) * 7 * MILLISECONDS_PER_DAY,
    )
      .toISOString()
      .slice(0, 10),
    newFollowers,
  }));
}

/** The earliest scheduled release, ties by id. `remindersOf` carries the
 *  caller's floor rule; without it the count reads as a plain zero. */
export function demoNextReleaseOf(
  rows: StudioReleaseDTO[],
  remindersOf: (releaseId: string) => StudioCountDTO = () => ({
    value: 0,
    isBelowThreshold: false,
  }),
): StudioNextReleaseDTO | null {
  const next = rows
    .filter((row) => row.status === "scheduled" && Boolean(row.publishAt))
    .sort(
      (left, right) =>
        (left.publishAt ?? "").localeCompare(right.publishAt ?? "") ||
        left.id.localeCompare(right.id),
    )[0];
  return next?.publishAt
    ? {
        releaseId: next.id,
        title: next.title,
        publishAt: next.publishAt,
        reminders: remindersOf(next.id),
      }
    : null;
}
