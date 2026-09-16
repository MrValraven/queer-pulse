import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * PRD-357: confirm step before the owner ends a group for everyone. Modelled
 * on `GroupRemoveMemberConfirm` (shared `Modal`, `pending` disables both
 * actions). The body spells out the three things a member cannot infer from
 * "End group" alone: everyone leaves, history stays readable, nobody can post
 * again.
 */
export function GroupDissolveConfirm({
  groupName,
  pending,
  onConfirm,
  onCancel,
}: {
  groupName: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("messages:group.dissolveConfirm.title", { name: groupName })}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {t("messages:group.dissolveConfirm.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("messages:group.dissolveConfirm.confirm")}
          </Button>
        </>
      }
    >
      <p>{t("messages:group.dissolveConfirm.body")}</p>
    </Modal>
  );
}
