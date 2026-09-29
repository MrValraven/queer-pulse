import {
  FiBookOpen,
  FiChevronDown,
  FiEdit3,
  FiLayers,
  FiSend,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DeskMenu, type DeskMenuItem } from "./DeskMenu";

export interface DeskNewMenuProps {
  onWrite: () => void;
  /** True while the new draft is being created, to hold Write disabled. */
  isWriting: boolean;
  onBuildDeck: () => void;
  /** True while the new deck piece is being created. */
  isBuildingDeck?: boolean;
  onCommission: () => void;
  onNewIssue: () => void;
}

/**
 * Every way to start new work on the desk, behind one ghost "New" button.
 * The four creation paths used to be four header buttons competing with the
 * shell's filled "Write"; folded here they leave the header calm, and the
 * shell button stays the one filled action on the page.
 *
 * The "W" hint mirrors the desk's existing Write shortcut
 * (`useDeskKeyboard`); this menu only displays it.
 */
export function DeskNewMenu({
  onWrite,
  isWriting,
  onBuildDeck,
  isBuildingDeck = false,
  onCommission,
  onNewIssue,
}: DeskNewMenuProps) {
  const { t } = useTranslation();
  const triggerLabel = t("magazine:desk.newMenu.trigger");

  const items: DeskMenuItem[] = [
    {
      kind: "action",
      id: "write",
      label: t("magazine:desk.newMenu.writeArticle"),
      icon: <FiEdit3 aria-hidden />,
      shortcut: "W",
      isDisabled: isWriting,
      onSelect: onWrite,
    },
    {
      kind: "action",
      id: "deck",
      label: t("magazine:desk.newMenu.buildDeck"),
      icon: <FiLayers aria-hidden />,
      isDisabled: isBuildingDeck,
      onSelect: onBuildDeck,
    },
    {
      kind: "action",
      id: "commission",
      label: t("magazine:desk.newMenu.commission"),
      icon: <FiSend aria-hidden />,
      onSelect: onCommission,
    },
    { kind: "separator", id: "issue-rule" },
    {
      kind: "action",
      id: "issue",
      label: t("magazine:desk.newMenu.newIssue"),
      icon: <FiBookOpen aria-hidden />,
      onSelect: onNewIssue,
    },
  ];

  return (
    <DeskMenu
      label={triggerLabel}
      items={items}
      align="end"
      renderTrigger={(triggerProps) => (
        <Button variant="ghost" size="sm" {...triggerProps}>
          {triggerLabel}
          <FiChevronDown aria-hidden />
        </Button>
      )}
    />
  );
}
