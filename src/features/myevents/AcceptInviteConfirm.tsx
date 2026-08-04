import { ConfirmDialog } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/**
 * Confirmation shown after accepting an invite. A positive action, so it uses
 * the shared `ConfirmDialog` in the default (non-destructive) tone: "Add to
 * calendar" is the confirm action (it fires the toast and leaves the dialog
 * open so the member can keep reading), and "Done" dismisses.
 */
export function AcceptInviteConfirm() {
  const { t } = useTranslation();
  const { confirm, closeConfirm, toast } = useMyEvents();

  return (
    <ConfirmDialog
      open={confirm.open}
      onClose={closeConfirm}
      onConfirm={() =>
        toast(t("myevents:tools.addedToCalendarToast"), "success")
      }
      title={
        <Translation
          i18nKey="myevents:acceptConfirm.title"
          components={{ em: <em /> }}
        />
      }
      confirmLabel={t("myevents:acceptConfirm.addToCalendarCta")}
      cancelLabel={t("myevents:acceptConfirm.doneCta")}
    >
      <div className={sx("modal-eyebrow")}>
        {t("myevents:acceptConfirm.eyebrow")}
      </div>
      <p className={sx("modal-evname")}>{confirm.title}</p>
      <p className={sx("modal-evname")}>{confirm.meta}</p>
    </ConfirmDialog>
  );
}
