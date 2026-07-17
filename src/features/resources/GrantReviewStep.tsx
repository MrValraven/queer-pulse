import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATEGORIES } from "./microGrants.data";
import styles from "./MicroGrantsPage.module.css";

/* Step 5 — review */
export function ReviewStep({
  cat,
  projName,
  projWhat,
  appName,
  total,
  budgetItems,
}: {
  cat: number | null;
  projName: string;
  projWhat: string;
  appName: string;
  total: number;
  budgetItems: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="resources:microGrants.apply.review.stepTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>
        {t("resources:microGrants.apply.review.stepSub")}
      </p>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>
          {t("resources:microGrants.apply.review.categoryLabel")}
        </div>
        <div className={styles.reviewVal}>
          {cat !== null ? (
            <>
              {(() => {
                const Icon = CATEGORIES[cat]!.icon;
                return <Icon />;
              })()}{" "}
              <strong>{t(CATEGORIES[cat]!.nameKey)}</strong>
            </>
          ) : (
            "—"
          )}
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>
          {t("resources:microGrants.apply.review.projectLabel")}
        </div>
        <div className={styles.reviewVal}>{projName || "—"}</div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>
          {t("resources:microGrants.apply.review.whatLabel")}
        </div>
        <div className={styles.reviewVal}>
          {projWhat
            ? projWhat.substring(0, 200) + (projWhat.length > 200 ? "…" : "")
            : "—"}
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>
          {t("resources:microGrants.apply.review.budgetLabel")}
        </div>
        <div className={styles.reviewVal}>
          <strong>€{total.toFixed(0)}</strong> — {budgetItems}
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>
          {t("resources:microGrants.apply.review.applicantLabel")}
        </div>
        <div className={styles.reviewVal}>{appName || "—"}</div>
      </div>
      <div className={`${styles.reviewBlock} ${styles.reviewDeadline}`}>
        <div className={`${styles.reviewLabel} ${styles.reviewDeadlineLabel}`}>
          {t("resources:microGrants.apply.review.deadlineLabel")}
        </div>
        <div className={styles.reviewVal}>
          <Translation
            i18nKey="resources:microGrants.apply.review.deadlineValue"
            components={{ strong: <strong /> }}
          />
        </div>
      </div>
    </>
  );
}
