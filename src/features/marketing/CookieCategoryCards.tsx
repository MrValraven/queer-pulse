import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  entriesInCategory,
  kindLabelKey,
  type StorageCategory,
} from "../../shared/consent/storageInventory";
import styles from "./CookiesPage.module.css";

interface CategoryCard {
  category: StorageCategory;
  titleKey: string;
  bodyKey: string;
  /** Always-on categories carry the "Always on" flag; the opt-in one doesn't. */
  isRequired: boolean;
}

/**
 * The three disclosure cards, in the order a reader needs them: what we must
 * store to run the site, what we store because you asked us to, and the one
 * thing you can switch off.
 *
 * "Functional" is required too — theme, language and unsent drafts are a
 * member's own choices, and gating them behind a toggle would mean losing them
 * on every visit — so it is shown as always-on rather than as a fake switch.
 */
const CATEGORY_CARDS: CategoryCard[] = [
  {
    category: "necessary",
    titleKey: "marketing:cookies.essential.title",
    bodyKey: "marketing:cookies.essential.body",
    isRequired: true,
  },
  {
    category: "functional",
    titleKey: "marketing:cookies.functional.title",
    bodyKey: "marketing:cookies.functional.body",
    isRequired: true,
  },
  {
    category: "monitoring",
    titleKey: "marketing:cookies.monitoring.title",
    bodyKey: "marketing:cookies.monitoring.body",
    isRequired: false,
  },
];

/**
 * The left column of the cookie center: one card per category, listing every
 * cookie and every piece of device storage in that category.
 *
 * Rows come from `shared/consent/storageInventory.ts`, the same list the
 * in-app preference center discloses, so this page and that modal can never
 * publish different answers. Rendered through LegalDoc's raw `body` slot so it
 * keeps its own card styling.
 */
export function CookieCategoryCards() {
  const { t } = useTranslation();
  return (
    <div className={styles.group}>
      {CATEGORY_CARDS.map((card) => (
        <div key={card.category} className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <div className={styles.cardTitle}>{t(card.titleKey)}</div>
              <div className={styles.cardReq}>
                {t(
                  card.isRequired
                    ? "marketing:cookies.alwaysOn"
                    : "marketing:cookies.optIn",
                )}
              </div>
            </div>
          </div>
          <p className={styles.cardBody}>{t(card.bodyKey)}</p>
          <div className={styles.rowHead}>
            <span className={styles.colLabel}>
              {t("marketing:cookies.columns.name")}
            </span>
            <span className={styles.colLabel}>
              {t("marketing:cookies.columns.storedWhere")}
            </span>
            <span className={styles.colLabel}>
              {t("marketing:cookies.columns.expires")}
            </span>
          </div>
          <div className={styles.list}>
            {entriesInCategory(card.category).map((entry) => (
              <div key={entry.id} className={styles.row}>
                <span className={styles.ckName}>
                  {/* One row can cover several keys serving one purpose (all the
                      accessibility settings, say). Every name is printed. */}
                  {entry.names.join(", ")}
                </span>
                <span className={styles.ckType}>
                  {t(kindLabelKey(entry.kind))}
                </span>
                <span className={styles.ckExp}>{t(entry.lifetimeKey)}</span>
                <span className={styles.ckPurpose}>{t(entry.purposeKey)}</span>
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
