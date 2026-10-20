import { FiCloudOff } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioClaimPanel.module.css";

/** A listener's withheld track page: the 410 names nothing, so neither does
 *  this view (no title, no reason, no claim). Since it cannot name the
 *  release either, the way back is Studio home, first among the actions. */
export function StudioTrackWithheldView() {
  const { t } = useTranslation();
  return (
    <div className={css.withheldView}>
      <span className={css.withheldIcon}>
        <FiCloudOff aria-hidden />
      </span>
      <h1>{t("studio:track.withheld.title")}</h1>
      <p>{t("studio:track.withheld.body")}</p>
      <div className={css.withheldActions}>
        <Button to={routes.studio}>{t("studio:withdrawnLive.homeCta")}</Button>
        <Button variant="ghost" to={routes.studioRights}>
          {t("studio:withdrawnLive.rightsCta")}
        </Button>
      </div>
    </div>
  );
}
