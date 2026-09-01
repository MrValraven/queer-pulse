import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import type { Company } from "./employerReviews.data";
import styles from "./EmployerReviewsPage.module.css";

export function EmployerReviewCard({
  company: c,
  onWriteReview,
}: {
  company: Company;
  onWriteReview?: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.companyCard}>
      <div className={styles.coTop}>
        <div
          className={styles.coAv}
          style={{ background: c.avBg, color: c.avColor }}
        >
          {c.avatar}
        </div>
        <div style={{ flex: 1, paddingLeft: 14 }}>
          <div className={styles.coName}>{c.name}</div>
          <div className={styles.coIndustry}>{c.industry}</div>
        </div>
        <div className={styles.coScore}>
          <div
            className={styles.coNum}
            style={c.scoreColor ? { color: c.scoreColor } : undefined}
          >
            {c.score}
          </div>
          <div className={styles.coLabel}>/ 10</div>
          <div className={styles.coConfidence}>
            {t("economy:employerReviewCard.basedOn", { count: c.reviewCount })}
          </div>
        </div>
      </div>
      <div className={styles.coSafety}>
        <SafetyBadges
          signals={safetyFor(c.name)}
          affiliation={c.queerRun ? "run" : "friendly"}
        />
      </div>
      <div className={styles.coBars}>
        {c.bars.map((b) => (
          <div className={styles.barRow} key={b.label}>
            <span className={styles.barLabel}>{b.label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${b.percent}%`,
                  background: b.accent ? "var(--accent)" : undefined,
                }}
              />
            </div>
            <span>{b.score}</span>
          </div>
        ))}
      </div>

      {expanded ? (
        <div className={styles.coReviews}>
          {c.reviews.map((review) => (
            <div className={styles.coReview} key={review.text}>
              <div className={styles.coReviewText}>{review.text}</div>
              <div className={styles.coReviewMeta}>
                {review.meta.map((metaItem) => (
                  <span key={metaItem}>{metaItem}</span>
                ))}
              </div>
              {/* The employer answering (PRD-47). Headed with its own label and
                  set on its own ground, so a reader can never take the
                  subject's answer for another reviewer's. */}
              {review.employerReply && (
                <div className={styles.employerReply}>
                  <div className={styles.employerReplyHead}>
                    <span className={styles.employerReplyTitle}>
                      {t("economy:employerReviewCard.reply.title")}
                    </span>
                    <span className={styles.employerReplyDate}>
                      {fmt.date(new Date(review.employerReply.at), {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className={styles.employerReplyText}>
                    {review.employerReply.text}
                  </div>
                  {review.isEditedAfterEmployerReply && (
                    <p className={styles.employerReplyStale}>
                      <FiAlertCircle aria-hidden />
                      {t("economy:employerReviewCard.reply.editedAfterReply")}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.coQuote}>{c.quote}</div>
      )}

      <div className={styles.coMeta}>
        {c.meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className={styles.coFoot}>
        <Button
          type="button"
          variant="ghost"
          className={styles.coBtn}
          onClick={() => setExpanded((wasExpanded) => !wasExpanded)}
          aria-expanded={expanded}
        >
          {expanded
            ? t("economy:employerReviewCard.showLess")
            : t("economy:employerReviewCard.readAll", {
                count: c.reviews.length,
              })}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={styles.coBtn}
          onClick={onWriteReview}
        >
          {t("economy:company.reviews.writeReview")}
        </Button>
      </div>
    </div>
  );
}
