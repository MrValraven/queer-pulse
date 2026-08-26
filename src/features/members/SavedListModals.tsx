import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Modal, Spinner } from "../../shared/components/ui";
import { useFocusOnMount } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SavedItem } from "../../app/providers/useSaved";
import type { SavedListDTO } from "./api/SavedLists.api";
import styles from "./SavedListModals.module.css";

/**
 * Name a new list.
 *
 * There is no visibility control here on purpose. A new list is private, full
 * stop, and it becomes shareable only when the member opens it and reads what a
 * link means. The collections modal this replaces offered a Private / Shared /
 * Public select in demo mode for a backend that had no visibility field at all,
 * which is exactly the kind of promise this product should not make.
 */
export function SavedListNewModal({
  onClose,
  onCreate,
  isCreating = false,
}: {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isCreating?: boolean;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const nameFieldRef = useFocusOnMount<HTMLInputElement>();
  const canCreate = name.trim().length > 0 && !isCreating;

  return (
    <Modal
      title={t("members:savedLists.new.title")}
      eyebrow={t("members:savedLists.new.eyebrow")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("members:savedLists.new.cancel")}
          </Button>
          <Button
            type="submit"
            form="saved-list-new-form"
            disabled={!canCreate}
          >
            {t("members:savedLists.new.submit")}
          </Button>
        </>
      }
    >
      <form
        id="saved-list-new-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canCreate) return;
          void onCreate(name).catch(() => undefined);
        }}
      >
        <div className={styles.field}>
          <label htmlFor="saved-list-new-name">
            {t("members:savedLists.new.nameLabel")}
          </label>
          <input
            id="saved-list-new-name"
            ref={nameFieldRef}
            type="text"
            maxLength={60}
            placeholder={t("members:savedLists.new.namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <p className={styles.note}>{t("members:savedLists.new.privateNote")}</p>
      </form>
    </Modal>
  );
}

/**
 * Pick which list to file a saved thing into.
 *
 * The success state is gated on the write, never on the click: `onFile` returns
 * the mutation's promise, the pressed row spins while it is in flight, and only
 * a resolved promise swaps this to the confirmation. A rejected one leaves the
 * picker open so the member can retry or choose somewhere else.
 *
 * The default list is not offered. Everything saved is already in it, so
 * "add it to Saved" would be a button that does nothing.
 */
export function SavedListFileModal({
  item,
  lists,
  onClose,
  onFile,
}: {
  item: SavedItem;
  lists: SavedListDTO[];
  onClose: () => void;
  onFile: (listId: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [filedListId, setFiledListId] = useState<string | null>(null);
  const [pendingListId, setPendingListId] = useState<string | null>(null);

  const handlePick = async (listId: string) => {
    if (pendingListId) return;
    setPendingListId(listId);
    try {
      await onFile(listId);
      setFiledListId(listId);
    } catch {
      // Already toasted upstream. Stay on the picker.
    } finally {
      setPendingListId(null);
    }
  };

  if (filedListId) {
    const filedList = lists.find((list) => list.id === filedListId);
    return (
      <Modal
        title={t("members:savedLists.file.success.title")}
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {t("members:savedLists.file.success.done")}
          </Button>
        }
      >
        <p className={styles.note}>
          {t("members:savedLists.file.success.body", {
            name: filedList?.name ?? "",
          })}
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={t("members:savedLists.file.title")}
      eyebrow={t("members:savedLists.file.eyebrow")}
      sub={item.title}
      onClose={onClose}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("members:savedLists.file.cancel")}
        </Button>
      }
    >
      {lists.length === 0 ? (
        <p className={styles.emptyPick}>{t("members:savedLists.file.empty")}</p>
      ) : (
        <div className={styles.pickList}>
          {lists.map((list) => {
            const isPending = pendingListId === list.id;
            return (
              <button
                key={list.id}
                type="button"
                className={styles.pick}
                disabled={pendingListId !== null}
                aria-busy={isPending || undefined}
                onClick={() => void handlePick(list.id)}
              >
                <span className={styles.pickCount}>{list.itemCount}</span>
                <span>
                  <span className={styles.pickName}>{list.name}</span>
                  <span className={styles.pickMeta}>
                    {isPending
                      ? t("members:savedLists.file.filing")
                      : list.isShared
                        ? t("members:savedLists.state.shared")
                        : t("members:savedLists.state.private")}
                  </span>
                </span>
                {isPending ? (
                  <Spinner className={styles.pickAdd} />
                ) : (
                  <FiPlus aria-hidden className={styles.pickAdd} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
