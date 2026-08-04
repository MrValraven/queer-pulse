import { useTranslation } from "../../shared/i18n/useTranslation";
import { COOKIE_CATEGORIES } from "./cookies.data";
import styles from "./CookiesPage.module.css";

interface CategoryToggle {
  value: boolean;
  set: (value: boolean) => void;
}

/**
 * The interactive left column of the cookie consent center: one card per
 * category (essential/functional always-on, analytics toggleable) with its
 * cookie table, plus the "no ads" reassurance panel. Rendered through
 * LegalDoc's raw `body` slot so it keeps its own card styling.
 */
export function CookieCategoryCards({
  toggleFor,
}: {
  toggleFor: Record<string, CategoryToggle>;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.group}>
      {COOKIE_CATEGORIES.map((category) => {
        const toggle = toggleFor[category.id];
        return (
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
              <label className={styles.toggle}>
                {/* The switch's only visible name sits in .cardTitle, which is
                    not associated with the control — so the label carries it
                    for assistive tech. */}
                <span className="visuallyHidden">{t(category.titleKey)}</span>
                <input
                  type="checkbox"
                  checked={
                    category.required ? true : (toggle?.value ?? false)
                  }
                  disabled={category.required}
                  onChange={(event) => toggle?.set(event.target.checked)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleThumb} />
              </label>
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
        );
      })}

      <div className={styles.noAds}>
        <div className={styles.noAdsTitle}>
          {t("marketing:cookies.noAds.title")}
        </div>
        <p>{t("marketing:cookies.noAds.body")}</p>
      </div>
    </div>
  );
}
