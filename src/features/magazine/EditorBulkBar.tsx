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
  return (
    <div className={cx(styles.bulkBar, count > 0 && styles.show)}>
      <div className={styles.bulkInner}>
        <span className={styles.bulkCount}>
          {count} pitch{count === 1 ? "" : "es"} selected
        </span>
        <div className={styles.bulkActions}>
          <button
            type="button"
            className={cx(styles.bulkBtn, styles.yes)}
            onClick={() => onBulk("yes")}
          >
            Accept
          </button>
          <button
            type="button"
            className={styles.bulkBtn}
            onClick={() => onBulk("maybe")}
          >
            Maybe
          </button>
          <button
            type="button"
            className={cx(styles.bulkBtn, styles.no)}
            onClick={() => onBulk("no")}
          >
            Decline
          </button>
          <button
            type="button"
            className={cx(styles.bulkBtn, styles.clear)}
            onClick={onClear}
          >
            Clear
          </button>
        </div>
        <span className={styles.bulkNote}>
          Accepting or declining sends each writer a templated reply
          automatically.
        </span>
      </div>
    </div>
  );
}
