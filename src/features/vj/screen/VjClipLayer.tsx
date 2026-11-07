import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type JSX,
  type RefObject,
  type TransitionEvent,
} from "react";
import type { VjSpeed } from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import {
  vjLoopWindowOf,
  vjVideoLoopAction,
  type VjLoopWindow,
} from "../engine/sources/vjVideoLoop";
import {
  shouldPixelateVjClip,
  vjPlaybackRateFor,
} from "../live/vjEffectsStyle";
import { VjDomGenerator } from "./VjDomGenerator";
import {
  isOwnOpacityTransition,
  type VjLayerSlot,
  type VjRenderableClip,
  type VjRenderableGenerator,
} from "./vjLayerMachine";
import type { VjDomTransition } from "./vjDomTransitionStyle";
import { VjFitBackdrop, type VjFitBackdropSource } from "./VjFitBackdrop";
import styles from "./VjStage.module.css";

/** How long a fading layer takes to finish to full opacity when a new target arrives. */
export const VJ_CATCH_UP_MS = 180;

/** If transitionend never arrives (a hidden tab, an interrupted transition), the fade still ends. */
const VJ_FADE_END_GRACE_MS = 250;

interface VjMediaElementProps {
  sourceUrl: string;
  className: string;
  isPaused: boolean;
  isPixelated?: boolean;
  /** Hands the mounted element to the fit backdrop, which paints from it. */
  onElementChange?: (element: VjFitBackdropSource | null) => void;
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

/**
 * Keeps a video inside its loop window (contract 6.1 loop points): near loop
 * out it seeks back to loop in, and a video sitting before loop in seeks
 * forward to it. The check runs on every presented frame
 * (requestVideoFrameCallback) and, where that API is missing, on
 * `timeupdate`. The DOM fallback plays a ping-pong clip as a forward loop
 * (contract 3.2: reverse playback is the WebGL engine's), so the caller
 * passes a forward window. The native `loop` attribute stays on as the net
 * under a missed seek: the wrap to 0 lands before loop in and seeks forward.
 */
function useVjVideoLoopWindow(
  videoRef: RefObject<HTMLVideoElement | null>,
  loopInSec: number | null,
  loopOutSec: number | null,
): void {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || loopInSec === null || loopOutSec === null) return undefined;
    const loopWindow: VjLoopWindow = {
      inSec: loopInSec,
      outSec: loopOutSec,
      mode: "loop",
    };
    const applyLoop = (mediaTimeSec: number): void => {
      if (vjVideoLoopAction(loopWindow, mediaTimeSec).kind === "none") return;
      video.currentTime = loopWindow.inSec;
    };
    const handleTimeChange = (): void => applyLoop(video.currentTime);
    video.addEventListener("loadedmetadata", handleTimeChange);
    video.addEventListener("timeupdate", handleTimeChange);
    let frameCallbackId: number | undefined;
    if (hasVideoFrameCallback(video)) {
      const handleVideoFrame: VideoFrameRequestCallback = (_now, metadata) => {
        applyLoop(metadata.mediaTime);
        frameCallbackId = video.requestVideoFrameCallback(handleVideoFrame);
      };
      frameCallbackId = video.requestVideoFrameCallback(handleVideoFrame);
    }
    return () => {
      video.removeEventListener("loadedmetadata", handleTimeChange);
      video.removeEventListener("timeupdate", handleTimeChange);
      cancelPendingFrameWork(
        {
          timeoutId: undefined,
          animationFrameId: undefined,
          frameCallbackId,
        },
        video,
      );
    };
  }, [videoRef, loopInSec, loopOutSec]);
}

