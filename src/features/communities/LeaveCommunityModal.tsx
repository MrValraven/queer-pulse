import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Confirm step for leaving a community — a destructive action, so it never
 * fires straight off the "Joined" button. Membership is only dropped once the
 * member confirms here.
 */
export function LeaveCommunityModal({
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
      title={t("communities:detail.leave.confirm.title", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("communities:detail.leave.confirm.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("communities:detail.leave.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("communities:detail.leave.confirm.body", { name })}</p>
    </Modal>
  );
}
