import { useCallback, useEffect, useRef } from "react";
import { markEpisodePlayed, saveEpisodePosition } from "./studioEpisodeMemory";
import {
  hasExplicitStart,
  markExplicitStart,
  registerEpisodePlaceSaver,
} from "./studioEpisodePlay";
import {
  EPISODE_SAVE_INTERVAL_SECONDS,
  hasReachedPlayed,
  resumeTargetSeconds,
} from "./studioEpisodeRules";
import { useStudioPlayer, useStudioPlayerClock } from "./studioPlayerContext";
import { useStudioEpisodeMemory } from "./useStudioEpisodeMemory";

/**
 * Studio artist kinds (spec 5.7): remembers where a member is in an episode
 * on this device. Saves the place every 10 s of play, on pause and when the
 * page goes away; marks the episode played at 90%; and resumes a fresh play
 * at the saved place once it starts playing. Music is left alone.
 */
export function useStudioEpisodeTracking(): void {
  const player = useStudioPlayer();
  const clock = useStudioPlayerClock();
  const { memberId, memory } = useStudioEpisodeMemory();
  const item = player.currentItem;
  const episodeKey = item?.isEpisode === true ? item.queueEntryId : null;
  const trackId = item?.trackId ?? null;
  const durationSeconds = clock.duration ?? item?.durationSeconds ?? null;
  /** The engine can report 0 before it knows the length: the item's own
   *  length then tells where the end is. */
  const endDurationSeconds =
    clock.duration && clock.duration > 0
      ? clock.duration
      : (item?.durationSeconds ?? null);
  const isPlayedNow = trackId ? memory[trackId]?.playedAt !== undefined : false;

  const pendingResumeKeyRef = useRef<string | null>(null);
  /** The place a resume jumped to, until the playhead gets there: no save
   *  runs in between, so the old playhead never overwrites the place. */
  const awaitedSeekRef = useRef<number | null>(null);
  const playedKeyRef = useRef<string | null>(null);
  /** The episode key that has actually reached "playing" since the last
   *  reset: a cued or restored episode never saves its idle playhead. */
  const hasPlayedKeyRef = useRef<string | null>(null);
  const previousStatusRef = useRef(player.status);
  const lastPlayingTimeRef = useRef(0);
  const lastSavedSecondsRef = useRef(0);
  const latestRef = useRef({
    memberId,
    trackId,
    episodeKey,
    currentTime: clock.currentTime,
    isPlayedNow,
    endDurationSeconds,
  });
  useEffect(() => {
    latestRef.current = {
      memberId,
      trackId,
      episodeKey,
      currentTime: clock.currentTime,
      isPlayedNow,
      endDurationSeconds,
    };
  });

  // A new play of an episode, or a new member on this device: one resume
  // check, fresh save bookkeeping.
  useEffect(() => {
    pendingResumeKeyRef.current = episodeKey;
    // A named start belongs to its own entry: moving to another entry
    // drops it, so coming back later resumes as usual.
    if (!hasExplicitStart(episodeKey)) markExplicitStart(null);
    awaitedSeekRef.current = null;
    playedKeyRef.current = null;
    hasPlayedKeyRef.current = null;
    lastSavedSecondsRef.current = 0;
    lastPlayingTimeRef.current = 0;
  }, [episodeKey, memberId]);

  useEffect(() => {
    if (player.status === "playing" && episodeKey)
      hasPlayedKeyRef.current = episodeKey;
  }, [player.status, episodeKey, memberId]);

  // The episode ends: playback leaves "playing" at its last second.
  useEffect(() => {
    const wasPlaying = previousStatusRef.current === "playing";
    previousStatusRef.current = player.status;
    if (player.status === "playing") {
      lastPlayingTimeRef.current = clock.currentTime;
      return;
    }
    const latest = latestRef.current;
    if (!wasPlaying || !latest.episodeKey || !latest.trackId) return;
    if (!latest.memberId || latest.isPlayedNow) return;
    if (playedKeyRef.current === latest.episodeKey) return;
    const end = latest.endDurationSeconds;
    if (end === null || end <= 0 || lastPlayingTimeRef.current < end - 1)
      return;
    playedKeyRef.current = latest.episodeKey;
    markEpisodePlayed(latest.memberId, latest.trackId);
  }, [player.status, clock.currentTime]);

  useEffect(() => {
    if (player.status !== "playing" || !episodeKey || !trackId) return;
    if (pendingResumeKeyRef.current !== episodeKey) return;
    pendingResumeKeyRef.current = null;
    // A timestamp, a chapter or a `&t=` link named where to start.
    if (hasExplicitStart(episodeKey)) return;
    const entry = memory[trackId];
    if (entry?.playedAt !== undefined) return;
    const target = resumeTargetSeconds(
      entry?.positionSeconds,
      durationSeconds,
      clock.currentTime,
    );
    if (target === null) return;
    awaitedSeekRef.current = target;
    lastSavedSecondsRef.current = target;
    player.seek(target);
  }, [player, episodeKey, trackId, memory, durationSeconds, clock.currentTime]);

  // Played at 90%, else a save every 10 s of playhead movement.
  useEffect(() => {
    if (!episodeKey || !trackId || !memberId) return;
    if (playedKeyRef.current === episodeKey) return;
    if (hasReachedPlayed(clock.currentTime, durationSeconds)) {
      playedKeyRef.current = episodeKey;
      if (!isPlayedNow) markEpisodePlayed(memberId, trackId);
      return;
    }
    if (player.status !== "playing" || isPlayedNow) return;
    const awaitedSeek = awaitedSeekRef.current;
    if (awaitedSeek !== null) {
      if (
        Math.abs(clock.currentTime - awaitedSeek) >=
        EPISODE_SAVE_INTERVAL_SECONDS
      )
        return;
      awaitedSeekRef.current = null;
    }
    const moved = Math.abs(clock.currentTime - lastSavedSecondsRef.current);
    if (moved < EPISODE_SAVE_INTERVAL_SECONDS) return;
    lastSavedSecondsRef.current = clock.currentTime;
    saveEpisodePosition(memberId, trackId, clock.currentTime);
  }, [
    episodeKey,
    trackId,
    memberId,
    clock.currentTime,
    durationSeconds,
    player.status,
    isPlayedNow,
  ]);

  // Reads refs only, so it stays the same function for the hook's life.
  const saveNow = useCallback(() => {
    const latest = latestRef.current;
    if (!latest.episodeKey || !latest.trackId || !latest.memberId) return;
    if (latest.isPlayedNow || playedKeyRef.current === latest.episodeKey)
      return;
    if (awaitedSeekRef.current !== null) return;
    if (hasPlayedKeyRef.current !== latest.episodeKey) return;
    saveEpisodePosition(latest.memberId, latest.trackId, latest.currentTime);
  }, []);

  // Closing the player saves the place through this, before the reset.
  useEffect(() => registerEpisodePlaceSaver(saveNow), [saveNow]);

  // On pause, and when the page goes away, the place is saved as it is.
  useEffect(() => {
    if (player.status === "paused") saveNow();
    window.addEventListener("pagehide", saveNow);
    return () => window.removeEventListener("pagehide", saveNow);
  }, [player.status, saveNow]);
}
