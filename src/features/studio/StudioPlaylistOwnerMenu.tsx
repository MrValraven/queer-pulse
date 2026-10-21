import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import releaseStyles from "./StudioRelease.module.css";

/* A destructive item reads in the danger ink, below a hairline. */
const OWNER_ITEMS = [
  {
    id: "edit",
    labelKey: "studio:playlist.page.editDetails",
    isDestructive: false,
  },
  {
    id: "visibility",
    labelKey: "studio:playlist.page.changeVisibility",
    isDestructive: false,
  },
  {
    id: "manageEditors",
    labelKey: "studio:playlist.page.manageEditors",
    isDestructive: false,
  },
  {
    id: "delete",
    labelKey: "studio:playlist.page.deletePlaylist",
    isDestructive: true,
  },
] as const;
const EDITOR_ITEMS = [
  {
    id: "edit",
    labelKey: "studio:playlist.page.editDetails",
    isDestructive: false,
  },
  {
    id: "leave",
    labelKey: "studio:playlist.page.leavePlaylist",
    isDestructive: true,
  },
] as const;
type OwnerAction =
  (typeof OWNER_ITEMS)[number]["id"] | (typeof EDITOR_ITEMS)[number]["id"];

/** The playlist menu. The owner gets Edit details, Change visibility,
 *  Manage editors and Delete playlist; an editor gets Edit details and Leave
 *  playlist, the last item set apart by a hairline in the danger ink. Arrow
 *  keys move through the items, Escape and a click outside close it, and
 *  focus returns to the trigger before a dialog opens. It fades. */
export function StudioPlaylistOwnerMenu({
  role,
  onAction,
}: {
  role: "owner" | "editor";
  onAction: (action: OwnerAction) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = role === "owner" ? OWNER_ITEMS : EDITOR_ITEMS;
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false), {
    onEscape: close,
  });
  // Opening brings the whole menu into view (on a phone it can open below
  // the fold), then moves focus onto its first item. jsdom leaves
  // scrollIntoView undefined.
  useEffect(() => {
    if (!isOpen) return;
    menuRef.current?.scrollIntoView?.({ block: "nearest" });
    // preventScroll keeps the focus from cutting the smooth scroll short.
    itemRefs.current[0]?.focus({ preventScroll: true });
  }, [isOpen]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const menuItems = itemRefs.current.filter(
      (item): item is HTMLButtonElement => item !== null,
    );
    const current = menuItems.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const nextIndex =
      event.key === "ArrowDown"
        ? (current + 1) % menuItems.length
        : event.key === "ArrowUp"
          ? (current - 1 + menuItems.length) % menuItems.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? menuItems.length - 1
              : null;
    if (nextIndex === null) return;
    event.preventDefault();
    menuItems[nextIndex]?.focus();
  }

  return (
    <div
      className={releaseStyles.overflow}
      ref={wrapRef}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (nextFocus && !event.currentTarget.contains(nextFocus))
          setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={releaseStyles.overflowTrigger}
        aria-label={t("studio:playlist.page.actionsLabel")}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="menu"
            ref={menuRef}
            id={menuId}
            role="menu"
            className={releaseStyles.menu}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
            onKeyDown={moveFocus}
          >
            {items.map((item, index) => (
              <Fragment key={item.id}>
                {/* The separator is no button, so the arrow keys skip it:
                    itemRefs holds the items alone, by their index. */}
                {item.isDestructive && (
                  <div
                    role="separator"
                    className={releaseStyles.menuSeparator}
                  />
                )}
                <button
                  type="button"
                  role="menuitem"
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  className={
                    item.isDestructive
                      ? `${releaseStyles.menuItem} ${releaseStyles.menuItemDanger}`
                      : releaseStyles.menuItem
                  }
                  onClick={() => {
                    close();
                    onAction(item.id);
                  }}
                >
                  {t(item.labelKey)}
                </button>
              </Fragment>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { OwnerAction as StudioPlaylistOwnerAction };
