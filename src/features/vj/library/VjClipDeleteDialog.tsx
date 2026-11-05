import type { VjClipDTO } from "../../../shared/contracts/vj";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDeleteVjClip } from "../api/useVjClipMutations";
import { VjReasonLine } from "../VjReasonLine";

/** Asks before deleting a clip for good, and says how many packs it leaves. */
export function VjClipDeleteDialog({
  clip,
  onClose,
  onDeleted,
}: {
  clip: VjClipDTO;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const deleteClip = useDeleteVjClip();

  const confirm = () => {
    if (deleteClip.isPending) return;
    deleteClip.mutate(
      { clipId: clip.id },
      {
        onSuccess: () => {
          showToast(t("vj:clipDelete.toast", { title: clip.title }), "success");
          onDeleted();
        },
      },
    );
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      title={t("vj:clipDelete.title", { title: clip.title })}
      description={
        clip.packCount === 0
          ? t("vj:clipDelete.bodyNone")
          : t("vj:clipDelete.body", { count: clip.packCount })
      }
      confirmLabel={t("vj:clipDelete.confirm")}
      loading={deleteClip.isPending}
      onClose={onClose}
      onConfirm={confirm}
    >
      <VjReasonLine error={deleteClip.error} />
    </ConfirmDialog>
  );
}
