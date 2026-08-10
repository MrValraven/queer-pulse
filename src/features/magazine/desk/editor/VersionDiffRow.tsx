import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VersionDiffRow as VersionDiffRowData } from "./versionDiffAlgorithm";
import styles from "./VersionDiff.module.css";

const STATUS_CHIP_CLASS = {
  unchanged: styles.statusUnchanged,
  changed: styles.statusChanged,
  added: styles.statusAdded,
  removed: styles.statusRemoved,
} as const;

export interface VersionDiffRowProps {
  row: VersionDiffRowData;
}

/** One block's comparison result — a status chip plus the block's readable
 *  text, or the before/after pair when it changed. Not a character-level
 *  diff: the whole block reads as a unit either way. */
export function VersionDiffRow({ row }: VersionDiffRowProps) {
  const { t } = useTranslation();
  const statusLabel = t(`magazine:write.versions.diff.status.${row.status}`);

  return (
    <div className={styles.row}>
      <span className={cx(styles.statusChip, STATUS_CHIP_CLASS[row.status])}>{statusLabel}</span>
      {row.status === "changed" ? (
        <div className={styles.changedPair}>
          <div>
            <div className={styles.textLabel}>{t("magazine:write.versions.diff.before")}</div>
            <p className={styles.text}>{row.versionText}</p>
          </div>
          <div>
            <div className={styles.textLabel}>{t("magazine:write.versions.diff.now")}</div>
            <p className={styles.text}>{row.currentText}</p>
          </div>
        </div>
      ) : (
        <p className={styles.text}>{row.currentText ?? row.versionText}</p>
      )}
    </div>
  );
}
