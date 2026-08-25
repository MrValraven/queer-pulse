import { useState } from "react";
import { FiCheck, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useFocusOnMount } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Collection } from "./collections.data";
import styles from "./CollectionsModals.module.css";

/**
 * The inline rename field. A component of its own (rather than a branch inside
 * `CollectionTitleRow`) so `useFocusOnMount` runs when the field actually
 * appears — the member asked for it, so focus belongs in it.
 */
function CollectionRenameForm({
  initialName,
  isSaving,
  onSave,
  onCancel,
}: {
  initialName: string;
  isSaving: boolean;
  onSave: (nextName: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [draftName, setDraftName] = useState(initialName);
  const nameFieldRef = useFocusOnMount<HTMLInputElement>();
  const canSave = draftName.trim().length > 0 && !isSaving;

  return (
    <form
      className={styles.renameForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        // A rejected rename keeps the field open (the controller already
        // toasted), so the member can retry without retyping.
        void onSave(draftName).catch(() => undefined);
      }}
    >
      <label className={styles.renameLabel} htmlFor="collection-rename">
        {t("members:collections.modal.view.renameLabel")}
      </label>
      <div className={styles.renameRow}>
        <input
          id="collection-rename"
          ref={nameFieldRef}
          type="text"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          disabled={isSaving}
        />
        <Button type="submit" size="sm" disabled={!canSave}>
          <FiCheck aria-hidden />{" "}
          {t("members:collections.modal.view.renameSave")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSaving}
          onClick={onCancel}
        >
          <FiX aria-hidden /> {t("members:collections.modal.view.renameCancel")}
        </Button>
      </div>
    </form>
  );
}

/**
 * The collection title inside `ViewCollectionModal`, with an inline rename.
 * Reading mode shows the name plus a "Rename" affordance; editing mode swaps in
 * the field above. The rename is only offered when the caller supplies
 * `onRename`, so a read-only rendering of the modal stays read-only.
 */
export function CollectionTitleRow({
  collection,
  onRename,
  isRenaming = false,
}: {
  collection: Collection;
  onRename?: (nextName: string) => Promise<void>;
  isRenaming?: boolean;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  if (!onRename) {
    return <h2 className={styles.title}>{collection.name}</h2>;
  }

  if (isEditing) {
    return (
      <CollectionRenameForm
        initialName={collection.plainName}
        isSaving={isRenaming}
        onSave={async (nextName) => {
          await onRename(nextName);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={styles.titleRow}>
      <h2 className={styles.title}>{collection.name}</h2>
      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
        <FiEdit2 aria-hidden /> {t("members:collections.modal.view.rename")}
      </Button>
    </div>
  );
}

/**
 * "Delete collection", behind a destructive `ConfirmDialog`. Deleting only
 * unfiles: the saved items themselves stay in the member's saves, which the
 * confirm copy says plainly so nobody loses something they meant to keep.
 */
export function DeleteCollectionAction({
  collection,
  onDelete,
  isDeleting = false,
}: {
  collection: Collection;
  onDelete: (collectionId: string) => Promise<void>;
  isDeleting?: boolean;
}) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isDeleting}
      >
        <FiTrash2 aria-hidden /> {t("members:collections.modal.view.delete")}
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          // A failure toasts from the controller and leaves the collection
          // where it is; the confirm closes either way.
          void onDelete(collection.id).catch(() => undefined);
          setIsConfirmOpen(false);
        }}
        title={t("members:collections.modal.view.deleteConfirm.title", {
          name: collection.plainName,
        })}
        description={t("members:collections.modal.view.deleteConfirm.body")}
        confirmLabel={t("members:collections.modal.view.deleteConfirm.cta")}
        tone="destructive"
        loading={isDeleting}
      />
    </>
  );
}