/** A muted looping video; it lets go of its decoder when it unmounts. */
function VjVideoElement({
  sourceUrl,
  className,
  isPaused,
  playbackRate,
  loopWindow,
  onElementChange,
  onFirstFrame,
  onFailed,
}: VjMediaElementProps & {
  playbackRate: number;
  loopWindow: VjLoopWindow | null;
}): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportElement = useEffectEvent((element: VjFitBackdropSource | null) =>
    onElementChange?.(element),
  );
  useEffect(() => {
    reportElement(videoRef.current);
    return () => reportElement(null);
  }, []);
  const {
    progressRef,
    pendingRef,
    handleCanPlayThrough,
    handlePlaying,
    handleError,
  } = useVjVideoFirstFrame(videoRef, onFirstFrame, onFailed);
  useVjVideoLoopWindow(
    videoRef,
    loopWindow?.inSec ?? null,
    loopWindow?.outSec ?? null,
  );

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

  // Paused (the curtain is up, or freeze is on): a video that starts playing
  // afterwards, a clip arriving while frozen, holds its first frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    if (!isPaused) {
      if (progressRef.current.hasStarted && video.paused) {
        video.play().catch(() => undefined);
      }
      return undefined;
    }
    video.pause();
    const holdPaused = (): void => video.pause();
    video.addEventListener("playing", holdPaused);
    return () => video.removeEventListener("playing", holdPaused);
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
  isPixelated = false,
  onElementChange,
  onFirstFrame,
  onFailed,
}: VjMediaElementProps): JSX.Element {
  const imageRef = useRef<HTMLImageElement>(null);
  const reportElement = useEffectEvent((element: VjFitBackdropSource | null) =>
    onElementChange?.(element),
  );
  useEffect(() => {
    reportElement(imageRef.current);
    return () => reportElement(null);
  }, []);
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
  /** False while the layer is hidden: the fit backdrop paints nothing. */
  isVisible: boolean;
  speed: VjSpeed;
  isPixelated: boolean;
  onFirstFrame?: () => void;
  onFailed?: () => void;
}

/**
 * The clip, plus a small painted backdrop behind it in "fit" mode. The clip
 * decodes once; the backdrop copies its frames to a 64 px canvas. A video
 * plays at its own default speed times the stage speed, inside its loop
 * window. Shared by the clip layers and the mix layer.
 */
