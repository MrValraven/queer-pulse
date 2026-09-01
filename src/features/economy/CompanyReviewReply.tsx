import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CompanyReviewView } from "./api/companyReviewView";
import { useCompanyReviewReply } from "./api/useCompanyReviewReply";
import styles from "./CompanyPage.module.css";

interface Props {
  review: CompanyReviewView;
  companySlug: string;
  /**
   * True only when the viewer OWNS this company, which the server decides
   * (`CompanyDetailDTO.isOwner`) and which is false for an unclaimed profile
   * because nobody owns it. False hides every compose control: readers, other
   * members and demo mode all get a read-only reply.
   */
  isOwner: boolean;
}

/**
 * One review's employer-reply block: the published reply every reader sees,
 * plus a Reply / Edit reply affordance for the employer alone (PRD-47).
 *
 * THE LABEL IS THE POINT. The reply is rendered inside its own block, headed
 * with the company's own name, so a reader can never mistake the subject's
 * answer for another reviewer's. It is styled as the house plum block the
 * directory already uses for the same statement, so the pattern reads the same
 * across the two verticals.
 */
export function CompanyReviewReply({ review, companySlug, isOwner }: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const reply = useCompanyReviewReply(companySlug);
  const [isComposing, setIsComposing] = useState(false);
  const [text, setText] = useState(review.ownerReply?.text ?? "");

  // A review with no id is a demo fixture: there is nothing to address the
  // endpoint with, so the compose affordance cannot render even for an owner.
  const canCompose = isOwner && Boolean(review.id);
  const canSave = text.trim().length > 0 && !reply.isPending;

  const openComposer = () => {
    setText(review.ownerReply?.text ?? "");
    setIsComposing(true);
  };

  const handleSave = () => {
    if (!canSave || !review.id) return;
    reply.mutate(
      { reviewId: review.id, text: text.trim() },
      {
        onSuccess: () => {
          setIsComposing(false);
          showToast(t("economy:company.reviews.reply.successToast"), "success");
        },
        onError: () =>
          showToast(t("economy:company.reviews.reply.errorToast"), "error"),
      },
    );
  };

  return (
    <>
      {review.ownerReply && !isComposing && (
        <div className={styles.employerReply}>
          <div className={styles.employerReplyHead}>
            <span className={styles.employerReplyTitle}>
              {t("economy:company.reviews.reply.employerResponseTitle")}
            </span>
            <span className={styles.employerReplyDate}>
              {fmt.date(new Date(review.ownerReply.at), {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className={styles.employerReplyText}>
            {review.ownerReply.text}
          </div>
          {/* Server-precomputed (`isEditedAfterOwnerReply`), never re-derived
              here from timestamps: the reviewer changed their words after this
              reply went up, so the reply may be answering text that is no
              longer on the page. Said plainly, next to the reply, so a reader
              can weigh it without blaming either side. */}
          {review.isEditedAfterOwnerReply && (
            <p className={styles.employerReplyStale}>
              <FiAlertCircle aria-hidden />
              {t("economy:company.reviews.reply.editedAfterReply")}
            </p>
          )}
        </div>
      )}

      {canCompose && !isComposing && (
        <Button
          variant="ghost"
          className={styles.replyToggle}
          onClick={openComposer}
        >
          {review.ownerReply
            ? t("economy:company.reviews.reply.editReplyCta")
            : t("economy:company.reviews.reply.replyCta")}
        </Button>
      )}

      {canCompose && isComposing && (
        <div className={styles.replyComposer}>
          <textarea
            className={styles.replyInput}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("economy:company.reviews.reply.placeholder")}
            rows={3}
            maxLength={2000}
            aria-label={t(
              "economy:company.reviews.reply.employerResponseTitle",
            )}
          />
          <div className={styles.replyComposerActions}>
            <Button variant="ghost" onClick={() => setIsComposing(false)}>
              {t("economy:company.reviews.reply.cancel")}
            </Button>
            <Button variant="primary" disabled={!canSave} onClick={handleSave}>
              {reply.isPending
                ? t("economy:company.reviews.reply.savingLabel")
                : t("economy:company.reviews.reply.save")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
