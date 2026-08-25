// src/features/messages/ConversationSafetyMenu.tsx
import { useState, type ReactNode } from "react";
import { FiFlag, FiMoreHorizontal, FiSlash } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BlockMemberModal } from "../members/BlockMemberModal";
import { ConversationReportModal } from "./ConversationReportModal";
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

/**
 * Conversation-header safety menu — Block and Report, the two in-chat safety
 * actions a marketplace-style DM needs (spec P0.7). DM-only: the caller never
 * renders this for a group or an official thread, neither of which has a
 * single counterpart to act against.
 *
 * Reuses the SAME primitives the rest of the app already uses for these
 * actions rather than forking a messaging-only copy: `useSocial()` (dual-mode
 * block state — see `SocialProvider`, via `useConversationBlockAction`),
 * `BlockMemberModal` (the destructive-confirm dialog also used from a
 * profile's `ProfileSafetyMenu`), and the shared `/reports` mutation via
 * `ConversationReportModal`. Blocking here has the exact same effect as
 * blocking from a profile: the composer severs immediately (`Composer`'s
 * `blocked` prop, wired from `useMessagesController`'s `isBlocked`), and the
 * thread drops out of the inbox (`useMessagesController`'s "DM severance"
 * filter, backed server-side by `ConversationsService.listConversations`'s
 * block filter). Keyboard/open-state mechanics live in `useKebabMenuA11y`,
 * shared with `ThreadRowMenu`; the popover/menu-item CSS classes are the same
 * `.rowMenu*` ones for visual consistency, not a forked look.
 */
export function ConversationSafetyMenu({
  slug,
  reportSubjectId,
  name,
}: {
  /** Counterpart's profile slug — the key blocks/mutes are stored under. */
  slug: string;
  /** Counterpart's user id for the report subject; falls back to `slug` when
   *  unset (demo mode never sends this over the network — see `useCreateReport`). */
  reportSubjectId: string | undefined;
  /** First name, for confirm/toast copy. */
  name: string;
}) {
  const { t } = useTranslation();
  const [reporting, setReporting] = useState(false);
  const { blocked, confirmingBlock, beginBlock, cancelBlock, confirmBlock } =
    useConversationBlockAction(slug, name);

  const items: MenuItemDef[] = [
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
      onSelect: () => setReporting(true),
      danger: true,
    },
  ];

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
        aria-label={t("safety:profileMenu.ariaLabel", { name })}
        title={t("safety:profileMenu.ariaLabel", { name })}
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

      {confirmingBlock && (
        <BlockMemberModal
          firstName={name}
          onCancel={cancelBlock}
          onConfirm={confirmBlock}
        />
      )}
      {reporting && (
        <ConversationReportModal
          subjectId={reportSubjectId ?? slug}
          name={name}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}
