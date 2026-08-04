import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./CookiesPage.module.css";

/**
 * The sticky companion column of the cookie consent center: a live summary of
 * the current choice plus the Save / Accept-all / Essential-only actions and a
 * link out to the in-app preference center. Rendered through LegalDoc's `aside`
 * slot, which turns the doc into a two-column layout.
 */
export function CookieConsentSummary({
  analytics,
  onSave,
  onAcceptAll,
  onEssentialOnly,
}: {
  analytics: boolean;
  onSave: () => void;
  onAcceptAll: () => void;
  onEssentialOnly: () => void;
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
        <div className={styles.sumRow}>
          <span className={styles.sumName}>
            {t("marketing:cookies.summary.analytics")}
          </span>
          <span
            className={`${styles.sumVal} ${analytics ? styles.sumOn : styles.sumOff}`}
          >
            {analytics
              ? t("marketing:cookies.summary.on")
              : t("marketing:cookies.summary.off")}
          </span>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={onSave}>
            {t("marketing:cookies.actions.save")}
          </Button>
          <Button variant="ghost" onClick={onAcceptAll}>
            {t("marketing:cookies.actions.acceptAll")}
          </Button>
          <Button variant="ghost" onClick={onEssentialOnly}>
            {t("marketing:cookies.actions.essentialOnly")}
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
