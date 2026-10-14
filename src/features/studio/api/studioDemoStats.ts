import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_STATS_THRESHOLD,
  type StudioArtistStatsDTO,
  type StudioCountDTO,
} from "./studio.types";
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

/** Save totals cycled over the demo owner's releases. 3 and 1 exercise the
 *  "Fewer than 5" rule; 0 shows a real zero. */
const DEMO_SAVE_TOTALS = [42, 3, 0, 17, 8, 1, 26];

/** Notify me holders per scheduled release (12 shows as a number; the
 *  server's floor would hide 1 to 4 the same way). */
const DEMO_REMINDER_TOTALS: Record<string, number> = {
  [DEMO_SCHEDULED_RELEASE_ID]: 12,
};

/** The server's rule, applied the same way: 1 to 4 is withheld. */
function countOf(total: number): StudioCountDTO {
  return total > 0 && total < STUDIO_STATS_THRESHOLD
    ? { value: null, isBelowThreshold: true }
    : { value: total, isBelowThreshold: false };
}

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
  const releases = [...published, ...unpublishedOf(subprofileId)].map(
    (release, index) => {
      const isScheduled = release.status === "scheduled";
      // A scheduled release has no listeners yet, so nothing saved it.
      const saves = isScheduled
        ? 0
        : (DEMO_SAVE_TOTALS[index % DEMO_SAVE_TOTALS.length] ?? 0);
      return {
        release: { ...demoReleaseCard(release), status: release.status },
        saves: countOf(saves),
        playlistInclusions: countOf(
          demoPublicInclusions(release.tracks.map((track) => track.id)),
        ),
        // Artist kinds: a show gets release-level numbers only (spec 6.5).
        tracks: (release.type === "podcast" ? [] : release.tracks).map(
          (track, trackIndex) => ({
            track,
            saves: countOf(Math.max(0, saves - trackIndex * 4)),
            playlistInclusions: countOf(demoPublicInclusions([track.id])),
          }),
        ),
        reminders: isScheduled
          ? countOf(DEMO_REMINDER_TOTALS[release.id] ?? 0)
          : null,
      };
    },
  );
  return {
    subprofileId,
    followerCount: demoArtistFollowerCount(subprofileId),
    releases,
  };
}
