import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useTeamRole } from "../../admin/adminRole";
import { VjReasonLine } from "../VjReasonLine";
import { useStopVjLive } from "./useVjLiveStop";

/**
 * Asks before stopping every screen and remote. An Admin stops every
 * operator's show, so their dialog says so. On success the hook's toast
 * names what stopped and `onStopped` closes the dialog. Mount it inside
 * `AnimatePresence`.
 */
export function VjLiveStopDialog({
  onClose,
  onStopped,
}: {
  onClose: () => void;
  onStopped: () => void;
}) {
  const { t } = useTranslation();
  const { role } = useTeamRole();
  const stopEverything = useStopVjLive();
  const isAdmin = role === "admin";

  const confirm = () => {
    if (stopEverything.isPending) return;
    stopEverything.mutate(undefined, { onSuccess: onStopped });
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      title={t("vj:live.stopDialog.title")}
      description={
        isAdmin
          ? t("vj:live.stopDialog.bodyAdmin")
          : t("vj:live.stopDialog.body")
      }
      confirmLabel={t("vj:live.stopEverything")}
      loading={stopEverything.isPending}
      onClose={onClose}
      onConfirm={confirm}
    >
      <VjReasonLine error={stopEverything.error} />
    </ConfirmDialog>
  );
}
