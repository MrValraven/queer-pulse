import {
  useEffect,
  useEffectEvent,
  useRef,
  type CSSProperties,
  type JSX,
  type RefObject,
  type TransitionEvent,
} from "react";
import type { VjSpeed } from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import {
  shouldPixelateVjClip,
  vjPlaybackRateFor,
} from "../live/vjEffectsStyle";
import {
  isOwnOpacityTransition,
  type VjLayerSlot,
  type VjRenderableClip,
} from "./vjLayerMachine";
import styles from "./VjStage.module.css";

/** If transitionend never arrives (a hidden tab, an interrupted transition), the fade still ends. */
const VJ_FADE_END_GRACE_MS = 250;

interface VjMediaElementProps {
  sourceUrl: string;
  className: string;
  isPaused: boolean;
  /** The blurred cover copy behind a "fit" clip. */
  isBackdrop?: boolean;
  isPixelated?: boolean;
  /** The main copy reports its first frame and failures; the blurred backdrop reports nothing. */
  onFirstFrame?: () => void;
  onFailed?: () => void;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function hasVideoFrameCallback(video: HTMLVideoElement): boolean {
  const candidate = video as Partial<
    Pick<HTMLVideoElement, "requestVideoFrameCallback">
  >;
  return typeof candidate.requestVideoFrameCallback === "function";
}

function hasImageDecode(image: HTMLImageElement): boolean {
  const candidate = image as Partial<Pick<HTMLImageElement, "decode">>;
  return typeof candidate.decode === "function";
}

/** After `playing`, how long the screen waits for requestVideoFrameCallback before its fallback. */
export const VJ_FRAME_CALLBACK_GRACE_MS = 300;
/** How often the fallback looks again while the video has no decoded frame yet. */
const VJ_DECODED_FRAME_POLL_MS = 100;
/** Animation frames the fallback waits so the decoded frame is painted before the layer shows. */
const VJ_FALLBACK_PAINT_FRAMES = 2;
/** HTMLMediaElement.HAVE_CURRENT_DATA: the frame at the current position is decoded. */
const HAVE_CURRENT_DATA = 2;

/** True once the video holds a decoded frame it can paint, so showing it is never black. */
function hasDecodedFrame(video: HTMLVideoElement): boolean {
  return video.readyState >= HAVE_CURRENT_DATA && video.videoWidth > 0;
}

interface VjFirstFrameProgress {
  hasStarted: boolean;
  hasReportedFrame: boolean;
  hasPlayingFired: boolean;
  /** No requestVideoFrameCallback: `playing` reports the frame. */
  isAwaitingPlaying: boolean;
  /** requestVideoFrameCallback asked: the fallback arms on `playing`. */
  isAwaitingFrameCallback: boolean;
  isFallbackArmed: boolean;
  /** The element let go of its source on unmount; later media events mean nothing. */
  isReleased: boolean;
}

interface VjPendingFrameWork {
  timeoutId: number | undefined;
  animationFrameId: number | undefined;
  frameCallbackId: number | undefined;
}

function cancelPendingFrameWork(
  pending: VjPendingFrameWork,
  video: HTMLVideoElement | null,
): void {
  window.clearTimeout(pending.timeoutId);
  if (pending.animationFrameId !== undefined) {
    window.cancelAnimationFrame(pending.animationFrameId);
  }
  const frameCallbackVideo = video as Partial<
    Pick<HTMLVideoElement, "cancelVideoFrameCallback">
  > | null;
  if (
    pending.frameCallbackId !== undefined &&
    typeof frameCallbackVideo?.cancelVideoFrameCallback === "function"
  ) {
    frameCallbackVideo.cancelVideoFrameCallback(pending.frameCallbackId);
  }
  pending.timeoutId = undefined;
  pending.animationFrameId = undefined;
  pending.frameCallbackId = undefined;
}

/**
 * First frame of a video: `canplaythrough`, then `play()` resolved, then the
 * next presented frame (requestVideoFrameCallback), or the `playing` event
 * where that API is missing. Chromium may never present a frame for a layer
 * held at opacity 0, so when the callback has not fired 300 ms after
 * `playing`, the fallback reports the frame once the video holds a decoded
 * frame and two animation frames have painted. It never reports a video with
 * no decoded frame, so the switch can never show black.
 */
function useVjVideoFirstFrame(
  videoRef: RefObject<HTMLVideoElement | null>,
  onFirstFrame: (() => void) | undefined,
  onFailed: (() => void) | undefined,
) {
  const progressRef = useRef<VjFirstFrameProgress>({
    hasStarted: false,
    hasReportedFrame: false,
    hasPlayingFired: false,
    isAwaitingPlaying: false,
    isAwaitingFrameCallback: false,
    isFallbackArmed: false,
    isReleased: false,
  });
  const pendingRef = useRef<VjPendingFrameWork>({
    timeoutId: undefined,
    animationFrameId: undefined,
    frameCallbackId: undefined,
  });

  const reportFirstFrame = (): void => {
    const progress = progressRef.current;
    if (progress.hasReportedFrame || progress.isReleased) return;
    progress.hasReportedFrame = true;
    cancelPendingFrameWork(pendingRef.current, videoRef.current);
    onFirstFrame?.();
  };

  const afterAnimationFrames = (frameCount: number, then: () => void) => {
    if (frameCount <= 0) {
      then();
      return;
    }
    pendingRef.current.animationFrameId = window.requestAnimationFrame(() =>
      afterAnimationFrames(frameCount - 1, then),
    );
  };

  const checkDecodedFrame = (): void => {
    pendingRef.current.timeoutId = undefined;
    const video = videoRef.current;
    if (!video || progressRef.current.hasReportedFrame) return;
    if (!hasDecodedFrame(video)) {
      pendingRef.current.timeoutId = window.setTimeout(
        checkDecodedFrame,
        VJ_DECODED_FRAME_POLL_MS,
      );
      return;
    }
    afterAnimationFrames(VJ_FALLBACK_PAINT_FRAMES, () => {
      if (hasDecodedFrame(video)) {
        reportFirstFrame();
        return;
      }
      pendingRef.current.timeoutId = window.setTimeout(
        checkDecodedFrame,
        VJ_DECODED_FRAME_POLL_MS,
      );
    });
  };

  const armFallback = (): void => {
    const progress = progressRef.current;
    // The blurred backdrop reports nothing, so it needs no fallback either.
    if (!onFirstFrame) return;
    if (progress.isFallbackArmed || progress.hasReportedFrame) return;
    progress.isFallbackArmed = true;
    pendingRef.current.timeoutId = window.setTimeout(
      checkDecodedFrame,
      VJ_FRAME_CALLBACK_GRACE_MS,
    );
  };

  const handleCanPlayThrough = (): void => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || progress.hasStarted) return;
    progress.hasStarted = true;
    video.play().then(
      () => {
        if (progress.isReleased) return;
        if (hasVideoFrameCallback(video)) {
          progress.isAwaitingFrameCallback = true;
          pendingRef.current.frameCallbackId = video.requestVideoFrameCallback(
            () => reportFirstFrame(),
          );
          if (progress.hasPlayingFired) armFallback();
        } else if (progress.hasPlayingFired) {
          reportFirstFrame();
        } else {
          progress.isAwaitingPlaying = true;
        }
      },
      (error: unknown) => {
        if (!isAbortError(error) && !progress.isReleased) onFailed?.();
      },
    );
  };

  const handlePlaying = (): void => {
    const progress = progressRef.current;
    progress.hasPlayingFired = true;
    if (progress.isAwaitingPlaying) reportFirstFrame();
    if (progress.isAwaitingFrameCallback) armFallback();
  };

  const handleError = (): void => {
    if (!progressRef.current.isReleased) onFailed?.();
  };

  return {
    progressRef,
    pendingRef,
    handleCanPlayThrough,
    handlePlaying,
    handleError,
  };
}

