import {
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VJ_PIXELATED_MIN_SCALE } from "../vj.constants";
import { formatVjBytes, formatVjDuration } from "../vjFormat";
import { VjClipCardPreview } from "./VjClipCardPreview";
import { VjClipFavoriteButton } from "./VjClipFavoriteButton";
import styles from "./VjClips.module.css";

/** How long a mouse rests on a card before its preview starts, so sweeping
 *  across the grid loads nothing. */
const PREVIEW_HOVER_DELAY_MS = 150;
/** How long a finger holds the thumbnail before the preview plays. */
const PREVIEW_LONG_PRESS_MS = 450;
/** How far a finger may drift during the hold before it counts as a scroll. */
const PREVIEW_LONG_PRESS_SLOP_PX = 10;

interface VjScaledImageProps {
  src: string;
  alt: string;
  /** The clip's own size, which also sets the image's width and height. */
  nativeWidth: number;
  nativeHeight: number;
  className?: string;
  isLazy?: boolean;
}

/** An image that switches to pixelated scaling once it is drawn at
 *  `VJ_PIXELATED_MIN_SCALE` times the clip's own width or more, so a tiny GIF
 *  keeps its hard pixel edges. */
export function VjScaledImage({
  src,
  alt,
  nativeWidth,
  nativeHeight,
  className,
  isLazy = false,
}: VjScaledImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isPixelated, setIsPixelated] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (image === null || nativeWidth <= 0) return;
    const update = () => {
      setIsPixelated(image.clientWidth >= nativeWidth * VJ_PIXELATED_MIN_SCALE);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(image);
    return () => observer.disconnect();
  }, [nativeWidth]);

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      width={nativeWidth}
      height={nativeHeight}
      loading={isLazy ? "lazy" : undefined}
      decoding="async"
      className={[className, isPixelated && styles.pixelated]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function isFocusVisible(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * When a card plays its animated preview: a resting mouse, keyboard focus on
 * the card, or a finger held on the thumbnail (released, the preview stops).
 * A long-press swallows the click that follows it, so holding to look never
 * opens Edit clip. Nothing arms while `isArmed` is false (no preview yet, or
 * reduced motion), so a plain tap stays a plain tap.
 */
function useVjCardPreviewTrigger(isArmed: boolean) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const wasLongPressRef = useRef(false);

  useEffect(
    () => () => {
      if (hoverTimerRef.current !== null) clearTimeout(hoverTimerRef.current);
      if (pressTimerRef.current !== null) clearTimeout(pressTimerRef.current);
    },
    [],
  );

  const endHover = () => {
    if (hoverTimerRef.current !== null) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    setIsHovered(false);
  };
  const endPress = () => {
    if (pressTimerRef.current !== null) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
    pressOriginRef.current = null;
    setIsPressed(false);
  };

  return {
    isActive: isArmed && (isHovered || isFocused || isPressed),
    articleHandlers: {
      onPointerEnter: (event: ReactPointerEvent) => {
        if (event.pointerType !== "mouse" || !isArmed) return;
        endHover();
        hoverTimerRef.current = setTimeout(() => {
          hoverTimerRef.current = null;
          setIsHovered(true);
        }, PREVIEW_HOVER_DELAY_MS);
      },
      onPointerLeave: endHover,
    },
    editHandlers: {
      onFocus: (event: ReactFocusEvent<HTMLButtonElement>) => {
        if (isFocusVisible(event.currentTarget)) setIsFocused(true);
      },
      onBlur: () => {
        wasLongPressRef.current = false;
        setIsFocused(false);
      },
      onPointerDown: (event: ReactPointerEvent) => {
        wasLongPressRef.current = false;
        if (event.pointerType !== "touch" || !isArmed) return;
        endPress();
        pressOriginRef.current = { x: event.clientX, y: event.clientY };
        pressTimerRef.current = setTimeout(() => {
          pressTimerRef.current = null;
          wasLongPressRef.current = true;
          setIsPressed(true);
        }, PREVIEW_LONG_PRESS_MS);
      },
      onPointerMove: (event: ReactPointerEvent) => {
        const origin = pressOriginRef.current;
        if (origin === null || pressTimerRef.current === null) return;
        const drift = Math.hypot(
          event.clientX - origin.x,
          event.clientY - origin.y,
        );
        if (drift > PREVIEW_LONG_PRESS_SLOP_PX) endPress();
      },
      onPointerUp: endPress,
      onPointerCancel: endPress,
      // A held finger opens the system menu on Android and iOS; the hold is
      // the preview here.
      onContextMenu: (event: ReactMouseEvent) => {
        if (pressOriginRef.current !== null || wasLongPressRef.current) {
          event.preventDefault();
        }
      },
    },
    /** True once for the click that ends a long-press. */
    consumeLongPress: () => {
      const wasLongPress = wasLongPressRef.current;
      wasLongPressRef.current = false;
      return wasLongPress;
    },
  };
}

export interface VjClipCardProps {
  clip: VjClipDTO;
  /** Zero-based slot in the grid. */
  position: number;
  total: number;
  isReorderable: boolean;
  isDragging: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
}

/** One clip in the library grid: the thumbnail and title open Edit clip;
 *  a star over the thumbnail's corner marks it a favorite, and a resting
 *  mouse, keyboard focus or a long-press plays its animated preview. Inside a
 *  pack the card also carries a drag grip and earlier and later buttons. */
export function VjClipCard({
  clip,
  position,
  total,
  isReorderable,
  isDragging,
  onEdit,
  onMove,
  gripProps,
}: VjClipCardProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const preview = useVjCardPreviewTrigger(
    clip.previewUrl !== null && !reducedMotion,
  );
  const size = formatVjBytes(clip.byteSize);
  const meta =
    clip.mediaKind === "video" && clip.durationMs !== null
      ? t("vj:clip.metaVideo", {
          duration: formatVjDuration(clip.durationMs),
          size,
        })
      : t("vj:clip.metaGif", { size });
  const isFirst = position === 0;
  const isLast = position >= total - 1;

  return (
    <article
      className={styles.card}
      data-dragging={isDragging || undefined}
      {...preview.articleHandlers}
    >
      <button
        type="button"
        className={styles.editButton}
        aria-label={t("vj:clip.editAria", { title: clip.title })}
        {...preview.editHandlers}
        onClick={() => {
          if (!preview.consumeLongPress()) onEdit();
        }}
      >
        <span className={styles.thumbBox}>
          <VjScaledImage
            src={clip.thumbnailUrl}
            alt=""
            nativeWidth={clip.width}
            nativeHeight={clip.height}
            className={styles.thumbImage}
            isLazy
          />
          <VjClipCardPreview
            clip={clip}
            isActive={preview.isActive && !isDragging}
          />
        </span>
        <span className={styles.cardTitle}>{clip.title}</span>
      </button>
      <VjClipFavoriteButton clip={clip} className={styles.favorite} />
      <p className={styles.cardMeta}>{meta}</p>
      {isReorderable ? (
        <div className={styles.cardActions}>
          <span
            className={styles.grip}
            aria-hidden="true"
            onPointerDown={gripProps.onPointerDown}
          >
            <MdDragIndicator focusable="false" />
          </span>
          <IconButton
            size="sm"
            aria-label={t("vj:clip.moveEarlier", { title: clip.title })}
            aria-disabled={isFirst || undefined}
            onClick={() => {
              if (!isFirst) onMove(-1);
            }}
          >
            <FiChevronLeft aria-hidden="true" focusable="false" fill="none" />
          </IconButton>
          <IconButton
            size="sm"
            aria-label={t("vj:clip.moveLater", { title: clip.title })}
            aria-disabled={isLast || undefined}
            onClick={() => {
              if (!isLast) onMove(1);
            }}
          >
            <FiChevronRight aria-hidden="true" focusable="false" fill="none" />
          </IconButton>
        </div>
      ) : (
        <p className={styles.cardPacks}>
          {clip.packCount === 0
            ? t("vj:clip.packCountNone")
            : t("vj:clip.packCount", { count: clip.packCount })}
        </p>
      )}
    </article>
  );
}
