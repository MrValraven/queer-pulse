import { useTranslation } from "../../shared/i18n/useTranslation";
import { QUEUE_ASSIGNMENT_SCOPES } from "./queueAssignmentScope";
import type { QueueAssignmentScope } from "./queueAssignmentScope";
import { AdminSeg } from "./ui";
import styles from "./QueueAssignment.module.css";

/**
 * The "Everything / Assigned to me / Unclaimed" control above a staff queue
 * (OPS-04).
 *
 * The moderation queue expresses the same idea as one chip among several
 * (`FilterId`'s `"mine"`); a queue whose only filter is this one reads better
 * as a labelled segmented control, which is what this renders.
 *
 * Narrowing happens on the SERVER. These queues are paginated, so filtering
 * after the fetch would hide claimed rows that had simply not loaded yet.
 */
export function QueueAssignmentFilter({
  value,
  onChange,
}: {
  value: QueueAssignmentScope;
  onChange: (value: QueueAssignmentScope) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.filterRow}>
      <span className={styles.filterLabel}>
        {t("admin:queueAssignment.filterLabel")}
      </span>
      <AdminSeg
        options={QUEUE_ASSIGNMENT_SCOPES.map((scope) => ({
          value: scope,
          label: t(`admin:queueAssignment.filter.${scope}`),
        }))}
        value={value}
        onChange={(next) => onChange(next as QueueAssignmentScope)}
      />
    </div>
  );
}
