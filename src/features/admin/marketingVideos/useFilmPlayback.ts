import { useCallback, useEffect, useRef, useState } from "react";
import { FilmPlayer } from "./filmPlayer";
import type { MarketingVideo } from "./marketingVideos.data";
import { filmIn } from "./render/filmWindow";
import { previewScore } from "./render/previewScore";

export type SoundState = "loading" | "on" | "failed";

/** Report the playhead to React at most this often while playing. */
const TICK_SECONDS = 1 / 15;

/**
 * Real-time playback of a film in an iframe, for the preview. The film plays
 * as soon as it loads; its score loads in the background (the pre-rendered
 * file, or a few seconds of synthesis when that file is stale) and joins in
 * when ready, whichever of the two finishes first. Call `reload` just before
 * pointing the iframe at another page (the same film in another shape): the
 * next load then starts a fresh player, and the score carries over.
 */
export function useFilmPlayback(video: MarketingVideo) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<FilmPlayer | null>(null);
  const scoreRef = useRef<AudioBuffer | null>(null);
  const isMountedRef = useRef(true);
  const lastReportedRef = useRef(0);
  /** Bumped by reload, so a load that was still settling is ignored. */
  const loadGenerationRef = useRef(0);
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
    previewScore(video.id)
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
    const generation = loadGenerationRef.current;
    filmIn(iframe)
      .then((film) => {
        if (!isMountedRef.current) return;
        if (generation !== loadGenerationRef.current) return;
        const player = new FilmPlayer(film, handleTick);
        playerRef.current = player;
        if (scoreRef.current) player.setScore(scoreRef.current);
        player.seek(0);
        setIsReady(true);
      })
      .catch(() => {
        // A load that reload() replaced must not fail the next shape's sound.
        if (isMountedRef.current && generation === loadGenerationRef.current) {
          setSound("failed");
        }
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

  const reload = useCallback(() => {
    loadGenerationRef.current += 1;
    playerRef.current?.dispose();
    playerRef.current = null;
    lastReportedRef.current = 0;
    setIsReady(false);
    setIsPlaying(false);
    setTime(0);
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
    reload,
  };
}
