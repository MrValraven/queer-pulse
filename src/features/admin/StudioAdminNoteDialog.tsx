import { useId, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import { useUpdateAdminStudioPickNote } from "./api/StudioAdminCurationHooks";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import css from "./StudioAdminPage.module.css";

/** Edit one pick's note; an empty note clears it. */
export function StudioAdminNoteDialog({
  pick,
  onClose,
}: {
  pick: AdminStudioPickDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const noteFieldId = useId();
  const noteRef = useRef<HTMLInputElement>(null);
  const noteHintId = useId();
  const [note, setNote] = useState(pick.note ?? "");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const update = useUpdateAdminStudioPickNote();

  function submit() {
    if (update.isPending) return;
    update.mutate(
      { pick, note: note.trim() || null },
      {
        onSuccess: () => {
          showToast(t("admin:studioAdmin.toast.noteSaved"), "success");
          onClose();
        },
        onError: (cause) => setErrorKey(studioAdminSaveErrorKeyOf(cause)),
      },
    );
  }

  return (
    <Modal
      initialFocusRef={noteRef}
      title={t("admin:studioAdmin.noteDialog.title", {
        title: pick.release.title,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={update.isPending || undefined}
            onClick={submit}
          >
            {t("admin:studioAdmin.noteDialog.saveCta")}
          </Button>
        </>
      }
    >
      <form
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label htmlFor={noteFieldId} className={css.fieldLabel}>
          {t("admin:studioAdmin.pickDialog.noteLabel")}
        </label>
        <input
          id={noteFieldId}
          ref={noteRef}
          type="text"
          className={css.textInput}
          value={note}
          maxLength={STUDIO_DISCOVERY_LIMITS.curationNoteMaxLength}
          aria-describedby={noteHintId}
          onChange={(event) => {
            setNote(event.target.value);
            setErrorKey(null);
          }}
        />
        <p id={noteHintId} className={css.fieldHint}>
          {t("admin:studioAdmin.pickDialog.noteHint")}
        </p>
        <Collapse isOpen={errorKey !== null}>
          <p className={css.error} role="alert">
            {errorKey ? t(errorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
