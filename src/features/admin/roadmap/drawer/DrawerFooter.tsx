import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminModal } from "../../ui";
import styles from "./ItemDrawer.module.css";

/**
 * Save & publish / Archive / Delete. Create mode only ever shows the first
 * (there's nothing to archive or delete before it exists). Delete gets a
 * confirm step (`drawer.deleteConfirm.*`). Edit mode's Save no longer
 * force-publishes the item (see `useItemDrawerHandlers.ts`), so it reads
 * plain "Save" (`drawer.saveEditCta`) — only create mode's Save actually
 * publishes, keeping `drawer.saveCta`'s "Save & publish" wording honest.
 */
export function DrawerFooter({
  isCreate,
  pending,
  canSave,
  itemName,
  onSave,
  onArchive,
  onDelete,
}: {
  isCreate: boolean;
  pending: boolean;
  canSave: boolean;
  itemName: string;
  onSave: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <div className={styles.footRow}>
        <Button
          variant="primary"
          size="md"
          disabled={pending || !canSave}
          onClick={onSave}
        >
          {t(
            isCreate
              ? "admin:roadmap.drawer.saveCta"
              : "admin:roadmap.drawer.saveEditCta",
          )}
        </Button>
        {!isCreate && (
          <>
            <Button
              variant="ghost"
              size="md"
              disabled={pending}
              onClick={onArchive}
            >
              {t("admin:roadmap.drawer.archiveCta")}
            </Button>
            <span className={styles.footSpacer} />
            <Button
              variant="danger"
              size="md"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
            >
              {t("admin:common.delete")}
            </Button>
          </>
        )}
      </div>

      {confirmingDelete && (
        <AdminModal
          title={t("admin:roadmap.drawer.deleteConfirm.title", {
            name: itemName,
          })}
          onClose={() => setConfirmingDelete(false)}
          footer={
            <div className={styles.deleteConfirmActions}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setConfirmingDelete(false)}
              >
                {t("admin:common.cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setConfirmingDelete(false);
                  onDelete();
                }}
              >
                {t("admin:common.delete")}
              </Button>
            </div>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:roadmap.drawer.deleteConfirm.body")}
          </p>
        </AdminModal>
      )}
    </>
  );
}
