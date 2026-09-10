// src/features/messages/ConversationMenu.tsx
import { useState, type ReactNode } from "react";
import { FiFlag, FiImage, FiMoreHorizontal, FiSlash } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BlockMemberModal } from "../members/BlockMemberModal";
import { ConversationReportModal } from "./ConversationReportModal";
import { WallpaperModal } from "./WallpaperModal";
import { useConversationBlockAction } from "./useConversationBlockAction";
import { useKebabMenuA11y } from "./useKebabMenuA11y";
import styles from "./MessagesPage.module.css";

interface MenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

/** The DM-only half of the menu. Absent for a group (no single counterpart to
 *  act against) and for an official thread (no member behind it at all). */
export interface ConversationSafetyTarget {
  /** Counterpart's profile slug — the key blocks/mutes are stored under. */
  slug: string;
  /** Counterpart's user id for the report subject; falls back to `slug` when
   *  unset (demo mode never sends this over the network — see `useCreateReport`). */
  reportSubjectId: string | undefined;
}

/**
 * Conversation-header overflow menu.
 *
 * This was `ConversationSafetyMenu`, rendered only for DMs. Wallpaper has to
 * be reachable from a group and an official thread too, so the menu itself now
 * renders for every thread and it is the SAFETY ITEMS that carry the DM-only
 * condition (`safety` absent = they are simply not in the list). Nothing about
 * blocking or reporting changed: same `useSocial()` primitive via
 * `useConversationBlockAction`, same `BlockMemberModal` a profile's
 * `ProfileSafetyMenu` opens, same shared `/reports` mutation, same gating.
 * Blocking here still severs the composer instantly and drops the thread from
 * the inbox.
 *
 * Keyboard/open-state mechanics live in `useKebabMenuA11y`, shared with
 * `ThreadRowMenu`; the popover/menu-item CSS classes are the same `.rowMenu*`
 * ones for visual consistency.
 */
export function ConversationMenu({
  conversationId,
  name,
  safety,
}: {
  /** The thread whose wallpaper this menu edits. */
  conversationId: string;
  /** Counterpart's first name, or the group's name — used in confirm/menu copy. */
  name: string;
  safety?: ConversationSafetyTarget;
}) {
  const { t } = useTranslation();
  const [isReporting, setIsReporting] = useState(false);
  const [isPickingWallpaper, setIsPickingWallpaper] = useState(false);
  // Called unconditionally (hook rules): for a group or an official thread
  // there is no slug, and the empty key simply reads back as "not blocked" —
  // the items it powers are not in the list for those threads anyway.
  const { blocked, confirmingBlock, beginBlock, cancelBlock, confirmBlock } =
    useConversationBlockAction(safety?.slug ?? "", name);

  const items: MenuItemDef[] = [
    {
      key: "wallpaper",
      label: t("messages:wallpaper.menuAction"),
      icon: <FiImage aria-hidden />,
      onSelect: () => setIsPickingWallpaper(true),
    },
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
        onSelect: beginBlock,
        danger: !blocked,
      },
      {
        key: "report",
        label: t("messages:conversation.reportMemberAction", { name }),
        icon: <FiFlag aria-hidden />,
        onSelect: () => setIsReporting(true),
        danger: true,
      },
    );
  }

  const { open, setOpen, containerRef, triggerRef, itemRefs, onMenuKeyDown } =
    useKebabMenuA11y(items.length);

  return (
    <div className={styles.safetyMenuWrap} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.ctbIconBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("messages:conversation.menuAriaLabel", { name })}
        title={t("messages:conversation.menuAriaLabel", { name })}
        onClick={() => setOpen((previous) => !previous)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {open && (
        <div
          className={styles.rowMenuPopover}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={
                item.danger ? styles.rowMenuItemDanger : styles.rowMenuItem
              }
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      {isPickingWallpaper && (
        <WallpaperModal
          conversationId={conversationId}
          chatName={name}
          onClose={() => setIsPickingWallpaper(false)}
        />
      )}
      {safety && confirmingBlock && (
        <BlockMemberModal
          firstName={name}
          onCancel={cancelBlock}
          onConfirm={confirmBlock}
        />
      )}
      {safety && isReporting && (
        <ConversationReportModal
          subjectId={safety.reportSubjectId ?? safety.slug}
          name={name}
          onClose={() => setIsReporting(false)}
        />
      )}
    </div>
  );
}
