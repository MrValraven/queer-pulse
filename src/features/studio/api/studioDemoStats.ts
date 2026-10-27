import { ApiError } from "../../../shared/api/client";
import type { StudioArtistStatsDTO } from "./studio.types";
import { demoArtistFollowerCount, demoReleaseCard } from "./studioDemoCards";
import {
  DEMO_OWNER_RELEASES,
  DEMO_SCHEDULED_RELEASE_ID,
} from "./studioDemo.data";
import {
  DEMO_FORMAT_RELEASES,
  demoPublishedReleasesOf,
  isDemoOwnedPersona,
} from "./studioDemoFormats.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { demoPublicInclusions } from "./studioDemoPlaylists";
import {
  demoFollowerGrowth,
  demoNextReleaseOf,
  demoReleaseHealthOf,
} from "./studioDemoDashboard";
import { demoFlooredCount, demoTrackPlaysOf } from "./studioDemoDashboardPlays";

/** Save totals cycled over the demo owner's releases. 3 and 1 exercise the
 *  "Fewer than 5" rule; 0 shows a real zero. */
const DEMO_SAVE_TOTALS = [42, 3, 0, 17, 8, 1, 26];

/** Notify me holders per scheduled release (12 shows as a number; the
 *  server's floor would hide 1 to 4 the same way). */
const DEMO_REMINDER_TOTALS: Record<string, number> = {
  [DEMO_SCHEDULED_RELEASE_ID]: 12,
};

/** The server's rule, applied the same way: 1 to 4 is withheld. */
const countOf = demoFlooredCount;

/** The persona's releases that are not live: Mariana's fixture, else any
 *  unpublished release of the artist kinds catalogue. */
const unpublishedOf = (subprofileId: string) =>
  subprofileId === DEMO_ARTIST_MARIANA.id
    ? DEMO_OWNER_RELEASES
    : DEMO_FORMAT_RELEASES.filter(
        (release) =>
          release.artist.id === subprofileId && release.status !== "published",
      );

/** GET /studio/artists/:id/stats in the demo: only the demo owner's personas
 *  (the ones they can upload as) answer; any other id is a 404, as it is
 *  live for a non-owner. */
export function demoStudioArtistStats(
  subprofileId: string,
): StudioArtistStatsDTO {
  if (!isDemoOwnedPersona(subprofileId)) throw new ApiError(404, "Not found");
  const published = demoPublishedReleasesOf(subprofileId);
  const releaseRows = [...published, ...unpublishedOf(subprofileId)];
  const releases = releaseRows.map((release, index) => {
    const isScheduled = release.status === "scheduled";
    // A scheduled release has no listeners yet, so nothing saved it.
    const saves = isScheduled
      ? 0
      : (DEMO_SAVE_TOTALS[index % DEMO_SAVE_TOTALS.length] ?? 0);
    // Episodes never count as plays, as on the server.
    const isPodcast = release.type === "podcast";
    const trackPlays = release.tracks.map((track) =>
      isPodcast ? { plays: 0, plays28d: 0 } : demoTrackPlaysOf(track.id),
    );
    return {
      release: { ...demoReleaseCard(release), status: release.status },
      plays: countOf(trackPlays.reduce((sum, row) => sum + row.plays, 0)),
      plays28d: countOf(trackPlays.reduce((sum, row) => sum + row.plays28d, 0)),
      saves: countOf(saves),
      playlistInclusions: countOf(
        demoPublicInclusions(release.tracks.map((track) => track.id)),
      ),
      // Artist kinds: a show gets release-level numbers only (spec 6.5).
      tracks: (release.type === "podcast" ? [] : release.tracks).map(
        (track, trackIndex) => ({
          track,
          saves: countOf(Math.max(0, saves - trackIndex * 4)),
          plays: countOf(demoTrackPlaysOf(track.id).plays),
          plays28d: countOf(demoTrackPlaysOf(track.id).plays28d),
          playlistInclusions: countOf(demoPublicInclusions([track.id])),
        }),
      ),
      reminders: isScheduled
        ? countOf(DEMO_REMINDER_TOTALS[release.id] ?? 0)
        : null,
      health: demoReleaseHealthOf(release),
    };
  });
  return {
    subprofileId,
    followerCount: demoArtistFollowerCount(subprofileId),
    releases,
    followerGrowth: demoFollowerGrowth(subprofileId),
    nextRelease: demoNextReleaseOf(releaseRows, (releaseId) =>
      countOf(DEMO_REMINDER_TOTALS[releaseId] ?? 0),
    ),
  };
}
