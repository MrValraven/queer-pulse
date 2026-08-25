import { useId, useState } from "react";
import { Button, Select } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { useSuggestEdit, type SuggestEditField } from "./api/useSuggestEdit";
import { DirectorySuggestEditValueField } from "./DirectorySuggestEditValueField";
import { suggestEditValueShape } from "./directorySuggestEditFields.data";
import styles from "./DirectorySuggestEditModal.module.css";

const FIELDS: SuggestEditField[] = [
  "hours",
  "address",
  "phone",
  "website",
  "description",
  "other",
];

const MESSAGE_MAX_LENGTH = 2000;

/**
 * The "Suggest an edit" form itself, opened by `DirectorySuggestEditControl`.
 * A non-owner member picks which of the 6 backend-recognized fields is off,
 * writes a note, and may also hand over the actual corrected value; submits
 * through `useSuggestEdit`, which POSTs in live mode and just resolves in demo
 * (there's no owner inbox to patch here).
 *
 * The value is optional throughout. Knowing something is wrong without knowing
 * what is right is a genuinely useful report, so prose alone always submits.
 * When a value IS offered and the server refuses it, the server's own reason
 * (it names the constraint that failed) is shown against the input instead of
 * disappearing behind a generic failure toast.
 */
export function DirectorySuggestEditModal({
  slug,
  placeName,
  onClose,
}: {
  slug: string;
  placeName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const suggestEdit = useSuggestEdit(slug);
  const [field, setField] = useState<SuggestEditField>("hours");
  const [message, setMessage] = useState("");
  const [proposedValue, setProposedValue] = useState("");
  const [valueRejection, setValueRejection] = useState<string | null>(null);
  const selectId = useId();
  const textareaId = useId();

  const valueShape = suggestEditValueShape(field);
  const trimmedMessage = message.trim();
  const trimmedValue = proposedValue.trim();
  const canSubmit = trimmedMessage.length > 0 && !suggestEdit.isPending;

  // A value typed for one bucket rarely fits the next one, and `other` refuses
  // values outright, so switching the picker clears both the value and any
  // rejection it collected.
  const pickField = (next: SuggestEditField) => {
    setField(next);
    setProposedValue("");
    setValueRejection(null);
  };

  const submit = () => {
    if (!canSubmit) return;
    setValueRejection(null);
    suggestEdit.mutate(
      {
        field,
        message: trimmedMessage,
        proposedValue: valueShape && trimmedValue ? trimmedValue : undefined,
      },
      {
        onSuccess: () => {
          onClose();
          showToast(
            t("marketing:directory.detail.suggestEdit.successToast"),
            "success",
          );
        },
        onError: (error) => {
          // A 400 here is the server checking what was sent against the real
          // column's rules, and its message names the constraint that failed.
          // When a value was offered, that message belongs beside the input
          // that caused it, with the form still open to fix it. Otherwise it
          // still beats a generic "something went wrong".
          const reason =
            error instanceof ApiError && error.status === 400
              ? error.message
              : null;
          if (reason && valueShape && trimmedValue) {
            setValueRejection(reason);
            return;
          }
          showToast(
            reason
              ? t("marketing:directory.detail.suggestEdit.value.rejected", {
                  reason,
                })
              : t("marketing:directory.detail.suggestEdit.errorToast"),
            "error",
          );
        },
      },
    );
  };

  return (
    <Modal
      title={t("marketing:directory.detail.suggestEdit.title")}
      onClose={onClose}
      sub={t("marketing:directory.detail.suggestEdit.sub", {
        name: placeName,
      })}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("marketing:directory.detail.suggestEdit.cancel")}
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            {suggestEdit.isPending
              ? t("marketing:directory.detail.suggestEdit.submitting")
              : t("marketing:directory.detail.suggestEdit.submit")}
          </Button>
        </>
      }
    >
      <label className={styles.field} htmlFor={selectId}>
        {t("marketing:directory.detail.suggestEdit.fieldLabel")}
      </label>
      <Select
        id={selectId}
        options={FIELDS.map((option) => ({
          value: option,
          label: t(`marketing:directory.detail.suggestEdit.field.${option}`),
        }))}
        value={field}
        onChange={(value) => pickField(value as SuggestEditField)}
      />

      <label className={styles.field} htmlFor={textareaId}>
        {t("marketing:directory.detail.suggestEdit.messageLabel")}
      </label>
      <textarea
        id={textareaId}
        className={styles.textarea}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t(
          "marketing:directory.detail.suggestEdit.messagePlaceholder",
        )}
        maxLength={MESSAGE_MAX_LENGTH}
      />
      <div className={styles.counter}>
        {message.length}/{MESSAGE_MAX_LENGTH}
      </div>

      {valueShape ? (
        <DirectorySuggestEditValueField
          shape={valueShape}
          value={proposedValue}
          rejection={valueRejection}
          onChange={(next) => {
            setProposedValue(next);
            // Editing the value answers the server's objection to it, so the
            // objection goes rather than sitting under a value it no longer
            // describes.
            setValueRejection(null);
          }}
        />
      ) : (
        <p className={styles.proseOnly}>
          {t("marketing:directory.detail.suggestEdit.value.proseOnly")}
        </p>
      )}
    </Modal>
  );
}
