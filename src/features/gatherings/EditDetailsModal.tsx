import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
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
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  const [done, setDone] = useState(false);

  const set = (k: keyof GatheringDetailsDraft, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const canSave =
    draft.title.trim().length > 0 &&
    draft.date.trim().length > 0 &&
    draft.location.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave(draft);
    setDone(true);
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {done ? (
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
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("gatherings:manage.editModal.title")}
          className={styles.modal}
        >
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("gatherings:manage.closeAria")}
          >
            <FiX />
          </button>
          <div className={styles.eye}>
            {t("gatherings:manage.editModal.eyebrow")}
          </div>
          <div className={styles.title}>
            {t("gatherings:manage.editModal.title")}
          </div>
          <p className={styles.sub}>{t("gatherings:manage.editModal.sub")}</p>

          <div className={styles.fields}>
            <FormField
              label={t("gatherings:manage.editModal.fieldTitle")}
              required
            >
              <input
                type="text"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </FormField>
            <FormField
              label={t("gatherings:manage.editModal.fieldDateTime")}
              required
            >
              <input
                type="text"
                value={draft.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </FormField>
            <FormField
              label={t("gatherings:manage.editModal.fieldLocation")}
              required
            >
              <input
                type="text"
                value={draft.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </FormField>
            <FormField
              label={t("gatherings:manage.editModal.fieldDescription")}
            >
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </FormField>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={save} disabled={!canSave}>
              {t("gatherings:manage.editModal.saveCta")}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("gatherings:manage.cancelCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
