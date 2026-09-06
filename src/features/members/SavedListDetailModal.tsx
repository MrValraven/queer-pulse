import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiEdit2, FiBookmark, FiTrash2, FiX } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  Modal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useFocusOnMount } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import type { SavedListDTO } from "./api/SavedLists.api";
import { SavedListShareControls } from "./SavedListShareControls";
import { SavedUnavailableNote } from "./SavedUnavailableNote";
import styles from "./SavedListDetailModal.module.css";

/** The inline rename field. Its own component so `useFocusOnMount` runs when
 *  the field actually appears: the member asked for it, so focus belongs in it. */
function SavedListRenameForm({
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
        // A rejected rename keeps the field open (the action already toasted),
        // so the member can retry without retyping.
        void onSave(draftName).catch(() => undefined);
      }}
    >
      <label className={styles.renameLabel} htmlFor="saved-list-rename">
        {t("members:savedLists.detail.renameLabel")}
      </label>
      <div className={styles.renameRow}>
        <input
          id="saved-list-rename"
          ref={nameFieldRef}
          type="text"
          maxLength={60}
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          disabled={isSaving}
        />
        <Button type="submit" size="sm" disabled={!canSave}>
          <FiCheck aria-hidden /> {t("members:savedLists.detail.renameSave")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSaving}
          onClick={onCancel}
        >
          <FiX aria-hidden /> {t("members:savedLists.detail.renameCancel")}
        </Button>
      </div>
    </form>
  );
}

/** One filed item. Links out where the save carried an href AND the API still
 *  reports the subject openable, and offers the unfile control only where
 *  taking it out of this list is allowed. An unavailable item keeps its title
 *  and meta and drops the link, so nobody is sent to a not-found page. */
function SavedListItemRow({
  item,
  onRemove,
  onNavigate,
}: {
  item: SavedItem;
  onRemove?: () => void;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const isUnavailable = isSavedItemUnavailable(item);
  const canOpen = !isUnavailable && Boolean(item.href);

  return (
    <div
      className={`${styles.row}${isUnavailable ? ` ${styles.rowUnavailable}` : ""}`}
    >
      <span className={styles.rowBadge}>
        {item.kind.slice(0, 3).toUpperCase()}
      </span>
      <div className={styles.rowInfo}>
        {canOpen && item.href ? (
          <Link
            to={linkToPath(item.href)}
            className={styles.rowTitle}
            onClick={onNavigate}
          >
            {item.title}
          </Link>
        ) : (
          <span className={styles.rowTitle}>{item.title}</span>
        )}
        {item.meta && <span className={styles.rowMeta}>{item.meta}</span>}
        {isUnavailable && (
          <SavedUnavailableNote shouldShowRemoveHint={Boolean(onRemove)} />
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          className={styles.rowRemove}
          onClick={onRemove}
          aria-label={t("members:savedLists.detail.removeItem", {
            title: item.title,
          })}
        >
          <FiX aria-hidden />
        </button>
      )}
    </div>
  );
}

/**
 * Read one saved list: its items, its share state, and its lifecycle actions.
 *
 * The DEFAULT list is handled differently on two counts, matching the API
 * rather than second-guessing it. Items cannot be pulled out of it (unsaving is
 * what removes them, which the note in the body says), and it cannot be
 * deleted. It can still be renamed and still be shared: it is the member's own
 * shelf, and "Saved" is only the name it was born with.
 */
export function SavedListDetailModal({
  list,
  items,
  areItemsLoading,
  onClose,
  onRename,
  onDelete,
  onRemoveItem,
  onShare,
  onRevoke,
  isRenaming = false,
  isDeleting = false,
  isSharing = false,
  isRevoking = false,
}: {
  list: SavedListDTO;
  items: SavedItem[];
  areItemsLoading: boolean;
  onClose: () => void;
  onRename: (nextName: string) => Promise<void>;
  onDelete: () => void;
  onRemoveItem: (ref: string) => void;
  onShare: () => void;
  onRevoke: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
  isSharing?: boolean;
  isRevoking?: boolean;
}) {
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const title = isEditingName ? (
    <SavedListRenameForm
      initialName={list.name}
      isSaving={isRenaming}
      onSave={async (nextName) => {
        await onRename(nextName);
        setIsEditingName(false);
      }}
      onCancel={() => setIsEditingName(false)}
    />
  ) : (
    <span className={styles.titleRow}>
      {list.name}
      <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>
        <FiEdit2 aria-hidden /> {t("members:savedLists.detail.rename")}
      </Button>
    </span>
  );

  return (
    <Modal
      title={title}
      eyebrow={
        list.isShared
          ? t("members:savedLists.state.shared")
          : t("members:savedLists.state.private")
      }
      onClose={onClose}
      wide
      footer={
        <div className={styles.footRow}>
          {list.isDefault ? (
            <span />
          ) : (
            <Button
              variant="ghost"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isDeleting}
            >
              <FiTrash2 aria-hidden /> {t("members:savedLists.detail.delete")}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            {t("members:savedLists.detail.close")}
          </Button>
        </div>
      }
    >
      {list.isDefault && (
        <p className={styles.defaultNote}>
          {t("members:savedLists.detail.defaultNote")}
        </p>
      )}

      {areItemsLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_unused, index) => (
            <SkeletonLine key={index} height={54} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <FiBookmark aria-hidden />
          <p>{t("members:savedLists.detail.empty")}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <SavedListItemRow
              key={item.id}
              item={item}
              onNavigate={onClose}
              onRemove={
                list.isDefault ? undefined : () => onRemoveItem(item.id)
              }
            />
          ))}
        </div>
      )}

      <SavedListShareControls
        list={list}
        onShare={onShare}
        onRevoke={onRevoke}
        isSharing={isSharing}
        isRevoking={isRevoking}
      />

      <ConfirmDialog
        open={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() => {
          onDelete();
          setIsConfirmingDelete(false);
        }}
        title={t("members:savedLists.detail.deleteConfirm.title", {
          name: list.name,
        })}
        description={t("members:savedLists.detail.deleteConfirm.body")}
        confirmLabel={t("members:savedLists.detail.deleteConfirm.cta")}
        tone="destructive"
        loading={isDeleting}
      />
    </Modal>
  );
}
