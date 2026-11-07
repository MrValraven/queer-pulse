import type { VjSceneDTO } from "../../../../shared/contracts/vj";
import { ConfirmDialog } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjSceneMutations } from "../../api/useVjSceneMutations";
import { VjReasonLine } from "../../VjReasonLine";

/**
 * Asks before deleting a scene for good, and says how many set list spots go
 * with it. Mount it inside `AnimatePresence`; the row folds away once the
 * scene leaves the cache.
 */
export function VjSceneDeleteDialog({
  scene,
  onClose,
  onDeleted,
}: {
  scene: VjSceneDTO;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { deleteScene } = useVjSceneMutations();

  const confirm = () => {
    if (deleteScene.isPending) return;
    // The answer resolves even while the row folds away, so the toast always
    // lands; a refusal stays on `deleteScene.error` for the reason line.
    void deleteScene
      .mutateAsync({ sceneId: scene.id })
      .then(() => {
        showToast(
          t("vj:libraryScenes.deleted", { name: scene.name }),
          "success",
        );
        onDeleted();
      })
      .catch(() => undefined);
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      title={t("vj:libraryScenes.deleteTitle", { name: scene.name })}
      description={
        scene.setlistItemCount === 0
          ? t("vj:libraryScenes.deleteBody")
          : t("vj:libraryScenes.deleteBodySetlists", {
              count: scene.setlistItemCount,
            })
      }
      confirmLabel={t("vj:libraryScenes.deleteConfirm")}
      loading={deleteScene.isPending}
      onClose={onClose}
      onConfirm={confirm}
    >
      <VjReasonLine error={deleteScene.error} />
    </ConfirmDialog>
  );
}
