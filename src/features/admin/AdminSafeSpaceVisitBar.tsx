import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * The tally this bar draws, wide enough for both readings of the same number.
 *
 * The reviewed queue (`AdminSafeSpaceNominationDTO["visits"]`) knows who
 * nominated the place, so it can also report the vouches it discounted. The
 * candidates endpoint has no nomination in hand and reports only the count, so
 * `notIndependentVouchCount` is optional here. One component either way: the
 * bar exists so the same number never grows a second visual language.
 */
export interface AdminSafeSpaceVisitTally {
  independentVisitCount: number;
  requiredVisitCount: number;
  hasMetVisitBar: boolean;
  notIndependentVouchCount?: number;
}

/**
 * The three-independent-visit bar, as the reviewer reads it.
 *
 * Two honest distinctions this has to keep. A nomination with no listing tied
 * to it shows no count at all, because "0 visits" would read as "nobody has
 * been" when the truth is "we have not said where". And vouches from people
 * with a stake in the place (the owner, an active co-manager, and the
 * nominator themselves) are reported separately, never folded into the number
 * that decides: a nominator vouching for their own nomination is one person
 * counted twice, which is the exact failure the bar exists to prevent.
 */
export function AdminSafeSpaceVisitBar({
  visits,
}: {
  visits: AdminSafeSpaceVisitTally | null;
}) {
  const { t } = useTranslation();

  if (!visits) {
    return (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("safety:governance.visits.title")}
        </h3>
        <p className={styles.visitNote}>
          {t("safety:governance.visits.unassigned")}
        </p>
      </section>
    );
  }

  const progress = Math.min(
    100,
    Math.round(
      (visits.independentVisitCount / Math.max(1, visits.requiredVisitCount)) *
        100,
    ),
  );

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("safety:governance.visits.title")}
      </h3>
      <div
        className={styles.visitBar}
        role="meter"
        aria-valuenow={visits.independentVisitCount}
        aria-valuemin={0}
        aria-valuemax={visits.requiredVisitCount}
        aria-label={t("safety:governance.visits.title")}
      >
        <span
          className={[
            styles.visitFill,
            visits.hasMetVisitBar && styles.visitFillMet,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ inlineSize: `${progress}%` }}
        />
      </div>
      <p className={styles.visitNote}>
        {visits.hasMetVisitBar
          ? t("safety:governance.visits.met", {
              count: visits.independentVisitCount,
              required: visits.requiredVisitCount,
            })
          : t("safety:governance.visits.short", {
              count: visits.independentVisitCount,
              required: visits.requiredVisitCount,
            })}
      </p>
      {(visits.notIndependentVouchCount ?? 0) > 0 && (
        <p className={styles.visitNote}>
          {t("safety:governance.visits.notIndependent", {
            count: visits.notIndependentVouchCount,
          })}
        </p>
      )}
      <p className={styles.visitNote}>
        {t("safety:governance.visits.whoNote")}
      </p>
    </section>
  );
}
