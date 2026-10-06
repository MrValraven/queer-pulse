import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { meetsLevel } from "../economy/api/verification.api";
import { formatEuros } from "../forum/funding/fundingFormat";
import { AdminChip } from "./ui";
import type { AdminForumReviewThread } from "./api/adminForumReview.api";
import styles from "./AdminFundingFacts.module.css";

/** The fundraiser checks on a held row: where the money goes, how far the
 *  poster is verified, and how old their account is. */
export function AdminFundingFacts({
  thread,
}: {
  thread: AdminForumReviewThread;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const review = thread.fundingReview ?? null;
  if (!review) return null;
  const funding = thread.funding ?? null;
  const isBelowPhone = !meetsLevel(review.posterVerificationLevel, "phone");
  return (
    <div className={styles.facts}>
      <AdminChip tone="violet">
        {t("admin:adminForumReview.funding.chip")}
      </AdminChip>
      <dl
        className={styles.list}
        aria-label={t("admin:adminForumReview.funding.aria")}
      >
        {funding && funding.goalAmount !== null && (
          <div className={styles.item}>
            <dt>{t("admin:adminForumReview.funding.goal")}</dt>
            <dd>{formatEuros(fmt, funding.goalAmount)}</dd>
          </div>
        )}
        <div className={styles.item}>
          <dt>{t("admin:adminForumReview.funding.link")}</dt>
          <dd>
            {funding ? (
              <a
                href={funding.linkUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={styles.link}
              >
                {review.linkHost}
              </a>
            ) : (
              review.linkHost
            )}
          </dd>
        </div>
        <div className={styles.item}>
          <dt>{t("admin:adminForumReview.funding.verification")}</dt>
          <dd>
            <AdminChip tone={isBelowPhone ? "amber" : "violet"}>
              {t(`admin:verifications.level.${review.posterVerificationLevel}`)}
            </AdminChip>
          </dd>
        </div>
        <div className={styles.item}>
          <dt>{t("admin:adminForumReview.funding.accountAge")}</dt>
          <dd>
            {t("admin:adminForumReview.funding.accountAgeDays", {
              count: review.posterAccountAgeDays,
            })}
          </dd>
        </div>
      </dl>
    </div>
  );
}
