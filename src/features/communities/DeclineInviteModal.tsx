import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Confirm step for declining a standing community invitation (PRD-140).
 *
 * The community is never told the answer was no, and the copy says so: being
 * able to decline a survivors' or coming-out group quietly is the whole reason
 * this is safe to offer. The invitation can be sent again later, so declining
 * closes nothing permanently.
 */
export function DeclineInviteModal({
  name,
  pending = false,
  onConfirm,
  onClose,
}: {
  name: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("communities:detail.invite.declineConfirm.title", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("communities:detail.invite.declineConfirm.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("communities:detail.invite.declineConfirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("communities:detail.invite.declineConfirm.body")}</p>
    </Modal>
  );
}
