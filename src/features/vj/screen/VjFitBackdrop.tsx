import { useEffect, useRef, type JSX } from "react";
import styles from "./VjStage.module.css";

/** How often the backdrop repaints from the playing media. */
const VJ_FIT_BACKDROP_PAINT_MS = 500;
/** The canvas holds this many pixels across; the browser scales it up smooth. */
const VJ_FIT_BACKDROP_WIDTH = 64;
const VJ_FIT_BACKDROP_MIN_HEIGHT = 8;
const VJ_FIT_BACKDROP_MAX_HEIGHT = 128;
/** Pixels drawn past each canvas edge so the blur has colour to sample there. */
const VJ_FIT_BACKDROP_OVERSCAN = 4;
/** The same dim and soft focus the blurred copy had, applied while painting. */
const VJ_FIT_BACKDROP_CANVAS_FILTER = "blur(2px) brightness(0.45)";

export type VjFitBackdropSource = HTMLVideoElement | HTMLImageElement;

function vjFitBackdropHeightFor(clipWidth: number, clipHeight: number): number {
  if (!(clipWidth > 0) || !(clipHeight > 0)) {
    return Math.round((VJ_FIT_BACKDROP_WIDTH * 9) / 16);
  }
  const height = Math.round((VJ_FIT_BACKDROP_WIDTH * clipHeight) / clipWidth);
  return Math.min(
    VJ_FIT_BACKDROP_MAX_HEIGHT,
    Math.max(VJ_FIT_BACKDROP_MIN_HEIGHT, height),
  );
}

/** One paint from the playing media; a frame that cannot be drawn yet is skipped. */
function paintBackdrop(
  canvas: HTMLCanvasElement,
  source: VjFitBackdropSource,
): void {
  try {
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.filter = VJ_FIT_BACKDROP_CANVAS_FILTER;
    context.drawImage(
      source,
      -VJ_FIT_BACKDROP_OVERSCAN,
      -VJ_FIT_BACKDROP_OVERSCAN,
      canvas.width + VJ_FIT_BACKDROP_OVERSCAN * 2,
      canvas.height + VJ_FIT_BACKDROP_OVERSCAN * 2,
    );
  } catch {
    // The media has no drawable frame yet, or the canvas refused it: keep the last paint.
  }
}

interface VjFitBackdropProps {
  /** The ONE playing media element of the clip; null until it mounts. */
  source: VjFitBackdropSource | null;
  clipWidth: number;
  clipHeight: number;
  /** False while the layer is hidden or paused: no timer runs. */
  isPainting: boolean;
}

/**
 * The cover backdrop behind a "fit" clip. A tiny canvas painted from the clip's
 * own media element every 500 ms and scaled up by CSS, so the clip decodes once.
 */
export function VjFitBackdrop({
  source,
  clipWidth,
  clipHeight,
  isPainting,
}: VjFitBackdropProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isPainting || !canvas || !source) return undefined;
    paintBackdrop(canvas, source);
    const intervalId = window.setInterval(
      () => paintBackdrop(canvas, source),
      VJ_FIT_BACKDROP_PAINT_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [isPainting, source]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.fitBackdrop}
      width={VJ_FIT_BACKDROP_WIDTH}
      height={vjFitBackdropHeightFor(clipWidth, clipHeight)}
      aria-hidden="true"
      data-vj-fit-backdrop=""
    />
  );
}
