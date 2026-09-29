import type { RefObject } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { IconButton, Tooltip } from "../../shared/components/ui";

/**
 * The "..." trigger shared by the two profile overflow menus
 * (`ProfileSettingsMenu`, the owner-only one, and `ProfileSafetyMenu`, the
 * visitor-facing one), so it stays defined once: the app's quiet icon button,
 * wrapped in a tooltip, at every one of their call sites.
 */
export function ProfileMenuTrigger({
  triggerRef,
  label,
  isOpen,
  menuId,
  onToggle,
}: {
  triggerRef: RefObject<HTMLButtonElement | null>;
  label: string;
  isOpen: boolean;
  menuId: string;
  onToggle: () => void;
}) {
  const triggerProps = {
    ref: triggerRef,
    "aria-label": label,
    "aria-haspopup": "menu" as const,
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? menuId : undefined,
    onClick: onToggle,
  };

  // Always the toolbar's last control, flush with the hero column's clipped
  // right edge, so the bubble grows leftward from it to stay whole.
  return (
    <Tooltip label={label} placement="bottom" align="end" isDisabled={isOpen}>
      <IconButton {...triggerProps}>
        <FiMoreHorizontal aria-hidden />
      </IconButton>
    </Tooltip>
  );
}
