import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit2,
  FiMoreVertical,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import styles from "./StickerTileMenu.module.css";

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

function menuItemsIn(menu: HTMLElement | null): HTMLElement[] {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [],
  );
}

/**
 * The dismiss and keyboard half of the open menu, as window/document
 * listeners because the panel is portalled out of the tile.
 *
 * - An outside press closes it.
 * - Escape closes it back to the trigger.
 * - Tab and Shift+Tab move focus to the trigger BEFORE the browser's default
 *   action runs, and do not prevent it. Sequential navigation then starts
 *   from the trigger, so Tab lands on the control after the kebab and
 *   Shift+Tab on the one before it, exactly as if the menu had never opened.
 *   Left alone, Tab would start from the portalled panel at the end of
 *   `<body>` and leave the page.
 * - Any scroll closes it (capture phase, so a scrolling column counts too).
 *   A `fixed` panel that followed its trigger would slide over the sticky
 *   admin top bar once the tile scrolled under it.
 * - The arrow keys, Home and End walk the items.
 */
function useTileMenuDismiss({
  isOpen,
  onClose,
  containerRef,
  triggerRef,
  menuRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const closeToTrigger = () => {
      triggerRef.current?.focus({ preventScroll: true });
      onClose();
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      // The menu is portalled out of `containerRef`, so an outside press has
      // to miss both the trigger's wrapper and the portalled panel.
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onClose();
    };
    const handleScroll = () => {
      // Hand focus back only when it sat in the panel, which is about to
      // unmount and would otherwise drop focus to `<body>`.
      if (menuRef.current?.contains(document.activeElement)) closeToTrigger();
      else onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") {
        closeToTrigger();
        return;
      }
      const items = menuItemsIn(menuRef.current);
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const lastIndex = items.length - 1;
      const nextIndexByKey: Record<string, number> = {
        ArrowDown: currentIndex >= lastIndex ? 0 : currentIndex + 1,
        ArrowUp: currentIndex <= 0 ? lastIndex : currentIndex - 1,
        Home: 0,
        End: lastIndex,
      };
      const nextIndex = nextIndexByKey[event.key];
      if (nextIndex === undefined) return;
      event.preventDefault();
      items[nextIndex]?.focus();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose, containerRef, triggerRef, menuRef]);
}

interface MenuItem {
  key: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  isAvailable?: boolean;
  /** A move re-focuses the trigger after the tile moves in the DOM. */
  isMove?: boolean;
  isDanger?: boolean;
  isHidden?: boolean;
  hasSeparatorBefore?: boolean;
}

/**
 * A sticker tile's kebab: set as cover, edit, move one step earlier or later
 * (the keyboard path for the grid's drag reorder) and remove. The APG
 * menu-button pattern of the roadmap board's `CardMenu`: outside-click and
 * Escape close, the first item takes focus on open, and the arrow keys, Home
 * and End walk the items.
 *
 * Every action hands focus back to the trigger before it runs, so a dialog
 * opened from here restores focus to the kebab when it closes. A move also
 * re-focuses the trigger on the next frame, because the reorder moves this
 * tile in the DOM and a moved node can drop its focus.
 *
 * Unavailable moves (at an end of the pack, or while a save is in flight)
 * stay in the menu as `aria-disabled` so the item list keeps its shape.
 *
 * The panel is portalled to `document.body` and placed in viewport
 * coordinates by the shared `useAnchoredPopover`, so it never opens partly
 * off screen from a tile near a grid edge and always paints above the
 * sticky publish dock (`--z-popover-portal` outranks `--z-sticky`). A scroll
 * closes it, and Tab leaves it from the trigger (`useTileMenuDismiss`).
 */
