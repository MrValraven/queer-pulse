import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { entriesInCategory } from "../../shared/consent/storageInventory";
import styles from "./CookiesPage.module.css";

/** Counted from the inventory so the summary can't drift from the cards. */
const SUMMARY_ROWS = [
  {
    category: "necessary",
    labelKey: "marketing:cookies.summary.essential",
    stateKey: "marketing:cookies.alwaysOn",
  },
  {
    category: "functional",
    labelKey: "marketing:cookies.summary.functional",
    stateKey: "marketing:cookies.alwaysOn",
  },
  {
    category: "monitoring",
    labelKey: "marketing:cookies.summary.monitoring",
    stateKey: "marketing:cookies.optIn",
  },
] as const;

/**
 * The sticky companion column of the cookie center: a read-only tally of what
 * each category holds, counted from `STORAGE_INVENTORY` rather than written by
 * hand, plus a button out to the in-app preference center where the one opt-in
 * (error monitoring) is actually switched. Rendered through LegalDoc's `aside`
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
        {SUMMARY_ROWS.map((row) => {
          const count = entriesInCategory(row.category).length;
          return (
            <div key={row.category} className={styles.sumRow}>
              <span className={styles.sumName}>
                {t(row.labelKey)}
                <span className={styles.sumCount}>
                  {t("marketing:cookies.summary.count", { count })}
                </span>
              </span>
              <span
                className={`${styles.sumVal} ${
                  row.category === "monitoring" ? styles.sumOff : styles.sumReq
                }`}
              >
                {t(row.stateKey)}
              </span>
            </div>
          );
        })}
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
