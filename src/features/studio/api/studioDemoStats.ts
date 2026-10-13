import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_STATS_THRESHOLD,
  type StudioArtistStatsDTO,
  type StudioCountDTO,
} from "./studio.types";
import { demoArtistFollowerCount, demoReleaseCard } from "./studioDemoCards";
import { DEMO_OWNER_RELEASES, DEMO_RELEASES } from "./studioDemo.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { demoPublicInclusions } from "./studioDemoPlaylists";

/** Save totals cycled over the demo owner's releases. 3 and 1 exercise the
 *  "Fewer than 5" rule; 0 shows a real zero. */
const DEMO_SAVE_TOTALS = [42, 3, 0, 17, 8, 1, 26];

/** The server's rule, applied the same way: 1 to 4 is withheld. */
function countOf(total: number): StudioCountDTO {
  return total > 0 && total < STUDIO_STATS_THRESHOLD
    ? { value: null, isBelowThreshold: true }
    : { value: total, isBelowThreshold: false };
}

/** GET /studio/artists/:id/stats in the demo: only the demo owner's persona
 *  answers; any other id is a 404, as it is live for a non-owner. */
export function demoStudioArtistStats(
  subprofileId: string,
): StudioArtistStatsDTO {
  if (subprofileId !== DEMO_ARTIST_MARIANA.id)
    throw new ApiError(404, "Not found");
  const published = DEMO_RELEASES.filter(
    (release) => release.artist.id === subprofileId,
  );
  const releases = [...published, ...DEMO_OWNER_RELEASES].map(
    (release, index) => {
      const saves = DEMO_SAVE_TOTALS[index % DEMO_SAVE_TOTALS.length] ?? 0;
      return {
        release: { ...demoReleaseCard(release), status: release.status },
        saves: countOf(saves),
        playlistInclusions: countOf(
          demoPublicInclusions(release.tracks.map((track) => track.id)),
        ),
        tracks: release.tracks.map((track, trackIndex) => ({
          track,
          saves: countOf(Math.max(0, saves - trackIndex * 4)),
          playlistInclusions: countOf(demoPublicInclusions([track.id])),
        })),
      };
    },
  );
  return {
    subprofileId,
    followerCount: demoArtistFollowerCount(subprofileId),
    releases,
  };
}