export function StickerTileMenu({
  stickerLabel,
  isCover,
  canMoveEarlier,
  canMoveLater,
  isBusy,
  onSetCover,
  onEdit,
  onMoveEarlier,
  onMoveLater,
  onRemove,
}: {
  stickerLabel: string;
  isCover: boolean;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  /** A pack save is in flight: cover and moves wait for it. */
  isBusy: boolean;
  onSetCover: () => void;
  onEdit: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Right edge aligned to the trigger, nudged back on screen when that would
  // hang the menu off the side, flipped above the trigger when there is no
  // room below.
  const placement = useAnchoredPopover(triggerRef, menuRef, isOpen);
  const isPlaced = placement !== null;
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // The first item takes focus once the panel is placed. On a first open the
  // panel spends one commit unplaced, and focusing it then was lost. The
  // unplaced panel is only transparent (see `.menuUnplaced`), so focus would
  // hold there too; waiting for placement keeps it off a panel still parked
  // in the corner. `preventScroll`, because a scroll now closes the menu.
  useEffect(() => {
    if (!isOpen || !isPlaced) return;
    menuItemsIn(menuRef.current)[0]?.focus({ preventScroll: true });
  }, [isOpen, isPlaced]);

  useTileMenuDismiss({
    isOpen,
    onClose: closeMenu,
    containerRef,
    triggerRef,
    menuRef,
  });

  function runAndClose(action: () => void, isMove = false) {
    triggerRef.current?.focus();
    setIsOpen(false);
    action();
    if (isMove) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  const menuItems: MenuItem[] = [
    {
      key: "cover",
      icon: <FiStar />,
      label: t("admin:stickerPacks.contents.menu.setCover"),
      onSelect: onSetCover,
      isAvailable: !isBusy,
      isHidden: isCover,
    },
    {
      key: "edit",
      icon: <FiEdit2 />,
      label: t("admin:stickerPacks.contents.menu.edit"),
      onSelect: onEdit,
    },
    {
      key: "earlier",
      icon: <FiArrowLeft />,
      label: t("admin:stickerPacks.contents.menu.moveEarlier"),
      onSelect: onMoveEarlier,
      isAvailable: canMoveEarlier && !isBusy,
      isMove: true,
      hasSeparatorBefore: true,
    },
    {
      key: "later",
      icon: <FiArrowRight />,
      label: t("admin:stickerPacks.contents.menu.moveLater"),
      onSelect: onMoveLater,
      isAvailable: canMoveLater && !isBusy,
      isMove: true,
    },
    {
      key: "remove",
      icon: <FiTrash2 />,
      label: t("admin:stickerPacks.contents.menu.remove"),
      onSelect: onRemove,
      isDanger: true,
      hasSeparatorBefore: true,
    },
  ];

  return (
    <div className={styles.wrap} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("admin:stickerPacks.contents.menu.trigger", {
          label: stickerLabel,
        })}
        onClick={() => setIsOpen((current) => !current)}
      >
        <FiMoreVertical aria-hidden />
      </button>

      {isOpen &&
        createPortal(
          <div
            className={[
              styles.menu,
              placement === null && styles.menuUnplaced,
              placement?.isFlipped && styles.menuFlipped,
            ]
              .filter(Boolean)
              .join(" ")}
            style={placement?.style}
            role="menu"
            ref={menuRef}
            aria-label={stickerLabel}
          >
            {menuItems
              .filter((item) => !item.isHidden)
              .map(
                ({
                  key,
                  icon,
                  label,
                  onSelect,
                  isAvailable = true,
                  isMove = false,
                  isDanger = false,
                  hasSeparatorBefore = false,
                }) => (
                  <Fragment key={key}>
                    {hasSeparatorBefore && (
                      <div className={styles.separator} role="separator" />
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      // Out of the tab sequence (APG): the arrow keys move
                      // between items, and Tab leaves the menu.
                      tabIndex={-1}
                      className={[styles.item, isDanger && styles.itemDanger]
                        .filter(Boolean)
                        .join(" ")}
                      aria-disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) runAndClose(onSelect, isMove);
                      }}
                    >
                      <span className={styles.itemIcon} aria-hidden>
                        {icon}
                      </span>
                      {label}
                    </button>
                  </Fragment>
                ),
              )}
          </div>,
          document.body,
        )}
    </div>
  );
}
