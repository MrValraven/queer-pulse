import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileShowcase.module.css";

/**
 * The switch list's header row: a generic "More sides" label for a visitor,
 * or (self view) a live persona count plus an "Add another side" link to
 * the dashboard. Extracted from `SubprofileSwitchList` to keep it under the
 * 200-line cap.
 */
export function SubprofileSwitchHeader({
  count,
  isSelf,
}: {
  count: number;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.switchHeadRow}>
      <p className={styles.switchHead}>
        {isSelf
          ? t("subprofiles:alsoAs.count", { count })
          : t("subprofiles:alsoAs.switchLabel")}
      </p>
      {isSelf && (
        <Button
          variant="ghost"
          size="md"
          to={routes.subprofilesDashboard}
          className={styles.addAnother}
        >
          {t("subprofiles:alsoAs.addAnother")}
        </Button>
      )}
    </div>
  );
}
