import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupMemberView } from "./data";

/**
 * DES-228: confirm step before an owner hands ownership to another member,
 * opened from that member's "Make owner" row action. Modelled on
 * `GroupRemoveMemberConfirm`: same shared `Modal`, same `pending`-disables-
 * both-actions shape. The server re-checks `canTransferOwnership` regardless;
 * this is only the "are you sure" step.
 */
export function GroupTransferOwnershipConfirm({
  member,
  pending,
  onConfirm,
  onCancel,
}: {
  member: GroupMemberView;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("messages:group.transferConfirm.title", { name: member.name })}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {t("messages:group.transferConfirm.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={pending}>
            {t("messages:group.transferConfirm.confirm")}
          </Button>
        </>
      }
    >
      <p>{t("messages:group.transferConfirm.body", { name: member.name })}</p>
    </Modal>
  );
}
