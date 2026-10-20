import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import releaseStyles from "./StudioRelease.module.css";

const OWNER_ITEMS = [
  { id: "edit", labelKey: "studio:playlist.page.editDetails" },
  { id: "visibility", labelKey: "studio:playlist.page.changeVisibility" },
  { id: "manageEditors", labelKey: "studio:playlist.page.manageEditors" },
  { id: "delete", labelKey: "studio:playlist.page.deletePlaylist" },
] as const;
const EDITOR_ITEMS = [
  { id: "edit", labelKey: "studio:playlist.page.editDetails" },
  { id: "leave", labelKey: "studio:playlist.page.leavePlaylist" },
] as const;
type OwnerAction =
  (typeof OWNER_ITEMS)[number]["id"] | (typeof EDITOR_ITEMS)[number]["id"];

/** The playlist menu. The owner gets Edit details, Change visibility,
 *  Manage editors and Delete playlist; an editor gets Edit details and Leave
 *  playlist. Arrow keys move through it, Escape and a click outside close
 *  it, and focus returns to the trigger before a dialog opens. It fades. */
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
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = role === "owner" ? OWNER_ITEMS : EDITOR_ITEMS;
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false), {
    onEscape: close,
  });
  useEffect(() => {
    if (isOpen) itemRefs.current[0]?.focus();
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
        aria-label={t("studio:playlist.page.actionsLabel")}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="menu"
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
              <button
                key={item.id}
                type="button"
                role="menuitem"
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className={releaseStyles.menuItem}
                onClick={() => {
                  close();
                  onAction(item.id);
                }}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { OwnerAction as StudioPlaylistOwnerAction };
