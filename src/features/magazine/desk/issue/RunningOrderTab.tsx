import { useEffect, useRef, useState, type DragEvent } from "react";
import { FiChevronDown, FiChevronUp, FiMoreVertical } from "react-icons/fi";
import { Button, Tag } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../../shared/i18n/types";
import type {
  IssueProductionDto,
  IssueRunOrderEntryDto,
} from "../../api/issueProduction.api";
import styles from "./issueTabs.module.css";

export interface RunningOrderTabProps {
  runOrder: IssueProductionDto["runOrder"];
  /** Fired with the full reordered array — the caller (page) persists it via
   *  `saveRunOrder`. Always the whole array, never a delta. */
  onReorder: (nextRunOrder: IssueProductionDto["runOrder"]) => void;
  onOpen: (piece: IssueRunOrderEntryDto["piece"]) => void;
}

function pagesLabel(pages: string, t: TFunction): string {
  return pages === "deck"
    ? t("magazine:issue.runOrder.deckNoPageCount")
    : t("magazine:issue.runOrder.pagesPrefix", { pages });
}

function moveItem<Item>(
  items: Item[],
  fromIndex: number,
  toIndex: number,
): Item[] {
  const next = [...items];
  const moved = next[fromIndex];
  if (moved === undefined) return items;
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Tab 1 of the issue-production page: the drag-reorderable running order
 * (`.plan`/`.ordrow`, ported from `mag-issue.jsx`/`mag-issue.css`). Reordering
 * works two ways so it stays keyboard-accessible: HTML5 drag-and-drop on the
 * whole row, and up/down icon buttons that any pointer or keyboard user can
 * reach — dragging alone would lock keyboard-only editors out of reordering.
 */
export function RunningOrderTab({
  runOrder,
  onReorder,
  onOpen,
}: RunningOrderTabProps) {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState("");
  const announcementFrameRef = useRef(0);

  useEffect(
    () => () => window.cancelAnimationFrame(announcementFrameRef.current),
    [],
  );

  /**
   * Writes the polite live region below the list. A move re-renders the rows in
   * place under a focus that never leaves the button that was pressed, so
   * without this a keyboard editor gets no confirmation that anything happened
   * and has to re-read the whole list after every step.
   *
   * The region is cleared first and written back on the next frame, so the two
   * writes land in separate commits and the text is GUARANTEED to change. The
   * position alone almost always differs between consecutive moves, but two
   * pieces that share a title can land on the same position one after the
   * other, and a live region handed identical text is never re-read.
   */
  function announceMove(title: string, position: number) {
    const total = runOrder.length;
    window.cancelAnimationFrame(announcementFrameRef.current);
    setMoveAnnouncement("");
    announcementFrameRef.current = window.requestAnimationFrame(() => {
      setMoveAnnouncement(
        t("magazine:issue.runOrder.movedAnnouncement", {
          title,
          position,
          total,
        }),
      );
    });
  }

  /** The single reorder path: persist the new array, then announce the move. */
  function applyMove(fromIndex: number, toIndex: number) {
    const moved = runOrder[fromIndex];
    if (moved === undefined) return;
    onReorder(moveItem(runOrder, fromIndex, toIndex));
    announceMove(moved.piece.title, toIndex + 1);
  }

  function handleDragStart(sourceIndex: number) {
    return (event: DragEvent<HTMLDivElement>) => {
      setDraggedIndex(sourceIndex);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(sourceIndex));
    };
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(targetIndex: number) {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const sourceIndex =
        draggedIndex ?? Number(event.dataTransfer.getData("text/plain"));
      setDraggedIndex(null);
      if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) return;
      applyMove(sourceIndex, targetIndex);
    };
  }

  function moveByStep(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= runOrder.length) return;
    applyMove(index, targetIndex);
  }

  return (
    <div className={styles.plan}>
      {runOrder.map((entry, index) => (
        <div
          key={entry.piece.id}
          className={styles.ordrow}
          draggable
          data-drag={draggedIndex === index}
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(index)}
          onDragEnd={() => setDraggedIndex(null)}
        >
          <span className={styles.ordn}>{index + 1}</span>
          <span className={styles.grab} aria-hidden="true">
            <FiMoreVertical />
          </span>
          <div className={styles.pt}>
            <h4>{entry.piece.title}</h4>
            <div className={styles.sub}>
              <span>{entry.piece.section}</span>
              <span>·</span>
              <span>{pagesLabel(entry.pages, t)}</span>
            </div>
          </div>
          <Tag className={entry.laidOut ? styles.tagJade : styles.tagAmber}>
            {entry.laidOut
              ? t("magazine:issue.runOrder.laidOut")
              : t("magazine:issue.runOrder.inLayout")}
          </Tag>
          <div className={styles.rowActs}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => moveByStep(index, "up")}
              disabled={index === 0}
              aria-label={t("magazine:issue.runOrder.moveEarlierAria", {
                title: entry.piece.title,
              })}
            >
              <FiChevronUp aria-hidden />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => moveByStep(index, "down")}
              disabled={index === runOrder.length - 1}
              aria-label={t("magazine:issue.runOrder.moveLaterAria", {
                title: entry.piece.title,
              })}
            >
              <FiChevronDown aria-hidden />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpen(entry.piece)}
            >
              {t("magazine:issue.runOrder.open")}
            </Button>
          </div>
        </div>
      ))}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {moveAnnouncement}
      </p>
    </div>
  );
}
