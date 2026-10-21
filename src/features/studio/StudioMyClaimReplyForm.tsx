import { useId, useRef, useState, type FormEvent } from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioMyClaimView } from "./api/studioSafety.adapters";
import { STUDIO_CLAIM_LIMITS } from "./api/studioSafety.types";
import { useReplyToStudioClaim } from "./api/useStudioClaims";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import css from "./StudioClaimPages.module.css";

/** One reply to the artist's counter-notice (spec 8), while the claim is
 *  countered. The reply goes out once, so it goes through a review step:
 *  write, Check reply (the text as our team will read it), then Send reply
 *  or Edit reply. It folds away once sent. */
export function StudioMyClaimReplyForm({
  claim,
}: {
  claim: StudioMyClaimView;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const reviewHeadingRef = useRef<HTMLParagraphElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reply = useReplyToStudioClaim();
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [text, setText] = useState("");
  const [hasTried, setHasTried] = useState(false);
  const trimmed = text.trim();
  const errorKey = reply.error
    ? studioErrorMessageKeyOf(reply.error)
    : hasTried && !trimmed
      ? "studio:claims.mine.replyRequired"
      : null;

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasTried(true);
    if (!trimmed) return;
    setIsReviewing(true);
    requestAnimationFrame(() => reviewHeadingRef.current?.focus());
  }

  function edit() {
    setIsReviewing(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function send() {
    if (reply.isPending || !trimmed) return;
    reply.mutate(
      { claimId: claim.id, reply: trimmed },
      {
        onSuccess: () => {
          setIsOpen(false);
          setIsReviewing(false);
          showToast(t("studio:claims.mine.replySentToast"), "success");
        },
      },
    );
  }

  return (
    <Collapse isOpen={claim.canReply}>
      <div className={css.actions}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={formId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          {t(
            isOpen
              ? "studio:claims.mine.replyCloseCta"
              : "studio:claims.mine.replyCta",
          )}
        </Button>
      </div>
      <div id={formId}>
        <Collapse isOpen={isOpen && !isReviewing}>
          <form className={css.form} onSubmit={review} noValidate>
            <FormField
              label={t("studio:claims.mine.replyLabel")}
              helper={t("studio:claims.mine.replyHint")}
              error={errorKey ? t(errorKey) : undefined}
              required
            >
              <textarea
                ref={textareaRef}
                rows={4}
                value={text}
                maxLength={STUDIO_CLAIM_LIMITS.replyMax}
                onChange={(event) => {
                  setText(event.target.value);
                  if (reply.error) reply.reset();
                }}
              />
            </FormField>
            <div>
              <Button type="submit" variant="primary">
                {t("studio:claims.mine.replyCheck")}
              </Button>
            </div>
          </form>
        </Collapse>
        <Collapse isOpen={isOpen && isReviewing}>
          <div className={css.form}>
            <p ref={reviewHeadingRef} tabIndex={-1} className={css.label}>
              {t("studio:claims.mine.replyReviewHeading")}
            </p>
            <blockquote className={css.quote}>{trimmed}</blockquote>
            <p className={css.meta}>
              {t("studio:claims.mine.replyReviewNote")}
            </p>
            <Collapse isOpen={reply.error !== null}>
              <p className={css.replyError} role="alert">
                {reply.error ? t(studioErrorMessageKeyOf(reply.error)) : null}
              </p>
            </Collapse>
            <div className={css.actions}>
              <Button
                type="button"
                variant="primary"
                aria-disabled={reply.isPending || undefined}
                aria-busy={reply.isPending || undefined}
                onClick={send}
              >
                {t(
                  reply.isPending
                    ? "studio:claims.mine.replySending"
                    : "studio:claims.mine.replySend",
                )}
              </Button>
              <Button
                type="button"
                variant="quiet"
                aria-disabled={reply.isPending || undefined}
                onClick={() => {
                  if (!reply.isPending) edit();
                }}
              >
                {t("studio:claims.mine.replyEdit")}
              </Button>
            </div>
          </div>
        </Collapse>
      </div>
    </Collapse>
  );
}
