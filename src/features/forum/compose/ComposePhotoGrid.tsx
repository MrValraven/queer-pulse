import type { ChangeEvent, RefObject } from "react";
import { AnimatePresence, m, type Transition } from "motion/react";
import { FiImage } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useMeasuredContentHeight } from "../../../shared/components/layout/useMeasuredContentHeight";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ComposePhoto } from "./composeThread.types";
import { ComposePhotoTile } from "./ComposePhotoTile";
import { useKeyedPhotoHandlers } from "./useKeyedPhotoHandlers";
import styles from "./ComposePhotoGrid.module.css";

// ── Up to four staged photos, each with its description ─────────────────────
// The description is not an afterthought tucked behind a menu: it is a field
// on the tile with a flag that says out loud whether it is still missing, so a
// photo nobody can see is visibly unfinished rather than quietly published.
//
// Every control drives the `photos` controller from `useComposeThreadPage`.
// Nothing about the order or the upload lives here.

/** The file types the picker accepts. Matches the upload pipeline. */
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

/** The house spring curve (`--ease`), as the cubic bezier motion expects. */
const PHOTO_MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;

/** A tile or a status line settles in over this long; zero under reduced
 *  motion, so it simply appears. */
function photoTransition(isReducedMotion: boolean): Transition {
  return { duration: isReducedMotion ? 0 : 0.26, ease: PHOTO_MOTION_EASE };
}

export interface ComposePhotoGridProps {
  /** The staged photos, in display order. */
  photos: readonly ComposePhoto[];
  /** Describes a photo. The controller applies `COMPOSE_ALT_MAX_LENGTH`. */
  onAltChange: (index: number, alt: string) => void;
  /** Takes a photo off the post. */
  onRemove: (index: number) => void;
  /** Moves one photo one place earlier (`-1`) or later (`1`). */
  onMove: (index: number, direction: -1 | 1) => void;
}

export function ComposePhotoGrid(props: ComposePhotoGridProps) {
  if (props.photos.length === 0) return null;
  return <ComposePhotoGridList {...props} />;
}

/** The grid proper. Its own component so the height measurement starts when
 *  the first photo lands, when there is a grid to measure. */
function ComposePhotoGridList({
  photos,
  onAltChange,
  onRemove,
  onMove,
}: ComposePhotoGridProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { contentRef, contentHeight, isTransitionEnabled } =
    useMeasuredContentHeight<HTMLUListElement>();
  const keyedHandlers = useKeyedPhotoHandlers(photos, {
    onAltChange,
    onRemove,
    onMove,
  });

  // A new tile scales up into its cell, a removed one shrinks away while
  // `popLayout` lifts it out of the grid, and `layout` glides the others into
  // their new cells, which is also what a reorder looks like. The list is the
  // `layoutRoot`, so the tiles glide only when a sibling comes, goes or swaps;
  // a taller title above moves the whole grid in one piece. The frame
  // carries the grid's measured height, so gaining or losing a row eases
  // the content below into its new place.
  return (
    <div
      className={styles.gridFrame}
      style={isTransitionEnabled ? { height: contentHeight ?? undefined } : {}}
    >
      <m.ul
        ref={contentRef}
        layout
        layoutRoot
        className={styles.grid}
        aria-label={t("forum:composePage.photo.gridLabel")}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {photos.map((photo, index) => (
            <ComposePhotoTile
              key={photo.key}
              photo={photo}
              index={index}
              total={photos.length}
              transition={photoTransition(reducedMotion)}
              {...keyedHandlers}
            />
          ))}
        </AnimatePresence>
      </m.ul>
    </div>
  );
}

export interface ComposePhotoAttachProps {
  /** The hidden file input the picker opens. From the photos controller. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Opens the file picker. */
  onOpenPicker: () => void;
  /** Uploads whatever the picker handed back. */
  onAddFiles: (files: FileList | null) => void;
  /** True once four photos are staged. */
  hasReachedLimit: boolean;
  /** True while at least one file is still uploading. */
  isUploading: boolean;
  /** A ready-to-render error line, or null. */
  error: string | null;
}

/**
 * The "Add a photo" control, plus the hidden input it opens and the upload's
 * status line. Lives beside the grid rather than inside it because the body
 * footer is where the prototype puts the button, and the grid renders nothing
 * at all until the first photo lands.
 */
export function ComposePhotoAttach({
  inputRef,
  onOpenPicker,
  onAddFiles,
  hasReachedLimit,
  isUploading,
  error,
}: ComposePhotoAttachProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // Each status line fades in beside the button and out again; `popLayout`
  // lets "uploading" and "limit reached" cross-fade in the same spot.
  const statusMotion = {
    initial: { opacity: 0, x: -4 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -4 },
    transition: photoTransition(reducedMotion),
  };

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    onAddFiles(event.target.files);
  }

  return (
    <span className={styles.attachWrap}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.attachButton}
        disabled={hasReachedLimit || isUploading}
        onClick={onOpenPicker}
      >
        <FiImage className={styles.attachIcon} aria-hidden />
        {t("forum:composePage.photo.attach")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className={styles.fileInput}
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        aria-label={t("forum:composePage.photo.inputLabel")}
        onChange={handlePick}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        {isUploading && (
          <m.span
            key="uploading"
            className={styles.attachNote}
            aria-live="polite"
            {...statusMotion}
          >
            {t("forum:composePage.photo.uploading")}
          </m.span>
        )}
        {hasReachedLimit && !isUploading && (
          <m.span key="limit" className={styles.attachNote} {...statusMotion}>
            {t("forum:composePage.photo.limitReached")}
          </m.span>
        )}
        {error && (
          <m.span
            key="error"
            className={styles.attachError}
            role="alert"
            {...statusMotion}
          >
            {error}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
