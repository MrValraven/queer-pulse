import { useState } from "react";
import { FiSlash } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRevokeAdminInvite } from "./api/useAdminInvites";
import {
  isInviteNotRevocableError,
  type AdminInviteDTO,
} from "./api/adminInvites.api";

/**
 * The invite drawer's one destructive action: pull a still-valid invite link,
 * whoever sent it. Offered only while the invite reads `valid` — an accepted,
 * expired, or already-revoked invite has nothing left to revoke, and the
 * backend answers those with a 409.
 *
 * Everything about it is deliberate: the confirm goes through the shared
 * `ConfirmDialog` in its destructive tone, the dialog names the code and the
 * sender so nobody revokes the wrong row from muscle memory, and success is
 * announced only from the mutation's `onSuccess` with the server's own row.
 * A 409 gets its own calm message: the invite moved on while the drawer sat
 * open, which is ordinary rather than a fault.
 */
export function AdminInviteRevokeAction({
  invite,
  onRevoked,
}: {
  invite: AdminInviteDTO;
  /** Hand the confirmed row back so the open drawer shows the new status. */
  onRevoked: (revoked: AdminInviteDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const revokeInvite = useRevokeAdminInvite();

  if (invite.status !== "valid") return null;

  const handleConfirm = () => {
    revokeInvite.mutate(invite, {
      onSuccess: (revoked) => {
        setIsConfirmOpen(false);
        onRevoked(revoked);
        showToast(
          t("admin:adminInvites.revoke.doneToast", { code: invite.code }),
          "success",
        );
      },
      onError: (error) => {
        setIsConfirmOpen(false);
        showToast(
          isInviteNotRevocableError(error)
            ? t("admin:adminInvites.revoke.movedOnToast")
            : t("admin:adminInvites.revoke.failedToast"),
          "error",
        );
      },
    });
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        disabled={revokeInvite.isPending}
        onClick={() => setIsConfirmOpen(true)}
      >
        <FiSlash aria-hidden /> {t("admin:adminInvites.revoke.cta")}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        tone="destructive"
        loading={revokeInvite.isPending}
        title={t("admin:adminInvites.revoke.confirmTitle", {
          code: invite.code,
        })}
        confirmLabel={t("admin:adminInvites.revoke.confirmCta")}
      >
        <p>
          {t("admin:adminInvites.revoke.confirmBody", {
            name: invite.inviter.name,
          })}
        </p>
      </ConfirmDialog>
    </>
  );
}
