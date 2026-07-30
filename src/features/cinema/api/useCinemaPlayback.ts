import { useMutation } from "@tanstack/react-query";
import {
  createPlaybackSession,
  reportCinemaProgress,
  type PlaybackSessionDTO,
  type ReportProgressResultDTO,
} from "./cinema.api";

/**
 * Mint a playback session (POST /cinema/titles/:id/playback) when the member
 * hits play. Deliberately a mutation, not a query: the response embeds
 * short-TTL signed Mux URLs served with `Cache-Control: no-store`, so it must
 * never be cached or shared — each play mints a fresh session that is held in
 * component state only and dropped on unmount.
 *
 * Only mounted in live mode (the demo watch page never renders the live
 * player), so it never fires in demo.
 */
export function usePlaybackSession() {
  return useMutation<PlaybackSessionDTO, Error, string>({
    mutationFn: (titleId: string) => createPlaybackSession(titleId),
  });
}

/**
 * Persist the member's watch position (PUT /cinema/titles/:id/progress). Called
 * periodically while playing and on pause/ended. Best-effort — a failed report
 * must never interrupt playback, so callers fire-and-forget.
 */
export function useReportProgress(titleId: string) {
  return useMutation<ReportProgressResultDTO, Error, number>({
    mutationFn: (positionSeconds: number) =>
      reportCinemaProgress(titleId, positionSeconds),
  });
}
