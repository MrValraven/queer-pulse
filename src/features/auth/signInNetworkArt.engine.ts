import { paintBackdrop } from "./signInNetworkArt.backdrop";
import {
  createQComposition,
  type Composition,
} from "./signInNetworkArt.compositions";
import type { TextAnchor, TextHandoffCues } from "./signInNetworkArt.handoff";
import { readNetworkPalette } from "./signInNetworkArt.palette";
import { watchArtHost } from "./signInNetworkArt.watchers";
import type { RenderResources } from "./signInNetworkArt.qRender";

/** Runs the network art on a canvas: sizing (HiDPI, ResizeObserver), theme
 *  (re-reads the tokens when <html data-theme> changes), the frame loop and
 *  its pauses (hidden tab, scrolled off screen, reduced motion). Kept out of
 *  React so the component only mounts it and tears it down. */

export interface NetworkArtEngine {
  setReducedMotion: (isReducedMotion: boolean) => void;
  setTextAnchor: (anchor: TextAnchor | null) => void;
  destroy: () => void;
}

const MAXIMUM_PIXEL_RATIO = 2;
const LONGEST_FRAME_SECONDS = 0.05;

/** Starts the network gathered into the Q of QueerPulse on `canvas`. The
 *  `cues` fire once, when the Q has formed and when its last light reaches
 *  the wordmark. */
export function createNetworkArtEngine(
  canvas: HTMLCanvasElement,
  cues: TextHandoffCues = {},
): NetworkArtEngine {
  return runComposition(canvas, createQComposition(cues));
}

function runComposition<Scene>(
  canvas: HTMLCanvasElement,
  composition: Composition<Scene>,
): NetworkArtEngine {
  const context = canvas.getContext("2d");
  const host = canvas.parentElement ?? canvas;
  let scene: Scene | null = null;
  let isPrepared = false;
  let isDestroyed = false;
  let resources: RenderResources | null = null;
  let width = 0;
  let height = 0;
  let insetTop = 0;
  let insetBottom = 0;
  let pixelRatio = 1;
  let isReducedMotion = false;
  let isOnScreen = true;
  let isPageVisible = !document.hidden;
  let frameHandle = 0;
  let lastTimestamp = 0;

  const refreshResources = () => {
    const palette = readNetworkPalette(canvas);
    if (!palette || !scene) {
      resources = null;
      return;
    }
    const anchor = composition.anchor(scene);
    resources = {
      palette,
      backdrop: paintBackdrop(
        palette,
        width,
        height,
        pixelRatio,
        anchor.anchorX,
        anchor.anchorY,
      ),
    };
  };

  const draw = () => {
    if (context && scene && resources)
      composition.render(context, scene, resources, pixelRatio);
  };

  const frame = (timestamp: number) => {
    frameHandle = 0;
    if (!scene) return;
    const deltaSeconds = lastTimestamp
      ? Math.min(LONGEST_FRAME_SECONDS, (timestamp - lastTimestamp) / 1000)
      : 1 / 60;
    lastTimestamp = timestamp;
    composition.step(scene, deltaSeconds);
    draw();
    frameHandle = requestAnimationFrame(frame);
  };

  const syncLoop = () => {
    const shouldRun =
      Boolean(context && scene && resources) &&
      !isReducedMotion &&
      isOnScreen &&
      isPageVisible;
    if (shouldRun && !frameHandle) {
      lastTimestamp = 0;
      frameHandle = requestAnimationFrame(frame);
    } else if (!shouldRun && frameHandle) {
      cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }
  };

  /** A fresh scene for the current size. Reduced motion gets its composed
   *  still frame, drawn once; otherwise the loop picks it up. */
  const rebuild = () => {
    if (!context || !isPrepared || width < 2 || height < 2) return;
    scene = composition.build(width, height, insetTop, insetBottom);
    if (isReducedMotion) composition.still(scene);
    else composition.step(scene, 0);
    refreshResources();
    draw();
    syncLoop();
  };

  const resize = (
    nextWidth: number,
    nextHeight: number,
    nextInsetTop: number,
    nextInsetBottom: number,
  ) => {
    const nextRatio = Math.min(
      window.devicePixelRatio || 1,
      MAXIMUM_PIXEL_RATIO,
    );
    if (
      nextWidth === width &&
      nextHeight === height &&
      nextInsetTop === insetTop &&
      nextInsetBottom === insetBottom &&
      nextRatio === pixelRatio
    )
      return;
    width = nextWidth;
    height = nextHeight;
    insetTop = nextInsetTop;
    insetBottom = nextInsetBottom;
    pixelRatio = nextRatio;
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    rebuild();
  };

  const stopWatching = watchArtHost(canvas, host, {
    onResize: resize,
    onScreenChange: (nextIsOnScreen) => {
      isOnScreen = nextIsOnScreen;
      syncLoop();
    },
    onThemeChange: () => {
      refreshResources();
      draw();
    },
    onPageVisibilityChange: (nextIsPageVisible) => {
      isPageVisible = nextIsPageVisible;
      syncLoop();
    },
  });

  // A failed preparation still builds: the Q falls back to its geometric
  // letter.
  void composition
    .prepare(canvas)
    .catch(() => undefined)
    .then(() => {
      if (isDestroyed) return;
      isPrepared = true;
      rebuild();
    });

  return {
    setReducedMotion: (nextIsReducedMotion) => {
      if (nextIsReducedMotion === isReducedMotion) return;
      isReducedMotion = nextIsReducedMotion;
      rebuild();
      syncLoop();
    },
    setTextAnchor: composition.setTextAnchor,
    destroy: () => {
      isDestroyed = true;
      if (frameHandle) cancelAnimationFrame(frameHandle);
      frameHandle = 0;
      stopWatching();
      scene = null;
      resources = null;
    },
  };
}
