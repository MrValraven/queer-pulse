import { useEffect, type RefObject } from "react";
import type { StudioAudioEngine } from "./studioAudioEngine";
import type { StudioPlaybackStatus } from "./studioPlayerContext";
import { useStudioEpisodeSpeed } from "./useStudioEpisodeMemory";

/** Music always plays at 1x; an episode at the member's speed (spec 5.6). */
export function playbackRateFor(isEpisode: boolean, speed: number): number {
  return isEpisode ? speed : 1;
}

/** Keeps both decks at the right rate: on every current item, speed change,
 *  plain-mode switch (fresh elements start at 1) and status change (the
 *  engine is created on the first gesture). */
export function useStudioEpisodeRate(
  engineRef: RefObject<StudioAudioEngine | null>,
  isEpisode: boolean,
  isPlainMode: boolean,
  status: StudioPlaybackStatus,
): void {
  const { speed } = useStudioEpisodeSpeed();
  const rate = playbackRateFor(isEpisode, speed);
  useEffect(() => {
    engineRef.current?.setPlaybackRate?.(rate);
  }, [engineRef, rate, isPlainMode, status]);
}
