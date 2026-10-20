import { useId, useState, type FormEvent } from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioMyClaimView } from "./api/studioSafety.adapters";
import { STUDIO_CLAIM_LIMITS } from "./api/studioSafety.types";
import { useReplyToStudioClaim } from "./api/useStudioClaims";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import css from "./StudioClaimPages.module.css";

/** One reply to the artist's counter-notice (spec 8), while the claim is
 *  countered. It folds away once sent. */
export function StudioMyClaimReplyForm({
  claim,
}: {
  claim: StudioMyClaimView;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const reply = useReplyToStudioClaim();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [hasTried, setHasTried] = useState(false);
  const trimmed = text.trim();
  const errorKey = reply.error
    ? studioErrorMessageKeyOf(reply.error)
    : hasTried && !trimmed
      ? "studio:claims.mine.replyRequired"
      : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reply.isPending) return;
    setHasTried(true);
    if (!trimmed) return;
    reply.mutate(
      { claimId: claim.id, reply: trimmed },
      {
        onSuccess: () => {
          setIsOpen(false);
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
        <Collapse isOpen={isOpen}>
          <form className={css.form} onSubmit={submit} noValidate>
            <FormField
              label={t("studio:claims.mine.replyLabel")}
              helper={t("studio:claims.mine.replyHint")}
              error={errorKey ? t(errorKey) : undefined}
              required
            >
              <textarea
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
              <Button
                type="submit"
                variant="primary"
                aria-disabled={reply.isPending || undefined}
              >
                {t(
                  reply.isPending
                    ? "studio:claims.mine.replySending"
                    : "studio:claims.mine.replySend",
                )}
              </Button>
            </div>
          </form>
        </Collapse>
      </div>
    </Collapse>
  );
}
