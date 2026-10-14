import { skipToken, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toWaveform,
  type StudioChapterView,
  type StudioSyncedLyricView,
} from "../api/studio.adapters";
import type { StudioStreamAnalysis } from "../api/studio.types";
import { studioKeys } from "../api/studioQueryKeys";
import { studioTrackQueryOptions } from "../api/studioTrackQuery";
import { useStudioAccess } from "../api/useStudioAccess";
import { activeIndexAt } from "./studioTimeline";

export interface StudioCurrentTrackDetail {
  chapters: StudioChapterView[] | null;
  syncedLyrics: StudioSyncedLyricView[] | null;
  /** 0..1 levels from the stream the player read; null before one. */
  waveform: number[] | null;
  chapterStartsSeconds: number[];
  lyricStartsSeconds: number[];
}

const NO_STARTS: number[] = [];

/** The track that plays: chapters and synced lyrics from its detail (the
 *  same read the track page makes), the waveform from its stream analysis.
 *  The analysis is only observed here (skipToken): the player's stream fetch
 *  writes it. An analysis with no peaks (audio was just replaced) reads as
 *  no waveform until the next stream fetch writes the new one.
 *  `shouldFetchDetail` false skips the detail read (a preview item, whose
 *  detail a previewer cannot read); the waveform still follows `trackId`. */
export function useStudioCurrentTrackDetail(
  trackId: string | null,
  shouldFetchDetail = true,
): StudioCurrentTrackDetail {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const detail = useQuery({
    ...studioTrackQueryOptions(demoMode, trackId ?? ""),
    enabled: shouldFetchDetail && trackId !== null && (demoMode || hasAccess),
  });
  const analysis = useQuery<StudioStreamAnalysis>({
    queryKey: studioKeys.streamAnalysis(demoMode, trackId ?? ""),
    queryFn: skipToken,
  });
  const track =
    trackId !== null && detail.data?.id === trackId ? detail.data : null;
  const chapters = track?.chapters ?? null;
  const syncedLyrics = track?.syncedLyrics ?? null;
  const peaks =
    trackId === null ? null : (analysis.data?.waveformPeaks ?? null);
  const waveform = useMemo(() => toWaveform(peaks), [peaks]);
  const chapterStartsSeconds = useMemo(
    () => chapters?.map((chapter) => chapter.startSeconds) ?? NO_STARTS,
    [chapters],
  );
  const lyricStartsSeconds = useMemo(
    () => syncedLyrics?.map((line) => line.ms / 1000) ?? NO_STARTS,
    [syncedLyrics],
  );
  return {
    chapters,
    syncedLyrics,
    waveform,
    chapterStartsSeconds,
    lyricStartsSeconds,
  };
}

export function studioClockIndexes(
  currentTime: number,
  detail: Pick<
    StudioCurrentTrackDetail,
    "chapterStartsSeconds" | "lyricStartsSeconds"
  >,
): { currentChapterIndex: number | null; currentLyricIndex: number | null } {
  return {
    currentChapterIndex: activeIndexAt(
      detail.chapterStartsSeconds,
      currentTime,
    ),
    currentLyricIndex: activeIndexAt(detail.lyricStartsSeconds, currentTime),
  };
}
