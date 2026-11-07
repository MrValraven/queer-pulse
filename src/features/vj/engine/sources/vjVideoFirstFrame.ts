/**
 * First frame of an engine video, ported from v1's `useVjVideoFirstFrame`
 * (screen/VjClipLayer.tsx) as a class with no React.
 *
 * `canplaythrough`, then `play()` resolved, then the next presented frame
 * (requestVideoFrameCallback), or the `playing` event where that API is
 * missing. Chromium may never present a frame for a video it judges hidden,
 * so when the callback has not fired VJ_FRAME_CALLBACK_GRACE_MS after
 * `playing`, the fallback reports the frame once the video holds a decoded
 * frame and two animation frames have passed. It never reports a video with
 * no decoded frame, so a switch can never show black.
 */
import { VJ_FRAME_CALLBACK_GRACE_MS } from "../../screen/VjClipLayer";

/** How often the fallback looks again while the video has no decoded frame yet. */
const VJ_DECODED_FRAME_POLL_MS = 100;
/** Animation frames the fallback waits so the decoded frame is ready before the layer shows. */
const VJ_FALLBACK_PAINT_FRAMES = 2;
/** HTMLMediaElement.HAVE_CURRENT_DATA: the frame at the current position is decoded. */
const HAVE_CURRENT_DATA = 2;

export function hasVjVideoFrameCallback(video: HTMLVideoElement): boolean {
  const candidate = video as Partial<
    Pick<HTMLVideoElement, "requestVideoFrameCallback">
  >;
  return typeof candidate.requestVideoFrameCallback === "function";
}

/** True once the video holds a decoded frame it can paint, so showing it is never black. */
export function hasVjDecodedFrame(video: HTMLVideoElement): boolean {
  return video.readyState >= HAVE_CURRENT_DATA && video.videoWidth > 0;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export interface VjVideoFirstFrameHandlers {
  onFirstFrame(): void;
  onFailed(): void;
}

export class VjVideoFirstFrame {
  private readonly video: HTMLVideoElement;
  private readonly handlers: VjVideoFirstFrameHandlers;
  private hasStartedFlag = false;
  private hasReportedFrame = false;
  private hasPlayingFired = false;
  /** No requestVideoFrameCallback: `playing` reports the frame. */
  private isAwaitingPlaying = false;
  /** requestVideoFrameCallback asked: the fallback arms on `playing`. */
  private isAwaitingFrameCallback = false;
  private isFallbackArmed = false;
  /** The source let go of the video; later media events mean nothing. */
  private isReleased = false;
  private timeoutId: number | undefined;
  private animationFrameId: number | undefined;
  private frameCallbackId: number | undefined;

  constructor(video: HTMLVideoElement, handlers: VjVideoFirstFrameHandlers) {
    this.video = video;
    this.handlers = handlers;
  }

  /** True once `canplaythrough` asked the video to play. */
  get hasStarted(): boolean {
    return this.hasStartedFlag;
  }

  get hasFirstFrame(): boolean {
    return this.hasReportedFrame;
  }

  start(): void {
    this.video.addEventListener("canplaythrough", this.handleCanPlayThrough);
    this.video.addEventListener("playing", this.handlePlaying);
    this.video.addEventListener("error", this.handleError);
  }

  release(): void {
    this.isReleased = true;
    this.cancelPendingWork();
    this.video.removeEventListener("canplaythrough", this.handleCanPlayThrough);
    this.video.removeEventListener("playing", this.handlePlaying);
    this.video.removeEventListener("error", this.handleError);
  }

  private cancelPendingWork(): void {
    window.clearTimeout(this.timeoutId);
    if (this.animationFrameId !== undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
    const frameCallbackVideo = this.video as Partial<
      Pick<HTMLVideoElement, "cancelVideoFrameCallback">
    >;
    if (
      this.frameCallbackId !== undefined &&
      typeof frameCallbackVideo.cancelVideoFrameCallback === "function"
    ) {
      frameCallbackVideo.cancelVideoFrameCallback(this.frameCallbackId);
    }
    this.timeoutId = undefined;
    this.animationFrameId = undefined;
    this.frameCallbackId = undefined;
  }

  private reportFirstFrame(): void {
    if (this.hasReportedFrame || this.isReleased) return;
    this.hasReportedFrame = true;
    this.cancelPendingWork();
    this.handlers.onFirstFrame();
  }

  private afterAnimationFrames(frameCount: number, then: () => void): void {
    if (frameCount <= 0) {
      then();
      return;
    }
    this.animationFrameId = window.requestAnimationFrame(() =>
      this.afterAnimationFrames(frameCount - 1, then),
    );
  }

  private readonly checkDecodedFrame = (): void => {
    this.timeoutId = undefined;
    if (this.hasReportedFrame || this.isReleased) return;
    if (!hasVjDecodedFrame(this.video)) {
      this.timeoutId = window.setTimeout(
        this.checkDecodedFrame,
        VJ_DECODED_FRAME_POLL_MS,
      );
      return;
    }
    this.afterAnimationFrames(VJ_FALLBACK_PAINT_FRAMES, () => {
      if (hasVjDecodedFrame(this.video)) {
        this.reportFirstFrame();
        return;
      }
      this.timeoutId = window.setTimeout(
        this.checkDecodedFrame,
        VJ_DECODED_FRAME_POLL_MS,
      );
    });
  };

  private armFallback(): void {
    if (this.isFallbackArmed || this.hasReportedFrame) return;
    this.isFallbackArmed = true;
    this.timeoutId = window.setTimeout(
      this.checkDecodedFrame,
      VJ_FRAME_CALLBACK_GRACE_MS,
    );
  }

  private readonly handleCanPlayThrough = (): void => {
    if (this.hasStartedFlag || this.isReleased) return;
    this.hasStartedFlag = true;
    const video = this.video;
    video.play().then(
      () => {
        if (this.isReleased) return;
        if (hasVjVideoFrameCallback(video)) {
          this.isAwaitingFrameCallback = true;
          this.frameCallbackId = video.requestVideoFrameCallback(() =>
            this.reportFirstFrame(),
          );
          if (this.hasPlayingFired) this.armFallback();
        } else if (this.hasPlayingFired) {
          this.reportFirstFrame();
        } else {
          this.isAwaitingPlaying = true;
        }
      },
      (error: unknown) => {
        if (!isAbortError(error) && !this.isReleased) this.handlers.onFailed();
      },
    );
  };

  private readonly handlePlaying = (): void => {
    this.hasPlayingFired = true;
    if (this.isAwaitingPlaying) this.reportFirstFrame();
    if (this.isAwaitingFrameCallback) this.armFallback();
  };

  private readonly handleError = (): void => {
    if (!this.isReleased) this.handlers.onFailed();
  };
}
