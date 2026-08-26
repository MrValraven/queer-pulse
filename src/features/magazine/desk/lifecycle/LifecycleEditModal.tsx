import { useState } from "react";
import {
  Button,
  DatePicker,
  FormField,
  Modal,
  Select,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  ArticleLifecycleRecordDTO,
  SetArticleLifecycleDto,
} from "../../api/lifecycle.api";
import type { ArticleLifecycle } from "../../api/magazine.api";
import {
  LIFECYCLE_HINT_KEY,
  LIFECYCLE_LABEL_KEY,
  LIFECYCLE_ORDER,
} from "./lifecycleLabels";
import styles from "./LifecycleBoard.module.css";

export interface LifecycleEditModalProps {
  record: ArticleLifecycleRecordDTO;
  isSaving: boolean;
  onClose: () => void;
  onSave: (dto: SetArticleLifecycleDto) => void;
}

/**
 * CON-16 — where an editor says what a published piece is now.
 *
 * The state picker carries a sentence per option rather than four bare words,
 * because the choice is about what the reader will be told, and "archived"
 * and "superseded" are easy to pick wrongly when they are only labels.
 *
 * `superseded` is the one state that needs a second field: the banner's whole
 * job in it is to send the reader to the replacement, so the slug is required
 * here rather than discovered as a 400 after saving.
 */
export function LifecycleEditModal({
  record,
  isSaving,
  onClose,
  onSave,
}: LifecycleEditModalProps) {
  const { t } = useTranslation();
  const [lifecycle, setLifecycle] = useState<ArticleLifecycle>(
    record.lifecycle,
  );
  const [note, setNote] = useState(record.lifecycleNote);
  const [reviewDueOn, setReviewDueOn] = useState<string | null>(
    record.reviewDueOn,
  );
  const [supersededBySlug, setSupersededBySlug] = useState(
    record.supersededBy?.slug ?? "",
  );

  const needsReplacement =
    lifecycle === "superseded" && supersededBySlug.trim() === "";

  const submit = () => {
    if (needsReplacement) return;
    onSave({
      lifecycle,
      note: note.trim(),
      reviewDueOn: reviewDueOn || null,
      supersededBySlug:
        lifecycle === "superseded" ? supersededBySlug.trim() : null,
    });
  };

  return (
    <Modal
      title={record.title}
      eyebrow={t("magazine:lifecycle.modal.eyebrow")}
      sub={t("magazine:lifecycle.modal.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:lifecycle.modal.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={isSaving || needsReplacement}
          >
            {t("magazine:lifecycle.modal.save")}
          </Button>
        </>
      }
    >
      <FormField label={t("magazine:lifecycle.modal.stateLabel")}>
        <Select
          value={lifecycle}
          onChange={(value) =>
            setLifecycle((value as ArticleLifecycle | null) ?? "live")
          }
          options={LIFECYCLE_ORDER.map((state) => ({
            value: state,
            label: t(LIFECYCLE_LABEL_KEY[state]),
            keywords: t(LIFECYCLE_HINT_KEY[state]),
          }))}
        />
        <p className={styles.stateHint}>{t(LIFECYCLE_HINT_KEY[lifecycle])}</p>
      </FormField>

      {lifecycle === "superseded" && (
        <FormField
          label={t("magazine:lifecycle.modal.replacementLabel")}
          helper={t("magazine:lifecycle.modal.replacementHelper")}
          required
          error={
            needsReplacement
              ? t("magazine:lifecycle.modal.replacementRequired")
              : undefined
          }
        >
          <input
            type="text"
            value={supersededBySlug}
            onChange={(event) => setSupersededBySlug(event.target.value)}
          />
        </FormField>
      )}

      {lifecycle !== "live" && (
        <FormField
          label={t("magazine:lifecycle.modal.noteLabel")}
          helper={t("magazine:lifecycle.modal.noteHelper")}
          labelAside={`${note.length}/500`}
        >
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </FormField>
      )}

      <FormField
        label={t("magazine:lifecycle.modal.reviewLabel")}
        helper={t("magazine:lifecycle.modal.reviewHelper")}
      >
        <DatePicker
          mode="date"
          value={reviewDueOn}
          onChange={setReviewDueOn}
          clearable
        />
      </FormField>
    </Modal>
  );
}
