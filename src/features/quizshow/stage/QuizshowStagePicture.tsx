import { useLayoutEffect, useRef } from "react";
import type {
  QuizshowLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import styles from "./QuizshowStagePicture.module.css";
import { pickQuizshowTextWithLanguage } from "./quizshowText";

export interface QuizshowStagePictureProps {
  mediaUrl: string;
  /** Blank in both languages renders alt="". */
  alt: QuizshowText;
  language: QuizshowLanguage;
  className?: string;
  /** Slow reveal (C6.23): null renders the picture clear. */
  slowReveal: { startsAt: number; endsAt: number; isCleared: boolean } | null;
  clockOffsetMs: number;
  /**
   * 0..1 while the session is paused: the reveal holds at that point and the
   * clock stops sharpening it. Null again runs the window as before (see
   * `frozenRevealProgressOf`).
   */
  frozenProgress?: number | null;
}

type SlowReveal = NonNullable<QuizshowStagePictureProps["slowReveal"]>;

/** C6.23: the picture starts at blur 28px and scale 1.6 and lands at 0 and 1. */
const START_BLUR_PX = 28;
const START_SCALE = 1.6;
/** Reduced motion: four held steps at 0, 33, 66 and 100 percent of the reveal
    (blur 28, 18.7, 9.3 and 0px, the same straight line as full motion). */
const REDUCED_STEP_LEVELS = [0, 1 / 3, 2 / 3, 1] as const;
const LAST_STEP = REDUCED_STEP_LEVELS.length - 1;
/** --dur-slow and --ease-std. Run through the Web Animations API, which the
    reduced-motion safety net (a CSS transition-duration override) leaves alone,
    so the opacity-only cross-fade still plays there. */
const CROSS_FADE_MS = 400;
const CROSS_FADE_EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)";

/**
 * Quadratic ease-out, for the zoom only. The blur runs straight in time: the
 * last few pixels of blur are what give a picture away, so a curve that
 * drops the radius early would hand the answer over long before the deadline.
 * Linear keeps the picture unreadable until late in the open phase.
 */
function easeOut(progress: number): number {
  return 1 - (1 - progress) * (1 - progress);
}

function revealProgressAt(
  reveal: SlowReveal,
  serverNow: number,
  frozenProgress: number | null,
): number {
  if (frozenProgress !== null && !reveal.isCleared) {
    return Math.min(1, Math.max(0, frozenProgress));
  }
  const durationMs = reveal.endsAt - reveal.startsAt;
  if (reveal.isCleared || durationMs <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0, (serverNow - reveal.startsAt) / durationMs));
}

/** Blur at a point of the reveal, straight in time: 28px at 0, none at 1. */
function blurFilterAt(progress: number): string {
  const blurPx = START_BLUR_PX * (1 - progress);
  return blurPx <= 0 ? "none" : `blur(${blurPx.toFixed(2)}px)`;
}

/**
 * The question picture on the TV and the phone, with the slow reveal of
 * C6.23. Blur is allowed here only, because the contract asks for it: the
 * blur is the reveal itself. Full motion runs the blur straight and eases the
 * zoom on a requestAnimationFrame loop on the server clock; reduced motion
 * holds four steps with an opacity cross-fade and no zoom.
 */
export function QuizshowStagePicture({
  mediaUrl,
  alt,
  language,
  className,
  slowReveal,
  clockOffsetMs,
  frozenProgress = null,
}: QuizshowStagePictureProps) {
  const isReducedMotion = usePrefersReducedMotion();
  const pickedAlt = pickQuizshowTextWithLanguage(alt, language);
  const altText = pickedAlt.text.trim();
  // The alt reads in the other language when the asked one is blank: name it.
  const altLanguage =
    altText !== "" && pickedAlt.language !== language
      ? pickedAlt.language
      : undefined;
  const frameClassName = [styles.frame, className].filter(Boolean).join(" ");
  if (isReducedMotion && slowReveal !== null) {
    return (
      <SteppedPicture
        mediaUrl={mediaUrl}
        altText={altText}
        altLanguage={altLanguage}
        frameClassName={frameClassName}
        slowReveal={slowReveal}
        clockOffsetMs={clockOffsetMs}
        frozenProgress={frozenProgress}
      />
    );
  }
  return (
    <EasedPicture
      mediaUrl={mediaUrl}
      altText={altText}
      altLanguage={altLanguage}
      frameClassName={frameClassName}
      slowReveal={slowReveal}
      clockOffsetMs={clockOffsetMs}
      frozenProgress={frozenProgress}
    />
  );
}

interface PictureLayoutProps {
  mediaUrl: string;
  altText: string;
  /** Set only when the alt fell back to the other language. */
  altLanguage: QuizshowLanguage | undefined;
  frameClassName: string;
  clockOffsetMs: number;
  /** Non-null holds the reveal at that progress (a paused session). */
  frozenProgress: number | null;
}

