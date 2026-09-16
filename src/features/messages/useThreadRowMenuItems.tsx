import { useMemo, type ReactNode } from "react";
import {
  FiArchive,
  FiBell,
  FiBellOff,
  FiHeart,
  FiInbox,
  FiTrash2,
} from "react-icons/fi";
import {
  TbAt,
  TbMail,
  TbMailOpened,
  TbPin,
  TbPinnedFilled,
} from "react-icons/tb";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToggleMute, useToggleMuteMode } from "./api/useConversationPrefs";
import type { Conversation } from "./data";
import { resolveMuteState } from "./muteUntilLabel";

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
  /** Unmutes the thread. Muting itself (PRD-349's 8-hour/1-week/Always
   *  choices) is handled INSIDE this hook via its own `useToggleMute()` call
   *  (see this hook's own doc), so this handler only ever fires the
   *  already-muted -> unmuted direction. */
  onToggleMute: () => void;
  onToggleArchive: () => void;
  /** Marks read (reuses the real read-watermark mutation) when `isUnread` is
   *  true, or marks unread (PRD-225) when it's false. */
  onToggleReadUnread: () => void;
  /** Opens the delete-confirmation flow for this conversation. */
  onDelete: () => void;
}

const MUTE_8_HOURS_MS = 8 * 60 * 60 * 1000;
const MUTE_1_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Builds `ThreadRowMenu`'s item list, split out purely to keep that
 * component under the 200-line cap (this hook carries no state/effects of its
 * own beyond its own `useToggleMute()` mutation, just the memoized
 * definitions). Order mirrors WhatsApp/Telegram: the reversible preferences
 * first, the mark-read/unread toggle, then delete last (destructive).
 *
 * PRD-349: an unmuted thread offers three flat mute items (8 hours / 1 week /
 * always) rather than one "Mute" toggle. This hook fires its OWN
 * `useToggleMute()` call for those (with a computed `mutedUntil`) instead of
 * routing through `handlers.onToggleMute`, since the plain boolean handler
 * wired in from the thread row has no duration parameter to pass one
 * through. A muted thread instead shows a single combined status+action item
 * ("Muted until {time}", or "Muted" for an "Always" mute) that unmutes on
 * select: this flat APG menu has no non-interactive row type to show the
 * status separately from the action the way the open-conversation menu does.
 */
export function useThreadRowMenuItems(
  thread: Conversation,
  /** Whether the row is CURRENTLY showing as unread (real unread count OR a
   *  manual "mark unread", PRD-225). Decides the Mark as read/unread label,
   *  computed by the caller (`isThreadUnread`) so this stays in lockstep with
   *  the row's own badge. */
  isUnread: boolean,
  handlers: ThreadRowMenuHandlers,
): MenuItemDef[] {
  const { t } = useTranslation();
  const { mutate: setMuted } = useToggleMute();
  const { mutate: setMuteMode } = useToggleMuteMode();
  const isPinned = !!thread.pinnedAt;
  const isFavorite = !!thread.favorite;
  // PRD-349: the SAME expired-mute resolution the row's own bell indicator
  // uses (`muteUntilLabel.ts`, shared with `MessagesThreadRow`). An expired
  // `mutedUntil` reads as unmuted here too, so this menu offers Mute choices
  // again instead of a stale "Unmute" for a mute that already lifted.
  const {
    isMuted,
    mutedUntilTime,
    isMentionsOnly: isMentionsOnlyMuted,
  } = resolveMuteState(thread);
  const isArchived = !!thread.archivedAt;
  const conversationId = thread.id;
  const {
    onTogglePin,
    onToggleFavorite,
    onToggleMute,
    onToggleArchive,
    onToggleReadUnread,
    onDelete,
  } = handlers;

  const mutedStatusLabel = mutedUntilTime
    ? t("messages:thread.mutedUntil", { time: mutedUntilTime })
    : t("messages:thread.mutedAlways");

  return useMemo(() => {
    const muteItems: MenuItemDef[] = isMuted
      ? [
          {
            key: "mute",
            label: mutedStatusLabel,
            icon: <FiBellOff aria-hidden />,
            onSelect: onToggleMute,
          },
        ]
      : isMentionsOnlyMuted
        ? [
            {
              key: "mute-mentions-only",
              label: t("messages:thread.mutedMentionsOnly"),
              icon: <FiBellOff aria-hidden />,
              onSelect: () => setMuteMode({ conversationId, muteMode: "all" }),
            },
          ]
        : [
            {
              key: "mute-8h",
              label: t("messages:thread.muteFor8Hours"),
              icon: <FiBell aria-hidden />,
              onSelect: () =>
                setMuted({
                  conversationId,
                  muted: false,
                  mutedUntil: new Date(
                    Date.now() + MUTE_8_HOURS_MS,
                  ).toISOString(),
                }),
            },
            {
              key: "mute-1w",
              label: t("messages:thread.muteFor1Week"),
              icon: <FiBell aria-hidden />,
              onSelect: () =>
                setMuted({
                  conversationId,
                  muted: false,
                  mutedUntil: new Date(
                    Date.now() + MUTE_1_WEEK_MS,
                  ).toISOString(),
                }),
            },
            {
              key: "mute-always",
              label: t("messages:thread.muteAlways"),
              icon: <FiBell aria-hidden />,
              onSelect: () =>
                setMuted({ conversationId, muted: false, mutedUntil: null }),
            },
            {
              key: "mute-mentions-only",
              label: t("messages:thread.muteMentionsOnly"),
              icon: <TbAt aria-hidden />,
              onSelect: () =>
                setMuteMode({ conversationId, muteMode: "mentionsOnly" }),
            },
          ];
    return [
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
      ...muteItems,
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
    ];
  }, [
    isPinned,
    isFavorite,
    isMuted,
    isMentionsOnlyMuted,
    mutedStatusLabel,
    isArchived,
    isUnread,
    conversationId,
    setMuted,
    setMuteMode,
    onTogglePin,
    onToggleFavorite,
    onToggleMute,
    onToggleArchive,
    onToggleReadUnread,
    onDelete,
    t,
  ]);
}
