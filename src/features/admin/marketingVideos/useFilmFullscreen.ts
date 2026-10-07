import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";

const MORPH_MS = 450;
const MORPH_EASING = "cubic-bezier(0.2, 0, 0, 1)";
/** The controls arrive once the film is on its way, in either direction. */
const CONTROLS_DELAY_MS = 150;
/** Pointer stillness, while playing, after which the controls step aside. */
const IDLE_MS = 2500;
const STAGE_CONTROLS = "button:not([disabled]), input:not([disabled])";

/** Where the film shows on screen, and how round its corners look there. */
type FilmPlace = { rect: DOMRect; radius: number };

/** A transform that lays a box at `from` over the place `to`, with its own top-left as origin. */
function flipFrom(from: DOMRect, to: DOMRect): string {
  const deltaX = from.left - to.left;
  const deltaY = from.top - to.top;
  return `translate(${deltaX}px, ${deltaY}px) scale(${from.width / to.width})`;
}

/**
 * Full screen for the preview stage (the film and its transport). The stage
 * fills the viewport in place (fixed, inside the dialog), so the iframe never
 * reloads, playback carries on, and the page owns every frame of the morph.
 * Both ways morph with FLIP:
 * the film travels between its place in the dialog and the whole viewport
 * while the veil fades the film ground in or out behind it.
 */
export function useFilmFullscreen({ isPlaying }: { isPlaying: boolean }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const firstPlaceRef = useRef<FilmPlace | null>(null);
  const firstVeilOpacityRef = useRef(0);
  const isFullscreenRef = useRef(false);
  const animationsRef = useRef<Animation[]>([]);
  const idleTimerRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const cancelMorph = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
  }, []);

  // On the way back the stage stays fixed over its place in the dialog
  // (see the layout effect). This lets it back into the dialog's flow.
  const releaseStage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    for (const property of ["position", "top", "left", "width"])
      stage.style.removeProperty(property);
  }, []);

  // Any pointer or key activity shows the controls and restarts the
  // countdown to hiding them (they only hide while the film plays).
  const wake = useCallback(() => {
    setIsIdle(false);
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => setIsIdle(true), IDLE_MS);
  }, []);

  const toggle = useCallback(() => {
    const stage = stageRef.current;
    const film = filmRef.current;
    if (!stage || !film) return;
    const isEntering = !isFullscreenRef.current;
    // FIRST: where the film shows right now, mid-morph included.
    const rect = film.getBoundingClientRect();
    const visualScale = film.offsetWidth ? rect.width / film.offsetWidth : 1;
    firstPlaceRef.current = {
      rect,
      radius:
        parseFloat(getComputedStyle(film).borderTopLeftRadius) * visualScale,
    };
    const veil = veilRef.current;
    firstVeilOpacityRef.current = veil
      ? Number(getComputedStyle(veil).opacity)
      : 0;
    cancelMorph();
    releaseStage();
    // Hold the stage's place so the dialog behind keeps its shape.
    if (isEntering && slotRef.current)
      slotRef.current.style.minHeight = `${stage.offsetHeight}px`;
    isFullscreenRef.current = isEntering;
    setIsFullscreen(isEntering);
    if (isEntering) wake();
  }, [cancelMorph, releaseStage, wake]);

  // LAST is read after the new layout commits and before it paints, so the
  // film never shows a frame in its new place without the morph.
  useLayoutEffect(() => {
    const first = firstPlaceRef.current;
    const film = filmRef.current;
    const stage = stageRef.current;
    if (!first || !film || !stage) return;
    firstPlaceRef.current = null;
    // Back in the dialog, the stage is fully laid out again.
    const land = () => {
      releaseStage();
      if (slotRef.current) slotRef.current.style.minHeight = "";
    };
    if (prefersReducedMotionNow()) {
      if (!isFullscreen) land();
      return;
    }
    // The dialog clips its overflow, so a film still growing out of its
    // place there would show cropped. The stage stays fixed over that place
    // (the slot holds the room) until the film lands.
    if (!isFullscreen) {
      const place = stage.getBoundingClientRect();
      Object.assign(stage.style, {
        position: "fixed",
        top: `${place.top}px`,
        left: `${place.left}px`,
        width: `${place.width}px`,
      });
    }
    const last = film.getBoundingClientRect();
    if (!last.width) {
      if (!isFullscreen) land();
      return;
    }
    const scale = first.rect.width / last.width;
    const timing = { duration: MORPH_MS, easing: MORPH_EASING };
    const filmMorph = film.animate(
      [
        {
          transformOrigin: "0 0",
          transform: flipFrom(first.rect, last),
          borderRadius: `${first.radius / scale}px`,
        },
        {
          transformOrigin: "0 0",
          transform: "none",
          borderRadius: getComputedStyle(film).borderTopLeftRadius,
        },
      ],
      timing,
    );
    if (!isFullscreen) filmMorph.onfinish = land;
    const morphs = [filmMorph];
    const veil = veilRef.current;
    if (veil)
      morphs.push(
        veil.animate(
          { opacity: [firstVeilOpacityRef.current, isFullscreen ? 1 : 0] },
          timing,
        ),
      );
    const controls = controlsRef.current;
    if (controls)
      morphs.push(
        controls.animate(
          { opacity: [0, 1] },
          {
            ...timing,
            duration: MORPH_MS - CONTROLS_DELAY_MS,
            delay: CONTROLS_DELAY_MS,
            fill: "backwards",
          },
        ),
      );
    animationsRef.current = morphs;
  }, [isFullscreen, releaseStage]);

  useEffect(
    () => () => {
      cancelMorph();
      window.clearTimeout(idleTimerRef.current);
    },
    [cancelMorph],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const hasModifier =
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    if (event.key.toLowerCase() === "f" && !hasModifier) {
      event.preventDefault();
      toggle();
      return;
    }
    if (!isFullscreen) return;
    wake();
    // In full screen only the stage shows: Tab cycles inside it.
    const stage = stageRef.current;
    if (event.key !== "Tab" || !stage) return;
    const controls = Array.from(
      stage.querySelectorAll<HTMLElement>(STAGE_CONTROLS),
    );
    const edge = event.shiftKey ? controls[0] : controls[controls.length - 1];
    const wrapTo = event.shiftKey ? controls[controls.length - 1] : controls[0];
    if (!edge || !wrapTo || document.activeElement !== edge) return;
    event.preventDefault();
    event.stopPropagation();
    wrapTo.focus();
  };

  return {
    isFullscreen,
    areControlsHidden: isFullscreen && isPlaying && isIdle,
    toggle,
    slotRef,
    stageRef,
    filmRef,
    controlsRef,
    veilRef,
    stageHandlers: {
      onKeyDown: handleKeyDown,
      onPointerMove: isFullscreen ? wake : undefined,
      onPointerDown: isFullscreen ? wake : undefined,
    },
  };
}
