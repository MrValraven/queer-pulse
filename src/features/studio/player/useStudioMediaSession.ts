import { useEffect, useRef } from "react";
import {
  EPISODE_SKIP_BACK_SECONDS,
  EPISODE_SKIP_FORWARD_SECONDS,
  MUSIC_SEEK_SECONDS,
} from "./studioEpisodeRules";
import type {
  StudioPlayerClock,
  StudioPlayerValue,
} from "./studioPlayerContext";
import { useStudioEpisodeSpeed } from "./useStudioEpisodeMemory";
import { playbackRateFor } from "./useStudioEpisodeRate";

function mediaSession(): MediaSession | null {
  return typeof navigator !== "undefined" && "mediaSession" in navigator
    ? navigator.mediaSession
    : null;
}

/** Title, artist, release and cover on the lock screen, with play, pause,
 *  previous, next and seek handlers. A no-op where the API is missing. */
export function useStudioMediaSession(
  player: StudioPlayerValue,
  clock: StudioPlayerClock,
) {
  const item = player.currentItem;
  // Artist kinds: episodes step 15 s back and 30 s forward, music 10 s.
  const isEpisode = item?.isEpisode === true;
  const backSeconds = isEpisode
    ? EPISODE_SKIP_BACK_SECONDS
    : MUSIC_SEEK_SECONDS;
  const forwardSeconds = isEpisode
    ? EPISODE_SKIP_FORWARD_SECONDS
    : MUSIC_SEEK_SECONDS;
  const { speed } = useStudioEpisodeSpeed();
  const playbackRate = playbackRateFor(isEpisode, speed);
  // The handlers read the playhead through a ref, so they register once per
  // track and play state and stay put while the clock ticks.
  const currentTimeRef = useRef(clock.currentTime);
  useEffect(() => {
    currentTimeRef.current = clock.currentTime;
  }, [clock.currentTime]);

  useEffect(() => {
    const session = mediaSession();
    if (!session || typeof MediaMetadata === "undefined") return;
    session.metadata = item
      ? new MediaMetadata({
          title: item.title,
          artist: item.artistName,
          album: item.releaseTitle,
          artwork: item.coverUrl
            ? [{ src: item.coverUrl, sizes: "512x512" }]
            : [],
        })
      : null;
  }, [item]);

  useEffect(() => {
    const session = mediaSession();
    if (!session) return;
    session.playbackState =
      player.status === "playing" ? "playing" : item ? "paused" : "none";
  }, [player.status, item]);

  useEffect(() => {
    const session = mediaSession();
    if (!session || !item) return;
    const isPlaying = player.status === "playing";
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      [
        "play",
        () => {
          if (!isPlaying) player.togglePlay();
        },
      ],
      [
        "pause",
        () => {
          if (isPlaying) player.togglePlay();
        },
      ],
      ["previoustrack", () => player.previous()],
      // The lock screen greys Next out when nothing follows.
      ["nexttrack", player.hasNext ? () => player.next() : null],
      [
        "seekto",
        (details) => {
          if (details.seekTime !== undefined) player.seek(details.seekTime);
        },
      ],
      [
        "seekbackward",
        (details) =>
          player.seek(
            currentTimeRef.current - (details.seekOffset ?? backSeconds),
          ),
      ],
      [
        "seekforward",
        (details) =>
          player.seek(
            currentTimeRef.current + (details.seekOffset ?? forwardSeconds),
          ),
      ],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // A browser that does not support this action ignores it.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Same as above.
        }
      }
    };
  }, [player, item, backSeconds, forwardSeconds]);

  useEffect(() => {
    const session = mediaSession();
    if (
      !session?.setPositionState ||
      clock.duration === null ||
      !Number.isFinite(clock.duration) ||
      clock.duration <= 0
    )
      return;
    try {
      session.setPositionState({
        duration: clock.duration,
        position: Math.min(Math.max(0, clock.currentTime), clock.duration),
        playbackRate,
      });
    } catch {
      // A position the browser refuses leaves the lock screen as it was.
    }
  }, [clock.currentTime, clock.duration, playbackRate]);
}
