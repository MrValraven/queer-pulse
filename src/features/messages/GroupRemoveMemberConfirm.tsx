import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupMemberView } from "./data";

/**
 * Confirm step before removing a member from a group (UX polish: no destructive
 * action without a confirm). Reuses the shared `Modal` primitive, so it inherits
 * the repo's focus-trap, Escape-to-close, and focus-return. `pending` disables
 * both actions while the removal is in flight.
 */
export function GroupRemoveMemberConfirm({
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
      title={t("messages:group.removeConfirm.title", { name: member.name })}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {t("messages:group.removeConfirm.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("messages:group.removeConfirm.confirm")}
          </Button>
        </>
      }
    >
      <p>{t("messages:group.removeConfirm.body", { name: member.name })}</p>
    </Modal>
  );
}
