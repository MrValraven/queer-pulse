import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import { FiShare2 } from "react-icons/fi";
import { lazyModal } from "../../../app/providers/lazyModal";
import { ModalLoadBoundary } from "../../../app/providers/ModalLoadBoundary";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { IconButton, Tooltip } from "../../../shared/components/ui";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import { useExitTransition } from "../../../shared/hooks/useExitTransition";
import { useOutsideDismiss } from "../../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ShareMenuItem } from "./ShareMenuItem";
import { ShareToChatModal } from "./ShareToChatModal";
import type {
  ShareMenuProps,
  ShareMenuTriggerRenderProps,
} from "./shareMenu.types";
import { MENU_ITEM_SELECTOR, moveMenuFocus } from "./shareMenuFocus";
import { toAbsoluteShareUrl } from "./shareToChat.helpers";
import { useShareMenuItems } from "./useShareMenuItems";
import { useShareToChat } from "./useShareToChat";
import { useShareToCommunityPicker } from "./useShareToCommunityPicker";
import styles from "./ShareMenu.module.css";

// Lazy: the community modal only matters on Studio menus, so its chunk stays
// out of every page that shows a Share button. Opening a menu that offers it
// starts the download, so the modal is ready by the time the item is picked.
// A failed load closes the modal with the shared error toast
// (`ModalLoadBoundary`) and the next open tries the network again.
const loadShareToCommunityModal = () =>
  import("../../economy/ShareToCommunityModal");
const shareToCommunityModal = lazyModal(() =>
  loadShareToCommunityModal().then((module) => module.ShareToCommunityModal),
);

/** The menu's fade out, matching `.menuClosing` in ShareMenu.module.css. */
const MENU_EXIT_MS = 90;

/**
 * Every way to pass something on, behind one Share trigger: a message inside
 * QueerPulse, a post in one of your communities (Studio links), WhatsApp,
 * the device's share sheet, the composed message and the bare link
 * (`useShareMenuItems` lists them). The caller describes the
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
  shouldOfferSendInMessage = true,
  identityNote,
}: ShareMenuProps) {
  const { t } = useTranslation();
  const shareToChat = useShareToChat();
  const shareToCommunity = useShareToCommunityPicker(content);
  const items = useShareMenuItems(content, shareToChat, {
    shouldOfferSendInMessage,
    shareToCommunity,
  });
  const [isOpen, setIsOpen] = useState(false);
  // Every close fades the menu out; reduced motion unmounts it on the spot.
  const { reducedMotion } = useMotionPrefs();
  const { isMounted, isExiting } = useExitTransition(
    isOpen,
    reducedMotion ? 0 : MENU_EXIT_MS,
  );
  // Reaches the real <button>: IconButton spreads `ref`, Tooltip adds a span.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const placement = useAnchoredPopover(triggerRef, menuRef, isOpen);
  const isPlaced = placement !== null;
  const shareLabel = triggerLabel ?? t("messages:shareMenu.triggerLabel");
  // Bumped on a failed load: the fresh boundary drops its error state, so
  // the next open renders the retried modal.
  const [communityLoadFailureCount, setCommunityLoadFailureCount] = useState(0);
  const onCommunityModalLoadFailure = () => {
    shareToCommunityModal.retryAfterFailure();
    setCommunityLoadFailureCount((count) => count + 1);
    shareToCommunity.close();
  };

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
      onClick: () => {
        if (!isOpen && shareToCommunity.canShare) {
          void loadShareToCommunityModal().catch(() => {});
        }
        setIsOpen((wasOpen) => !wasOpen);
      },
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
      {isMounted &&
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
            className={[
              placement === null
                ? styles.menuUnplaced
                : placement.isFlipped
                  ? styles.menuFlipped
                  : styles.menu,
              isExiting && styles.menuClosing,
            ]
              .filter(Boolean)
              .join(" ")}
            style={placement?.style}
            // Fading out: out of the tab order and the accessibility tree.
            inert={isExiting || undefined}
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
      <AnimatePresence>
        {shareToChat.isOpen && (
          <ShareToChatModal
            key="share-to-chat"
            url={content.path}
            title={content.title}
            kind={content.kind}
            identityNote={identityNote}
            onClose={shareToChat.close}
          />
        )}
      </AnimatePresence>
      <ModalLoadBoundary
        key={communityLoadFailureCount}
        onFailure={onCommunityModalLoadFailure}
      >
        <AnimatePresence>
          {shareToCommunity.isOpen && (
            <shareToCommunityModal.Component
              key="share-to-community"
              title={content.title}
              url={toAbsoluteShareUrl(content.path)}
              defaultNote={t("messages:shareToCommunity.studioDefaultNote")}
              notice={
                shareToCommunity.ownPersonaName
                  ? t("messages:shareToCommunity.ownPersonaNote", {
                      persona: shareToCommunity.ownPersonaName,
                    })
                  : undefined
              }
              onClose={shareToCommunity.close}
            />
          )}
        </AnimatePresence>
      </ModalLoadBoundary>
    </>
  );
}
