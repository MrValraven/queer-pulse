import { useId, useState, type FormEvent } from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import {
  STUDIO_DISPUTE_LIMITS,
  type StudioErrorCode,
} from "./api/studio.types";
import { useFileStudioDispute } from "./api/useStudioDisputeMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import css from "./StudioReleaseDispute.module.css";

/** Refusals about the release's state (a dispute already waiting, the cap):
 *  the re-read folds this form away, so the message goes out as a toast. */
const STATE_REFUSAL_CODES: ReadonlySet<StudioErrorCode> = new Set([
  "studio_dispute_already_open",
  "studio_dispute_limit_reached",
]);

/** The owner's dispute form: a button that opens it, one note, Send. A blank
 *  note never goes out. It folds away once the release can take no dispute
 *  (after sending, or at the cap). On a refusal about the release's state it
 *  folds too, toasts why and hands focus to the panel through `onRefused`. */
export function StudioReleaseDisputeForm({
  releaseId,
  canDispute,
  hasEarlierDispute,
  onSent,
  onRefused,
}: {
  releaseId: string;
  canDispute: boolean;
  hasEarlierDispute: boolean;
  onSent: () => void;
  onRefused: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const fileDispute = useFileStudioDispute();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [hasTriedBlank, setHasTriedBlank] = useState(false);
  const trimmedNote = note.trim();
  const errorKey = fileDispute.error
    ? studioErrorMessageKeyOf(fileDispute.error)
    : hasTriedBlank && !trimmedNote
      ? "studio:dispute.noteRequired"
      : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fileDispute.isPending) return;
    if (!trimmedNote) {
      setHasTriedBlank(true);
      return;
    }
    fileDispute.mutate(
      { releaseId, note: trimmedNote },
      {
        onSuccess: () => {
          setIsOpen(false);
          setNote("");
          setHasTriedBlank(false);
          showToast(t("studio:dispute.sentToast"), "success");
          onSent();
        },
        onError: (error) => {
          const code = studioErrorCodeOf(error);
          if (!code || !STATE_REFUSAL_CODES.has(code)) return;
          setIsOpen(false);
          fileDispute.reset();
          showToast(t(studioErrorMessageKeyOf(error)), "error");
          onRefused();
        },
      },
    );
  }

  return (
    <Collapse isOpen={canDispute}>
      <div className={css.formArea}>
        {!hasEarlierDispute && (
          <p className={css.intro}>{t("studio:dispute.intro")}</p>
        )}
        <Button
          type="button"
          variant="ghost"
          aria-expanded={isOpen}
          aria-controls={formId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          {t(
            isOpen
              ? "studio:dispute.closeFormCta"
              : hasEarlierDispute
                ? "studio:dispute.againCta"
                : "studio:dispute.openFormCta",
          )}
        </Button>
        <div id={formId}>
          <Collapse isOpen={isOpen}>
            <form className={css.form} onSubmit={submit} noValidate>
              <FormField
                label={t("studio:dispute.noteLabel")}
                helper={t("studio:dispute.noteHint")}
                error={errorKey ? t(errorKey) : undefined}
                required
              >
                <textarea
                  rows={4}
                  value={note}
                  maxLength={STUDIO_DISPUTE_LIMITS.noteMax}
                  onChange={(event) => {
                    setNote(event.target.value);
                    if (fileDispute.error) fileDispute.reset();
                  }}
                />
              </FormField>
              <Button
                type="submit"
                variant="primary"
                aria-disabled={fileDispute.isPending || undefined}
              >
                {t(
                  fileDispute.isPending
                    ? "studio:dispute.sendingCta"
                    : "studio:dispute.sendCta",
                )}
              </Button>
            </form>
          </Collapse>
        </div>
      </div>
    </Collapse>
  );
}