/** Full motion: one picture, its blur and scale written each frame until the end. */
function EasedPicture({
  mediaUrl,
  altText,
  altLanguage,
  frameClassName,
  slowReveal,
  clockOffsetMs,
  frozenProgress,
}: PictureLayoutProps & { slowReveal: SlowReveal | null }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const startsAt = slowReveal?.startsAt ?? 0;
  const endsAt = slowReveal?.endsAt ?? 0;
  const isCleared = slowReveal === null || slowReveal.isCleared;

  // A layout effect, so the first blurred frame lands before paint and the
  // picture never flashes clear.
  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image === null) {
      return undefined;
    }
    const reveal: SlowReveal = { startsAt, endsAt, isCleared };
    let frameId: number | null = null;
    const drawFrame = () => {
      const progress = revealProgressAt(
        reveal,
        Date.now() + clockOffsetMs,
        frozenProgress,
      );
      const zoomProgress = easeOut(progress);
      image.style.filter = blurFilterAt(progress);
      image.style.transform =
        progress >= 1
          ? "none"
          : `scale(${(START_SCALE - (START_SCALE - 1) * zoomProgress).toFixed(4)})`;
      if (progress < 1 && frozenProgress === null) {
        frameId = requestAnimationFrame(drawFrame);
        return;
      }
      // Clear, or held by a pause: no more frames, so the layer hint goes.
      frameId = null;
      image.style.willChange = "auto";
    };
    if (!isCleared) {
      image.style.willChange = "filter, transform";
    }
    drawFrame();
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [startsAt, endsAt, isCleared, clockOffsetMs, frozenProgress]);

  return (
    <span className={frameClassName}>
      <img
        ref={imageRef}
        className={styles.image}
        src={mediaUrl}
        alt={altText}
        lang={altLanguage}
        decoding="async"
        draggable={false}
      />
    </span>
  );
}

function reducedStepAt(
  reveal: SlowReveal,
  serverNow: number,
  frozenProgress: number | null,
): number {
  const progress = revealProgressAt(reveal, serverNow, frozenProgress);
  return progress >= 1 ? LAST_STEP : Math.floor(progress * LAST_STEP);
}

/** Shows the copies up to `step`, cross-fading each one that changes when `shouldFade`. */
function showStep(
  layers: ReadonlyArray<HTMLImageElement | null>,
  step: number,
  shouldFade: boolean,
) {
  layers.forEach((layer, layerIndex) => {
    if (layer === null) {
      return;
    }
    const targetOpacity = layerIndex <= step ? 1 : 0;
    const currentOpacity = layer.style.opacity === "1" ? 1 : 0;
    if (
      shouldFade &&
      currentOpacity !== targetOpacity &&
      typeof layer.animate === "function"
    ) {
      layer.animate([{ opacity: currentOpacity }, { opacity: targetOpacity }], {
        duration: CROSS_FADE_MS,
        easing: CROSS_FADE_EASING,
      });
    }
    layer.style.opacity = String(targetOpacity);
  });
}

/**
 * Reduced motion: four stacked copies of the picture, one per step, each
 * held at its own blur with no zoom. A timer at each step boundary fades the
 * next copy in over the one below it.
 */
function SteppedPicture({
  mediaUrl,
  altText,
  altLanguage,
  frameClassName,
  slowReveal,
  clockOffsetMs,
  frozenProgress,
}: PictureLayoutProps & { slowReveal: SlowReveal }) {
  const layerRefs = useRef<Array<HTMLImageElement | null>>([]);
  // The first step after mount lands at once (a picture that mounts already
  // cleared shows clear with no fade); every later step change cross-fades.
  const hasShownStepRef = useRef(false);
  const { startsAt, endsAt, isCleared } = slowReveal;

  useLayoutEffect(() => {
    const reveal: SlowReveal = { startsAt, endsAt, isCleared };
    const layers = layerRefs.current;
    let timerId: number | null = null;
    const scheduleNextStep = () => {
      const serverNow = Date.now() + clockOffsetMs;
      const step = reducedStepAt(reveal, serverNow, frozenProgress);
      showStep(layers, step, hasShownStepRef.current);
      hasShownStepRef.current = true;
      if (step >= LAST_STEP || frozenProgress !== null) {
        timerId = null;
        return;
      }
      const stepMs = (endsAt - startsAt) / LAST_STEP;
      const nextBoundary = startsAt + (step + 1) * stepMs;
      timerId = window.setTimeout(
        scheduleNextStep,
        Math.max(0, nextBoundary - serverNow),
      );
    };
    scheduleNextStep();
    return () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [startsAt, endsAt, isCleared, clockOffsetMs, frozenProgress]);

  return (
    <span className={frameClassName}>
      {REDUCED_STEP_LEVELS.map((level, layerIndex) => (
        <img
          key={level}
          ref={(layer) => {
            layerRefs.current[layerIndex] = layer;
          }}
          className={styles.image}
          src={mediaUrl}
          alt={layerIndex === 0 ? altText : ""}
          lang={layerIndex === 0 ? altLanguage : undefined}
          aria-hidden={layerIndex === 0 ? undefined : true}
          decoding="async"
          draggable={false}
          style={{
            filter: blurFilterAt(level),
            opacity: layerIndex === 0 ? 1 : 0,
          }}
        />
      ))}
    </span>
  );
}
