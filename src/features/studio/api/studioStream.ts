import type { QueryClient } from "@tanstack/react-query";
import { getStudioStream } from "./studio.api";
import type { StudioStreamAnalysis, StudioStreamDTO } from "./studio.types";
import { getStudioPreviewStream } from "./studioArtistTools.api";
import { studioKeys } from "./studioQueryKeys";

const DEMO_STREAM_LIFETIME_MS = 15 * 60_000;

/** What a track holds before (or after new audio clears) its analysis. */
export const EMPTY_STREAM_ANALYSIS: StudioStreamAnalysis = {
  waveformPeaks: null,
  loudnessLufs: null,
  peakDb: null,
};

/**
 * A fresh signed stream URL for one track, with the track's stored analysis.
 * Fetched imperatively by the player for the one track that is loading: the
 * URL lifetime is per track (contract A.2) and the URL lives in memory only.
 * A `previewToken` reads the track through its release's private preview
 * link. Demo has no audio files, so it answers an empty URL that the
 * simulated engine plays as a silent clock, with the track's seeded analysis.
 * `gaplessAfterTrackId` names the track this one follows without a
 * crossfade; an older server leaves it out, which reads as null.
 */
export async function fetchStudioStream(
  demoMode: boolean,
  trackId: string,
  previewToken?: string,
): Promise<StudioStreamDTO & { gaplessAfterTrackId: string | null }> {
  if (demoMode) {
    const { demoGaplessAfterTrackId, demoStreamAnalysis } =
      await import("./studioDemoListening");
    return {
      url: "",
      expiresAt: new Date(Date.now() + DEMO_STREAM_LIFETIME_MS).toISOString(),
      ...demoStreamAnalysis(trackId),
      gaplessAfterTrackId: demoGaplessAfterTrackId(trackId),
    };
  }
  const stream = previewToken
    ? await getStudioPreviewStream(previewToken, trackId)
    : await getStudioStream(trackId);
  return {
    url: stream.url,
    expiresAt: stream.expiresAt,
    ...streamAnalysisOf(stream),
    gaplessAfterTrackId: stream.gaplessAfterTrackId ?? null,
  };
}

/** The analysis part of a stream; fields an older server leaves out read as
 *  null. */
export function streamAnalysisOf(
  stream: StudioStreamDTO,
): StudioStreamAnalysis {
  return {
    waveformPeaks: stream.waveformPeaks ?? null,
    loudnessLufs: stream.loudnessLufs ?? null,
    peakDb: stream.peakDb ?? null,
  };
}

/** Keeps a track's analysis where the player and the editor read it. */
export function rememberStreamAnalysis(
  queryClient: QueryClient,
  demoMode: boolean,
  trackId: string,
  analysis: StudioStreamAnalysis,
): void {
  queryClient.setQueryData(
    studioKeys.streamAnalysis(demoMode, trackId),
    analysis,
  );
}

/** Empties a track's analysis (new audio was confirmed). It writes the empty
 *  analysis into the same query, so a player already watching the key hears
 *  the change and a later remember lands where that player reads. */
export function forgetStreamAnalysis(
  queryClient: QueryClient,
  demoMode: boolean,
  trackId: string,
): void {
  rememberStreamAnalysis(queryClient, demoMode, trackId, {
    ...EMPTY_STREAM_ANALYSIS,
  });
}
