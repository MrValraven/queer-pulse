import { useState } from "react";
import { FiSlash } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRevokeJoinRequestInvite } from "./api/useRevokeJoinRequestInvite";
import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * The decided row's one destructive action: switch off an approval's invite
 * link while it still works, for a link that went to the wrong person or was
 * shared somewhere it should not be. Offered only while the invite reads
 * `valid`, since a used, expired or revoked link has nothing left to revoke
 * and the backend answers those with a 409.
 *
 * The confirm goes through the shared `ConfirmDialog` in its destructive tone
 * and names the applicant, so nobody revokes the wrong row from muscle memory.
 * Revoking is final: a revoked link cannot be reissued, and the dialog says
 * so. A 409 gets its own calm message, because the link simply changed state
 * while the row sat open.
 */
export function JoinRequestRevokeInviteAction({
  item,
}: {
  item: JoinRequestView;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const revokeInvite = useRevokeJoinRequestInvite();

  if (item.inviteStatus !== "valid") return null;

  const handleConfirm = () => {
    revokeInvite.mutate(
      { id: item.id },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          showToast(
            t("admin:members.verify.invite.revoke.doneToast", {
              email: item.email,
            }),
            "success",
          );
        },
        onError: (error) => {
          setIsConfirmOpen(false);
          const isAlreadyChanged =
            error instanceof ApiError && error.status === 409;
          showToast(
            isAlreadyChanged
              ? t("admin:members.verify.invite.revoke.movedOnToast")
              : t("admin:members.verify.invite.revoke.failedToast"),
            "error",
          );
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="danger"
        size="md"
        disabled={revokeInvite.isPending}
        onClick={() => setIsConfirmOpen(true)}
      >
        <FiSlash aria-hidden />
        {t("admin:members.verify.invite.revoke.cta")}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        tone="destructive"
        initialFocus="cancel"
        loading={revokeInvite.isPending}
        title={t("admin:members.verify.invite.revoke.confirmTitle", {
          name: item.name,
        })}
        confirmLabel={t("admin:members.verify.invite.revoke.confirmCta")}
      >
        <p>
          {t("admin:members.verify.invite.revoke.confirmBody", {
            email: item.email,
          })}
        </p>
      </ConfirmDialog>
    </>
  );
}
