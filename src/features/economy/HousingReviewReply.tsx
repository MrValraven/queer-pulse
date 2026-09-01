import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingReviewDTO } from "./api/housingReviews.api";
import { useReplyToHousingReview } from "./api/useHousingReviews";
import styles from "./HousingReviewList.module.css";

/** Matches the backend's `ReplyToHousingReviewDto` bound, so the field stops
 * where the endpoint stops rather than failing validation after a member has
 * typed past it. */
const MAX_REPLY_LENGTH = 2000;

/**
 * One review's lister-reply block: the published reply every reader sees, plus
 * a compose or edit affordance for the lister alone (PRD-47).
 *
 * THE LABEL IS THE POINT. The reply sits in its own block headed "Reply from
 * the lister", so no reader mistakes the subject's answer for a second reviewer
 * agreeing with the first. Without that heading a defence reads as
 * corroboration, which is the failure this whole block exists to avoid.
 *
 * WHO SEES THE COMPOSE BOX. `isViewerTheLister` comes from the server, which
 * also enforces it: the endpoint refuses anybody but the review's subject,
 * refuses the private lister-to-guest review outright, and refuses any reply at
 * all until the review has revealed, because replying proves the lister has
 * read it and housing reviews are blind until both sides have written or the
 * window has passed. Nothing here re-implements any of that.
 */
export function HousingReviewReply({
  review,
  listingSlug,
  isViewerTheLister,
}: {
  review: HousingReviewDTO;
  listingSlug: string;
  isViewerTheLister: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const replyMutation = useReplyToHousingReview(listingSlug);
  const [isComposing, setIsComposing] = useState(false);
  const [text, setText] = useState(review.listerReply?.text ?? "");

  const existingReply = review.listerReply ?? null;
  const canSave = text.trim().length > 0 && !replyMutation.isPending;

  const openComposer = () => {
    setText(existingReply?.text ?? "");
    setIsComposing(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    replyMutation.mutate(
      { reviewId: review.id, text: text.trim() },
      {
        onSuccess: () => {
          setIsComposing(false);
          showToast(t("economy:housingReview.reply.successToast"), "success");
        },
        // The composer stays open and still holds what was typed, so a failed
        // save never costs the lister their words.
        onError: () =>
          showToast(t("economy:housingReview.reply.errorToast"), "error"),
      },
    );
  };

  return (
    <>
      {existingReply && !isComposing && (
        <div className={styles.listerReply}>
          <div className={styles.listerReplyHead}>
            <span className={styles.listerReplyTitle}>
              {t("economy:housingReview.reply.listerResponseTitle")}
            </span>
            <span className={styles.listerReplyDate}>
              {format.date(new Date(existingReply.at), {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className={styles.listerReplyText}>{existingReply.text}</p>
        </div>
      )}

      {isViewerTheLister && !isComposing && (
        <Button
          variant="ghost"
          className={styles.replyToggle}
          onClick={openComposer}
        >
          {existingReply
            ? t("economy:housingReview.reply.editCta")
            : t("economy:housingReview.reply.cta")}
        </Button>
      )}

      {isViewerTheLister && isComposing && (
        <div className={styles.replyComposer}>
          <textarea
            className={styles.replyInput}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("economy:housingReview.reply.placeholder")}
            rows={3}
            maxLength={MAX_REPLY_LENGTH}
            aria-label={t("economy:housingReview.reply.listerResponseTitle")}
          />
          <p className={styles.replyNote}>
            {t("economy:housingReview.reply.publicNote")}
          </p>
          <div className={styles.replyComposerActions}>
            <Button variant="ghost" onClick={() => setIsComposing(false)}>
              {t("economy:housingReview.reply.cancel")}
            </Button>
            <Button variant="primary" disabled={!canSave} onClick={handleSave}>
              {replyMutation.isPending
                ? t("economy:housingReview.reply.savingLabel")
                : t("economy:housingReview.reply.save")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
