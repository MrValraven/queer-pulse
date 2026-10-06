import { useCallback, useEffect, useRef, useState } from "react";
import { FilmPlayer } from "./filmPlayer";
import { filmUrl, scoreUrl, type MarketingVideo } from "./marketingVideos.data";
import { filmScore } from "./render/filmScore";
import { filmIn } from "./render/filmWindow";

export type SoundState = "loading" | "on" | "failed";

/** Report the playhead to React at most this often while playing. */
const TICK_SECONDS = 1 / 15;

/**
 * Real-time playback of a film in an iframe, for the preview. The film plays
 * as soon as it loads; its score is composed in the background (a few
 * seconds, or at once when this session already composed it) and joins in
 * when ready, whichever of the two finishes first.
 */
export function useFilmPlayback(video: MarketingVideo) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<FilmPlayer | null>(null);
  const scoreRef = useRef<AudioBuffer | null>(null);
  const isMountedRef = useRef(true);
  const lastReportedRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [sound, setSound] = useState<SoundState>("loading");

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    filmScore(filmUrl(video.id), scoreUrl(video.id))
      .then((score) => {
        if (!isCurrent) return;
        scoreRef.current = score;
        playerRef.current?.setScore(score);
        // A film that failed to load keeps its failed status.
        setSound((current) => (current === "failed" ? current : "on"));
      })
      .catch(() => {
        if (isCurrent) setSound("failed");
      });
    return () => {
      isCurrent = false;
    };
  }, [video.id]);

  const handleTick = useCallback((seconds: number, playing: boolean) => {
    if (!isMountedRef.current) return;
    if (
      !playing ||
      Math.abs(seconds - lastReportedRef.current) >= TICK_SECONDS
    ) {
      lastReportedRef.current = seconds;
      setTime(seconds);
    }
    setIsPlaying(playing);
  }, []);

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || playerRef.current) return;
    filmIn(iframe)
      .then((film) => {
        if (!isMountedRef.current) return;
        const player = new FilmPlayer(film, handleTick);
        playerRef.current = player;
        if (scoreRef.current) player.setScore(scoreRef.current);
        player.seek(0);
        setIsReady(true);
      })
      .catch(() => {
        if (isMountedRef.current) setSound("failed");
      });
  }, [handleTick]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
  }, [isPlaying]);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seek(seconds);
  }, []);

  return {
    iframeRef,
    handleLoad,
    isReady,
    isPlaying,
    time,
    sound,
    togglePlay,
    seek,
  };
}
