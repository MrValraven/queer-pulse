import { useId, useRef, type ComponentProps, type MouseEvent } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiInfo,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
} from "react-icons/fi";
import {
  Button,
  Collapse,
  IconButton,
} from "../../../../../shared/components/ui";
import { useMediaQuery } from "../../../../../shared/hooks";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../../../shared/theme/breakpoints";
import type { NudgeDirection, RotationDirection } from "../model/pdfEditModel";
import styles from "./PdfChrome.module.css";
import { PdfSelectionStatus } from "./PdfSelectionStatus";
import { useFocusHandoff } from "./useFocusHandoff";
import { useTopBarOffset } from "./useTopBarOffset";

export interface PdfSelectionBarProps {
  selectedCount: number;
  isWholeGridSelected: boolean;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRemove: () => void;
  onRotate: (direction: RotationDirection) => void;
  onNudge: (direction: NudgeDirection) => void;
  onUndo: () => void;
  onRedo: () => void;
}

/** An icon action in the bar. Its tooltip opens downward, clear of the top bar. */
function BarIconButton(props: ComponentProps<typeof IconButton>) {
  return (
    <IconButton
      tooltip
      tooltipPlacement="bottom"
      className={styles.barIcon}
      {...props}
    />
  );
}

/**
 * The sticky bar over the page grid: what is selected, the page actions and
 * the edit history. Remove stays off while every page is selected, and says
 * why, since a PDF needs at least one page. On a phone every action is an
 * icon, so the bar stays a few rows tall while it follows the scroll.
 */
export function PdfSelectionBar({
  selectedCount,
  isWholeGridSelected,
  isUndoAvailable,
  isRedoAvailable,
  onSelectAll,
  onClearSelection,
  onRemove,
  onRotate,
  onNudge,
  onUndo,
  onRedo,
}: PdfSelectionBarProps) {
  const { t } = useTranslation();
  const barRef = useRef<HTMLDivElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const redoRef = useRef<HTMLButtonElement>(null);
  const blockedReasonId = useId();
  const handOffFocus = useFocusHandoff();
  const isCompact = useMediaQuery(mediaMax("md"));
  useTopBarOffset(barRef);
  const hasSelection = selectedCount > 0;
  const removeLabel = t("admin:utilities.pdf.actions.remove");
  const removeProps = {
    disabled: !hasSelection || isWholeGridSelected,
    "aria-describedby": isWholeGridSelected ? blockedReasonId : undefined,
    onClick: onRemove,
  };

  return (
    <div ref={barRef} className={styles.selectionBar}>
      <PdfSelectionStatus
        selectedCount={selectedCount}
        isWholeGridSelected={isWholeGridSelected}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
      />
      <div className={styles.actionRow}>
        <div className={styles.group}>
          {isCompact ? (
            <BarIconButton aria-label={removeLabel} {...removeProps}>
              <FiTrash2 aria-hidden />
            </BarIconButton>
          ) : (
            <Button variant="ghost" size="sm" {...removeProps}>
              <FiTrash2 aria-hidden />
              {removeLabel}
            </Button>
          )}
          <BarIconButton
            aria-label={t("admin:utilities.pdf.actions.rotateLeft")}
            disabled={!hasSelection}
            onClick={() => onRotate("left")}
          >
            <FiRotateCcw aria-hidden />
          </BarIconButton>
          <BarIconButton
            aria-label={t("admin:utilities.pdf.actions.rotateRight")}
            disabled={!hasSelection}
            onClick={() => onRotate("right")}
          >
            <FiRotateCw aria-hidden />
          </BarIconButton>
          <BarIconButton
            aria-label={t("admin:utilities.pdf.actions.moveEarlier")}
            disabled={!hasSelection}
            onClick={() => onNudge(-1)}
          >
            <FiChevronLeft aria-hidden />
          </BarIconButton>
          <BarIconButton
            aria-label={t("admin:utilities.pdf.actions.moveLater")}
            disabled={!hasSelection}
            onClick={() => onNudge(1)}
          >
            <FiChevronRight aria-hidden />
          </BarIconButton>
        </div>
        <div className={styles.history}>
          <BarIconButton
            ref={undoRef}
            aria-label={t("admin:utilities.pdf.actions.undo")}
            aria-keyshortcuts="Control+Z Meta+Z"
            disabled={!isUndoAvailable}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              handOffFocus(event, redoRef);
              onUndo();
            }}
          >
            <FiCornerUpLeft aria-hidden />
          </BarIconButton>
          <BarIconButton
            ref={redoRef}
            aria-label={t("admin:utilities.pdf.actions.redo")}
            aria-keyshortcuts="Shift+Control+Z Shift+Meta+Z"
            disabled={!isRedoAvailable}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              handOffFocus(event, undoRef);
              onRedo();
            }}
          >
            <FiCornerUpRight aria-hidden />
          </BarIconButton>
        </div>
      </div>
      <Collapse isOpen={isWholeGridSelected} className={styles.blockedReason}>
        <p id={blockedReasonId} className={styles.blockedText}>
          <FiInfo aria-hidden />
          {t("admin:utilities.pdf.actions.removeBlocked")}
        </p>
      </Collapse>
    </div>
  );
}
