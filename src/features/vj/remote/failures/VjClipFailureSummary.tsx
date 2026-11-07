import { useId, useState, type JSX } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VjClipFailures.module.css";

export interface VjClipFailureSummaryProps {
  failedCount: number;
  /** The pack grid is showing (the generators have nothing to load). */
  isShown: boolean;
  onSeeWhy: () => void;
}

/**
 * One line over the clip grid while a screen could not load some of the
 * pack's clips: how many, and "See why", which opens the sheet listing each
 * clip with its reason. It folds open and closed, and keeps the last count
 * while it folds away.
 */
export function VjClipFailureSummary({
  failedCount,
  isShown,
  onSeeWhy,
}: VjClipFailureSummaryProps): JSX.Element {
  const { t } = useTranslation();
  const summaryId = useId();
  const [shownCount, setShownCount] = useState(failedCount);
  if (failedCount > 0 && failedCount !== shownCount) setShownCount(failedCount);

  return (
    <Collapse isOpen={isShown && failedCount > 0}>
      <div className={styles.summary} data-vj-failure-summary="">
        <FiAlertTriangle
          aria-hidden="true"
          fill="none"
          className={styles.summaryIcon}
        />
        <p id={summaryId} className={styles.summaryText}>
          {t("vj:remote.failures.summary", { count: shownCount })}
        </p>
        <Button
          variant="stage-ghost"
          size="sm"
          className={styles.summaryButton}
          aria-haspopup="dialog"
          aria-describedby={summaryId}
          onClick={onSeeWhy}
        >
          {t("vj:remote.failures.seeWhy")}
        </Button>
      </div>
    </Collapse>
  );
}
