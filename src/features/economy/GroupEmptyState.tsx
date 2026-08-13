import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./HousingGroupsPage.module.css";

/**
 * Honest empty state for the groups grid: production starts with zero vetted
 * groups, and that's a real state worth naming warmly. Plum-panel pattern.
 */
export function GroupEmptyState() {
  const { t } = useTranslation();
  return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>
        {t("economy:housingGroups.empty.title")}{" "}
        <em>{t("economy:housingGroups.empty.titleEm")}</em>
      </div>
      <p className={styles.emptyBody}>{t("economy:housingGroups.empty.body")}</p>
    </div>
  );
}
