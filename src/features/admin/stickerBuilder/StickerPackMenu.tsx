import { useEffect, useId, useRef, useState } from "react";
import { FiArchive, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { ConfirmDialog, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import styles from "./StickerPackMenu.module.css";

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

type PendingConfirm = "archive" | "delete" | null;

/**
 * The pack header's overflow menu: the two rarely used, hard-to-undo actions
 * kept out of the header's single status button. "Archive pack" shows for any
 * pack that is not archived yet; "Delete pack" only for a draft, because the
 * backend refuses to delete a pack that is published or archived right now
 * (archive is the withdrawal path for those). With neither available the
 * trigger is not rendered at all.
 *
 * While a publish run writes to this pack, both items stay in the menu as
 * `aria-disabled`, with the reason printed under them and tied to each item
 * through `aria-describedby`.
 *
 * The APG menu-button pattern of the roadmap board's `CardMenu`: outside-click
 * and Escape close, first item focused on open, and ArrowUp/ArrowDown/Home/End
 * walk the items (matching the sticker tile menu's `StickerTileMenu`). Each
 * item opens its own `ConfirmDialog`, which closes as soon as the admin
 * confirms; the caller owns the mutation and its toasts.
 */
export function StickerPackMenu({
  pack,
  onArchive,
  onDeletePack,
  isMutating,
  isRunWriting = false,
}: {
  pack: AdminStickerPackResponse;
  onArchive: () => void;
  onDeletePack: () => void;
  isMutating: boolean;
  /** A publish run is writing to this pack: archive and delete wait. */
  isRunWriting?: boolean;
}) {
  const { t } = useTranslation();
  const runLockReasonId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canArchive = pack.status !== "archived";
  const canDelete = pack.status === "draft";
  const stickerCount = pack.stickers.length;

  useEffect(() => {
    if (!isOpen) return;
    const menuItems = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ??
          [],
      );
    menuItems()[0]?.focus();

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        setIsOpen(false);
        return;
      }
      const items = menuItems();
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const lastIndex = items.length - 1;
      const nextIndexByKey: Record<string, number> = {
        ArrowDown: currentIndex >= lastIndex ? 0 : currentIndex + 1,
        ArrowUp: currentIndex <= 0 ? lastIndex : currentIndex - 1,
        Home: 0,
        End: lastIndex,
      };
      const nextIndex = nextIndexByKey[event.key];
      if (nextIndex === undefined) return;
      event.preventDefault();
      items[nextIndex]?.focus();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!canArchive && !canDelete) return null;

  function openConfirm(confirm: Exclude<PendingConfirm, null>) {
    if (isRunWriting) return;
    // The menu item is about to unmount, so hand focus back to the trigger
    // first: the dialog restores focus to whatever held it when it opened.
    triggerRef.current?.focus();
    setIsOpen(false);
    setPendingConfirm(confirm);
  }

  function closeConfirm() {
    setPendingConfirm(null);
  }

  return (
    <div className={styles.wrap} ref={containerRef}>
      <IconButton
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("admin:stickerPacks.header.menu.triggerLabel", {
          name: pack.name,
        })}
        onClick={() => setIsOpen((current) => !current)}
      >
        <FiMoreHorizontal aria-hidden />
      </IconButton>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.items} role="menu" ref={menuRef}>
            {canArchive && (
              <button
                type="button"
                role="menuitem"
                className={styles.item}
                aria-disabled={isRunWriting || undefined}
                aria-describedby={isRunWriting ? runLockReasonId : undefined}
                onClick={() => openConfirm("archive")}
              >
                <FiArchive className={styles.itemIcon} aria-hidden />
                {t("admin:stickerPacks.header.menu.archive")}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                role="menuitem"
                className={[styles.item, styles.itemDanger].join(" ")}
                aria-disabled={isRunWriting || undefined}
                aria-describedby={isRunWriting ? runLockReasonId : undefined}
                onClick={() => openConfirm("delete")}
              >
                <FiTrash2 className={styles.itemIcon} aria-hidden />
                {t("admin:stickerPacks.header.menu.delete")}
              </button>
            )}
          </div>
          {/* Outside the `menu` role, which may own only its items. */}
          {isRunWriting && (
            <p id={runLockReasonId} className={styles.lockReason}>
              {t("admin:stickerPacks.header.menu.runLocked")}
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={pendingConfirm === "archive"}
        onClose={closeConfirm}
        onConfirm={() => {
          closeConfirm();
          onArchive();
        }}
        tone="destructive"
        loading={isMutating}
        initialFocus="cancel"
        title={t("admin:stickerPacks.header.archiveConfirm.title", {
          name: pack.name,
        })}
        description={t("admin:stickerPacks.header.archiveConfirm.body")}
        confirmLabel={t("admin:stickerPacks.header.menu.archive")}
      />

      <ConfirmDialog
        open={pendingConfirm === "delete"}
        onClose={closeConfirm}
        onConfirm={() => {
          closeConfirm();
          onDeletePack();
        }}
        tone="destructive"
        loading={isMutating}
        initialFocus="cancel"
        title={t("admin:stickerPacks.header.deleteConfirm.title", {
          name: pack.name,
        })}
        description={
          stickerCount === 0
            ? t("admin:stickerPacks.header.deleteConfirm.bodyEmpty")
            : t("admin:stickerPacks.header.deleteConfirm.body", {
                count: stickerCount,
              })
        }
        confirmLabel={t("admin:stickerPacks.header.menu.delete")}
      />
    </div>
  );
}
