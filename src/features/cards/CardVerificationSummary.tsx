import { FiCheckCircle } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardVerifications } from "./api/useCardVerifications";
import styles from "./CardVerificationSummary.module.css";

/**
 * How often this community's cards have actually been checked, for the owner
 * and mod panel. Two numbers and a date, which is the whole of what the
 * platform records and the whole of what it will ever show here.
 *
 * Deliberately quiet: it is an operational fact an issuer needs when a partner
 * asks whether the card is used, and it is never a chart, a trend, or a way to
 * look up a person. The note under it says so in the product rather than only
 * in a comment, because an owner reading this panel deserves to know what is
 * and is not being kept.
 */
export function CardVerificationSummary({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { counts, isLoading } = useCardVerifications(slug, true);

  if (isLoading) {
    return (
      <section aria-label={t("cards:verifications.title")}>
        <SkeletonLine height={64} style={{ borderRadius: 16 }} />
      </section>
    );
  }

  if (!counts) return null;

  const hasAnyVerification = counts.total > 0;

  return (
    <section
      aria-label={t("cards:verifications.title")}
      className={styles.panel}
    >
      <p className={styles.heading}>
        <FiCheckCircle aria-hidden /> {t("cards:verifications.title")}
      </p>
      {hasAnyVerification ? (
        <>
          <p className={styles.figures}>
            <span className={styles.total}>
              {t("cards:verifications.total", { count: counts.total })}
            </span>
            <span className={styles.recent}>
              {t("cards:verifications.recent", {
                count: counts.recent,
                days: counts.recentDays,
              })}
            </span>
          </p>
          {counts.lastVerifiedAt ? (
            <p className={styles.last}>
              {t("cards:verifications.last", {
                date: formatDate(counts.lastVerifiedAt),
              })}
            </p>
          ) : null}
        </>
      ) : (
        <p className={styles.empty}>{t("cards:verifications.empty")}</p>
      )}
      <p className={styles.note}>{t("cards:verifications.note")}</p>
    </section>
  );
}