export function VjClipMedia({
  clip,
  isPaused,
  isVisible,
  speed,
  isPixelated,
  onFirstFrame,
  onFailed,
}: VjClipMediaProps): JSX.Element {
  const [mediaElement, setMediaElement] = useState<VjFitBackdropSource | null>(
    null,
  );
  const isFit = clip.fitMode === "fit";
  const playbackRate = vjPlaybackRateFor(
    clip.mediaKind,
    speed,
    clip.defaultSpeed,
  );
  // Reverse playback is the WebGL engine's: on the DOM a ping-pong clip loops forward.
  const loopWindow = vjLoopWindowOf({
    durationMs: clip.durationMs,
    loopInMs: clip.loopInMs,
    loopOutMs: clip.loopOutMs,
    loopMode: "loop",
  });
  const mainClassName = cx(
    styles.media,
    isFit && styles.mediaContain,
    isPixelated && styles.pixelated,
  );
  const backdrop = isFit ? (
    <VjFitBackdrop
      source={mediaElement}
      clipWidth={clip.width}
      clipHeight={clip.height}
      isPainting={isVisible && !isPaused}
    />
  ) : null;
  if (clip.mediaKind === "gif" || playbackRate === null) {
    return (
      <>
        {backdrop}
        <VjGifElement
          sourceUrl={clip.sourceUrl}
          className={mainClassName}
          isPaused={isPaused}
          isPixelated={isPixelated}
          onElementChange={isFit ? setMediaElement : undefined}
          onFirstFrame={onFirstFrame}
          onFailed={onFailed}
        />
      </>
    );
  }
  return (
    <>
      {backdrop}
      <VjVideoElement
        sourceUrl={clip.sourceUrl}
        className={mainClassName}
        isPaused={isPaused}
        playbackRate={playbackRate}
        loopWindow={loopWindow}
        onElementChange={isFit ? setMediaElement : undefined}
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
  /** How the layer rises while it fades in (vjDomTransitionOf); a catch-up always eases its opacity. */
  transitionStyle: VjDomTransition;
  speed: VjSpeed;
  viewport: { width: number; height: number };
  /**
   * Pauses the clip in place: the renderer sets it on the front once the
   * black curtain is fully up, and on every layer while freeze is on.
   */
  isPaused?: boolean;
  onFirstFrame: () => void;
  onFailed: () => void;
  onFadeEnded: () => void;
  onCatchUpEnded: () => void;
}

/** The layer's opacity right now, read mid-transition; 1 when it cannot be read. */
function readVisibleOpacity(layer: HTMLElement): number {
  const opacity = Number.parseFloat(window.getComputedStyle(layer).opacity);
  return Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 1;
}

/** Cancels the running CSS opacity transition so the catch-up animation owns the layer. */
function cancelRunningTransitions(layer: HTMLElement): void {
  const candidate = layer as Partial<Pick<HTMLElement, "getAnimations">>;
  if (typeof candidate.getAnimations !== "function") return;
  for (const animation of layer.getAnimations()) animation.cancel();
}

/**
 * While `isCatchingUp`, eases the layer from its current visible opacity to 1
 * over 180 ms, then reports the end. The layer never loses opacity: the CSS
 * fade is cancelled and replaced in the same task, and the animation fills
 * forwards at 1 until the layer is promoted. Web Animations ignore the laptop's
 * reduced-motion setting, as the rest of the projector does.
 */
function useVjLayerCatchUp(
  layerRef: RefObject<HTMLDivElement | null>,
  isCatchingUp: boolean,
  onEnded: () => void,
): void {
  const reportEnded = useEffectEvent(() => onEnded());
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!isCatchingUp || !layer) return undefined;
    let isEnded = false;
    const finish = (): void => {
      if (isEnded) return;
      isEnded = true;
      reportEnded();
    };
    const visibleOpacity = readVisibleOpacity(layer);
    cancelRunningTransitions(layer);
    const canAnimate =
      visibleOpacity < 1 && typeof layer.animate === "function";
    const animation = canAnimate
      ? layer.animate([{ opacity: visibleOpacity }, { opacity: 1 }], {
          duration: VJ_CATCH_UP_MS,
          easing: "ease-out",
          fill: "forwards",
        })
      : null;
    animation?.addEventListener("finish", finish);
    // Without the animation (already opaque, or no Web Animations) the catch-up is over at once;
    // with it, a hidden tab that never fires `finish` still ends after the grace.
    const timeoutId = window.setTimeout(
      finish,
      animation ? VJ_CATCH_UP_MS + VJ_FADE_END_GRACE_MS : 0,
    );
    return () => {
      window.clearTimeout(timeoutId);
      animation?.removeEventListener("finish", finish);
      animation?.cancel();
    };
  }, [isCatchingUp, layerRef]);
}

/** A generator draws at once: it reports its first frame as soon as it mounts. */
function VjGeneratorMedia({
  generator,
  onFirstFrame,
}: {
  generator: VjRenderableGenerator;
  onFirstFrame: () => void;
}): JSX.Element {
  const reportFirstFrame = useEffectEvent(() => onFirstFrame());
  useEffect(() => {
    reportFirstFrame();
  }, []);
  return (
    <VjDomGenerator
      generatorId={generator.generatorId}
      generatorVariant={generator.generatorVariant}
    />
  );
}

/** The layer's class and custom properties while it rises, per transition kind. */
function risingLayerLook(
  transitionStyle: VjDomTransition,
  isFadingIn: boolean,
  isCatchingUp: boolean,
): {
  className: string | false | undefined;
  properties: Record<string, string>;
} {
  if (isCatchingUp || !isFadingIn) {
    return {
      className: isCatchingUp && styles.clipLayerFading,
      properties: {},
    };
  }
  switch (transitionStyle.kind) {
    case "clip":
      return {
        className: styles.clipLayerClip,
        properties: {
          "--vj-clip-from": transitionStyle.clipFrom ?? "none",
          "--vj-clip-to": transitionStyle.clipTo ?? "none",
        },
      };
    case "sweep":
      return { className: styles.clipLayerSweep, properties: {} };
    case "dip":
      return {
        className: styles.clipLayerDip,
        properties: {
          "--vj-dip-colour":
            transitionStyle.dipColor === "white"
              ? "var(--vj-white)"
              : "var(--vj-black)",
        },
      };
    case "fade":
    case "cut":
      return { className: styles.clipLayerFading, properties: {} };
  }
}

