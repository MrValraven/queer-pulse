import {
  useId,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { AnimatePresence } from "motion/react";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import {
  splitIntoChunks,
  type OpenedFileInfo,
  type PageItem,
} from "../model/pdfEditModel";
import { nextGridFocusIndex, type GridFocusKey } from "../model/pdfSelection";
import { PdfPageTile } from "./PdfPageTile";
import styles from "./PdfPageGrid.module.css";

const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 6 } };
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 250, tolerance: 8 },
};

export interface PdfPageGridProps {
  pages: readonly PageItem[];
  filesById: ReadonlyMap<string, OpenedFileInfo>;
  isMultiFile: boolean;
  selectedIds: ReadonlySet<string>;
  onTogglePage: (pageId: string) => void;
  onSelectRange: (pageId: string) => void;
  onMovePage: (pageId: string, toIndex: number) => void;
  onToggleCut: (pageId: string) => void;
  renderThumbnail: (page: PageItem) => ReactNode;
}

function isGridFocusKey(key: string): key is GridFocusKey {
  return (
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "Home" ||
    key === "End"
  );
}

/** Matches live tiles only: popLayout keeps exiting ones briefly. */
const LIVE_TILE = "li:not([data-motion-pop-id])";

/** How many tiles share the first row, read from the rendered layout. */
function columnCountOf(list: HTMLElement): number {
  const rows = Array.from(list.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && !child.hasAttribute("data-motion-pop-id"),
  );
  const firstTop = rows[0]?.offsetTop;
  if (firstTop === undefined) return 1;
  return Math.max(1, rows.filter((row) => row.offsetTop === firstTop).length);
}

/** Part numbers keyed by the first page of each part, once there are two. */
function partNumbersOf(
  pages: readonly PageItem[],
): ReadonlyMap<string, number> {
  const chunks = splitIntoChunks(pages);
  const partNumbers = new Map<string, number>();
  if (chunks.length < 2) return partNumbers;
  chunks.forEach((chunk, chunkIndex) => {
    const firstPage = chunk[0];
    if (firstPage) partNumbers.set(firstPage.id, chunkIndex + 1);
  });
  return partNumbers;
}

/**
 * The page grid: thumbnails to select (click, shift-click, Space), to drag
 * into a new order with a mouse or finger, and the split toggles between
 * them. Arrow keys, Home and End move focus across the tiles; keyboard
 * moves go through the selection bar's Move buttons.
 */
export function PdfPageGrid({
  pages,
  filesById,
  isMultiFile,
  selectedIds,
  onTogglePage,
  onSelectRange,
  onMovePage,
  onToggleCut,
  renderThumbnail,
}: PdfPageGridProps) {
  const { t } = useTranslation();
  const hintId = useId();
  const hasDragJustEndedRef = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
  );
  const pageIds = useMemo(() => pages.map((page) => page.id), [pages]);
  const partNumbers = partNumbersOf(pages);

  const positionOf = (pageId: UniqueIdentifier) =>
    pages.findIndex((page) => page.id === pageId) + 1;

  // The finished move is announced once by the page's live region, for
  // drags and Move buttons alike, so the drop itself says nothing here.
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t("admin:utilities.pdf.drag.start", { number: positionOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over
        ? t("admin:utilities.pdf.drag.over", {
            number: positionOf(active.id),
            position: positionOf(over.id),
          })
        : undefined,
    onDragEnd: () => undefined,
    onDragCancel: ({ active }) => {
      const startPosition = positionOf(active.id);
      return t("admin:utilities.pdf.drag.cancel", {
        number: startPosition,
        position: startPosition,
      });
    },
  };

  function markDragEnded() {
    hasDragJustEndedRef.current = true;
  }

  function clearDragEnded() {
    hasDragJustEndedRef.current = false;
  }

  function consumeClickAfterDrag(): boolean {
    const hasDragJustEnded = hasDragJustEndedRef.current;
    hasDragJustEndedRef.current = false;
    return hasDragJustEnded;
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    markDragEnded();
    if (!over || active.id === over.id) return;
    const toIndex = pages.findIndex((page) => page.id === over.id);
    if (toIndex !== -1) onMovePage(String(active.id), toIndex);
  }

  function handleTileKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    tileIndex: number,
  ) {
    clearDragEnded();
    const list = listRef.current;
    if (!list || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!isGridFocusKey(event.key)) return;
    const nextIndex = nextGridFocusIndex(
      tileIndex,
      event.key,
      columnCountOf(list),
      pages.length,
    );
    event.preventDefault();
    list
      .querySelector<HTMLElement>(
        `${LIVE_TILE} [data-page-tile="${nextIndex}"]`,
      )
      ?.focus();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragCancel={markDragEnded}
      accessibility={{
        screenReaderInstructions: {
          draggable: t("admin:utilities.pdf.drag.instructions"),
        },
        announcements,
      }}
    >
      <SortableContext items={pageIds} strategy={rectSortingStrategy}>
        <p id={hintId} className="visuallyHidden">
          {t("admin:utilities.pdf.grid.keyboardHint")}
        </p>
        <ol
          ref={listRef}
          className={styles.grid}
          aria-label={t("admin:utilities.pdf.grid.label")}
          aria-describedby={hintId}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {pages.map((page, index) => (
              <PdfPageTile
                key={page.id}
                page={page}
                index={index}
                isLast={index === pages.length - 1}
                fileInfo={filesById.get(page.fileId)}
                isMultiFile={isMultiFile}
                isSelected={selectedIds.has(page.id)}
                partNumber={partNumbers.get(page.id) ?? null}
                thumbnail={renderThumbnail(page)}
                onTogglePage={onTogglePage}
                onSelectRange={onSelectRange}
                onToggleCut={onToggleCut}
                consumeClickAfterDrag={consumeClickAfterDrag}
                onTileKeyDown={handleTileKeyDown}
                onTilePointerDown={clearDragEnded}
              />
            ))}
          </AnimatePresence>
        </ol>
      </SortableContext>
    </DndContext>
  );
}
