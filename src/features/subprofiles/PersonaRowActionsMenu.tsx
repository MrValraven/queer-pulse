import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  FiChevronDown,
  FiEdit2,
  FiEye,
  FiLogOut,
  FiShare2,
  FiTrash2,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PersonaRowActionsPopover,
  type PersonaRowMenuItem,
} from "./PersonaRowActionsPopover";
import type { PersonaDangerAction } from "./SideCardFooter";
import styles from "./PersonaRowActionsMenu.module.css";

export interface PersonaRowActionsMenuProps {
  /** Names the trigger and the menu ("Actions for Maya"). */
  personaName: string;
  /** No public address yet: View and Share stay listed but inert, with the
   *  reason under them. */
  hasNoAddress: boolean;
  danger: PersonaDangerAction;
  onEdit: () => void;
  onOpen: () => void;
  onShare: () => void;
  onDelete: () => void;
  onLeave: () => void;
  /** Extra class for the wrapper, so the row footer can show or hide it. */
  className?: string;
}

/**
 * A narrow List-view row's single "Actions" menu button, standing in for the
 * wide row's cluster of Edit plus three icon buttons that crowd a phone-width
 * bottom bar. One labelled pill beside the reorder controls, and the choice
 * is made in a menu where every action carries its icon AND its word.
 *
 * The menu lists what the cluster offers, with the same rules: Edit, View,
 * Share, then Delete for the creator or Leave for a co-owner in danger ink,
 * and neither while the members roster is still answering (`"unknown"`).
 * With no public address View and Share are listed but disabled, and the
 * reason (`side.noAddressNote`) sits right under them inside the menu.
 *
 * An APG menu button (`aria-haspopup`, `aria-expanded`, `aria-controls`):
 * click, Enter, Space or Arrow Down open it on the first item, Arrow Up on the
 * last. The open menu is `PersonaRowActionsPopover`, portalled to `<body>`
 * like the magazine desk's `PieceRowMenu`, so neither the row's rounded
 * surface nor the list around it can clip it.
 */
export function PersonaRowActionsMenu({
  personaName,
  hasNoAddress,
  danger,
  onEdit,
  onOpen,
  onShare,
  onDelete,
  onLeave,
  className,
}: PersonaRowActionsMenuProps) {
  const { t } = useTranslation();
  const [openFrom, setOpenFrom] = useState<"first" | "last" | null>(null);
  const isOpen = openFrom !== null;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const label = t("subprofiles:mine.rowActionsFor", { name: personaName });

  const items: PersonaRowMenuItem[] = [
    {
      key: "edit",
      label: t("subprofiles:mine.rowEdit"),
      icon: <FiEdit2 aria-hidden />,
      onSelect: onEdit,
    },
    {
      key: "view",
      label: t("subprofiles:side.viewCta"),
      icon: <FiEye aria-hidden />,
      isDisabled: hasNoAddress,
      onSelect: onOpen,
    },
    {
      key: "share",
      label: t("subprofiles:share.cta"),
      icon: <FiShare2 aria-hidden />,
      isDisabled: hasNoAddress,
      onSelect: onShare,
    },
  ];
  if (danger === "delete") {
    items.push({
      key: "delete",
      label: t("subprofiles:mine.rowDelete"),
      icon: <FiTrash2 aria-hidden />,
      isDanger: true,
      onSelect: onDelete,
    });
  }
  if (danger === "leave") {
    items.push({
      key: "leave",
      label: t("subprofiles:owners.leaveCta"),
      icon: <FiLogOut aria-hidden />,
      isDanger: true,
      onSelect: onLeave,
    });
  }

  function close(shouldRestoreFocus: boolean): void {
    setOpenFrom(null);
    if (shouldRestoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpenFrom(event.key === "ArrowUp" ? "last" : "first");
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onKeyDown={handleTriggerKeyDown}
        onClick={() => setOpenFrom(isOpen ? null : "first")}
      >
        {t("subprofiles:mine.rowActions")}
        <FiChevronDown aria-hidden className={styles.chevron} />
      </Button>
      {isOpen && (
        <PersonaRowActionsPopover
          items={items}
          triggerRef={triggerRef}
          menuId={menuId}
          label={label}
          initialFocus={openFrom}
          note={hasNoAddress ? t("subprofiles:side.noAddressNote") : undefined}
          onClose={close}
        />
      )}
    </div>
  );
}
