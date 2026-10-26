import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRefreshAdminInvite } from "./api/useAdminInvites";
import {
  isInviteNotRefreshableError,
  type AdminInviteDTO,
} from "./api/adminInvites.api";

/**
 * The invite drawer's action for an expired invite: give it seven more days,
 * whoever sent it. The code stays the same, so the link the inviter already
 * shared works again. Offered only while the invite reads `expired`; an
 * accepted, revoked or already-valid invite gets a 409 from the backend.
 *
 * It mirrors {@link AdminInviteRevokeAction}: the confirm goes through the
 * shared `ConfirmDialog` (the jade positive tone, matching the bulk refresh,
 * since reopening a link is reversible with a revoke), the dialog names the code and the sender, and success is
 * announced only from the mutation's `onSuccess` with the server's own row.
 * A 409 gets its own calm message: the invite moved on while the drawer sat
 * open, which is ordinary.
 */
export function AdminInviteRefreshAction({
  invite,
  onRefreshed,
}: {
  invite: AdminInviteDTO;
  /** Hand the confirmed row back so the open drawer shows the new status. */
  onRefreshed: (refreshed: AdminInviteDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const refreshInvite = useRefreshAdminInvite();

  if (invite.status !== "expired") return null;

  const handleConfirm = () => {
    refreshInvite.mutate(invite, {
      onSuccess: (refreshed) => {
        setIsConfirmOpen(false);
        onRefreshed(refreshed);
        showToast(
          t("admin:adminInvites.refresh.doneToast", { code: invite.code }),
          "success",
        );
      },
      onError: (error) => {
        setIsConfirmOpen(false);
        showToast(
          isInviteNotRefreshableError(error)
            ? t("admin:adminInvites.refresh.movedOnToast")
            : t("admin:adminInvites.refresh.failedToast"),
          "error",
        );
      },
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={refreshInvite.isPending}
        onClick={() => setIsConfirmOpen(true)}
      >
        <FiRefreshCw aria-hidden /> {t("admin:adminInvites.refresh.cta")}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        tone="positive"
        loading={refreshInvite.isPending}
        title={t("admin:adminInvites.refresh.confirmTitle", {
          code: invite.code,
        })}
        confirmLabel={t("admin:adminInvites.refresh.confirmCta")}
      >
        <p>
          {t("admin:adminInvites.refresh.confirmBody", {
            name: invite.inviter.name,
          })}
        </p>
      </ConfirmDialog>
    </>
  );
}
