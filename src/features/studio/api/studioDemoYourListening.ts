import type { StudioPlaylistTrackDTO } from "./studio.types";
import type {
  StudioListeningRange,
  StudioListeningSummaryDTO,
  StudioListensPageDTO,
} from "./studioListening.types";
import { STUDIO_LISTENING_TOP_MAX } from "./studioListening.types";
import { DEMO_ARTISTS } from "./studioDemo.data";
import { demoReleaseCard } from "./studioDemoCards";
import {
  DEMO_FORMAT_ARTISTS,
  demoPublishedReleasesOf,
} from "./studioDemoFormats.data";
import {
  DEMO_LISTEN_SEEDS,
  DEMO_RECENT_PAGE_SIZE,
} from "./studioDemoYourListening.data";
import { resetDemoYourSupporters } from "./studioDemoYourSupporters";

export {
  demoDeleteStudioSupporter,
  demoPutStudioSupporter,
  demoStudioListeningSupporting,
  demoStudioSupporterState,
} from "./studioDemoYourSupporters";

// The demo viewer's own listening (contract 4). Demo plays never add rows
// (contract 11): the history is the seeds, held in memory until cleared.

const CURSOR_PREFIX = "demo-listens:";
const HOURS_TO_MILLISECONDS = 3600 * 1000;
const RANGE_DAYS: Readonly<Record<StudioListeningRange, number>> = {
  "4w": 28,
  "6m": 183,
  "12m": 365,
};

let historyRows:
  { id: string; trackId: string | null; hoursAgo: number }[] | null = null;
let trackById: Map<string, StudioPlaylistTrackDTO> | null = null;

function history() {
  historyRows ??= DEMO_LISTEN_SEEDS.map((seed) => ({ ...seed }));
  return historyRows;
}

/** Every published track of a persona the viewer does not own, with its
 *  release card: what the viewer can play. */
function tracks(): Map<string, StudioPlaylistTrackDTO> {
  trackById ??= new Map(
    [...DEMO_ARTISTS, ...DEMO_FORMAT_ARTISTS].flatMap((artist) =>
      demoPublishedReleasesOf(artist.id).flatMap((release) =>
        release.tracks.map(
          (track) =>
            [
              track.id,
              { ...track, release: demoReleaseCard(release) },
            ] as const,
        ),
      ),
    ),
  );
  return trackById;
}

export function resetDemoYourListening(): void {
  historyRows = null;
  resetDemoYourSupporters();
}

export function demoClearStudioListening(): void {
  historyRows = [];
}

interface Ranked {
  listens: number;
  latestHoursAgo: number;
}

function rankDescending<Item extends Ranked>(
  entries: [string, Item][],
): [string, Item][] {
  return entries.sort(
    ([leftId, left], [rightId, right]) =>
      right.listens - left.listens ||
      left.latestHoursAgo - right.latestHoursAgo ||
      leftId.localeCompare(rightId),
  );
}

export function demoStudioListeningSummary(
  range: StudioListeningRange,
  now: Date = new Date(),
): StudioListeningSummaryDTO {
  const windowHours = RANGE_DAYS[range] * 24;
  const rows = history().filter((row) => row.hoursAgo < windowHours);
  const days = new Set(
    rows.map((row) =>
      new Date(now.getTime() - row.hoursAgo * HOURS_TO_MILLISECONDS)
        .toISOString()
        .slice(0, 10),
    ),
  );
  const byTrack = new Map<string, Ranked>();
  const byArtist = new Map<string, Ranked>();
  for (const row of rows) {
    const track = row.trackId === null ? undefined : tracks().get(row.trackId);
    if (!track) continue;
    for (const [bucket, id] of [
      [byTrack, track.id],
      [byArtist, track.release.artist.id],
    ] as const) {
      const entry = bucket.get(id) ?? { listens: 0, latestHoursAgo: Infinity };
      bucket.set(id, {
        listens: entry.listens + 1,
        latestHoursAgo: Math.min(entry.latestHoursAgo, row.hoursAgo),
      });
    }
  }
  return {
    range,
    totalListens: rows.length,
    listeningDays: days.size,
    topArtists: rankDescending([...byArtist.entries()])
      .slice(0, STUDIO_LISTENING_TOP_MAX)
      .flatMap(([id, entry]) => {
        const artist = [...DEMO_ARTISTS, ...DEMO_FORMAT_ARTISTS].find(
          (candidate) => candidate.id === id,
        );
        return artist ? [{ artist, listens: entry.listens }] : [];
      }),
    topTracks: rankDescending([...byTrack.entries()])
      .slice(0, STUDIO_LISTENING_TOP_MAX)
      .flatMap(([id, entry]) => {
        const track = tracks().get(id);
        return track ? [{ track, listens: entry.listens }] : [];
      }),
  };
}

/** Newest first; the cursor is an opaque offset, and garbage reads as page one. */
export function demoStudioListeningRecent(
  cursor: string | null,
  now: Date = new Date(),
): StudioListensPageDTO {
  const parsed =
    cursor !== null && cursor.startsWith(CURSOR_PREFIX)
      ? Number(cursor.slice(CURSOR_PREFIX.length))
      : 0;
  const offset = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  const newestFirst = [...history()].sort(
    (left, right) =>
      left.hoursAgo - right.hoursAgo || left.id.localeCompare(right.id),
  );
  const page = newestFirst.slice(offset, offset + DEMO_RECENT_PAGE_SIZE);
  const nextOffset = offset + page.length;
  return {
    items: page.map((row) => ({
      id: row.id,
      playedAt: new Date(
        now.getTime() - row.hoursAgo * HOURS_TO_MILLISECONDS,
      ).toISOString(),
      track: row.trackId === null ? null : (tracks().get(row.trackId) ?? null),
    })),
    nextCursor:
      nextOffset < newestFirst.length ? `${CURSOR_PREFIX}${nextOffset}` : null,
  };
}
