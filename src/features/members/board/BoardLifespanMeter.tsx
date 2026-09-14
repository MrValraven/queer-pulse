import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { BoardLifespan as Lifespan } from "./boardLifespan";
import styles from "./BoardSection.module.css";

/**
 * The left column's countdown: days remaining against the post's full window,
 * over a bar filled to the proportion left.
 *
 * The bar is decorative. Everything it conveys is already in the text beside
 * it, so it carries no meter role and no aria value.
 */
export function BoardLifespanMeter({ lifespan }: { lifespan: Lifespan }) {
  const { t } = useTranslation();

  if (lifespan.isExpired) {
    return (
      <div className={styles.lifespan}>
        <div className={styles.lifespanHead}>
          <span className={styles.lifespanTotal}>
            {t("members:content.board.expiredQuietly")}
          </span>
        </div>
        <div className={styles.lifespanBar} aria-hidden />
      </div>
    );
  }

  return (
    <div className={styles.lifespan}>
      <div className={styles.lifespanHead}>
        <span
          className={`${styles.lifespanDays} ${
            lifespan.isExpiringSoon ? styles.lifespanDaysWarn : ""
          }`}
        >
          {t("members:content.board.daysLeft", { count: lifespan.daysLeft })}
        </span>
        <span className={styles.lifespanTotal}>
          {t("members:content.board.ofWindow", { count: lifespan.windowDays })}
        </span>
      </div>
      <div className={styles.lifespanBar} aria-hidden>
        <div
          className={`${styles.lifespanFill} ${
            lifespan.isExpiringSoon ? styles.lifespanFillWarn : ""
          }`}
          style={{ width: `${Math.round(lifespan.fractionLeft * 100)}%` }}
        />
      </div>
    </div>
  );
}
