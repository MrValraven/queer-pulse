// Studio landing v2 wire types
// (QUEERPULSE-STUDIO-LANDING-V2-CONTRACT-2026-10-28.md, sections 2, 3, 10,
// 11.1 and 12.1). Kinds, statuses and relations are typed `string` where a
// newer server could send more, as studioDashboard.types.ts does.
import type { StudioArtistRefDTO } from "./studio.types";

/** Public persona fields. No persona id, no member field. */
export interface StudioLandingPersonaDTO {
  name: string;
  /** The public persona handle, for /p/:handle. */
  handle: string;
  kind: string;
  avatarUrl: string | null;
}

export interface StudioLandingNextEventDTO {
  slug: string;
  title: string;
  startAt: string;
  timezone: string;
  /** The event's neighbourhood, or null. Area level only. */
  area: string | null;
  isOnline: boolean;
  artist: StudioLandingPersonaDTO;
}

export interface StudioLandingPreviewCardDTO {
  /** The preview id: the key of the stream route. */
  id: string;
  trackTitle: string;
  durationSeconds: number;
  coverUrl: string | null;
  /** The release persona. */
  artist: StudioLandingPersonaDTO;
}

export interface StudioLandingArtistCardDTO {
  /** The card id, a render key. */
  id: string;
  artist: StudioLandingPersonaDTO;
  quote: string | null;
  isFoundingArtist: boolean;
}

export interface StudioLandingPhotoDTO {
  url: string;
  altText: { en: string; pt: string };
  credit: string | null;
}

/** `GET /studio/landing` (public). */
export interface StudioLandingDTO {
  counts: {
    /** Null below 5. */
    artists: number | null;
    /** Null below 5. */
    releases: number | null;
    /** Events this calendar month (Europe/Lisbon) with a Studio artist.
     *  Null below 5. */
    eventsThisMonth: number | null;
  };
  nextEvent: StudioLandingNextEventDTO | null;
  /** Max 5, staff order. */
  previews: StudioLandingPreviewCardDTO[];
  /** Max 6: founding artists first, then staff order. */
  artists: StudioLandingArtistCardDTO[];
  photos: {
    hero: StudioLandingPhotoDTO | null;
    manifesto: StudioLandingPhotoDTO | null;
  };
}

/** `GET /studio/landing/previews/:previewId/stream` (public). */
export interface StudioLandingPreviewStreamDTO {
  /** Presigned GET. */
  url: string;
  expiresAt: string;
}

/** One row of `GET /studio/artists/:subprofileId/landing-previews`. */
export interface StudioLandingPreviewOwnerItemDTO {
  id: string;
  /** "pending" | "approved" | "declined" | "withdrawn". Answered rows come
   *  back once in the action's own answer, with the new status. */
  status: string;
  /** "main" | "credited": this persona's link to the track. */
  relation: string;
  track: { id: string; title: string; durationSeconds: number | null };
  release: { id: string; title: string; coverUrl: string | null };
  /** The release persona. */
  mainArtist: StudioArtistRefDTO;
  requestedAt: string;
  decidedAt: string | null;
  isEligible: boolean;
  /** relation "main" and status "pending". */
  canApprove: boolean;
  /** relation "main" and status "pending". */
  canDecline: boolean;
  /** status "approved". */
  canWithdraw: boolean;
}

export interface StudioLandingPreviewOwnerListDTO {
  /** Pending first (requestedAt asc), then approved (decidedAt desc). */
  items: StudioLandingPreviewOwnerItemDTO[];
}

/** `GET /studio/founding-artists` (granted members). */
export interface StudioFoundingArtistsDTO {
  /** The launch shelf switch (a missing settings row reads true). */
  isShelfVisible: boolean;
  /** Every listed founding artist the caller can see, position asc. */
  artists: StudioArtistRefDTO[];
}

/** `POST /studio/access-requests` body. */
export interface CreateStudioAccessRequestBody {
  wantsToRelease: boolean;
}

/** `POST /studio/access-requests` answer (201). */
export interface StudioAccessRequestStateDTO {
  hasPendingRequest: true;
  wantsToRelease: boolean;
  requestedAt: string;
}
