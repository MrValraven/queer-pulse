import { useId, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUpdateAdminStudioSpotlightNote } from "./api/StudioAdminSpotlightMutations";
import type { AdminStudioSpotlightArtistDTO } from "./api/studioSpotlightAdmin.api";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { StudioAdminNoteField } from "./StudioAdminNoteField";
import css from "./StudioAdminSpotlight.module.css";

/** Edit one spotlight artist's note; an empty note clears it, and Enter
 *  saves. A row another console already removed names that in the alert. */
export function StudioAdminSpotlightNoteDialog({
  spotlightArtist,
  onClose,
}: {
  spotlightArtist: AdminStudioSpotlightArtistDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [note, setNote] = useState(spotlightArtist.note ?? "");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const update = useUpdateAdminStudioSpotlightNote();

  function submit() {
    if (update.isPending) return;
    update.mutate(
      { spotlightArtist, note: note.trim() || null },
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
      title={t("admin:studioAdmin.spotlight.noteDialogTitle", {
        name: spotlightArtist.artist.name,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            aria-disabled={update.isPending || undefined}
            aria-busy={update.isPending || undefined}
          >
            {t("admin:studioAdmin.spotlight.saveNoteCta")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <StudioAdminNoteField
          value={note}
          inputRef={noteRef}
          hintKey="admin:studioAdmin.spotlight.noteHint"
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
