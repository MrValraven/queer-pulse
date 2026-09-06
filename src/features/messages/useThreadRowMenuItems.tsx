import { useMemo, type ReactNode } from "react";
import {
  FiArchive,
  FiBell,
  FiBellOff,
  FiHeart,
  FiInbox,
  FiTrash2,
} from "react-icons/fi";
import { TbMail, TbMailOpened, TbPin, TbPinnedFilled } from "react-icons/tb";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";

export interface MenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

export interface ThreadRowMenuHandlers {
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  /** Marks read (reuses the real read-watermark mutation) when `isUnread` is
   *  true, or marks unread (PRD-225) when it's false. */
  onToggleReadUnread: () => void;
  /** Opens the delete-confirmation flow for this conversation. */
  onDelete: () => void;
}

/**
 * Builds `ThreadRowMenu`'s item list — split out purely to keep that
 * component under the 200-line cap (this hook carries no state/effects of its
 * own, just the memoized definitions). Order mirrors WhatsApp/Telegram: the
 * reversible preferences first, the mark-read/unread toggle, then delete last
 * (destructive).
 */
export function useThreadRowMenuItems(
  thread: Conversation,
  /** Whether the row is CURRENTLY showing as unread (real unread count OR a
   *  manual "mark unread", PRD-225) — decides the Mark as read/unread label,
   *  computed by the caller (`isThreadUnread`) so this stays in lockstep with
   *  the row's own badge. */
  isUnread: boolean,
  handlers: ThreadRowMenuHandlers,
): MenuItemDef[] {
  const { t } = useTranslation();
  const isPinned = !!thread.pinnedAt;
  const isFavorite = !!thread.favorite;
  const isMuted = !!thread.muted;
  const isArchived = !!thread.archivedAt;
  const {
    onTogglePin,
    onToggleFavorite,
    onToggleMute,
    onToggleArchive,
    onToggleReadUnread,
    onDelete,
  } = handlers;

  return useMemo(
    () => [
      {
        key: "pin",
        label: isPinned
          ? t("messages:thread.unpinChat")
          : t("messages:thread.pinChat"),
        icon: isPinned ? <TbPinnedFilled aria-hidden /> : <TbPin aria-hidden />,
        onSelect: onTogglePin,
      },
      {
        key: "favorite",
        label: isFavorite
          ? t("messages:thread.unfavoriteChat")
          : t("messages:thread.favoriteChat"),
        icon: <FiHeart aria-hidden />,
        onSelect: onToggleFavorite,
      },
      {
        key: "mute",
        label: isMuted
          ? t("messages:thread.unmuteChat")
          : t("messages:thread.muteChat"),
        icon: isMuted ? <FiBellOff aria-hidden /> : <FiBell aria-hidden />,
        onSelect: onToggleMute,
      },
      {
        key: "archive",
        label: isArchived
          ? t("messages:thread.unarchiveChat")
          : t("messages:thread.archiveChat"),
        icon: isArchived ? <FiInbox aria-hidden /> : <FiArchive aria-hidden />,
        onSelect: onToggleArchive,
      },
      {
        key: "readUnread",
        label: isUnread
          ? t("messages:thread.markRead")
          : t("messages:thread.markUnread"),
        icon: isUnread ? <TbMailOpened aria-hidden /> : <TbMail aria-hidden />,
        onSelect: onToggleReadUnread,
      },
      {
        key: "delete",
        label: t("messages:thread.deleteChat"),
        icon: <FiTrash2 aria-hidden />,
        onSelect: onDelete,
        danger: true,
      },
    ],
    [
      isPinned,
      isFavorite,
      isMuted,
      isArchived,
      isUnread,
      onTogglePin,
      onToggleFavorite,
      onToggleMute,
      onToggleArchive,
      onToggleReadUnread,
      onDelete,
      t,
    ],
  );
}