/**
 * One of the two stacked source layers: a clip or a generator. While it fades
 * in it animates its opacity, a clip-path, a conic mask or a dip, per the
 * transition; a catch-up eases its opacity. A leaving layer drops its media
 * (its URL is already released).
 */
export function VjClipLayer({
  slot,
  opacity,
  zIndex,
  fadeMs,
  transitionStyle,
  speed,
  viewport,
  isPaused = false,
  onFirstFrame,
  onFailed,
  onFadeEnded,
  onCatchUpEnded,
}: VjClipLayerProps): JSX.Element {
  const layerRef = useRef<HTMLDivElement>(null);
  const isFadingIn = slot.phase === "fadingIn";
  const isCatchingUp = slot.phase === "catchingUp";
  const fadeEnded = useEffectEvent(() => onFadeEnded());
  useVjLayerCatchUp(layerRef, isCatchingUp, onCatchUpEnded);

  useEffect(() => {
    if (!isFadingIn) return undefined;
    const timeoutId = window.setTimeout(
      () => fadeEnded(),
      fadeMs + VJ_FADE_END_GRACE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isFadingIn, fadeMs]);

  const risingLook = risingLayerLook(transitionStyle, isFadingIn, isCatchingUp);
  const isOpacityFade =
    isCatchingUp ||
    transitionStyle.kind === "fade" ||
    transitionStyle.kind === "cut";

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (isFadingIn && isOpacityFade && isOwnOpacityTransition(event)) {
      onFadeEnded();
    }
  };
  // A clip-path, a mask or a dip veil (a pseudo-element, so its event targets
  // the layer itself) ends on the layer's own animationend.
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (isFadingIn && !isOpacityFade && event.target === event.currentTarget) {
      onFadeEnded();
    }
  };

  const clip = slot.clip;
  const hasMedia =
    clip !== null &&
    (slot.phase === "loading" ||
      slot.phase === "fadingIn" ||
      slot.phase === "catchingUp" ||
      slot.phase === "shown");
  const isRising = isFadingIn || isCatchingUp;
  let layerFadeMs = 0;
  if (isFadingIn) layerFadeMs = fadeMs;
  if (isCatchingUp) layerFadeMs = VJ_CATCH_UP_MS;
  const style = (
    isRising
      ? {
          opacity,
          zIndex,
          "--vj-layer-fade": `${fadeMs}ms`,
          ...risingLook.properties,
        }
      : { opacity, zIndex }
  ) as CSSProperties;

  let media: JSX.Element | null = null;
  if (hasMedia) {
    media =
      clip.mediaKind === "generator" ? (
        <VjGeneratorMedia
          key={clip.clipId}
          generator={clip}
          onFirstFrame={onFirstFrame}
        />
      ) : (
        <VjClipMedia
          key={`${clip.clipId}|${clip.sourceUrl}`}
          clip={clip}
          isPaused={isPaused}
          isVisible={slot.phase !== "loading"}
          speed={speed}
          isPixelated={shouldPixelateVjClip(clip, viewport)}
          onFirstFrame={onFirstFrame}
          onFailed={onFailed}
        />
      );
  }

  return (
    <div
      ref={layerRef}
      className={cx(styles.clipLayer, risingLook.className)}
      style={style}
      data-vj-layer-phase={slot.phase}
      data-vj-fading={isFadingIn ? "true" : undefined}
      data-vj-catching-up={isCatchingUp ? "true" : undefined}
      data-vj-transition={isFadingIn ? transitionStyle.kind : undefined}
      data-vj-clip-id={clip?.clipId}
      data-vj-fade-ms={layerFadeMs}
      aria-hidden="true"
      onTransitionEnd={handleTransitionEnd}
      onAnimationEnd={handleAnimationEnd}
    >
      {media}
    </div>
  );
}
