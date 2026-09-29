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
import type { DeskTrack } from "./deskTrack";
import styles from "./DeskStates.module.css";

const SKELETON_CHIP_COUNT = 5;
const SKELETON_ROW_COUNT = 6;
const SKELETON_RAIL_LINE_COUNT = 5;

/**
 * Shimmer placeholder for the desk while pieces and pitches load, drawn in
 * the page's own four bands (header, focus chips, workbar, then the table
 * beside the rail) so nothing jumps when the real desk arrives. Purely
 * decorative: `aria-hidden`, so screen readers go straight to the loaded
 * content.
 */
export function DeskSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonHeader}>
        <SkeletonLine height={12} width="22%" />
        <SkeletonLine height={32} width="30%" />
        <SkeletonLine height={13} width="45%" />
      </div>
      <div className={styles.skeletonRow}>
        {Array.from({ length: SKELETON_CHIP_COUNT }).map((_, chipIndex) => (
          <SkeletonLine height={32} width={104} key={chipIndex} />
        ))}
      </div>
      <div className={styles.skeletonRow}>
        <SkeletonLine height={40} width="38%" />
        <SkeletonLine height={36} width={200} />
        <SkeletonLine height={36} width={88} />
        <SkeletonLine height={36} width={88} />
      </div>
      <div className={styles.skeletonWork}>
        <div className={styles.table}>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
            <div className={styles.tableRow} key={rowIndex}>
              <SkeletonLine height={16} width="55%" />
              <SkeletonLine height={13} width="30%" />
            </div>
          ))}
        </div>
        <div className={styles.rail}>
          {Array.from({ length: SKELETON_RAIL_LINE_COUNT }).map(
            (_, lineIndex) => (
              <SkeletonLine
                height={lineIndex === 0 ? 12 : 14}
                width={lineIndex === 0 ? "40%" : "85%"}
                key={lineIndex}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export interface DeskEmptyStateProps {
  /** The scope with nothing in it, so the title can say which. */
  track: DeskTrack;
  /** The selected issue's number, for the issue scope's title. */
  issueNumber: string;
  onWrite: () => void;
  onCommission: () => void;
}

/** The empty scope's title: the issue by number, or what the scope holds. */
function emptyTitleKey(track: DeskTrack, issueNumber: string): string {
  if (track === "issue" && issueNumber) {
    return "magazine:desk.states.emptyIssueTitle";
  }
  return track === "unassigned"
    ? "magazine:desk.pulse.unfiledEmpty"
    : "magazine:desk.pulse.everythingEmpty";
}

/**
 * The table's place when the chosen scope holds no pieces at all (before
 * any filter). Two ways to start, in the same order as the New menu: write
 * the first piece yourself, or commission it out. Both are ghost buttons,
 * so the shell's Write stays the one filled button on the page.
 */
export function DeskEmptyState({
  track,
  issueNumber,
  onWrite,
  onCommission,
}: DeskEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.empty}>
      <EmptyState
        icon={<FiFileText aria-hidden />}
        title={t(emptyTitleKey(track, issueNumber), { number: issueNumber })}
        description={
          // "Every piece is in an issue" is good news, so the "nothing has
          // been filed yet" line only belongs to the other scopes.
          track === "unassigned"
            ? undefined
            : t("magazine:desk.states.emptyIssueDescription")
        }
        headingLevel={2}
      />
      <div className={styles.emptyActions}>
        <Button variant="ghost" onClick={onWrite}>
          <FiEdit3 aria-hidden /> {t("magazine:desk.states.writePiece")}
        </Button>
        <Button variant="ghost" onClick={onCommission}>
          <FiPlus aria-hidden /> {t("magazine:desk.states.commissionPiece")}
        </Button>
      </div>
    </div>
  );
}

export interface DeskErrorBandProps {
  onRetry: () => void;
}

/**
 * Non-blocking inline error band shown above stale/cached data when the live
 * pipeline fetch failed. The desk stays usable; this just says so honestly.
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
