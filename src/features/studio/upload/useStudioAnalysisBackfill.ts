import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { StudioReleaseView } from "../api/studio.adapters";
import { studioKeys } from "../api/studioQueryKeys";
import { fetchStudioStream } from "../api/studioStream";
import { useUpdateStudioTrack } from "../api/useStudioTrackMutations";
import {
  analyseStudioAudio,
  type StudioAnalysisOutcome,
} from "./analysis/analyseStudioAudio";
import { sniffAudioKind } from "./analysis/studioAudioSniff";
import {
  StudioRangeUnsupportedError,
  rangeByteSource,
} from "./analysis/studioByteSource";
import { whenConversionIdle } from "./convert/studioWavConverter";
import {
  runWithAnalysisTimeout,
  wholeDecodeLimitSeconds,
} from "./studioAnalysisRunner";

/** Failures that every other track would hit the same way. The backfill
 *  stops for the session after the first one and asks for no more stream
 *  URLs that would only fail again:
 *  - a TypeError from the range fetch: the bucket's CORS rule is missing
 *    (or the network is gone), so no ranged read can succeed;
 *  - StudioRangeUnsupportedError: the storage server ignores Range;
 *  - a 403 on the PATCH: this viewer may no longer change the release. */
const isRangeReadBlocked = (error: unknown) =>
  error instanceof TypeError || error instanceof StudioRangeUnsupportedError;
const isPatchRefused = (error: unknown) =>
  error instanceof ApiError && error.status === 403;

/** A stored track, read from its signed stream URL in byte ranges. Live
 *  only: demo has no audio files to read. */
async function measureStoredTrack(
  trackId: string,
  durationSeconds: number | null,
  signal: AbortSignal,
  onBlocked: () => void,
): Promise<StudioAnalysisOutcome> {
  const stream = await fetchStudioStream(false, trackId);
  if (!stream.url) return { status: "skipped" };
  const source = await rangeByteSource(stream.url, { signal }).catch(
    (error: unknown) => {
      if (!signal.aborted && isRangeReadBlocked(error)) onBlocked();
      throw error;
    },
  );
  const kind = await sniffAudioKind(source);
  if (!kind) return { status: "failed" };
  return analyseStudioAudio({
    source,
    kind,
    durationSeconds,
    signal,
    wholeDecodeLimitSeconds: wholeDecodeLimitSeconds(),
  });
}

/** Spec 8.2: measures an owner's older tracks one at a time, quietly. Demo
 *  answers no audio URL and every demo track is already measured, so the
 *  backfill idles there and fetches nothing. */
export function useStudioAnalysisBackfill({
  release,
  isEnabled,
  skipTrackIds,
}: {
  release: StudioReleaseView | null;
  isEnabled: boolean;
  skipTrackIds: ReadonlySet<string>;
}): { pendingCount: number } {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { mutateAsync: updateTrack } = useUpdateStudioTrack();
  const [attemptedIds, setAttemptedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [isStopped, setIsStopped] = useState(false);
  const isActive = isEnabled && !demoMode && !isStopped;
  const candidates = useMemo(
    () =>
      release?.ownerTracks && release.status !== "taken_down"
        ? release.ownerTracks.filter(
            (track) =>
              track.hasAudio &&
              !track.hasAnalysis &&
              !skipTrackIds.has(track.id) &&
              !attemptedIds.has(track.id),
          )
        : [],
    [release, skipTrackIds, attemptedIds],
  );
  const releaseId = release?.id ?? null;
  const nextTrackId = candidates[0]?.id ?? null;
  const nextDurationSeconds = candidates[0]?.durationSeconds ?? null;

  useEffect(() => {
    if (!isActive || releaseId === null || nextTrackId === null) return;
    const controller = new AbortController();
    void (async () => {
      // A phone converts one WAV at a time; the backfill starts after it.
      await whenConversionIdle(controller.signal);
      if (controller.signal.aborted) return;
      const blockState = { isBlocked: false };
      const outcome = await runWithAnalysisTimeout(
        (signal) =>
          measureStoredTrack(nextTrackId, nextDurationSeconds, signal, () => {
            blockState.isBlocked = true;
          }),
        nextDurationSeconds,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (outcome.status === "measured") {
        const { waveformPeaks, loudnessLufs, peakDb } = outcome.analysis;
        await updateTrack({
          trackId: nextTrackId,
          releaseId,
          body: { waveformPeaks, loudnessLufs, peakDb },
        })
          .then(() =>
            queryClient.invalidateQueries({
              queryKey: studioKeys.release(false, releaseId),
            }),
          )
          .catch((error: unknown) => {
            if (isPatchRefused(error)) blockState.isBlocked = true;
          });
      }
      if (blockState.isBlocked) setIsStopped(true);
      if (!controller.signal.aborted)
        setAttemptedIds((previous) => new Set(previous).add(nextTrackId));
    })();
    return () => controller.abort();
  }, [
    isActive,
    releaseId,
    nextTrackId,
    nextDurationSeconds,
    queryClient,
    updateTrack,
  ]);

  return { pendingCount: isActive ? candidates.length : 0 };
}
