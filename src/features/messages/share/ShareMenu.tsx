import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiShare2 } from "react-icons/fi";
import { IconButton, Tooltip } from "../../../shared/components/ui";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import { useOutsideDismiss } from "../../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ShareMenuItem } from "./ShareMenuItem";
import { ShareToChatModal } from "./ShareToChatModal";
import type {
  ShareMenuProps,
  ShareMenuTriggerRenderProps,
} from "./shareMenu.types";
import { MENU_ITEM_SELECTOR, moveMenuFocus } from "./shareMenuFocus";
import { useShareMenuItems } from "./useShareMenuItems";
import { useShareToChat } from "./useShareToChat";
import styles from "./ShareMenu.module.css";

/**
 * Every way to pass something on, behind one Share trigger: a message inside
 * QueerPulse, WhatsApp, the device's share sheet, the composed message and
 * the bare link (`useShareMenuItems` lists them). The caller describes the
 * thing once in `content`.
 *
 * ```tsx
 * <ShareMenu
 *   content={{ path: gatheringPath(slug), title, kind: "gathering", text }}
 * />
 * ```
 *
 * The trigger is a Share icon with a tooltip by default (`tone`,
 * `tooltipPlacement`), or whatever `renderTrigger` builds from the props it is
 * handed. Follows the house APG menu-button contract: the first item takes
 * focus on open, the arrows rove, Escape hands focus back to the trigger.
 *
 * The menu is portalled and placed by `useAnchoredPopover`, aligned to the
 * trigger's right edge and nudged back inside the viewport on a narrow phone:
 * a trigger inside `FadeIn` sits in a stacking context that would trap an
 * absolute panel under a sticky sidebar.
 */
export function ShareMenu({
  content,
  menuLabel,
  triggerLabel,
  triggerAriaLabel,
  tone,
  tooltipPlacement = "bottom",
  renderTrigger,
}: ShareMenuProps) {
  const { t } = useTranslation();
  const shareToChat = useShareToChat();
  const items = useShareMenuItems(content, shareToChat);
  const [isOpen, setIsOpen] = useState(false);
  // Reaches the real <button>: IconButton spreads `ref`, Tooltip adds a span.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const placement = useAnchoredPopover(triggerRef, menuRef, isOpen);
  const isPlaced = placement !== null;
  const shareLabel = triggerLabel ?? t("messages:shareMenu.triggerLabel");

  // The menu is hidden for the one commit before its first measurement, and a
  // hidden element refuses focus, so the first item takes it once placed.
  useEffect(() => {
    if (!isOpen || !isPlaced) return;
    menuRef.current?.querySelector<HTMLElement>(MENU_ITEM_SELECTOR)?.focus();
  }, [isOpen, isPlaced]);

  useOutsideDismiss(isOpen, triggerRef, () => setIsOpen(false), {
    additionalInsideRef: menuRef,
  });

  // Focus goes back to the trigger first, so a picker an item opens hands it
  // back there when it closes.
  const closeToTrigger = () => {
    triggerRef.current?.focus();
    setIsOpen(false);
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Space activates a button item natively; the link item needs a nudge.
    if (event.key === " " && event.target instanceof HTMLAnchorElement) {
      event.preventDefault();
      event.target.click();
      return;
    }
    if (event.key === "Escape") event.preventDefault();
    // Tab leaves from the trigger, so it carries on in page order from there
    // and skips the end of `<body>` where the portalled menu lives.
    if (event.key === "Escape" || event.key === "Tab") closeToTrigger();
    else if (moveMenuFocus(menuRef.current, event.key)) event.preventDefault();
  };

  // A null `relatedTarget` (a press on an item) is ignored, or the item would
  // unmount before its click handler could run.
  const onMenuBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || menuRef.current?.contains(next)) return;
    if (next !== triggerRef.current) setIsOpen(false);
  };

  const trigger: ShareMenuTriggerRenderProps = {
    isOpen,
    triggerProps: {
      ref: triggerRef,
      "aria-haspopup": "menu",
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? menuId : undefined,
      onClick: () => setIsOpen((wasOpen) => !wasOpen),
    },
  };

  return (
    <>
      {/* While the menu is open the tooltip would sit on its first item, and
          the menu already names every option, so the tooltip steps aside. */}
      {renderTrigger ? (
        <span className={isOpen ? styles.triggerSlotOpen : styles.triggerSlot}>
          {renderTrigger(trigger)}
        </span>
      ) : (
        <span className={isOpen ? styles.triggerOpen : styles.trigger}>
          <Tooltip label={shareLabel} placement={tooltipPlacement}>
            <IconButton
              {...trigger.triggerProps}
              tone={tone}
              aria-label={triggerAriaLabel ?? shareLabel}
            >
              <FiShare2 aria-hidden />
            </IconButton>
          </Tooltip>
        </span>
      )}
      {isOpen &&
        createPortal(
          <div
            id={menuId}
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            aria-label={
              menuLabel ??
              t("messages:shareMenu.menuAria", { title: content.title })
            }
            className={
              placement === null
                ? styles.menuUnplaced
                : placement.isFlipped
                  ? styles.menuFlipped
                  : styles.menu
            }
            style={placement?.style}
            onKeyDown={onMenuKeyDown}
            onBlur={onMenuBlur}
          >
            {items.map((item) => (
              <ShareMenuItem
                key={item.key}
                item={item}
                onPicked={closeToTrigger}
              />
            ))}
          </div>,
          document.body,
        )}
      {/* Outside the menu, so closing the menu leaves the picker mounted. */}
      {shareToChat.isOpen && (
        <ShareToChatModal
          url={content.path}
          title={content.title}
          kind={content.kind}
          onClose={shareToChat.close}
        />
      )}
    </>
  );
}
