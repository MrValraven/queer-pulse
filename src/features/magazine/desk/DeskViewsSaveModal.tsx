import { useId, useRef, useState, type FormEvent } from "react";
import { Button, FormField, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  DESK_VIEW_NAME_MAX,
  DESK_VIEWS_PER_OWNER_MAX,
  type DeskView,
} from "../api/deskViews.api";
import { deskViewSaveErrorKey } from "./deskViewErrors";
import modalStyles from "./DeskModals.module.css";
import styles from "./DeskViews.module.css";

export interface DeskViewsSaveModalProps {
  /** The views already saved, for the duplicate-name and limit checks. */
  views: DeskView[];
  onClose: () => void;
  /** Resolves once saved; rejects with the request's error. */
  onSave: (name: string) => Promise<void>;
}

/**
 * Names the desk as it stands and saves it as a view. The name is the only
 * field: what gets saved is already on screen behind the dialog.
 *
 * The two refusals an editor can fix here, a name already in use and a full
 * list, are checked before the request and again from a 409 (another tab may
 * have saved in the meantime), and both answer beside the field.
 */
export function DeskViewsSaveModal({
  views,
  onClose,
  onSave,
}: DeskViewsSaveModalProps) {
  const { t } = useTranslation();
  const formId = useId();
  // The dialog opens on the name field: typing a name is the whole task.
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const isListFull = views.length >= DESK_VIEWS_PER_OWNER_MAX;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (trimmedName === "" || isSaving) return;
    if (isListFull) {
      setErrorKey("magazine:desk.savedViews.limitReached");
      return;
    }
    if (views.some((view) => view.name === trimmedName)) {
      setErrorKey("magazine:desk.savedViews.duplicateName");
      return;
    }
    setErrorKey(null);
    setIsSaving(true);
    try {
      await onSave(trimmedName);
      onClose();
    } catch (error) {
      setErrorKey(deskViewSaveErrorKey(error, isListFull));
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={t("magazine:desk.views.saveTitle")}
      sub={t("magazine:desk.views.saveSub")}
      onClose={onClose}
      initialFocusRef={nameInputRef}
      footer={
        <div className={modalStyles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={trimmedName === "" || isSaving}
          >
            {isSaving
              ? t("magazine:desk.views.saving")
              : t("magazine:desk.views.saveCta")}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={(event) => void submit(event)}>
        <FormField
          label={t("magazine:desk.views.nameLabel")}
          required
          error={
            errorKey
              ? t(errorKey, { count: DESK_VIEWS_PER_OWNER_MAX })
              : undefined
          }
          labelAside={
            <span className={styles.count} aria-hidden>
              {name.length}/{DESK_VIEW_NAME_MAX}
            </span>
          }
        >
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            maxLength={DESK_VIEW_NAME_MAX}
            placeholder={t("magazine:desk.views.namePlaceholder")}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              setErrorKey(null);
            }}
          />
        </FormField>
      </form>
    </Modal>
  );
}
