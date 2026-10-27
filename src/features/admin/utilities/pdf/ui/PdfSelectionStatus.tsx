import { useRef, useState, type MouseEvent } from "react";
import { Button } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import styles from "./PdfChrome.module.css";
import { useFocusHandoff } from "./useFocusHandoff";

interface PdfSelectionStatusProps {
  selectedCount: number;
  isWholeGridSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

/**
 * The selection bar's top row: how many pages are selected (or how to start
 * selecting), with Select all and Clear selection beside it. Each of those
 * two switches itself off when pressed, so it hands focus to the other.
 */
export function PdfSelectionStatus({
  selectedCount,
  isWholeGridSelected,
  onSelectAll,
  onClearSelection,
}: PdfSelectionStatusProps) {
  const { t } = useTranslation();
  const selectAllRef = useRef<HTMLButtonElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);
  const handOffFocus = useFocusHandoff();
  const hasSelection = selectedCount > 0;
  // The count line keeps its last number while it fades out.
  const [shownCount, setShownCount] = useState(selectedCount);
  if (hasSelection && selectedCount !== shownCount) {
    setShownCount(selectedCount);
  }
  const countText = t("admin:utilities.pdf.selection.count", {
    count: shownCount,
  });
  const hintText = t("admin:utilities.pdf.selection.hint");

  return (
    <div className={styles.selectionStatus}>
      <p className={styles.selectionText}>
        <span className="visuallyHidden" role="status">
          {hasSelection ? countText : hintText}
        </span>
        <span className={styles.swap} aria-hidden>
          <span className={styles.swapLine} data-shown={!hasSelection}>
            {hintText}
          </span>
          <span
            className={styles.swapLine}
            data-shown={hasSelection}
            data-tone="count"
          >
            {countText}
          </span>
        </span>
      </p>
      <div className={styles.selectionTools}>
        <Button
          ref={selectAllRef}
          variant="quiet"
          size="sm"
          disabled={isWholeGridSelected}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            handOffFocus(event, clearRef);
            onSelectAll();
          }}
        >
          {t("admin:utilities.pdf.selection.selectAll")}
        </Button>
        <Button
          ref={clearRef}
          variant="quiet"
          size="sm"
          disabled={!hasSelection}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            handOffFocus(event, selectAllRef);
            onClearSelection();
          }}
        >
          {t("admin:utilities.pdf.selection.clear")}
        </Button>
      </div>
    </div>
  );
}
