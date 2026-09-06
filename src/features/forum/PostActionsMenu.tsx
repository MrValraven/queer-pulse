import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  usePostAuthorSafety,
  type PostAuthor,
  type PostMenuAction,
} from "./usePostAuthorSafety";
import styles from "./PostActionsMenu.module.css";

interface PostActionsMenuProps {
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  /** Re-file this thread into another category (PRD-163). The gate is the
   *  thread endpoint's: a moderator at any time, the author inside the
   *  thread's first 24 hours (see `canMoveThreadCategory`). Post-level menus
   *  (a reply) never pass it — a reply has no category of its own. */
  canMoveCategory?: boolean;
  onMoveCategory?: () => void;
  /** Mod-only: pin/unpin this post to the top of its feed. `pinned` reflects
   *  the post's current state so the menu label toggles ("Pin" ↔ "Unpin"). */
  canPin?: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
  /** Any member may report someone else's post/reply — never their own. */
  canReport?: boolean;
  onReport?: () => void;
  /** The post's author, which adds "Mute" / "Block" to the menu. Safe to pass
   *  for every post: `usePostAuthorSafety` returns no actions for the viewer's
   *  own posts, the QueerPulse Official account, and authors with no slug. */
  author?: PostAuthor;
}

export function PostActionsMenu({
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
  canMoveCategory,
  onMoveCategory,
  canPin,
  pinned,
  onTogglePin,
  canReport,
  onReport,
  author,
}: PostActionsMenuProps) {
  const { t } = useTranslation();
  // Mute/block for this post's author, wired to the app-wide social store. Its
  // own confirmation dialog renders alongside the menu below.
  const safety = usePostAuthorSafety(author);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  /** Close and hand focus back to the trigger (APG menu-button contract). */
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || container.contains(event.target as Node)) return;
      // Focus was inside the menu we are about to unmount, so hand it back to
      // the trigger rather than dropping the caret on <body>. When the click
      // landed on some other focusable element, focus has already left the
      // container and that element keeps it.
      if (container.contains(document.activeElement)) {
        close();
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
    // `close` is re-created every render but only ever calls setOpen + focus.
  }, [open]);

  // APG menu-button contract: focus the first item when the menu opens.
  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
  }, [open]);

  if (
    !canEdit &&
    !canDelete &&
    !canRestore &&
    !canViewHistory &&
    !canMoveCategory &&
    !canPin &&
    !canReport &&
    safety.actions.length === 0
  )
    return null;

  const runAndClose = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  const actions: PostMenuAction[] = [
    canPin && {
      key: "pin",
      label: t(pinned ? "forum:postMenu.unpin" : "forum:postMenu.pin"),
      run: () => onTogglePin?.(),
    },
    canEdit && {
      key: "edit",
      label: t("forum:postMenu.edit"),
      run: onEdit,
    },
    // Filing sits next to editing: both are "put this right", neither is
    // destructive (PRD-163).
    canMoveCategory && {
      key: "move",
      label: t("forum:postMenu.moveCategory"),
      run: () => onMoveCategory?.(),
    },
    canViewHistory && {
      key: "history",
      label: t("forum:postMenu.history"),
      run: onHistory,
    },
    canRestore && {
      key: "restore",
      label: t("forum:postMenu.restore"),
      run: onRestore,
    },
    canDelete && {
      key: "delete",
      label: t("forum:postMenu.delete"),
      run: onDelete,
      danger: true,
    },
    canReport && {
      key: "report",
      label: t("forum:postMenu.report"),
      run: () => onReport?.(),
    },
    // Safety last, after the content actions, matching the feed's ⋯ menu order.
    ...safety.actions,
  ].filter((action): action is PostMenuAction => Boolean(action));

  // Up/Down roving, Home/End to ends, Escape closes and restores focus.
  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex: number;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else {
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length;
    }
    items[nextIndex]?.focus();
  };

  // Tab (or Shift+Tab) out of the popup used to leave it rendered with
  // `aria-expanded="true"` behind the member's focus. Closing on a focusout
  // whose `relatedTarget` is outside the container fixes that; a null
  // relatedTarget (focus going to <body>, which is what a click on a menu item
  // does before its own click handler runs) is deliberately ignored, or the
  // item would unmount before it could act.
  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    if (containerRef.current?.contains(next)) return;
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={styles.container} onBlur={onFocusOut}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("forum:postMenu.ariaLabel")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={
                action.danger ? `${styles.item} ${styles.danger}` : styles.item
              }
              onClick={runAndClose(action.run)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {safety.dialog}
    </div>
  );
}
