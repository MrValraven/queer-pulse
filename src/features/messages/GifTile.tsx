import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { FiPlay } from "react-icons/fi";
import type { GifAttachment, GifResult } from "../../shared/api/gifs";
import styles from "./GifPicker.module.css";

/** The tile box is a fixed square (`.tile`'s own `aspect-ratio: 1 / 1` in
 *  GifPicker.module.css). The reduced-motion still frame is captured onto a
 *  canvas sized to that box in device pixels, capped well below the
 *  provider's own full GIF dimensions, so the buffer stays proportional to
 *  what's actually on screen. */
const TILE_CSS_SIZE = 160;
const MAX_CANVAS_DEVICE_PIXELS = 320;
const CANVAS_DEVICE_PIXEL_SIZE = Math.min(
  Math.round(TILE_CSS_SIZE * (window.devicePixelRatio || 1)),
  MAX_CANVAS_DEVICE_PIXELS,
);

interface GifTileProps {
  result: GifResult;
  onPick: (attachment: GifAttachment) => void;
  /** DES-205: whether the picker must hold the tile still right now. */
  prefersReducedMotion: boolean;
  /** Roving-tabindex value from `useGifGridNavigation`: 0 for the single
   *  tile currently in the tab order, -1 for every other tile. */
  tabIndex: number;
  tileRef: (element: HTMLButtonElement | null) => void;
  /** Tells the grid's roving-tabindex state this tile is now the reference
   *  point: a pointer click/tap or an arrow key landing here. */
  onFocus: () => void;
  /** Arrow/Home/End navigation from `useGifGridNavigation`, attached to the
   *  tile's own button so keyboard focus and the handler always live on the
   *  same interactive element. See `GifGrid` for the full reasoning. */
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  /** The picker's own scrolling `.body`, used as the `IntersectionObserver`
   *  root so the still frame below only loads once this tile is likely to
   *  scroll into view there. */
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

/** Crops the loaded still frame to a centered square using its own natural
 *  dimensions, then scales that square to fill the canvas: the same crop
 *  CSS `object-fit: cover` performs on the live `<img>`, so the frozen
 *  poster and the animated preview always frame the GIF the same way. */
function drawCoverFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasSize: number,
) {
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight) {
    context.drawImage(image, 0, 0, canvasSize, canvasSize);
    return;
  }
  const cropSize = Math.min(naturalWidth, naturalHeight);
  const sourceX = (naturalWidth - cropSize) / 2;
  const sourceY = (naturalHeight - cropSize) / 2;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    canvasSize,
    canvasSize,
  );
}

/**
 * A single GIF result tile.
 *
 * `GifAttachment` carries no still-image URL from the provider today (see
 * `shared/api/gifs.ts`: KLIPY's mapped fields are `url`/`previewUrl`, both
 * animated GIFs). Wiring a real still through the adapter is outside this
 * component's file scope, so under `prefers-reduced-motion: reduce` this
 * freezes the FIRST FRAME of the animated preview onto a canvas. An `<img>`
 * playing a GIF has no format-level play/pause hook, so pausing means
 * drawing one frame once. That frame is captured the first time the tile
 * scrolls near `.body`'s view and stays mounted underneath for the tile's
 * whole lifetime; hovering or focusing layers the live animated `<img>` on
 * top, with a play icon as the affordance, and leaving hover/blur removes
 * that layer again to reveal the frame already drawn beneath it. Picking the
 * tile always sends the real animated `GifAttachment`; the frozen frame is
 * display-only.
 */
export function GifTile({
  result,
  onPick,
  prefersReducedMotion,
  tabIndex,
  tileRef,
  onFocus,
  onKeyDown,
  scrollRootRef,
}: GifTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isNearView, setIsNearView] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const isPreviewing = isHovered || isFocused;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonElementRef = useRef<HTMLButtonElement | null>(null);

  function setButtonRef(element: HTMLButtonElement | null) {
    buttonElementRef.current = element;
    tileRef(element);
  }

  // Loads the still frame only once the tile is likely to scroll into
  // `.body`'s view, the way the browser's own `loading="lazy"` defers the
  // animated `<img>` below: a bare `new Image()` has no native lazy hook, so
  // this recreates one with an observer rooted on the picker's own scroller.
  useEffect(() => {
    if (!prefersReducedMotion || isNearView) return;
    const element = buttonElementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearView(true);
        }
      },
      { root: scrollRootRef.current, rootMargin: "200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion, isNearView, scrollRootRef]);

  useEffect(() => {
    if (!prefersReducedMotion || !isNearView) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let isCancelled = false;
    const stillFrameImage = new Image();
    stillFrameImage.onload = () => {
      if (isCancelled) return;
      drawCoverFrame(context, stillFrameImage, CANVAS_DEVICE_PIXEL_SIZE);
    };
    stillFrameImage.onerror = () => {
      if (isCancelled) return;
      setHasImageError(true);
    };
    stillFrameImage.src = result.attachment.previewUrl;
    return () => {
      isCancelled = true;
    };
  }, [prefersReducedMotion, isNearView, result.attachment.previewUrl]);

  function handleImageError() {
    setHasImageError(true);
  }

  const showsAnimatedImage =
    !hasImageError && (!prefersReducedMotion || isPreviewing);
  const showsPlayAffordance =
    prefersReducedMotion && !isPreviewing && !hasImageError;

  return (
    <button
      ref={setButtonRef}
      type="button"
      className={styles.tile}
      aria-label={result.description}
      tabIndex={tabIndex}
      onClick={() => onPick(result.attachment)}
      onFocus={() => {
        onFocus();
        if (prefersReducedMotion) setIsFocused(true);
      }}
      onBlur={() => {
        if (prefersReducedMotion) setIsFocused(false);
      }}
      onMouseEnter={() => {
        if (prefersReducedMotion) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (prefersReducedMotion) setIsHovered(false);
      }}
      onKeyDown={onKeyDown}
    >
      {!hasImageError && prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className={styles.tileImage}
          width={CANVAS_DEVICE_PIXEL_SIZE}
          height={CANVAS_DEVICE_PIXEL_SIZE}
          aria-hidden
        />
      )}
      {showsAnimatedImage && (
        <img
          className={styles.tileImage}
          src={result.attachment.previewUrl}
          loading="lazy"
          alt=""
          onError={handleImageError}
        />
      )}
      {showsPlayAffordance && (
        <span className={styles.playAffordance} aria-hidden>
          <FiPlay />
        </span>
      )}
    </button>
  );
}
