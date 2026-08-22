import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useReportProgress } from "./api/useCinemaPlayback";

/** Persist the watch position at most this often while playing. */
const PROGRESS_INTERVAL_SECONDS = 15;

/**
 * Owns the watch-position bookkeeping for the live player: the periodic report
 * while playing, the flush on pause/ended, and a flush when the member leaves
 * mid-playback.
 *
 * Why the leave-flush exists: `timeupdate` only persists every
 * PROGRESS_INTERVAL_SECONDS, so unmounting the route (or hiding/closing the
 * tab) while the film played used to drop up to 15 seconds, and "Resume" then
 * restarted earlier than where the member actually stopped.
 *
 * `navigator.sendBeacon` is deliberately not used: the progress PUT goes
 * through the shared API client for its CSRF header and cookie session, while
 * a beacon is a header-less POST. The flush is therefore an ordinary request
 * fired from `pagehide`/`visibilitychange`, which covers route changes and
 * backgrounding; a hard tab kill can still lose the very last report.
 */
export function useWatchProgress(
  titleId: string | null,
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  const reportProgress = useReportProgress(titleId ?? "");
  /** Whole seconds already persisted. Doubles as the double-flush guard. */
  const lastReportedRef = useRef(0);
  /**
   * Mirror of the player's clock, read on unmount where React has already
   * detached `videoRef`.
   */
  const latestPositionRef = useRef(0);

  const saveProgress = useCallback(
    (positionSeconds: number) => {
      const wholeSeconds = Math.floor(positionSeconds);
      if (!titleId || wholeSeconds <= 0) return;
      // Nothing new to store: a pause landing on the second just reported, or
      // an unmount arriving right after a `pagehide` flush.
      if (wholeSeconds === lastReportedRef.current) return;
      lastReportedRef.current = wholeSeconds;
      reportProgress.mutate(wholeSeconds);
    },
    [reportProgress, titleId],
  );

  // Latest-ref mirror. `saveProgress` changes identity on every react-query
  // state change, so the leave-flush effect below must not depend on it: it
  // would resubscribe on each change and fire its cleanup flush mid-playback,
  // report after report.
  const saveProgressRef = useRef(saveProgress);
  useEffect(() => {
    saveProgressRef.current = saveProgress;
  });

  useEffect(() => {
    const flushLatestPosition = () =>
      saveProgressRef.current(latestPositionRef.current);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushLatestPosition();
    };
    // `pagehide` covers tab close, navigation away and bfcache;
    // `visibilitychange` covers a mobile tab discarded while backgrounded.
    window.addEventListener("pagehide", flushLatestPosition);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushLatestPosition);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      flushLatestPosition();
    };
  }, []);

  /**
   * Seed both counters after the resume seek, so the jump itself is never
   * reported back as fresh progress.
   */
  const markPosition = useCallback((positionSeconds: number) => {
    latestPositionRef.current = positionSeconds;
    lastReportedRef.current = Math.floor(positionSeconds);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    latestPositionRef.current = video.currentTime;
    const wholeSeconds = Math.floor(video.currentTime);
    if (wholeSeconds - lastReportedRef.current >= PROGRESS_INTERVAL_SECONDS) {
      saveProgress(wholeSeconds);
    }
  }, [saveProgress, videoRef]);

  const flushProgress = useCallback(() => {
    const video = videoRef.current;
    if (video) latestPositionRef.current = video.currentTime;
    saveProgress(latestPositionRef.current);
  }, [saveProgress, videoRef]);

  return { markPosition, onTimeUpdate, flushProgress };
}
