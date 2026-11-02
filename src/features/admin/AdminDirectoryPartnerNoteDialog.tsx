import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DIRECTORY_PARTNER_NOTE_MAX,
  type AdminDirectoryPartnerDTO,
} from "../marketing/api/directoryPartners.api";
import {
  DIRECTORY_PARTNER_ERROR_VALUES,
  directoryPartnerErrorKeyOf,
} from "./adminDirectoryPartners.model";
import { AdminDirectoryPartnerThumb } from "./AdminDirectoryPartnerThumb";
import { StudioAdminNoteField } from "./StudioAdminNoteField";
import type { UpdateDirectoryPartnerNoteMutation } from "./useAdminDirectoryPartnersActions";
import pickCss from "./StudioAdminPickDialog.module.css";
import css from "./AdminDirectoryPartners.module.css";

/** Edit one partner's note under a summary of the business; an empty note
 *  clears it. A refusal names its cause under the field. */
export function AdminDirectoryPartnerNoteDialog({
  partner,
  updateNote,
  isBusy,
  onClose,
}: {
  partner: AdminDirectoryPartnerDTO;
  updateNote: UpdateDirectoryPartnerNoteMutation;
  isBusy: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [note, setNote] = useState(partner.note ?? "");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  function submit() {
    if (isBusy) return;
    updateNote.mutate(
      { pickId: partner.id, note: note.trim() || null },
      {
        onSuccess: () => {
          showToast(t("admin:directoryPartners.toast.noteSaved"), "success");
          onClose();
        },
        onError: (cause) => setErrorKey(directoryPartnerErrorKeyOf(cause)),
      },
    );
  }

  return (
    <Modal
      initialFocusRef={noteRef}
      title={t("admin:directoryPartners.row.editNoteCta")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={isBusy || undefined}
            aria-busy={updateNote.isPending || undefined}
            onClick={submit}
          >
            {t("admin:directoryPartners.noteDialog.saveCta")}
          </Button>
        </>
      }
    >
      <form
        className={pickCss.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={pickCss.summaryCard}>
          <span className={css.summary}>
            <AdminDirectoryPartnerThumb
              coverImage={partner.coverImage}
              tint={partner.tint}
              initials={partner.av}
            />
            <span className={css.resultText}>
              <span className={css.name}>{partner.name}</span>
              {partner.hood ? (
                <span className={css.hood}>{partner.hood}</span>
              ) : null}
            </span>
          </span>
        </div>
        <StudioAdminNoteField
          value={note}
          inputRef={noteRef}
          maxLength={DIRECTORY_PARTNER_NOTE_MAX}
          measureLength={(noteValue) => Array.from(noteValue).length}
          hintKey="admin:directoryPartners.noteHint"
          onChange={(value) => {
            setNote(value);
            setErrorKey(null);
          }}
        />
        <Collapse isOpen={errorKey !== null}>
          <p className={pickCss.error} role="alert">
            {errorKey ? t(errorKey, DIRECTORY_PARTNER_ERROR_VALUES) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
