import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import styles from "./AdminCommunitiesPage.module.css";

// Shown in place of the health-card grid before any community exists yet.
// Deliberately has no call-to-action: admins don't found communities here,
// members do — the copy says so instead of offering a button that would
// contradict that.
export function AdminCommunitiesEmpty() {
  const { t } = useTranslation();
  return (
    <div className={styles.emptyPanel}>
      <h3 className={styles.emptyTitle}>
        <Translation
          i18nKey="admin:communities.grid.emptyTitle"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.emptyText}>
        {t("admin:communities.grid.emptyText")}
      </p>
    </div>
  );
}
