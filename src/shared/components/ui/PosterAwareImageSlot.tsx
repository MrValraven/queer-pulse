import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { ImageSlot } from "./ImageSlot";
import styles from "./PosterAwareImageSlot.module.css";

/** Width over height below which a file counts as a poster (portrait or
 *  near-square) and shows whole instead of being cropped to fill the frame. */
const POSTER_RATIO_CEILING = 1.2;

/**
 * How far a poster's aspect may sit from its frame's own aspect (the larger
 * over the smaller) and still take a plain cover fit. Cropping a few percent
 * off a 4:5 poster in a 3:4 card is invisible, while the thin blurred bands
 * the poster treatment would leave there read as a hard seam.
 */
const NEAR_MATCH_TOLERANCE = 1.1;

/** The sharp poster sits centred and whole, above the backdrop. */
const POSTER_IMG_STYLE: CSSProperties = {
  position: "relative",
  zIndex: 1,
  objectFit: "contain",
};

/** Whether a file of this natural size is poster-shaped (see the ceiling). */
export function isPosterShaped(width: number, height: number): boolean {
  return width / height < POSTER_RATIO_CEILING;
}

/** Whether a file of this aspect sits close enough to its frame's aspect to
 *  fill it with a plain cover fit. A frame with no size never matches. */
function isNearMatch(fileAspect: number, frameAspect: number | null): boolean {
  if (frameAspect === null) return false;
  const larger = Math.max(fileAspect, frameAspect);
  const smaller = Math.min(fileAspect, frameAspect);
  return larger / smaller <= NEAR_MATCH_TOLERANCE;
}

/** The width over height of the frame (the img's parent) at this moment, or
 *  null while it has no size. */
function readFrameAspect(image: HTMLImageElement): number | null {
  const frame = image.parentElement;
  if (!frame || frame.clientWidth === 0 || frame.clientHeight === 0) {
    return null;
  }
  return frame.clientWidth / frame.clientHeight;
}

type PosterAwareImageSlotProps = ComponentProps<typeof ImageSlot> & {
  /** Reports the loaded file's natural pixel size, also for a file that was
   *  already complete (cached) when the slot mounted. */
  onNaturalSize?: (size: { width: number; height: number }) => void;
};

interface LoadedImage {
  /** The `src` prop this measurement belongs to. */
  src: string;
  /** Natural pixel size; zero for a file the browser could not size. */
  width: number;
  height: number;
  /** True for a file that arrived after mount, which fades in. False for one
   *  already complete at mount, which shows at once. */
  isFreshLoad: boolean;
  /** The frame's aspect when the file was measured. The near-match check
   *  reads only this, so a caller growing its frame to fit the poster
   *  afterwards never flips the treatment mid-transition. */
  frameAspectAtMeasure: number | null;
  /** The URL the sharp image actually painted. The blurred backdrop reuses
   *  it, so it is already in the browser's cache and shows with the reveal
   *  instead of fetching a second render after it. */
  paintedUrl: string;
}

/** The aspect of a measured poster-shaped file, or null for anything else. */
function posterAspectOf(image: LoadedImage | null): number | null {
  if (!image || image.width === 0 || image.height === 0) return null;
  if (!isPosterShaped(image.width, image.height)) return null;
  return image.width / image.height;
}

/**
 * A drop-in `ImageSlot` that never crops a poster. A missing `src` and a
 * broken one render exactly as `ImageSlot` does, and a landscape file takes
 * the same cover fit. A poster-shaped file shows whole (`object-fit: contain`)
 * over a blurred, dimmed copy of itself that fills the rest of the frame,
 * unless its aspect sits within `NEAR_MATCH_TOLERANCE` of the frame's own,
 * where a plain cover fit crops only a few percent. That choice is made once
 * per `src`, from the frame as it is when the file is measured, and holds
 * while a caller grows the frame to fit (contain at an exact fit shows no
 * bands anyway). A file that arrives after mount stays hidden over
 * the slot's tint until it is measured, then fades in already in its final
 * treatment. A file already in the browser's memory at mount is measured
 * before the first paint and shows at once. `crop`, `focus` and `imgStyle`
 * apply to a landscape file only.
 */
export function PosterAwareImageSlot({
  onNaturalSize,
  onLoad,
  className,
  crop,
  focus,
  imgStyle,
  children,
  ...slotProps
}: PosterAwareImageSlotProps) {
  const { src } = slotProps;
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const onNaturalSizeRef = useRef(onNaturalSize);
  useLayoutEffect(() => {
    onNaturalSizeRef.current = onNaturalSize;
  });

  // The cached path and the load event can both fire for one file (and
  // StrictMode attaches refs twice), so each `src` is measured once.
  const measuredSrcRef = useRef<string | null>(null);

  // A loaded file is always recorded, even one the browser could not size,
  // so it never stays hidden; only a real size is reported to the caller.
  const recordImage = useCallback(
    (image: HTMLImageElement, isFreshLoad: boolean) => {
      if (!src || measuredSrcRef.current === src) return;
      measuredSrcRef.current = src;
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      setLoadedImage({
        src,
        width,
        height,
        isFreshLoad,
        frameAspectAtMeasure: readFrameAspect(image),
        paintedUrl: image.currentSrc || image.src,
      });
      if (width > 0 && height > 0) {
        onNaturalSizeRef.current?.({ width, height });
      }
    },
    [src],
  );

  // Runs when the <img> attaches and again whenever `src` changes, after the
  // new src is set: a file the browser already holds is `complete` here, and
  // the frame has its size, before the first paint. A broken file is also
  // `complete` but has no natural size; its error event swaps the slot to
  // its placeholder.
  const handleImageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth > 0) recordImage(image, false);
    },
    [recordImage],
  );

  const currentImage = loadedImage?.src === src ? loadedImage : null;
  const posterAspect = posterAspectOf(currentImage);
  const isPoster =
    posterAspect !== null &&
    !isNearMatch(posterAspect, currentImage?.frameAspectAtMeasure ?? null);
  // A poster-shaped file drops the caller's landscape framing in both of
  // its renderings: whole over the backdrop, or a plain cover fit.
  const framing =
    posterAspect === null
      ? { crop, focus, imgStyle }
      : { imgStyle: isPoster ? POSTER_IMG_STYLE : undefined };
  const frameClassName = [
    className,
    isPoster && styles.poster,
    Boolean(src) && currentImage === null && styles.awaiting,
    currentImage?.isFreshLoad && styles.reveal,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ImageSlot
      {...slotProps}
      {...framing}
      className={frameClassName}
      imgRef={handleImageRef}
      onLoad={(event) => {
        recordImage(event.currentTarget, true);
        onLoad?.(event);
      }}
    >
      {isPoster && currentImage && (
        <span className={styles.backdrop} aria-hidden="true">
          <img
            src={currentImage.paintedUrl}
            alt=""
            decoding="sync"
            referrerPolicy="no-referrer"
          />
        </span>
      )}
      {children}
    </ImageSlot>
  );
}
