import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/** Delete confirmation for a forum/community post, built on the shared
 *  `ConfirmDialog` (destructive tone). Kept as a named wrapper so its three
 *  call sites (forum thread, forum page, community thread) mount it the same
 *  way — conditionally, with `busy` while the delete is in flight. */
export function ConfirmDeleteModal({
  busy,
  onConfirm,
  onClose,
}: {
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={busy}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("forum:deleteConfirm.title")}
      description={t("forum:deleteConfirm.body")}
      cancelLabel={t("forum:deleteConfirm.cancel")}
      confirmLabel={
        busy
          ? t("forum:deleteConfirm.deleting")
          : t("forum:deleteConfirm.confirm")
      }
    />
  );
}
