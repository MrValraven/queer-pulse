import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { FormField } from "../../shared/components/ui/FormField";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuggestCommunityTag } from "./api/useCommunityMutations";
import styles from "./SuggestCommunityTagModal.module.css";

const LABEL_MAX_LENGTH = 60;
const NOTE_MAX_LENGTH = 300;

/**
 * The small "Suggest a tag" dialog opened from `EditCommunityModal`'s tag
 * field — an owner/mod flags a curated tag that doesn't exist yet in
 * `COMMUNITY_TAGS`. Nested inside the edit modal (the shared `Modal` stack
 * only closes the topmost on Escape, so this composes safely). Submits
 * through `useSuggestCommunityTag`; on success the caller closes it and a
 * toast confirms — this is fire-and-forget from the submitter's side, so
 * there's nothing further to render here.
 */
export function SuggestCommunityTagModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const suggestTag = useSuggestCommunityTag(slug);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  const trimmedLabel = label.trim();
  const canSubmit = trimmedLabel.length > 0 && !suggestTag.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const trimmedNote = note.trim();
    suggestTag.mutate(
      { label: trimmedLabel, note: trimmedNote || undefined },
      {
        onSuccess: () => {
          onClose();
          showToast(t("communities:edit.suggestTag.successToast"), "success");
        },
        onError: () =>
          showToast(t("communities:edit.suggestTag.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      title={t("communities:edit.suggestTag.title")}
      sub={t("communities:edit.suggestTag.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("communities:edit.suggestTag.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={submit}
            disabled={!canSubmit}
          >
            {suggestTag.isPending
              ? t("communities:edit.suggestTag.submitting")
              : t("communities:edit.suggestTag.submit")}
          </Button>
        </>
      }
    >
      <FormField
        label={t("communities:edit.suggestTag.labelField")}
        labelAside={
          <span className={styles.counter}>
            {label.length}/{LABEL_MAX_LENGTH}
          </span>
        }
        required
      >
        <input
          type="text"
          value={label}
          maxLength={LABEL_MAX_LENGTH}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={t("communities:edit.suggestTag.labelPlaceholder")}
        />
      </FormField>

      <FormField
        label={t("communities:edit.suggestTag.noteField")}
        labelAside={
          <span className={styles.counter}>
            {note.length}/{NOTE_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          value={note}
          maxLength={NOTE_MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("communities:edit.suggestTag.notePlaceholder")}
        />
      </FormField>
    </Modal>
  );
}
