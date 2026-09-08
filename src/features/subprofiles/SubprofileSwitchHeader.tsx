import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileShowcase.module.css";

/**
 * The switch list's header row: a generic "More personas" label for a visitor,
 * or (self view) a live persona count plus an "Add another persona" link to
 * the dashboard. Extracted from `SubprofileSwitchList` to keep it under the
 * 200-line cap.
 */
export function SubprofileSwitchHeader({
  count,
  isSelf,
  canAddPersona = true,
}: {
  count: number;
  isSelf: boolean;
  /** Self view only: whether the "Add another persona" link belongs here at
   *  all. `false` while the owner is editing their own profile — the editor
   *  is a form about *this* profile with unsaved changes in it, so a link
   *  off to the personas dashboard has no place in it (see
   *  `ProfileBelowHeroGroup`). Defaults to `true` for every read view. */
  canAddPersona?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.switchHeadRow}>
      <p className={styles.switchHead}>
        {isSelf
          ? t("subprofiles:alsoAs.count", { count })
          : t("subprofiles:alsoAs.switchLabel")}
      </p>
      {isSelf && canAddPersona && (
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
