import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VjGrid.module.css";

/** Space kept between the card and every viewport edge. */
const VJ_PREVIEW_EDGE_PX = 12;
/** Space between the card and the tile it previews. */
const VJ_PREVIEW_ANCHOR_GAP_PX = 8;
/** The app's ease-out token (--ease-out) and fast duration (--dur-fast). */
const VJ_PREVIEW_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_PREVIEW_INSTANT = { duration: 0 };

interface VjPreviewPosition {
  top: number;
  left: number;
  placement: "above" | "below";
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Above the tile and centred on it; below when the room above runs out. */
function placeVjPreview(
  anchor: HTMLElement,
  card: HTMLElement,
): VjPreviewPosition {
  const anchorRect = anchor.getBoundingClientRect();
  const aboveTop =
    anchorRect.top - VJ_PREVIEW_ANCHOR_GAP_PX - card.offsetHeight;
  const placement = aboveTop >= VJ_PREVIEW_EDGE_PX ? "above" : "below";
  const preferredTop =
    placement === "above"
      ? aboveTop
      : anchorRect.bottom + VJ_PREVIEW_ANCHOR_GAP_PX;
  const preferredLeft =
    anchorRect.left + anchorRect.width / 2 - card.offsetWidth / 2;
  return {
    placement,
    top: clampToRange(
      preferredTop,
      VJ_PREVIEW_EDGE_PX,
      window.innerHeight - card.offsetHeight - VJ_PREVIEW_EDGE_PX,
    ),
    left: clampToRange(
      preferredLeft,
      VJ_PREVIEW_EDGE_PX,
      window.innerWidth - card.offsetWidth - VJ_PREVIEW_EDGE_PX,
    ),
  };
}

interface VjTilePreviewCardProps {
  clip: VjClipDTO;
  anchorRef: RefObject<HTMLElement | null>;
  note: string | null;
}

function VjTilePreviewCard({
  clip,
  anchorRef,
  note,
}: VjTilePreviewCardProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const cardRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<VjPreviewPosition | null>(null);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const card = cardRef.current;
    if (anchor && card) setPosition(placeVjPreview(anchor, card));
  }, [anchorRef]);
  useLayoutEffect(place, [place]);

  // Moving pictures play only while the tile is held, and never under
  // reduced motion: the still thumbnail stands in.
  const isMoving = clip.previewUrl !== null && !reducedMotion;
  const transition = reducedMotion ? VJ_PREVIEW_INSTANT : VJ_PREVIEW_TRANSITION;
  return (
    <m.figure
      ref={cardRef}
      className={styles.preview}
      aria-label={t("vj:grid.previewAria", { title: clip.title })}
      data-theme="dark"
      data-vj-tile-preview=""
      data-moving={isMoving ? "true" : "false"}
      data-placement={position?.placement ?? "above"}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        originY: position?.placement === "below" ? 0 : 1,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={transition}
    >
      <span className={styles.previewMedia}>
        {isMoving && clip.previewUrl !== null ? (
          <video
            className={styles.previewPicture}
            src={clip.previewUrl}
            poster={clip.thumbnailUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
          />
        ) : (
          <img
            className={styles.previewPicture}
            src={clip.thumbnailUrl}
            alt=""
            width={clip.width}
            height={clip.height}
            decoding="async"
          />
        )}
      </span>
      <figcaption className={styles.previewCaption}>
        <span className={styles.previewTitle}>{clip.title}</span>
        {clip.previewUrl === null ? (
          <span className={styles.previewNote} data-vj-preview-missing="">
            {t("vj:grid.previewMissing")}
          </span>
        ) : null}
        {note !== null ? (
          <span className={styles.previewNote} data-vj-preview-readiness="">
            {note}
          </span>
        ) : null}
      </figcaption>
    </m.figure>
  );
}

interface VjTilePreviewProps {
  clip: VjClipDTO;
  /** The tile the card sits above. */
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  /** The tile's readiness line, shown under the title while the clip is not ready. */
  note: string | null;
}

/**
 * The long-press peek at a clip: a 240px card portaled above the held tile,
 * playing the clip's moving preview muted and looped while the press lasts.
 * With no preview yet (or under reduced motion) it shows the still
 * thumbnail, with a note pointing to the VJ library when the preview is
 * missing. Presses pass through it, so the release lands on the tile.
 */
export function VjTilePreview({
  clip,
  anchorRef,
  isOpen,
  note,
}: VjTilePreviewProps): JSX.Element {
  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <VjTilePreviewCard
          key="vj-tile-preview"
          clip={clip}
          anchorRef={anchorRef}
          note={note}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
