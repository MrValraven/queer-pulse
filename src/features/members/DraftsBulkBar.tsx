import { Button } from "../../shared/components/ui";
import styles from "./DraftsPage.module.css";

/** Floating bar that appears while one or more drafts are selected. */
export function DraftsBulkBar({
  count,
  onDelete,
  onCancel,
}: {
  count: number;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={`${styles.bulkBar} ${count > 0 ? styles.show : ""}`}
      role="region"
      aria-label="Bulk actions"
      aria-hidden={count === 0}
    >
      <span className={styles.bbCount}>
        <b>{count}</b> selected
      </span>
      <Button
        variant="primary"
        onClick={onDelete}
        tabIndex={count === 0 ? -1 : undefined}
      >
        Delete selected
      </Button>
      <Button
        variant="ghost-dark"
        onClick={onCancel}
        tabIndex={count === 0 ? -1 : undefined}
      >
        Cancel
      </Button>
    </div>
  );
}
