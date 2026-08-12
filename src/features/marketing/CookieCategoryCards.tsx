import { useTranslation } from "../../shared/i18n/useTranslation";
import { COOKIE_CATEGORIES } from "./cookies.data";
import styles from "./CookiesPage.module.css";

/**
 * The left column of the cookie center: one card per category with its cookie
 * table, plus the "no ads" reassurance panel. Every cookie we set is strictly
 * necessary or functional — all always-on — so the cards are informational, with
 * no toggles to save. Rendered through LegalDoc's raw `body` slot so it keeps its
 * own card styling.
 */
export function CookieCategoryCards() {
  const { t } = useTranslation();
  return (
    <div className={styles.group}>
      {COOKIE_CATEGORIES.map((category) => (
        <div key={category.id} className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <div className={styles.cardTitle}>{t(category.titleKey)}</div>
              {category.required && (
                <div className={styles.cardReq}>
                  {t("marketing:cookies.alwaysOn")}
                </div>
              )}
            </div>
          </div>
          <p className={styles.cardBody}>{t(category.bodyKey)}</p>
          <div className={styles.rowHead}>
            <span className={styles.colLabel}>
              {t("marketing:cookies.columns.name")}
            </span>
            <span className={styles.colLabel}>
              {t("marketing:cookies.columns.expires")}
            </span>
            <span className={styles.colLabel}>
              {t("marketing:cookies.columns.provider")}
            </span>
          </div>
          <div className={styles.list}>
            {category.cookies.map((cookie) => (
              <div key={cookie.name} className={styles.row}>
                <span className={styles.ckName}>{cookie.name}</span>
                <span className={styles.ckExp}>{t(cookie.expiresKey)}</span>
                <span className={styles.ckType}>{cookie.provider}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.noAds}>
        <div className={styles.noAdsTitle}>
          {t("marketing:cookies.noAds.title")}
        </div>
        <p>{t("marketing:cookies.noAds.body")}</p>
      </div>
    </div>
  );
}
