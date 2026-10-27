import {
  useCallback,
  useId,
  useLayoutEffect,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { getClientRect, type ClientRect } from "@dnd-kit/core";
import {
  defaultAnimateLayoutChanges,
  useSortable,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import { SelectCheckMark } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { OpenedFileInfo, PageItem } from "../model/pdfEditModel";
import { PdfCutControl } from "./PdfCutControl";
import tones from "./fileTones.module.css";
import styles from "./PdfPageGrid.module.css";

/** Mirrors --ease and --dur-base from styles/tokens/effects.css. */
const SORTABLE_TRANSITION = {
  duration: 250,
  easing: "cubic-bezier(.22,.68,.16,1)",
};
const PRESENCE_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1],
} as const;
/** The dragged card lifts a little off the grid. */
const DRAG_LIFT_SCALE = 1.03;

/**
 * Right after a drag, dnd-kit's own rule decides, so a dropped page settles
 * from where the pointer left it. Every other reorder (a removal, a Move
 * button, an undo) glides each moved tile from its previous slot.
 */
const animateLayoutChanges: AnimateLayoutChanges = (layoutChange) =>
  layoutChange.wasDragging || layoutChange.isSorting
    ? defaultAnimateLayoutChanges(layoutChange)
    : layoutChange.transition !== null;

/**
 * A layout rect that stays true while the window scrolls: its edges shift by
 * however far the page has scrolled since the measurement.
 */
function scrollStableRect(measured: ClientRect): ClientRect {
  const scrollLeftAtMeasure = window.scrollX;
  const scrollTopAtMeasure = window.scrollY;
  const shiftX = () => scrollLeftAtMeasure - window.scrollX;
  const shiftY = () => scrollTopAtMeasure - window.scrollY;
  return {
    width: measured.width,
    height: measured.height,
    get left() {
      return measured.left + shiftX();
    },
    get right() {
      return measured.right + shiftX();
    },
    get top() {
      return measured.top + shiftY();
    },
    get bottom() {
      return measured.bottom + shiftY();
    },
  };
}

export interface PdfPageTileProps {
  page: PageItem;
  index: number;
  isLast: boolean;
  fileInfo: OpenedFileInfo | undefined;
  isMultiFile: boolean;
  isSelected: boolean;
  /** Set on the first page of each part while the cuts make two or more. */
  partNumber: number | null;
  thumbnail: ReactNode;
  onTogglePage: (pageId: string) => void;
  onSelectRange: (pageId: string) => void;
  onToggleCut: (pageId: string) => void;
  /** True once for the click that ends a drag, so the drop selects nothing. */
  consumeClickAfterDrag: () => boolean;
  /** Arrow keys, Home and End move focus across the grid. */
  onTileKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    tileIndex: number,
  ) => void;
  onTilePointerDown: () => void;
  /** AnimatePresence's popLayout reads the list item through this. */
  ref?: Ref<HTMLLIElement>;
}

/**
 * One page in the grid: a selectable toggle that is also the drag handle,
 * tinted in its file's tone, with the page number, the source file when
 * several are open, the part chip at the start of each part, and the split
 * toggle in the gap after it.
 */
export function PdfPageTile({
  page,
  index,
  isLast,
  fileInfo,
  isMultiFile,
  isSelected,
  partNumber,
  thumbnail,
  onTogglePage,
  onSelectRange,
  onToggleCut,
  consumeClickAfterDrag,
  onTileKeyDown,
  onTilePointerDown,
  ref,
}: PdfPageTileProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const partChipId = useId();
  const sortable = useSortable({
    id: page.id,
    transition: reducedMotion ? null : SORTABLE_TRANSITION,
    animateLayoutChanges,
  });
  const {
    setNodeRef,
    node,
    rect: sortableRectRef,
    isSorting,
    isDragging,
  } = sortable;

  // dnd-kit measures its rects only during a drag. Keeping them current
  // after each commit lets the next reorder glide from the true slot.
  useLayoutEffect(() => {
    if (isSorting || !node.current) return;
    sortableRectRef.current = scrollStableRect(
      getClientRect(node.current, { ignoreTransform: true }),
    );
  });

  const setListItemRef = useCallback(
    (element: HTMLLIElement | null) => {
      setNodeRef(element);
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [setNodeRef, ref],
  );

  const pageNumber = index + 1;
  const namedFile = isMultiFile ? fileInfo : undefined;
  const label = namedFile
    ? t("admin:utilities.pdf.page.labelWithFile", {
        number: pageNumber,
        fileName: namedFile.name,
      })
    : t("admin:utilities.pdf.page.label", { number: pageNumber });
  const presenceTransition = reducedMotion
    ? { duration: 0 }
    : PRESENCE_TRANSITION;
  const cardScale = isDragging && !reducedMotion ? DRAG_LIFT_SCALE : 1;
  // The part chip sits inside the labelled button, so it joins the
  // description dnd-kit already gives the drag handle.
  const describedBy =
    [sortable.attributes["aria-describedby"], partNumber !== null && partChipId]
      .filter(Boolean)
      .join(" ") || undefined;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (consumeClickAfterDrag()) return;
    if (event.shiftKey) onSelectRange(page.id);
    else onTogglePage(page.id);
  }

  return (
    <li
      ref={setListItemRef}
      className={[styles.tile, tones.tone, isDragging && styles.tileDragging]
        .filter(Boolean)
        .join(" ")}
      data-file-tone={fileInfo?.toneIndex}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
    >
      <m.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: cardScale }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={presenceTransition}
      >
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          aria-roledescription={undefined}
          aria-describedby={describedBy}
          type="button"
          aria-pressed={isSelected}
          aria-label={label}
          data-page-tile={index}
          className={styles.tileButton}
          onClick={handleClick}
          onKeyDown={(event) => onTileKeyDown(event, index)}
          onPointerDown={onTilePointerDown}
        >
          <span className={styles.thumb}>{thumbnail}</span>
          <span className={styles.check}>
            <SelectCheckMark isSelected={isSelected} />
          </span>
          <span className={styles.caption}>
            <span className={styles.number}>{pageNumber}</span>
            {namedFile && (
              <>
                <span className={styles.toneDot} />
                <span className={styles.fileName}>{namedFile.name}</span>
              </>
            )}
            <AnimatePresence initial={false}>
              {partNumber !== null && (
                <m.span
                  key="part-chip"
                  id={partChipId}
                  className={styles.part}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={presenceTransition}
                >
                  {t("admin:utilities.pdf.page.partLabel", {
                    number: partNumber,
                  })}
                </m.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </m.div>
      {!isLast && (
        <PdfCutControl
          pageNumber={pageNumber}
          isActive={page.hasCutAfter}
          onToggle={() => onToggleCut(page.id)}
        />
      )}
    </li>
  );
}
