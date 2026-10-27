import type {
  StudioArtistRefDTO,
  StudioPlaylistPersonDTO,
  StudioPlaylistTrackDTO,
  StudioSupportLinkDTO,
} from "./studio.types";

// Studio dashboard upgrade, Part 2 (CONTRACT-PART-2 sections 2, 4 and 5, with
// the backend deltas 3 to 5). The contract's StudioPlaylistEntryTrack is the
// frontend's StudioPlaylistTrackDTO, the same shape.

export const STUDIO_LISTENING_RANGES = ["4w", "6m", "12m"] as const;
export type StudioListeningRange = (typeof STUDIO_LISTENING_RANGES)[number];
export const STUDIO_LISTENING_TOP_MAX = 10;
export const STUDIO_LISTENS_PAGE_SIZE = 30;

/** GET /me/studio-listening?range=: the caller's own counts, unfloored.
 *  `range` is typed string so a range from a newer server reaches the adapter. */
export interface StudioListeningSummaryDTO {
  range: string;
  totalListens: number;
  listeningDays: number;
  topArtists: { artist: StudioArtistRefDTO; listens: number }[];
  topTracks: { track: StudioPlaylistTrackDTO; listens: number }[];
}

/** `track` is null when the caller cannot play it now, rendered as unavailable. */
export interface StudioListenDTO {
  id: string;
  playedAt: string;
  track: StudioPlaylistTrackDTO | null;
}

/** GET /me/studio-listening/recent?cursor=, newest first. */
export interface StudioListensPageDTO {
  items: StudioListenDTO[];
  nextCursor: string | null;
}

/** `kind` is typed string so a kind from a newer server reaches the adapter. */
export interface StudioSupporterPersonaDTO {
  id: string;
  handle: string;
  name: string;
  kind: string;
  avatarUrl: string | null;
  isLinkable: boolean;
}

export type StudioSupporterIdentityDTO =
  | { kind: "account"; member: StudioPlaylistPersonDTO }
  | { kind: "persona"; persona: StudioSupporterPersonaDTO };

export interface StudioSupportingItemDTO {
  artist: StudioArtistRefDTO;
  since: string;
  shownAs: StudioSupporterIdentityDTO;
  supportLinks: StudioSupportLinkDTO[];
  isFollowing: boolean;
}

/** GET /me/studio-listening/supporting, newest first. */
export interface StudioSupportingResponseDTO {
  items: StudioSupportingItemDTO[];
}

export interface StudioSupporterOptionDTO {
  shownAsSubprofileId: string | null;
  identity: StudioSupporterIdentityDTO;
}

/** GET and PUT /studio/artists/:subprofileId/supporter. The options are
 *  "Your account" first, then every persona the caller is a member of, any
 *  kind, by display name then id. */
export interface StudioSupporterStateDTO {
  isSupporting: boolean;
  shownAsSubprofileId: string | null;
  shownAs: StudioSupporterIdentityDTO | null;
  since: string | null;
  options: StudioSupporterOptionDTO[];
}

/** PUT body; the key is required and null shows the account. */
export interface UpdateStudioSupporterBody {
  shownAsSubprofileId: string | null;
}

/** POST /studio/plays */
export interface RecordStudioPlayBody {
  trackId: string;
}
