import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  return (
    <div
      className={`${styles.bulkBar} ${count > 0 ? styles.show : ""}`}
      role="region"
      aria-label={t("members:drafts.bulkBar.ariaLabel")}
      aria-hidden={count === 0}
    >
      <span className={styles.bbCount}>
        <Translation
          i18nKey="members:drafts.bulkBar.selectedCount"
          components={{ b: <b /> }}
          values={{ count }}
        />
      </span>
      <Button
        variant="primary"
        onClick={onDelete}
        tabIndex={count === 0 ? -1 : undefined}
      >
        {t("members:drafts.bulkBar.deleteCta")}
      </Button>
      <Button
        variant="ghost-dark"
        onClick={onCancel}
        tabIndex={count === 0 ? -1 : undefined}
      >
        {t("members:drafts.bulkBar.cancel")}
      </Button>
    </div>
  );
}
