import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { ATTENDEE_COUNT } from "./manageGathering.data";
import styles from "./GatheringModals.module.css";

export interface GatheringDetailsDraft {
  title: string;
  date: string;
  location: string;
  description: string;
}

export function EditDetailsModal({
  initial,
  onClose,
  onSave,
}: {
  initial: GatheringDetailsDraft;
  onClose: () => void;
  onSave: (draft: GatheringDetailsDraft) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  const [done, setDone] = useState(false);

  const set = (key: keyof GatheringDetailsDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const canSave =
    draft.title.trim().length > 0 &&
    draft.date.trim().length > 0 &&
    draft.location.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave(draft);
    setDone(true);
  };

  if (done) {
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:manage.editModal.successTitle"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="gatherings:manage.editModal.successSub"
            values={{ title: draft.title }}
            components={{ b: <b /> }}
          />
        }
        meta={t("gatherings:manage.editModal.successMeta", {
          count: ATTENDEE_COUNT,
        })}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:manage.editModal.eyebrow")}
      title={t("gatherings:manage.editModal.title")}
      sub={t("gatherings:manage.editModal.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {t("gatherings:manage.editModal.saveCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <FormField label={t("gatherings:manage.editModal.fieldTitle")} required>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
          />
        </FormField>
        <FormField
          label={t("gatherings:manage.editModal.fieldDateTime")}
          required
        >
          <input
            type="text"
            value={draft.date}
            onChange={(event) => set("date", event.target.value)}
          />
        </FormField>
        <FormField
          label={t("gatherings:manage.editModal.fieldLocation")}
          required
        >
          <input
            type="text"
            value={draft.location}
            onChange={(event) => set("location", event.target.value)}
          />
        </FormField>
        <FormField label={t("gatherings:manage.editModal.fieldDescription")}>
          <textarea
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}
