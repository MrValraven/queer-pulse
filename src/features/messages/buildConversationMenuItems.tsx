// src/features/messages/buildConversationMenuItems.tsx
import type { ReactNode } from "react";
import { FiFlag, FiGrid, FiImage, FiSlash, FiUsers } from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import type { ConversationSafetyTarget } from "./ConversationMenu";

export interface MenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

interface BuildConversationMenuItemsParams {
  t: TFunction;
  name: string;
  onOpenMediaGallery?: (trigger?: HTMLElement | null) => void;
  /** Lazy on purpose: read at click time, once the kebab's own trigger
   *  button ref (`ConversationMenu`'s `triggerRef`) has actually mounted. */
  getMediaTrigger: () => HTMLElement | null;
  onOpenWallpaper: () => void;
  muteItems: MenuItemDef[];
  groupReportItems: MenuItemDef[];
  safety?: ConversationSafetyTarget;
  blocked: boolean;
  onBeginBlock: () => void;
  onManageBlockedMembers: () => void;
  onOpenReport: () => void;
}

/**
 * Builds the `ConversationMenu`'s flat item list: media gallery (if wired),
 * wallpaper, the mute items, the group-only report item, then (DM-only)
 * block/blocked-members/report. Split out purely to keep that orchestrator
 * under the size cap; no behaviour changed from the inline version it
 * replaces.
 */
export function buildConversationMenuItems({
  t,
  name,
  onOpenMediaGallery,
  getMediaTrigger,
  onOpenWallpaper,
  muteItems,
  groupReportItems,
  safety,
  blocked,
  onBeginBlock,
  onManageBlockedMembers,
  onOpenReport,
}: BuildConversationMenuItemsParams): MenuItemDef[] {
  const items: MenuItemDef[] = [
    ...(onOpenMediaGallery
      ? [
          {
            key: "media",
            label: t("messages:mediaGallery.title"),
            icon: <FiGrid aria-hidden />,
            onSelect: () => onOpenMediaGallery(getMediaTrigger()),
          },
        ]
      : []),
    {
      key: "wallpaper",
      label: t("messages:wallpaper.menuAction"),
      icon: <FiImage aria-hidden />,
      onSelect: onOpenWallpaper,
    },
    ...muteItems,
    ...groupReportItems,
  ];
  if (safety) {
    items.push(
      {
        key: "block",
        label: t(
          blocked ? "safety:profileMenu.unblock" : "safety:profileMenu.block",
          { name },
        ),
        icon: <FiSlash aria-hidden />,
        onSelect: onBeginBlock,
        danger: !blocked,
      },
      {
        // PRD-346: a path from inside the thread back to the block/mute list.
        // Previously nothing in messaging linked there at all once the
        // block undo toast's own window closed.
        key: "blockedMembers",
        label: t("safety:blockMute.blocked.manageLink"),
        icon: <FiUsers aria-hidden />,
        onSelect: onManageBlockedMembers,
      },
      {
        key: "report",
        label: t("messages:conversation.reportMemberAction", { name }),
        icon: <FiFlag aria-hidden />,
        onSelect: onOpenReport,
        danger: true,
      },
    );
  }
  return items;
}
