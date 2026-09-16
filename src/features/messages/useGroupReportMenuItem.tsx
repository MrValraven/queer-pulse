import type { ReactNode } from "react";
import { FiFlag } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface MenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

/**
 * PRD-356: the group-only "Report group" item `ConversationMenu` appends for
 * a group thread, the mirror of the DM-only `safety.report` item it already
 * has, opening the same `ConversationReportModal` with `kind="group"` instead
 * of `kind="member"`. Split into its own hook rather than inlined in
 * `ConversationMenu.tsx`, which is already over the repo's 200-line guidance
 * before this addition.
 */
export function useGroupReportMenuItem(
  isGroup: boolean,
  onReport: () => void,
): MenuItemDef[] {
  const { t } = useTranslation();
  if (!isGroup) return [];
  return [
    {
      key: "reportGroup",
      label: t("messages:conversation.reportGroupAction"),
      icon: <FiFlag aria-hidden />,
      onSelect: onReport,
      danger: true,
    },
  ];
}
