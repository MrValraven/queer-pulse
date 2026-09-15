import { FiBarChart2, FiEye } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeBlocksRow.module.css";

// ── The two things a post can carry beyond its text ─────────────────────────
// A content warning and a poll are both optional, both rare, and both open a
// panel of their own below the row. Keeping them behind a pair of pills means
// the composer opens on the writing and reveals the rest only when it is asked
// for.
//
// Each pill is a toggle AND a disclosure, so it carries both states:
// `aria-pressed` says whether the block is ON, and `aria-expanded` +
// `aria-controls` say that its panel is open and where it is.

export interface ComposeBlocksRowProps {
  /** True while the content-warning panel is open. */
  isContentWarningPanelOpen: boolean;
  onToggleContentWarningPanel: () => void;
  /** `id` of the content-warning panel this pill discloses. */
  contentWarningPanelId: string;
  /** True while a poll is attached, which is also when its panel is open. */
  hasPoll: boolean;
  onTogglePoll: () => void;
  /** `id` of the poll panel this pill discloses. */
  pollPanelId: string;
}

export function ComposeBlocksRow({
  isContentWarningPanelOpen,
  onToggleContentWarningPanel,
  contentWarningPanelId,
  hasPoll,
  onTogglePoll,
  pollPanelId,
}: ComposeBlocksRowProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.block}
        aria-pressed={isContentWarningPanelOpen}
        aria-expanded={isContentWarningPanelOpen}
        aria-controls={contentWarningPanelId}
        onClick={onToggleContentWarningPanel}
      >
        <FiEye className={styles.blockIcon} aria-hidden />
        <span>{t("forum:composePage.block.contentWarning")}</span>
      </button>
      <button
        type="button"
        className={styles.block}
        aria-pressed={hasPoll}
        aria-expanded={hasPoll}
        aria-controls={pollPanelId}
        onClick={onTogglePoll}
      >
        <FiBarChart2 className={styles.blockIcon} aria-hidden />
        <span>{t("forum:composePage.block.poll")}</span>
      </button>
    </div>
  );
}
