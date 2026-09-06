import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/** What is about to come down. `"post"` (the default, and what every existing
 *  call site means) is one post inside a thread: it is hidden and can be
 *  restored. `"thread"` is the whole forum thread (PRD-160), which is a
 *  different promise entirely and needs copy that says so. */
export type ConfirmDeleteSubject = "post" | "thread";

/** Delete confirmation for a forum/community post, built on the shared
 *  `ConfirmDialog` (destructive tone). Kept as a named wrapper so its call
 *  sites (forum thread, forum page, community thread, community pulse) mount it
 *  the same way: conditionally, with `busy` while the delete is in flight.
 *
 *  `subject` picks the copy. It defaults to `"post"`, so every call site that
 *  tombstones a single post keeps exactly the wording it had. Both key sets are
 *  written out in full rather than built from a prefix, so a catalog grep for
 *  either one still finds its use. */
export function ConfirmDeleteModal({
  busy,
  subject = "post",
  onConfirm,
  onClose,
}: {
  busy: boolean;
  subject?: ConfirmDeleteSubject;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isThread = subject === "thread";

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={busy}
      onClose={onClose}
      onConfirm={onConfirm}
      title={
        isThread
          ? t("forum:deleteThread.title")
          : t("forum:deleteConfirm.title")
      }
      description={
        isThread ? t("forum:deleteThread.body") : t("forum:deleteConfirm.body")
      }
      cancelLabel={
        isThread
          ? t("forum:deleteThread.cancel")
          : t("forum:deleteConfirm.cancel")
      }
      confirmLabel={
        busy
          ? isThread
            ? t("forum:deleteThread.deleting")
            : t("forum:deleteConfirm.deleting")
          : isThread
            ? t("forum:deleteThread.confirm")
            : t("forum:deleteConfirm.confirm")
      }
    />
  );
}
