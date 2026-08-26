import { FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GuideReviewFooter.module.css";

export interface GuideReviewFooterProps {
  /** ISO date (YYYY-MM-DD) an editor last read the guide end to end. */
  lastReviewedOn: string | null;
  /** The person or team who took responsibility for that review. */
  reviewedBy: string | null;
  /** When it is due to be read again. */
  reviewDueOn: string | null;
}

/**
 * The freshness line every guide carries (CON-09).
 *
 * Not one of the ~31 guides used to say when it was last checked or who
 * checked it, and these are the highest-stakes pages on the platform: trans
 * healthcare pathways, harm reduction, crisis lines, legal aid. A reader
 * deciding whether to trust a hormone-access pathway needs to know whether
 * anyone looked at it this year.
 *
 * A never-reviewed guide says so plainly. Inventing a date here would be
 * worse than the silence it replaces, so the "never reviewed" state is a real
 * state with its own copy, matching how the library card already treats an
 * unverified guide.
 */
export function GuideReviewFooter({
  lastReviewedOn,
  reviewedBy,
  reviewDueOn,
}: GuideReviewFooterProps) {
  const { t } = useTranslation();
  const isOverdue =
    reviewDueOn !== null && reviewDueOn < new Date().toISOString().slice(0, 10);

  return (
    <section
      className={styles.footer}
      aria-label={t("resources:guide.review.ariaLabel")}
    >
      <div className="wrap">
        <div className={styles.row}>
          {lastReviewedOn ? (
            <span className={styles.reviewed}>
              <FiCheckCircle aria-hidden />
              {reviewedBy
                ? t("resources:guide.review.reviewedOnBy", {
                    date: formatDate(lastReviewedOn),
                    reviewer: reviewedBy,
                  })
                : t("resources:guide.review.reviewedOn", {
                    date: formatDate(lastReviewedOn),
                  })}
            </span>
          ) : (
            <span className={styles.never}>
              <FiClock aria-hidden />
              {t("resources:guide.review.never")}
            </span>
          )}

          {reviewDueOn && (
            <span className={isOverdue ? styles.overdue : styles.due}>
              {isOverdue && <FiAlertCircle aria-hidden />}
              {isOverdue
                ? t("resources:guide.review.overdue", {
                    date: formatDate(reviewDueOn),
                  })
                : t("resources:guide.review.due", {
                    date: formatDate(reviewDueOn),
                  })}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
