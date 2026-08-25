import {
  FiAlertTriangle,
  FiEdit3,
  FiFileText,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import {
  Button,
  EmptyState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskStates.module.css";

const SKELETON_STAT_COUNT = 4;
const SKELETON_ROW_COUNT = 5;

/**
 * Shimmer placeholder for the desk while pieces/pitches are still loading:
 * the 4-up stats row, then a handful of pipeline-table rows. Purely
 * decorative — `aria-hidden` so screen readers skip straight to the loaded
 * content once it arrives.
 */
export function DeskSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.statsRow}>
        {Array.from({ length: SKELETON_STAT_COUNT }).map((_, statIndex) => (
          <div className={styles.statCard} key={statIndex}>
            <SkeletonLine height={34} width="55%" />
            <SkeletonLine height={13} width="75%" />
          </div>
        ))}
      </div>
      <div className={styles.table}>
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
          <div className={styles.tableRow} key={rowIndex}>
            <SkeletonLine height={16} width="55%" />
            <SkeletonLine height={13} width="22%" />
            <SkeletonLine height={13} width="16%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export interface DeskEmptyStateProps {
  /** The current issue number, so the copy can say exactly which one is bare. */
  issueNumber: string;
  onWrite: () => void;
  onCommission: () => void;
}

/**
 * First-run / "the desk is clear" state: nothing has been filed yet for the
 * current issue. Two recovery actions, in the same order as the header:
 * write the first piece yourself, or commission it out.
 */
export function DeskEmptyState({
  issueNumber,
  onWrite,
  onCommission,
}: DeskEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiFileText aria-hidden />}
      title={t("magazine:desk.states.emptyIssueTitle", { number: issueNumber })}
      description={t("magazine:desk.states.emptyIssueDescription")}
      action={{
        label: (
          <>
            <FiEdit3 aria-hidden /> {t("magazine:desk.states.writePiece")}
          </>
        ),
        onClick: onWrite,
      }}
      secondaryAction={{
        label: (
          <>
            <FiPlus aria-hidden /> {t("magazine:desk.states.commissionPiece")}
          </>
        ),
        onClick: onCommission,
      }}
    />
  );
}

export interface DeskErrorBandProps {
  onRetry: () => void;
}

/**
 * Non-blocking inline error band shown above stale/cached data when the live
 * pipeline fetch failed — the desk stays usable, this just says so honestly.
 */
export function DeskErrorBand({ onRetry }: DeskErrorBandProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.errorBand} role="alert">
      <FiAlertTriangle aria-hidden />
      <span>{t("magazine:desk.states.errorBand")}</span>
      <Button size="sm" variant="ghost" onClick={onRetry}>
        <FiRefreshCw aria-hidden />
        {t("magazine:desk.states.tryAgain")}
      </Button>
    </div>
  );
}
