import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { FiLink, FiSend, FiShare, FiShare2 } from "react-icons/fi";
import { IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import { useShareToChat } from "../messages/share/useShareToChat";
import { ShareToChatModal } from "../messages/share/ShareToChatModal";
import styles from "./CommunityShareMenu.module.css";

/** The page's side gutter at phone width, the edge the menu must stay inside. */
const VIEWPORT_GUTTER = 16;
const ROVING_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

/** Arrow/Home/End roving across the open menu's items, wrapping at the ends. */
function moveMenuFocus(menu: HTMLElement | null, key: string) {
  const items = Array.from(
    menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
  );
  const lastIndex = items.length - 1;
  const currentIndex = items.indexOf(
    document.activeElement as HTMLButtonElement,
  );
  let nextIndex = 0;
  if (key === "End") nextIndex = lastIndex;
  if (key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  if (key === "ArrowUp") {
    nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
  }
  items[nextIndex]?.focus();
}

/**
 * The hero's Share icon. For a signed-in member it opens a menu holding both
 * ways to pass the community on: the device share sheet (or copy link where
 * there is none) and "Send in a message", once its own labelled button in the
 * row. A signed-out visitor has only the first, so the icon just runs it.
 * Follows the house APG menu-button contract, as `ModMemberMenu` does.
 */
export function CommunityShareMenu({
  communityName,
  communitySlug,
  onShare,
}: {
  communityName: string;
  communitySlug: string | undefined;
  /** Native share sheet when the device has one, else copy link + toast. */
  onShare: () => void;
}) {
  const { t } = useTranslation();
  const shareToChat = useShareToChat();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Reaches the real <button>: IconButton spreads `ref`, Tooltip adds a span.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const hasMenu = shareToChat.canShare && communitySlug !== undefined;
  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || container.contains(event.target as Node)) return;
      // Focus inside the menu we are about to unmount goes back to the trigger.
      const hadFocus = container.contains(document.activeElement);
      setIsOpen(false);
      if (hadFocus) triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // Where the row wraps on a phone the trigger can land anywhere on the line,
  // so the menu opens from its left edge and slides left just enough to clear
  // the right gutter (never past the left one). Then the first item is focused.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!isOpen || !menu) return;
    const { left, right } = menu.getBoundingClientRect();
    const pageWidth = document.documentElement.clientWidth;
    const overflowRight = right + VIEWPORT_GUTTER - pageWidth;
    const shift = Math.min(overflowRight, left - VIEWPORT_GUTTER);
    if (shift > 0) menu.style.left = `${-shift}px`;
    menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [isOpen]);

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" && !ROVING_KEYS.includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Escape") close();
    else moveMenuFocus(menuRef.current, event.key);
  };

  // A null `relatedTarget` (clicking a menu item) is ignored, or the item
  // would unmount before its click handler could run.
  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || containerRef.current?.contains(next)) return;
    setIsOpen(false);
  };

  const items = [
    {
      label: t(
        canUseNativeShare
          ? "communities:detail.share.nativeShare"
          : "communities:detail.share.copyLink",
      ),
      icon: canUseNativeShare ? <FiShare /> : <FiLink />,
      run: onShare,
    },
    {
      label: t("messages:share.cta"),
      icon: <FiSend />,
      run: shareToChat.open,
    },
  ];

  return (
    <>
      <div
        ref={containerRef}
        className={`${styles.container} ${isOpen ? styles.open : ""}`}
        onBlur={onFocusOut}
      >
        <Tooltip label={t("communities:detail.share.cta")}>
          <IconButton
            ref={triggerRef}
            tone="dark"
            aria-label={t("communities:detail.share.ariaLabel", {
              name: communityName,
            })}
            aria-haspopup={hasMenu ? "menu" : undefined}
            aria-expanded={hasMenu ? isOpen : undefined}
            aria-controls={isOpen ? menuId : undefined}
            onClick={hasMenu ? () => setIsOpen((wasOpen) => !wasOpen) : onShare}
          >
            <FiShare2 aria-hidden />
          </IconButton>
        </Tooltip>
        {isOpen && (
          <div
            id={menuId}
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            className={styles.menu}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={styles.item}
                onClick={() => {
                  // Focus returns to the trigger first, so the picker modal
                  // hands it back there when it closes.
                  close();
                  item.run();
                }}
              >
                <span className={styles.itemIcon} aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Outside the menu's container, so closing the menu leaves it mounted. */}
      {shareToChat.isOpen && communitySlug && (
        <ShareToChatModal
          url={communityPath(communitySlug)}
          title={communityName}
          kind="community"
          onClose={shareToChat.close}
        />
      )}
    </>
  );
}
