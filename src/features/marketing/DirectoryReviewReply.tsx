import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Review } from "./directoryPlaces";
import { useReplyToReview } from "./api/useReplyToReview";
import s from "./DirectorySpacePage.module.css";

interface Props {
  review: Review;
  /** The viewer's own listing ref, present only when they own this listing
   * (`DirectorySpacePage` resolves it from `useAllMyListings`). Undefined
   * hides every compose control — non-owners, logged-out visitors, and the
   * moderation preview (which never passes a ref) all get read-only replies. */
  ownerRef?: string;
  slug: string;
}

/**
 * One review's owner-reply block: the existing public reply (if any, read by
 * every visitor) plus — only when `ownerRef` is set — a Reply/Edit reply
 * affordance that opens an inline composer targeting `useReplyToReview`.
 */
export function DirectoryReviewReply({ review, ownerRef, slug }: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  // `ownerRef` is only undefined when no compose control can render, so the
  // fallback empty string here is never actually sent to the endpoint.
  const reply = useReplyToReview(ownerRef ?? "", slug);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState(review.ownerReply?.text ?? "");

  const canSave = text.trim().length > 0 && !reply.isPending;

  const openComposer = () => {
    setText(review.ownerReply?.text ?? "");
    setComposing(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    reply.mutate(
      { reviewId: review.id, text: text.trim() },
      {
        onSuccess: () => {
          setComposing(false);
          showToast(
            t("marketing:directory.detail.reply.successToast"),
            "success",
          );
        },
        onError: () =>
          showToast(t("marketing:directory.detail.reply.errorToast"), "error"),
      },
    );
  };

  return (
    <>
      {review.ownerReply && !composing && (
        <div className={s.ownerReply}>
          <div className={s.ownerReplyHead}>
            <span className={s.ownerReplyTitle}>
              {t("marketing:directory.detail.reply.ownerResponseTitle")}
            </span>
            <span className={s.ownerReplyDate}>
              {fmt.date(new Date(review.ownerReply.at), {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className={s.ownerReplyText}>{review.ownerReply.text}</div>
          {/* Server-precomputed (`isEditedAfterOwnerReply`), never re-derived
              here from timestamps: the reviewer changed their words after this
              reply went up, so the reply may be answering text that is no
              longer on the page. Said plainly, next to the reply, so a reader
              can weigh it without blaming either side. */}
          {review.isEditedAfterOwnerReply && (
            <p className={s.ownerReplyStale}>
              <FiAlertCircle aria-hidden />
              {t("marketing:directory.detail.reply.editedAfterReply")}
            </p>
          )}
        </div>
      )}

      {ownerRef && !composing && (
        <Button
          variant="ghost"
          className={s.replyToggle}
          onClick={openComposer}
        >
          {review.ownerReply
            ? t("marketing:directory.detail.reply.editReplyCta")
            : t("marketing:directory.detail.reply.replyCta")}
        </Button>
      )}

      {ownerRef && composing && (
        <div className={s.replyComposer}>
          <textarea
            className={s.replyInput}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("marketing:directory.detail.reply.placeholder")}
            rows={3}
            maxLength={2000}
            aria-label={t(
              "marketing:directory.detail.reply.ownerResponseTitle",
            )}
          />
          <div className={s.replyComposerActions}>
            <Button variant="ghost" onClick={() => setComposing(false)}>
              {t("marketing:directory.detail.reply.cancel")}
            </Button>
            <Button variant="primary" disabled={!canSave} onClick={handleSave}>
              {reply.isPending
                ? t("marketing:directory.detail.reply.savingLabel")
                : t("marketing:directory.detail.reply.save")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
