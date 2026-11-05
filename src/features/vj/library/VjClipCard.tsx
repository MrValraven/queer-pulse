import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VJ_PIXELATED_MIN_SCALE } from "../vj.constants";
import { formatVjBytes, formatVjDuration } from "../vjFormat";
import styles from "./VjClips.module.css";

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
 *  inside a pack the card also carries a drag grip and earlier and later
 *  buttons. */
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
    <article className={styles.card} data-dragging={isDragging || undefined}>
      <button
        type="button"
        className={styles.editButton}
        aria-label={t("vj:clip.editAria", { title: clip.title })}
        onClick={onEdit}
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
        </span>
        <span className={styles.cardTitle}>{clip.title}</span>
      </button>
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
