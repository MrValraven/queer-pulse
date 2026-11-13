import type { VjClipDTO } from "../../../shared/contracts/vj";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDeleteVjClip } from "../api/useVjClipMutations";
import { useVjSetlists } from "../api/useVjSetlists";
import { VjReasonLine } from "../VjReasonLine";

/** Asks before deleting a clip for good, and says how many packs it leaves
 *  and, when it plays in sequences, which sequences lose how many steps. The
 *  sequence names come from the set list read; until it answers, the note
 *  gives the step count alone. */
export function VjClipDeleteDialog({
  clip,
  onClose,
  onDeleted,
}: {
  clip: VjClipDTO;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const deleteClip = useDeleteVjClip();
  const setlistsQuery = useVjSetlists({
    isEnabled: clip.setlistItemCount > 0,
  });
  const setlistNames = (setlistsQuery.data ?? [])
    .filter((setlist) => setlist.items.some((item) => item.clipId === clip.id))
    .map((setlist) => setlist.name);
  const setlistNote =
    setlistNames.length === 0
      ? t("vj:clipDelete.setlistNote", { count: clip.setlistItemCount })
      : t("vj:clipDelete.setlistNoteNamed", {
          count: clip.setlistItemCount,
          names: new Intl.ListFormat(intlLocale(language), {
            style: "long",
            type: "conjunction",
          }).format(setlistNames),
        });

  const packBody =
    clip.packCount === 0
      ? t("vj:clipDelete.bodyNone")
      : t("vj:clipDelete.body", { count: clip.packCount });

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
        clip.setlistItemCount === 0 ? (
          packBody
        ) : (
          <>
            {packBody}
            {/* Its own paragraph, a line apart, inside the dialog's
                description. */}
            <span
              style={{ display: "block", marginBlockStart: "var(--gap-xs)" }}
            >
              {setlistNote}
            </span>
          </>
        )
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
