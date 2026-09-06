import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Confirm step for taking a pending join request back (PRD-148).
 *
 * The hero's "Requested" button was a disabled label with no way out: an
 * applicant who changed their mind, or who asked the wrong community, could
 * only wait for a decision. Withdrawing is close enough to destructive to
 * deserve a step of its own, and the reason it is worth doing belongs in the
 * copy: a request that is withdrawn is simply gone, while a request that is
 * DECLINED writes a reapply wait of 30 or 180 days depending on the kind of
 * "no" the moderator chose. Withdrawing first is what keeps that lock from
 * ever existing.
 *
 * Nobody is told. The community's queue simply stops showing the row.
 */
export function WithdrawJoinRequestModal({
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
      title={t("communities:detail.withdraw.confirm.title", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("communities:detail.withdraw.confirm.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("communities:detail.withdraw.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("communities:detail.withdraw.confirm.body")}</p>
    </Modal>
  );
}
