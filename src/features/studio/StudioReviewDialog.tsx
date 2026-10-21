import { useId, useRef, useState } from "react";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioFlagReview.module.css";

export interface StudioReviewDialogRequest {
  titleKey: string;
  bodyKey: string;
  confirmKey: string;
  /** The text field's label, or null for a decision with nothing to write. */
  textLabelKey: string | null;
  textMaxLength: number;
  releaseTitle: string;
  tone: "default" | "destructive" | "positive";
}

/**
 * The confirm step of a staff decision. The panel mounts it keyed per
 * request, so the text starts empty each time; it stays open, with both
 * buttons waiting, while the decision is on its way. A required text keeps
 * Confirm disabled until it holds more than spaces.
 *
 * A failed decision keeps the dialog and the note, and names the reason
 * inside it (`errorKey`). A typed note never leaves by accident: Escape,
 * the scrim or Cancel first ask "Discard your note?", and only Discard note
 * closes.
 */
export function StudioReviewDialog({
  request,
  isPending,
  errorKey = null,
  onConfirm,
  onClose,
}: {
  request: StudioReviewDialogRequest | null;
  isPending: boolean;
  /** The last attempt's failure, as a catalog key; null while none. */
  errorKey?: string | null;
  onConfirm: (text: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [isAskingToDiscard, setIsAskingToDiscard] = useState(false);
  const keepWritingRef = useRef<HTMLButtonElement>(null);
  const discardId = useId();
  const isDirty = text.trim().length > 0;

  function requestClose() {
    if (isPending) return;
    if (!isDirty) {
      onClose();
      return;
    }
    setIsAskingToDiscard(true);
    requestAnimationFrame(() => keepWritingRef.current?.focus());
  }

  // Back to the note before the question folds away (and goes inert), so
  // focus never drops to the page. The shared dialog owns the textarea, so
  // it is found inside this dialog.
  function keepWriting() {
    const dialog = keepWritingRef.current?.closest('[role="dialog"]');
    const textarea = dialog?.querySelector("textarea");
    textarea?.focus();
    requestAnimationFrame(() => {
      setIsAskingToDiscard(false);
      textarea?.focus();
    });
  }

  return (
    <ConfirmDialog
      open={request !== null}
      onClose={requestClose}
      onConfirm={() => {
        setIsAskingToDiscard(false);
        onConfirm(text.trim());
      }}
      loading={isPending}
      tone={request?.tone ?? "default"}
      title={
        request ? t(request.titleKey, { title: request.releaseTitle }) : ""
      }
      description={request ? t(request.bodyKey) : undefined}
      confirmLabel={request ? t(request.confirmKey) : undefined}
      reason={
        request?.textLabelKey
          ? {
              value: text,
              onChange: (value) => {
                setText(value);
                setIsAskingToDiscard(false);
              },
              label: t(request.textLabelKey),
              required: true,
              maxLength: request.textMaxLength,
            }
          : undefined
      }
    >
      <Collapse isOpen={errorKey !== null}>
        <p className={css.dialogError} role="alert">
          {errorKey ? t(errorKey) : null}
        </p>
      </Collapse>
      <Collapse isOpen={isAskingToDiscard}>
        <div className={css.discard} role="group" aria-labelledby={discardId}>
          <p id={discardId} className={css.discardText}>
            {t("studio:flagReviewLive.dialog.discardQuestion")}
          </p>
          <div className={css.discardActions}>
            <Button
              ref={keepWritingRef}
              variant="quiet"
              size="sm"
              onClick={keepWriting}
            >
              {t("studio:flagReviewLive.dialog.keepWriting")}
            </Button>
            <Button variant="danger" size="sm" onClick={onClose}>
              {t("studio:flagReviewLive.dialog.discardNote")}
            </Button>
          </div>
        </div>
      </Collapse>
    </ConfirmDialog>
  );
}
