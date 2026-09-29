import { useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DeskView } from "../api/deskViews.api";
import { DeskViewsManageRow } from "./DeskViewsManageRow";
import modalStyles from "./DeskModals.module.css";
import styles from "./DeskViews.module.css";

export interface DeskViewsManageModalProps {
  views: DeskView[];
  onClose: () => void;
  /** Resolve on success; reject with the request's error. */
  onRename: (id: string, name: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

/**
 * The editor's saved views as a list to tidy: rename in place, delete after
 * a confirmation. Views are personal, so the dialog says so and nothing here
 * touches a piece.
 *
 * Deleting removes the row that opened the confirmation, so once the list
 * no longer holds the deleted view, focus goes to the list itself. The
 * failure toast comes from `useDeskViews`; the confirmation stays open for
 * a retry.
 */
export function DeskViewsManageModal({
  views,
  onClose,
  onRename,
  onRemove,
}: DeskViewsManageModalProps) {
  const { t } = useTranslation();
  const [pendingDelete, setPendingDelete] = useState<DeskView | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const listRegionRef = useRef<HTMLDivElement>(null);
  const removedViewIdRef = useRef<string | null>(null);

  useEffect(() => {
    const removedViewId = removedViewIdRef.current;
    if (removedViewId === null) return;
    if (views.some((view) => view.id === removedViewId)) return;
    removedViewIdRef.current = null;
    listRegionRef.current?.focus();
    // `pendingDelete` too: when the list refreshed before the confirmation
    // closed, this runs after the confirmation hands focus back.
  }, [views, pendingDelete]);

  async function confirmDelete(): Promise<void> {
    if (pendingDelete === null || isDeleting) return;
    setIsDeleting(true);
    try {
      await onRemove(pendingDelete.id);
      removedViewIdRef.current = pendingDelete.id;
      setPendingDelete(null);
    } catch {
      // `useDeskViews` has already said so in a toast.
    } finally {
      setIsDeleting(false);
    }
  }

  const isNameTakenBy = (viewId: string) => (name: string) =>
    views.some((view) => view.id !== viewId && view.name === name);

  return (
    <>
      <Modal
        title={t("magazine:desk.views.manageTitle")}
        sub={t("magazine:desk.views.manageSub")}
        onClose={onClose}
        footer={
          <div className={modalStyles.actions}>
            <Button variant="ghost" onClick={onClose}>
              {t("magazine:desk.views.done")}
            </Button>
          </div>
        }
      >
        <div
          ref={listRegionRef}
          tabIndex={-1}
          className={styles.listRegion}
          aria-label={t("magazine:desk.views.heading")}
          role="region"
        >
          {views.length === 0 ? (
            <p className={styles.empty}>
              {t("magazine:desk.views.manageEmpty")}
            </p>
          ) : (
            <ul className={styles.list}>
              {views.map((view) => (
                <DeskViewsManageRow
                  key={view.id}
                  view={view}
                  isNameTaken={isNameTakenBy(view.id)}
                  onRename={onRename}
                  onDelete={setPendingDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={pendingDelete !== null}
        tone="destructive"
        loading={isDeleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        title={t("magazine:desk.views.deleteTitle", {
          name: pendingDelete?.name ?? "",
        })}
        description={t("magazine:desk.views.deleteBody")}
        confirmLabel={t("magazine:desk.views.deleteConfirm")}
      />
    </>
  );
}
