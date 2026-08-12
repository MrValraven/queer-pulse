import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./CookiesPage.module.css";

/**
 * The sticky companion column of the cookie center: a read-only summary of the
 * cookies we set — all strictly necessary or functional, so all always-on — plus
 * a button out to the in-app preference center for the one remaining opt-in
 * (error monitoring, which isn't a cookie). Rendered through LegalDoc's `aside`
 * slot, which turns the doc into a two-column layout.
 */
export function CookieConsentSummary({
  onManagePreferences,
}: {
  onManagePreferences: () => void;
}) {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.summary}>
        <h3>
          <Translation
            i18nKey="marketing:cookies.summary.title"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={styles.sumRow}>
          <span className={styles.sumName}>
            {t("marketing:cookies.summary.essential")}
          </span>
          <span className={`${styles.sumVal} ${styles.sumReq}`}>
            {t("marketing:cookies.alwaysOn")}
          </span>
        </div>
        <div className={styles.sumRow}>
          <span className={styles.sumName}>
            {t("marketing:cookies.summary.functional")}
          </span>
          <span className={`${styles.sumVal} ${styles.sumReq}`}>
            {t("marketing:cookies.alwaysOn")}
          </span>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={onManagePreferences}>
            {t("marketing:cookies.actions.managePreferences")}
          </Button>
        </div>
      </div>
      <div className={styles.info}>
        <Translation
          i18nKey="marketing:cookies.info"
          components={{
            settingsLink: <Link to={routes.settings} />,
            privacyLink: <Link to={routes.privacy} />,
          }}
        />
      </div>
    </aside>
  );
}