/** A muted looping video; it lets go of its decoder when it unmounts. */
function VjVideoElement({
  sourceUrl,
  className,
  isPaused,
  isBackdrop = false,
  playbackRate,
  onFirstFrame,
  onFailed,
}: VjMediaElementProps & { playbackRate: number }): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    progressRef,
    pendingRef,
    handleCanPlayThrough,
    handlePlaying,
    handleError,
  } = useVjVideoFirstFrame(videoRef, onFirstFrame, onFailed);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const progress = progressRef.current;
    const pending = pendingRef.current;
    // A StrictMode remount follows a release: give the element its source back.
    if (video.getAttribute("src") !== sourceUrl) {
      progress.isReleased = false;
      video.setAttribute("src", sourceUrl);
    }
    return () => {
      // Drop the source and reload so the browser frees the decoder now.
      progress.isReleased = true;
      cancelPendingFrameWork(pending, video);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [sourceUrl, progressRef, pendingRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultPlaybackRate = playbackRate;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) {
      video.pause();
      return;
    }
    if (progressRef.current.hasStarted && video.paused) {
      video.play().catch(() => undefined);
    }
  }, [isPaused, progressRef]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={sourceUrl}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      data-vj-fit-backdrop={isBackdrop ? "" : undefined}
      onCanPlayThrough={handleCanPlayThrough}
      onPlaying={handlePlaying}
      onError={handleError}
    />
  );
}

/** A GIF. First frame: `img.decode()` resolved (or `load` where decode is missing). */
function VjGifElement({
  sourceUrl,
  className,
  isBackdrop = false,
  isPixelated = false,
  onFirstFrame,
  onFailed,
}: VjMediaElementProps): JSX.Element {
  const imageRef = useRef<HTMLImageElement>(null);
  const reportFirstFrame = useEffectEvent(() => onFirstFrame?.());
  const reportFailed = useEffectEvent(() => onFailed?.());

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !hasImageDecode(image)) return undefined;
    let isCurrent = true;
    image.decode().then(
      () => {
        if (isCurrent) reportFirstFrame();
      },
      () => {
        if (isCurrent) reportFailed();
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <img
      ref={imageRef}
      className={className}
      src={sourceUrl}
      alt=""
      draggable={false}
      data-vj-fit-backdrop={isBackdrop ? "" : undefined}
      data-vj-pixelated={isPixelated ? "true" : undefined}
      onLoad={(event) => {
        if (!hasImageDecode(event.currentTarget)) onFirstFrame?.();
      }}
      onError={() => onFailed?.()}
    />
  );
}

