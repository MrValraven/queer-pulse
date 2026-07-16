import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TriageVerdict } from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

/** Fixed bottom bar for triaging selected pitches in bulk. */
export function EditorBulkBar({
  count,
  onBulk,
  onClear,
}: {
  count: number;
  onBulk: (verdict: TriageVerdict) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={cx(styles.bulkBar, count > 0 && styles.show)}>
      <div className={styles.bulkInner}>
        <span className={styles.bulkCount}>
          {t("magazine:editor.bulkBar.selected", { count })}
        </span>
        <div className={styles.bulkActions}>
          <button
            type="button"
            className={cx(styles.bulkBtn, styles.yes)}
            onClick={() => onBulk("yes")}
          >
            {t("magazine:editor.bulkBar.accept")}
          </button>
          <button
            type="button"
            className={styles.bulkBtn}
            onClick={() => onBulk("maybe")}
          >
            {t("magazine:editor.bulkBar.maybe")}
          </button>
          <button
            type="button"
            className={cx(styles.bulkBtn, styles.no)}
            onClick={() => onBulk("no")}
          >
            {t("magazine:editor.bulkBar.decline")}
          </button>
          <button
            type="button"
            className={cx(styles.bulkBtn, styles.clear)}
            onClick={onClear}
          >
            {t("magazine:editor.bulkBar.clear")}
          </button>
        </div>
        <span className={styles.bulkNote}>
          {t("magazine:editor.bulkBar.note")}
        </span>
      </div>
    </div>
  );
}
