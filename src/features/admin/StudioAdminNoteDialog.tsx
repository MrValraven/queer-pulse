import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUpdateAdminStudioPickNote } from "./api/StudioAdminCurationHooks";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { StudioAdminNoteField } from "./StudioAdminNoteField";
import css from "./StudioAdminPickDialog.module.css";
import { StudioAdminReleaseSummary } from "./StudioAdminReleaseSummary";

/** Edit one pick's note under a summary of its release; an empty note
 *  clears it. The title stays "Edit note" since the card names the release. */
export function StudioAdminNoteDialog({
  pick,
  onClose,
}: {
  pick: AdminStudioPickDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const noteRef = useRef<HTMLTextAreaElement>(null);
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
      title={t("admin:studioAdmin.pick.editNoteCta")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={update.isPending || undefined}
            aria-busy={update.isPending || undefined}
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
        <div className={css.summaryCard}>
          <StudioAdminReleaseSummary release={pick.release} size="md" />
        </div>
        <StudioAdminNoteField
          value={note}
          inputRef={noteRef}
          onChange={(value) => {
            setNote(value);
            setErrorKey(null);
          }}
        />
        <Collapse isOpen={errorKey !== null}>
          <p className={css.error} role="alert">
            {errorKey ? t(errorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
