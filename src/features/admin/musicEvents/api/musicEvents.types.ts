import type { EventCardDTO } from "../../../gatherings/api/events.api";

/** The three tabs of the music events list, as `GET /admin/music-events`
 *  takes them in `?bucket=`. */
export const MUSIC_EVENT_BUCKETS = ["upcoming", "past", "cancelled"] as const;
export type MusicEventBucket = (typeof MUSIC_EVENT_BUCKETS)[number];

/** Rows the server sends per list page (contract section 2). */
export const MUSIC_EVENT_PAGE_SIZE = 20;
/** Rows the server sends per Studio artist search page. */
export const STUDIO_ARTIST_PAGE_SIZE = 20;

/** How the event's lineup invites stand. Backend `AdminMusicEventLineupCounts`. */
export interface AdminMusicEventLineupCountsDTO {
  pending: number;
  accepted: number;
  declined: number;
}

/** One row of the list. Backend `AdminMusicEventListItem`. */
export interface AdminMusicEventListItemDTO extends EventCardDTO {
  lineupCounts: AdminMusicEventLineupCountsDTO;
  /** Member invites waiting for the house to approve or decline them. */
  pendingInviteRequestCount: number;
}

/** Totals across every upcoming or underway house music event, whatever
 *  bucket was asked for. Backend `AdminMusicEventAttention`. */
export interface AdminMusicEventAttentionDTO {
  pendingInviteRequestCount: number;
  pendingLineupCount: number;
}

/** One page of the list. Backend `AdminMusicEventListPage`. */
export interface AdminMusicEventListPageDTO {
  items: AdminMusicEventListItemDTO[];
  page: number;
  pageSize: number;
  /** Exact: another page exists. */
  hasMore: boolean;
  attention: AdminMusicEventAttentionDTO;
}

/** A linked, listenable artist persona the member created. */
export interface StudioArtistPersonaRefDTO {
  subprofileId: string;
  handle: string;
  displayName: string;
  kind: string;
}

/** A member the lineup picker can book. Backend `StudioArtistCandidate`. */
export interface StudioArtistCandidateDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  artistPersonas: StudioArtistPersonaRefDTO[];
}

/** One page of the Studio artist search. Backend `Paginated<StudioArtistCandidate>`. */
export interface StudioArtistSearchPageDTO {
  items: StudioArtistCandidateDTO[];
  total: number;
  page: number;
  pageSize: number;
}
