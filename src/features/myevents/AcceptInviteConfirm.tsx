import { AnimatePresence } from "motion/react";
import { FiClock } from "react-icons/fi";
import { Button, Modal, SuccessPanel } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";

/**
 * Confirmation shown after accepting an invite, in the house success pattern:
 * the dialog's head carries the eyebrow and the "You said yes." title, and the
 * shared `SuccessPanel` (flat inside a `Modal`) shows the jade icon, the event
 * name in ink and its date as meta. "Add to calendar" is the primary action
 * for a member who is going; it fires the toast and leaves the dialog open so
 * they can keep reading. A waitlisted member is not going yet, so their dialog
 * offers only "Done" and a clock in place of the tick. `AnimatePresence`
 * lets the shared Modal play its exit when the dialog closes.
 */
export function AcceptInviteConfirm() {
  const { t } = useTranslation();
  const { confirm, closeConfirm, toast } = useMyEvents();
  const { isWaitlisted } = confirm;

  return (
    <AnimatePresence>
      {confirm.open && (
        <Modal
          key="accept-confirm"
          onClose={closeConfirm}
          eyebrow={t(
            isWaitlisted
              ? "myevents:acceptConfirm.waitlistedEyebrow"
              : "myevents:acceptConfirm.eyebrow",
          )}
          title={
            <Translation
              i18nKey={
                isWaitlisted
                  ? "myevents:acceptConfirm.waitlistedTitle"
                  : "myevents:acceptConfirm.title"
              }
              components={{ em: <em /> }}
            />
          }
        >
          <SuccessPanel
            title={confirm.title}
            onClose={closeConfirm}
            closeLabel={t("myevents:acceptConfirm.doneCta")}
            icon={
              isWaitlisted ? (
                <FiClock size={26} color="var(--jade)" aria-hidden />
              ) : undefined
            }
            extraActions={
              isWaitlisted ? undefined : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() =>
                    toast(t("myevents:tools.addedToCalendarToast"), "success")
                  }
                >
                  {t("myevents:acceptConfirm.addToCalendarCta")}
                </Button>
              )
            }
          >
            {confirm.meta}
          </SuccessPanel>
        </Modal>
      )}
    </AnimatePresence>
  );
}
