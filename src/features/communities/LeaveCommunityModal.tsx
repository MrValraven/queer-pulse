import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Confirm step for leaving a community — a destructive action, so it never
 * fires straight off the "Joined" button. Membership is only dropped once the
 * member confirms here.
 *
 * The OWNER gets a different dialog entirely (PRD-142). The hero shows them
 * the same "Joined" button as everybody else, and confirming here used to fire
 * `DELETE /communities/:slug/members/:me`, which the backend refuses outright:
 * `removeMember` throws "The owner cannot be removed", so the owner's only
 * feedback was a generic error toast, and nothing on the page pointed at
 * transferring ownership, which is the only real exit there is. They are now
 * told plainly that a community cannot be left without a successor, and handed
 * the route to the transfer.
 *
 * A CO-OWNER is not covered by that refusal and leaves like anyone else, so the
 * owner branch keys on the single accountable owner and nothing wider.
 */
export function LeaveCommunityModal({
  name,
  isOwner = false,
  transferOwnershipHref,
  pending = false,
  onConfirm,
  onClose,
}: {
  name: string;
  /** The viewer is this community's single accountable owner. */
  isOwner?: boolean;
  /** Where the transfer lives: the mod console's danger pane. */
  transferOwnershipHref?: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (isOwner) {
    return (
      <Modal
        title={t("communities:detail.leave.owner.title", { name })}
        onClose={onClose}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("communities:detail.leave.owner.cancel")}
            </Button>
            {transferOwnershipHref && (
              <Button
                variant="primary"
                to={transferOwnershipHref}
                onClick={onClose}
              >
                {t("communities:detail.leave.owner.transferCta")}
              </Button>
            )}
          </>
        }
      >
        <p>{t("communities:detail.leave.owner.body", { name })}</p>
      </Modal>
    );
  }

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
