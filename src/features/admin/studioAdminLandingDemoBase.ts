import { ApiError } from "../../shared/api/client";
import type {
  StudioArtistRefDTO,
  StudioErrorCode,
} from "../studio/api/studio.types";
import { DEMO_RELEASES, DEMO_ARTISTS } from "../studio/api/studioDemo.data";
import {
  DEMO_ARTIST_LUA_CARDOSO,
  DEMO_ARTIST_VANDA_DIESEL,
} from "../studio/api/studioDemoFormats.data";
import { DEMO_ARTIST_LATE_BLOOMERS } from "../studio/api/studioDemoMe.data";
import {
  DEMO_ARTIST_WARNINGS,
  DEMO_WITHHELD_TRACK_ID,
} from "../studio/api/studioDemoSafety.data";
import type {
  AdminStudioLandingPreviewDTO,
  AdminStudioLandingTrackOptionDTO,
  AdminStudioStaffRefDTO,
  StudioLandingIneligibleReason,
} from "./api/studioLandingAdmin.api";
import { renumbered } from "./studioAdmin.model";

// The Studio page console's demo rules: limits, refusals, the demo staff,
// personas and tracks every demo write and search reads.

export const LIMITS = {
  openPreviews: 10,
  shownPreviews: 5,
  cards: 6,
  founding: 50,
};
export const SEARCH_MAX = 20;
const STATUS_TEXT: Record<number, string> = {
  400: "Bad Request",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
};

/** A key the demo did not issue: a photo PUT naming it answers the codeless
 *  403 the upload ownership check sends. */
export const DEMO_LANDING_FOREIGN_IMAGE_KEY =
  "uploads/another-member/photo.jpg";

export function demoRefusal(
  code: StudioErrorCode,
  status: 400 | 404 | 409 | 422,
  details: Record<string, unknown> = {},
): ApiError {
  const message = STATUS_TEXT[status] ?? "Error";
  return new ApiError(status, message, {
    statusCode: status,
    code,
    message,
    ...details,
  });
}

export const DEMO_STAFF: AdminStudioStaffRefDTO = {
  id: "demo-staff-sam",
  displayName: "Sam Alves",
};
export const INELIGIBLE_PERSONA_IDS: ReadonlySet<string> = new Set([
  "demo-persona-rita-ferreira",
  "demo-persona-coro-de-outubro",
]);
export const DEMO_PERSONAS: StudioArtistRefDTO[] = [
  ...DEMO_ARTISTS,
  DEMO_ARTIST_LUA_CARDOSO,
  DEMO_ARTIST_VANDA_DIESEL,
  DEMO_ARTIST_LATE_BLOOMERS,
];

function ineligibleReasonOf(
  release: { artist: StudioArtistRefDTO },
  track: { id: string; hasAudio: boolean; isExplicit: boolean },
): StudioLandingIneligibleReason | null {
  if (!track.hasAudio) return "not_playable";
  if (INELIGIBLE_PERSONA_IDS.has(release.artist.id))
    return "persona_not_eligible";
  if (release.artist.kind === "podcaster") return "podcast";
  if ((DEMO_ARTIST_WARNINGS[track.id]?.length ?? 0) > 0)
    return "content_warnings";
  if (track.isExplicit) return "explicit";
  if (track.id === DEMO_WITHHELD_TRACK_ID) return "open_claim";
  return null;
}

export type TrackEntry = Omit<
  AdminStudioLandingTrackOptionDTO,
  "hasOpenPreview"
>;

export function trackEntries(): TrackEntry[] {
  return DEMO_RELEASES.filter(
    (release) => release.status === "published",
  ).flatMap((release) =>
    release.tracks.map((track) => ({
      track: {
        id: track.id,
        title: track.title,
        durationSeconds: track.durationSeconds,
      },
      release: {
        id: release.id,
        title: release.title,
        coverUrl: release.coverUrl,
      },
      artist: release.artist,
      ineligibleReason: ineligibleReasonOf(release, track),
    })),
  );
}

export const isOpen = (preview: AdminStudioLandingPreviewDTO) =>
  preview.status === "pending" || preview.status === "approved";

/** Marks the approved, eligible rows inside the first 5 as on the page. */
export function flagged(open: AdminStudioLandingPreviewDTO[]) {
  let shown = 0;
  return renumbered(open).map((preview) => {
    const isOnLanding =
      preview.status === "approved" &&
      preview.ineligibleReason === null &&
      shown < LIMITS.shownPreviews;
    if (isOnLanding) shown += 1;
    return { ...preview, isOnLanding };
  });
}

export function previewOf(
  entry: TrackEntry,
  status: AdminStudioLandingPreviewDTO["status"],
  requestedAt: string,
): AdminStudioLandingPreviewDTO {
  const isDecided = status !== "pending";
  return {
    id: `demo-landing-preview-${entry.track.id}`,
    status,
    position: 0,
    track: entry.track,
    release: entry.release,
    artist: entry.artist,
    ineligibleReason: entry.ineligibleReason,
    isOnLanding: false,
    requestedBy: DEMO_STAFF,
    requestedAt,
    decidedBy: isDecided
      ? { id: entry.artist.id, displayName: entry.artist.name }
      : null,
    decidedAt: isDecided ? "2026-10-27T09:30:00.000Z" : null,
  };
}
