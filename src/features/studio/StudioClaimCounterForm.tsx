import { useId, useState, type FormEvent } from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioOwnerClaimView } from "./api/studioSafetyFields";
import { STUDIO_CLAIM_LIMITS } from "./api/studioSafety.types";
import { useCounterStudioClaim } from "./api/useStudioOwnerClaimMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import css from "./StudioClaimPanel.module.css";

/** The owner's one counter-notice (spec 8): a button that opens the form,
 *  the note, the good-faith statement, Send. It folds away once sent. */
export function StudioClaimCounterForm({
  claim,
  releaseId,
}: {
  claim: StudioOwnerClaimView;
  releaseId: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const counter = useCounterStudioClaim();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isGoodFaith, setIsGoodFaith] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const trimmedNote = note.trim();
  const errorKey = counter.error
    ? studioErrorMessageKeyOf(counter.error)
    : hasTried && !trimmedNote
      ? "studio:claimPanel.counterRequired"
      : hasTried && !isGoodFaith
        ? "studio:claimPanel.goodFaithRequired"
        : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (counter.isPending) return;
    setHasTried(true);
    if (!trimmedNote || !isGoodFaith) return;
    counter.mutate(
      { claim, releaseId, note: trimmedNote },
      {
        onSuccess: () => {
          setIsOpen(false);
          showToast(t("studio:claimPanel.counterSentToast"), "success");
        },
      },
    );
  }

  return (
    <Collapse isOpen={claim.canCounter}>
      <Button
        type="button"
        variant="ghost"
        aria-expanded={isOpen}
        aria-controls={formId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {t(
          isOpen
            ? "studio:claimPanel.counterCloseCta"
            : "studio:claimPanel.counterOpenCta",
        )}
      </Button>
      <div id={formId}>
        <Collapse isOpen={isOpen}>
          <form className={css.form} onSubmit={submit} noValidate>
            <FormField
              label={t("studio:claimPanel.counterLabel")}
              helper={t("studio:claimPanel.counterHint")}
              required
            >
              <textarea
                rows={5}
                value={note}
                maxLength={STUDIO_CLAIM_LIMITS.counterNoteMax}
                onChange={(event) => {
                  setNote(event.target.value);
                  if (counter.error) counter.reset();
                }}
              />
            </FormField>
            <label className={css.goodFaith}>
              <input
                type="checkbox"
                checked={isGoodFaith}
                onChange={(event) => setIsGoodFaith(event.target.checked)}
              />
              {t("studio:claimPanel.counterGoodFaith")}
            </label>
            <Collapse isOpen={errorKey !== null}>
              <p className={css.error} role="alert">
                {errorKey ? t(errorKey) : null}
              </p>
            </Collapse>
            <Button
              type="submit"
              variant="primary"
              aria-disabled={counter.isPending || undefined}
            >
              {t(
                counter.isPending
                  ? "studio:claimPanel.counterSending"
                  : "studio:claimPanel.counterCta",
              )}
            </Button>
          </form>
        </Collapse>
      </div>
    </Collapse>
  );
}