interface VjClipMediaProps {
  clip: VjRenderableClip;
  isPaused: boolean;
  speed: VjSpeed;
  isPixelated: boolean;
  onFirstFrame: () => void;
  onFailed: () => void;
}

/** The clip, plus a blurred cover copy of itself behind it in "fit" mode. */
function VjClipMedia({
  clip,
  isPaused,
  speed,
  isPixelated,
  onFirstFrame,
  onFailed,
}: VjClipMediaProps): JSX.Element {
  const isFit = clip.fitMode === "fit";
  const playbackRate = vjPlaybackRateFor(clip.mediaKind, speed);
  const mainClassName = cx(
    styles.media,
    isFit && styles.mediaContain,
    isPixelated && styles.pixelated,
  );
  const backdropClassName = cx(styles.media, styles.fitBackdrop);
  if (clip.mediaKind === "gif" || playbackRate === null) {
    return (
      <>
        {isFit ? (
          <VjGifElement
            sourceUrl={clip.sourceUrl}
            className={backdropClassName}
            isPaused={isPaused}
            isBackdrop
          />
        ) : null}
        <VjGifElement
          sourceUrl={clip.sourceUrl}
          className={mainClassName}
          isPaused={isPaused}
          isPixelated={isPixelated}
          onFirstFrame={onFirstFrame}
          onFailed={onFailed}
        />
      </>
    );
  }
  return (
    <>
      {isFit ? (
        <VjVideoElement
          sourceUrl={clip.sourceUrl}
          className={backdropClassName}
          isPaused={isPaused}
          isBackdrop
          playbackRate={playbackRate}
        />
      ) : null}
      <VjVideoElement
        sourceUrl={clip.sourceUrl}
        className={mainClassName}
        isPaused={isPaused}
        playbackRate={playbackRate}
        onFirstFrame={onFirstFrame}
        onFailed={onFailed}
      />
    </>
  );
}

export interface VjClipLayerProps {
  slot: VjLayerSlot;
  opacity: 0 | 1;
  zIndex: 0 | 1;
  fadeMs: number;
  speed: VjSpeed;
  viewport: { width: number; height: number };
  /** Pauses the clip in place: the renderer sets it on the front once the black curtain is fully up. */
  isPaused?: boolean;
  onFirstFrame: () => void;
  onFailed: () => void;
  onFadeEnded: () => void;
}

/**
 * One of the two stacked clip layers. Its opacity animates only while it fades
 * in; a leaving layer drops its media (its URL is already released).
 */
export function VjClipLayer({
  slot,
  opacity,
  zIndex,
  fadeMs,
  speed,
  viewport,
  isPaused = false,
  onFirstFrame,
  onFailed,
  onFadeEnded,
}: VjClipLayerProps): JSX.Element {
  const isFadingIn = slot.phase === "fadingIn";
  const fadeEnded = useEffectEvent(() => onFadeEnded());

  useEffect(() => {
    if (!isFadingIn) return undefined;
    const timeoutId = window.setTimeout(
      () => fadeEnded(),
      fadeMs + VJ_FADE_END_GRACE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isFadingIn, fadeMs]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (isFadingIn && isOwnOpacityTransition(event)) onFadeEnded();
  };

  const clip = slot.clip;
  const hasMedia =
    clip !== null &&
    (slot.phase === "loading" ||
      slot.phase === "fadingIn" ||
      slot.phase === "shown");
  const layerFadeMs = isFadingIn ? fadeMs : 0;
  const style = (
    isFadingIn
      ? { opacity, zIndex, "--vj-layer-fade": `${layerFadeMs}ms` }
      : { opacity, zIndex }
  ) as CSSProperties;

  return (
    <div
      className={cx(styles.clipLayer, isFadingIn && styles.clipLayerFading)}
      style={style}
      data-vj-layer-phase={slot.phase}
      data-vj-fading={isFadingIn ? "true" : undefined}
      data-vj-clip-id={clip?.clipId}
      data-vj-fade-ms={layerFadeMs}
      aria-hidden="true"
      onTransitionEnd={handleTransitionEnd}
    >
      {hasMedia ? (
        <VjClipMedia
          key={`${clip.clipId}|${clip.sourceUrl}`}
          clip={clip}
          isPaused={isPaused}
          speed={speed}
          isPixelated={shouldPixelateVjClip(clip, viewport)}
          onFirstFrame={onFirstFrame}
          onFailed={onFailed}
        />
      ) : null}
    </div>
  );
}
