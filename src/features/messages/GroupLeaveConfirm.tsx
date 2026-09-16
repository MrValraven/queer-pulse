import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface GroupLeaveConfirmProps {
  groupName: string;
  /** The signed-in member's own role: the owner gets the succession copy +
   *  the "Transfer ownership instead" way out; anyone else gets a plain
   *  confirm. */
  isOwner: boolean;
  /** DES-228: the longest-standing admin, else the longest-standing member,
   *  computed by `computeGroupSuccessor`, naming who inherits if the owner leaves.
   *  Null when nobody else remains (leaving ends the group). Ignored when
   *  `isOwner` is false. */
  successorName: string | null;
  /** False while the caller's own roster row has not resolved yet. In that
   *  case `successorName` being null does NOT mean nobody remains, so the
   *  "this ends the group" copy must never show; fall back to the plain
   *  body instead. */
  isSuccessionKnown: boolean;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Closes this confirm WITHOUT leaving, so the owner can pick a specific
   *  successor from a roster row's own "Make owner" action first, instead of
   *  leaving straight into auto-succession. Absent for a non-owner. */
  onTransferInstead?: () => void;
}

/**
 * DES-228: confirm step before the signed-in member leaves a group. Modelled
 * on `GroupRemoveMemberConfirm` (shared `Modal`, `pending` disables every
 * action). For the owner, the body names who inherits (or says the group
 * ends if nobody remains) and a ghost "Transfer ownership instead" button
 * lets them back out to hand it to someone specific via that member's own
 * "Make owner" row action, rather than leaving straight into
 * auto-succession.
 */
export function GroupLeaveConfirm({
  groupName,
  isOwner,
  successorName,
  isSuccessionKnown,
  pending,
  onConfirm,
  onCancel,
  onTransferInstead,
}: GroupLeaveConfirmProps) {
  const { t } = useTranslation();

  // The "this ends the group" copy is only ever correct when the caller's
  // own row was found AND no successor candidate remains. Anything less
  // certain (including the row not resolving yet) falls back to the plain
  // body rather than risk telling an owner their leave ends the group when
  // it may not.
  const body =
    isOwner && successorName
      ? t("messages:group.leaveConfirm.ownerBodySuccessor", {
          name: groupName,
          successor: successorName,
        })
      : isOwner && isSuccessionKnown
        ? t("messages:group.leaveConfirm.ownerBodyEnds", { name: groupName })
        : t("messages:group.leaveConfirm.body", { name: groupName });

  return (
    <Modal
      title={t("messages:group.leaveConfirm.title")}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {t("messages:group.leaveConfirm.cancel")}
          </Button>
          {isOwner && onTransferInstead && (
            <Button
              variant="ghost"
              onClick={onTransferInstead}
              disabled={pending}
            >
              {t("messages:group.leaveConfirm.transferInstead")}
            </Button>
          )}
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t("messages:group.leaveConfirm.confirm")}
          </Button>
        </>
      }
    >
      <p>{body}</p>
    </Modal>
  );
}
