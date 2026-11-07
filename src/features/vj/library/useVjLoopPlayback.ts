import { useEffect, type RefObject } from "react";
import type { VjPreviewPlayback } from "./useVjClipPlaybackDraft";
import { vjLoopPlayheadMs } from "./vjLoopPlayhead";

/** How far past a loop point the playhead may run before it is sent back.
 *  One frame at 60 fps, so the jump lands before the next frame shows. */
const LOOP_SLACK_MS = 16;

/**
 * Drives the Edit clip preview video the way the projector plays the clip.
 * While a handle is dragged it holds the frame the handle points at. Playing
 * in loop mode it runs at the clip speed and jumps back to the loop start
 * once it passes the end. Playing in ping-pong it sets the playhead itself on
 * every animation frame, so the video runs forward and back; on clips with
 * far-apart keyframes this preview can stutter; the projector plays it smoothly.
 * Not playing, it leaves the video alone.
 */
export function useVjLoopPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: {
    playback: VjPreviewPlayback | null;
    scrubMs: number | null;
    isPlaying: boolean;
  },
): void {
  const { playback, scrubMs, isPlaying } = options;

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;
    if (scrubMs !== null) {
      video.pause();
      video.currentTime = scrubMs / 1000;
      return;
    }
    if (!isPlaying || playback === null) return;

    const { span, speed, loopMode } = playback;
    if (span === null || loopMode === "loop") {
      video.defaultPlaybackRate = speed;
      video.playbackRate = speed;
    }
    if (span === null) {
      // A clip with no loop span plays whole on the element's own loop.
      void video.play().catch(() => undefined);
      return;
    }

    let frameId = 0;
    if (loopMode === "loop") {
      const positionMs = video.currentTime * 1000;
      if (positionMs < span.inMs || positionMs >= span.outMs) {
        video.currentTime = span.inMs / 1000;
      }
      void video.play().catch(() => undefined);
      const keepInsideLoop = () => {
        const nowMs = video.currentTime * 1000;
        const isOutside =
          nowMs >= span.outMs - LOOP_SLACK_MS ||
          nowMs < span.inMs - LOOP_SLACK_MS;
        if (isOutside && !video.seeking) {
          video.currentTime = span.inMs / 1000;
        }
        frameId = requestAnimationFrame(keepInsideLoop);
      };
      frameId = requestAnimationFrame(keepInsideLoop);
    } else {
      video.pause();
      const startedAt = performance.now();
      const stepPlayhead = (frameTime: number) => {
        // A seek still in flight is left to land; the next frame catches up.
        if (!video.seeking) {
          const playheadMs = vjLoopPlayheadMs(
            frameTime - startedAt,
            span,
            "pingPong",
            speed,
          );
          video.currentTime = playheadMs / 1000;
        }
        frameId = requestAnimationFrame(stepPlayhead);
      };
      frameId = requestAnimationFrame(stepPlayhead);
    }
    return () => cancelAnimationFrame(frameId);
  }, [videoRef, playback, scrubMs, isPlaying]);
}
