import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATEGORIES } from "./microGrants.data";
import styles from "./MicroGrantsPage.module.css";

/* Step 1 — category */
export function CategoryStep({
  cat,
  setCat,
}: {
  cat: number | null;
  setCat: (i: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="resources:microGrants.apply.category.stepTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>
        {t("resources:microGrants.apply.category.stepSub")}
      </p>
      <div className={styles.cats}>
        {CATEGORIES.map((c, i) => (
          <button
            key={c.nameKey}
            type="button"
            className={[styles.cat, cat === i && styles.catSelected]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setCat(i)}
          >
            <div className={styles.catIcon}>
              <c.icon />
            </div>
            <span className={styles.catName}>{t(c.nameKey)}</span>
            <span className={styles.catSub}>{t(c.subKey)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
