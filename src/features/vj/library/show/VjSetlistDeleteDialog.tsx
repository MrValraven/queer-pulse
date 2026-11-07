import type { VjSetlistDTO } from "../../../../shared/contracts/vj";
import { ConfirmDialog } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjSetlistMutations } from "../../api/useVjSetlistMutations";
import { VjReasonLine } from "../../VjReasonLine";

/** Asks before deleting a set list for good. Its scenes stay in the library;
 *  only the order that named them goes. */
export function VjSetlistDeleteDialog({
  setlist,
  onClose,
  onDeleted,
}: {
  setlist: VjSetlistDTO;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { deleteSetlist } = useVjSetlistMutations();

  const confirm = () => {
    if (deleteSetlist.isPending) return;
    deleteSetlist.mutate(
      { setlistId: setlist.id },
      {
        onSuccess: () => {
          showToast(
            t("vj:librarySetlists.deleted", { name: setlist.name }),
            "success",
          );
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
      title={t("vj:librarySetlists.deleteTitle", { name: setlist.name })}
      description={t("vj:librarySetlists.deleteBody")}
      confirmLabel={t("vj:librarySetlists.deleteConfirm")}
      loading={deleteSetlist.isPending}
      onClose={onClose}
      onConfirm={confirm}
    >
      <VjReasonLine error={deleteSetlist.error} />
    </ConfirmDialog>
  );
}
