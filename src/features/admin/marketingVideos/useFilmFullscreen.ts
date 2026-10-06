import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";

const MORPH_MS = 450;
const MORPH_EASING = "cubic-bezier(0.2, 0, 0, 1)";
/** The overlaid controls arrive once the film has started to grow. */
const CONTROLS_DELAY_MS = 150;
/** Pointer stillness, while playing, after which the controls step aside. */
const IDLE_MS = 2500;
const STAGE_CONTROLS = "button:not([disabled]), input:not([disabled])";

/** The film box's place in full screen, read from layout (transforms ignored). */
function laidOutRect(film: HTMLElement): DOMRect {
  return new DOMRect(
    film.offsetLeft,
    film.offsetTop,
    film.offsetWidth,
    film.offsetHeight,
  );
}

/** A transform that lays a box at `from` over the place `to`, with its own top-left as origin. */
function flipFrom(from: DOMRect, to: DOMRect): string {
  const deltaX = from.left - to.left;
  const deltaY = from.top - to.top;
  return `translate(${deltaX}px, ${deltaY}px) scale(${from.width / to.width})`;
}

/**
 * Full screen for the preview stage (the film and its transport). The stage
 * itself goes full screen, so the iframe never reloads and playback carries
 * on. Both ways morph with FLIP: going in, the film grows from its place in
 * the dialog; coming out (by any route, Escape included), the whole dialog
 * shrinks from the full-screen film back to its resting place.
 */
export function useFilmFullscreen({ isPlaying }: { isPlaying: boolean }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const filmRectBeforeRef = useRef<DOMRect | null>(null);
  const fullscreenRectRef = useRef<DOMRect | null>(null);
  const isStageFullscreenRef = useRef(false);
  const animationsRef = useRef<Animation[]>([]);
  const frameRef = useRef(0);
  const idleTimerRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const isSupported =
    typeof document !== "undefined" && document.fullscreenEnabled === true;

  const cancelMorph = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
  }, []);

  const toggle = useCallback(() => {
    const stage = stageRef.current;
    const film = filmRef.current;
    if (!stage || !film || !document.fullscreenEnabled) return;
    if (document.fullscreenElement === stage) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }
    // FIRST: where the film sits right now, mid-morph included.
    filmRectBeforeRef.current = film.getBoundingClientRect();
    cancelMorph();
    // Hold the stage's place so the dialog behind keeps its shape.
    if (slotRef.current)
      slotRef.current.style.minHeight = `${stage.offsetHeight}px`;
    void stage.requestFullscreen().catch(() => {
      if (slotRef.current) slotRef.current.style.minHeight = "";
    });
  }, [cancelMorph]);

  const morphIn = useCallback((stage: HTMLElement, film: HTMLElement) => {
    const first = filmRectBeforeRef.current;
    const last = film.getBoundingClientRect();
    fullscreenRectRef.current = last;
    if (!first || !last.width) return;
    const timing = { duration: MORPH_MS, easing: MORPH_EASING };
    const morphs = [
      film.animate(
        [
          { transformOrigin: "0 0", transform: flipFrom(first, last) },
          { transformOrigin: "0 0", transform: "none" },
        ],
        timing,
      ),
      stage.animate(
        { opacity: [0, 1] },
        { ...timing, pseudoElement: "::before" },
      ),
    ];
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
  }, []);

  const morphOut = useCallback((film: HTMLElement) => {
    const dialog = film.closest<HTMLElement>('[role="dialog"]');
    const fullscreenRect = fullscreenRectRef.current;
    if (!dialog || !fullscreenRect) return;
    const filmRect = film.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    if (!filmRect.width) return;
    // Scale the dialog about its film's top-left corner, so the film lands
    // exactly on the full-screen place it just left.
    const origin = `${filmRect.left - dialogRect.left}px ${filmRect.top - dialogRect.top}px`;
    const timing = { duration: MORPH_MS, easing: MORPH_EASING };
    const morphs = [
      dialog.animate(
        [
          {
            transformOrigin: origin,
            transform: flipFrom(fullscreenRect, filmRect),
          },
          { transformOrigin: origin, transform: "none" },
        ],
        timing,
      ),
    ];
    // The veil stands in for the full-screen ground around the film, so the
    // dialog's chrome fades up as it shrinks into place.
    const veil = veilRef.current;
    if (veil) morphs.push(veil.animate({ opacity: [1, 0] }, timing));
    animationsRef.current = morphs;
  }, []);

  // Any pointer or key activity shows the controls and restarts the
  // countdown to hiding them (they only hide while the film plays).
  const wake = useCallback(() => {
    setIsIdle(false);
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => setIsIdle(true), IDLE_MS);
  }, []);

  useEffect(() => {
    const handleChange = () => {
      const stage = stageRef.current;
      const film = filmRef.current;
      if (!stage || !film) return;
      const isEntering = document.fullscreenElement === stage;
      if (!isEntering && !isStageFullscreenRef.current) return;
      isStageFullscreenRef.current = isEntering;
      setIsFullscreen(isEntering);
      if (isEntering) wake();
      cancelMorph();
      if (!isEntering && slotRef.current) slotRef.current.style.minHeight = "";
      if (prefersReducedMotionNow()) return;
      // LAST is read one frame on, once the new layout has settled.
      frameRef.current = requestAnimationFrame(() => {
        if (isEntering) morphIn(stage, film);
        else morphOut(film);
      });
    };
    // A window resized while in full screen moves the film: keep its place.
    const handleResize = () => {
      if (isStageFullscreenRef.current && filmRef.current)
        fullscreenRectRef.current = laidOutRect(filmRef.current);
    };
    document.addEventListener("fullscreenchange", handleChange);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [cancelMorph, morphIn, morphOut, wake]);

  // Closing the preview leaves full screen too.
  useEffect(
    () => () => {
      cancelMorph();
      window.clearTimeout(idleTimerRef.current);
      if (document.fullscreenElement)
        void document.exitFullscreen().catch(() => undefined);
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
    isSupported,
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
