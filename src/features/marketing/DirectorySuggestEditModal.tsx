import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useSuggestEdit,
  type SuggestEditField,
} from "./api/useSuggestEdit";
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
 * A non-owner member picks which of the 6 backend-recognized fields is off
 * and writes a note; submits through `useSuggestEdit`, which POSTs in live
 * mode and just resolves in demo (there's no owner inbox to patch here).
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
  const selectId = useId();
  const textareaId = useId();

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length > 0 && !suggestEdit.isPending;

  const submit = () => {
    if (!canSubmit) return;
    suggestEdit.mutate(
      { field, message: trimmedMessage },
      {
        onSuccess: () => {
          onClose();
          showToast(
            t("marketing:directory.detail.suggestEdit.successToast"),
            "success",
          );
        },
        onError: () =>
          showToast(
            t("marketing:directory.detail.suggestEdit.errorToast"),
            "error",
          ),
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
      <select
        id={selectId}
        className={styles.select}
        value={field}
        onChange={(event) =>
          setField(event.target.value as SuggestEditField)
        }
      >
        {FIELDS.map((option) => (
          <option key={option} value={option}>
            {t(`marketing:directory.detail.suggestEdit.field.${option}`)}
          </option>
        ))}
      </select>

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
    </Modal>
  );
}
