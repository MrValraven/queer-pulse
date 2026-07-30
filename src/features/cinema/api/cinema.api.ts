import { apiGet, apiPost, apiPut } from "../../../shared/api/client";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// Shapes the NestJS cinema `TitlesController` returns (guarded by
// ActiveMemberGuard — an active, signed-in member). Field names mirror
// `title-response.ts` exactly; `Date` columns arrive as ISO strings over JSON.

export type TitleKind = "film" | "short";

export type TitleStatus =
  | "draft"
  | "awaiting_upload"
  | "processing"
  | "ready"
  | "failed";

export interface MyProgressDTO {
  positionSeconds: number;
  /** True once the saved position is within the final 3% of the title. */
  finished: boolean;
}

export interface TitleListItemDTO {
  id: string;
  kind: TitleKind;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
  viewCount: number;
  myProgress: MyProgressDTO | null;
  // Admin-only (present only in the moderator `?all=true` list, never used here).
  status?: TitleStatus;
  errorMessage?: string | null;
}

export type TitleDetailDTO = TitleListItemDTO;

/**
 * A playback session embedding short-TTL signed Mux URLs. The endpoint answers
 * with `Cache-Control: no-store`; this response must NEVER be cached — it is
 * fetched through a mutation (not a query) and dropped when the player unmounts.
 */
export interface PlaybackSessionDTO {
  hlsUrl: string;
  posterUrl: string;
  storyboardUrl: string;
  expiresAt: string;
  /** Where to resume (0 when finished or never started). */
  resumePositionSeconds: number;
  durationSeconds: number | null;
}

export interface ReportProgressResultDTO {
  positionSeconds: number;
  viewCounted: boolean;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /cinema/titles — published, ready catalog titles for the member. */
export const getCinemaTitles = () =>
  apiGet<TitleListItemDTO[]>("/cinema/titles");

/** GET /cinema/titles/:id — one title's detail. */
export const getCinemaTitle = (id: string) =>
  apiGet<TitleDetailDTO>(`/cinema/titles/${id}`);

/**
 * POST /cinema/titles/:id/playback — mint a playback session with signed URLs.
 * Never cache the result (see PlaybackSessionDTO).
 */
export const createPlaybackSession = (id: string) =>
  apiPost<PlaybackSessionDTO>(`/cinema/titles/${id}/playback`);

/** PUT /cinema/titles/:id/progress — persist the member's watch position. */
export const reportCinemaProgress = (id: string, positionSeconds: number) =>
  apiPut<ReportProgressResultDTO>(`/cinema/titles/${id}/progress`, {
    positionSeconds,
  });
