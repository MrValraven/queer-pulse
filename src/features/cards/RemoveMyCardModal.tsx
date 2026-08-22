import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Confirm step for permanently removing one of the member's own cards from
 * their wallet (spec §K.4: the member's right to have a card destroyed, not
 * merely revoked). `MyCardsPage` only ever opens this for a non-active card
 * (expired, suspended, revoked) — removing a live credential by accident is
 * worse than keeping it, so an active card never offers this at all.
 * Irreversible, so it never fires straight off a single tap, mirroring
 * `LeaveCommunityModal`'s confirm-modal pattern.
 */
export function RemoveMyCardModal({
  communityName,
  pending = false,
  onConfirm,
  onClose,
}: {
  communityName: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("cards:remove.confirm.title", { community: communityName })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("cards:remove.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("cards:remove.confirm.body", { community: communityName })}</p>
    </Modal>
  );
}
