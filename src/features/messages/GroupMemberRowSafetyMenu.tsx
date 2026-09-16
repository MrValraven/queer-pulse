import { useState, type ReactNode } from "react";
import { FiFlag, FiMoreHorizontal, FiSlash } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BlockMemberModal } from "../members/BlockMemberModal";
import { ConversationReportModal } from "./ConversationReportModal";
import { useConversationBlockAction } from "./useConversationBlockAction";
import { useKebabMenuA11y } from "./useKebabMenuA11y";
import type { GroupMemberView } from "./data";
import menuStyles from "./MessagesPage.module.css";

interface GroupMemberRowSafetyMenuProps {
  member: GroupMemberView;
}

interface SafetyMenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

/**
 * PRD-354: per-roster-row Block + Report, reusing the exact primitives the
 * conversation-header kebab already uses for a DM counterpart:
 * `useConversationBlockAction`, `BlockMemberModal`, and `ConversationReportModal`
 * in its `member` form. A group roster member is blocked/reported the same
 * way a DM counterpart is, just from their row instead of the header. Its own
 * small kebab (not more buttons crowding the row) so it reads as a "safety"
 * action distinct from the server-gated management ones (promote/demote/
 * remove/make owner) that sit beside it. `.map()`s over `items` (mirroring
 * `ConversationMenu`'s own shape) rather than two hand-written buttons, so
 * `itemRefs`'s roving-tabindex wiring matches that already-working pattern.
 */
export function GroupMemberRowSafetyMenu({
  member,
}: GroupMemberRowSafetyMenuProps) {
  const { t } = useTranslation();
  const [isReporting, setIsReporting] = useState(false);
  const { blocked, confirmingBlock, beginBlock, cancelBlock, confirmBlock } =
    useConversationBlockAction(member.slug ?? "", member.name);
  const menuAriaLabel = t("messages:group.memberSafetyMenuAriaLabel", {
    name: member.name,
  });

  const items: SafetyMenuItemDef[] = [
    {
      key: "block",
      label: t(
        blocked ? "safety:profileMenu.unblock" : "safety:profileMenu.block",
        { name: member.name },
      ),
      icon: <FiSlash aria-hidden />,
      onSelect: beginBlock,
    },
    {
      key: "report",
      label: t("messages:conversation.reportMemberAction", {
        name: member.name,
      }),
      icon: <FiFlag aria-hidden />,
      onSelect: () => setIsReporting(true),
    },
  ];

  const { open, setOpen, containerRef, triggerRef, itemRefs, onMenuKeyDown } =
    useKebabMenuA11y(items.length);

  return (
    <div className={menuStyles.safetyMenuWrap} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={menuStyles.ctbIconBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={menuAriaLabel}
        title={menuAriaLabel}
        onClick={() => setOpen((previous) => !previous)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {open && (
        <div
          className={menuStyles.rowMenuPopover}
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
              className={menuStyles.rowMenuItemDanger}
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
          firstName={member.name}
          onCancel={cancelBlock}
          onConfirm={confirmBlock}
        />
      )}
      {isReporting && (
        <ConversationReportModal
          kind="member"
          subjectId={member.id ?? member.slug ?? ""}
          name={member.name}
          onClose={() => setIsReporting(false)}
        />
      )}
    </div>
  );
}
