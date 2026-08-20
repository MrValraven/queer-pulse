import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FiBell, FiBellOff, FiHeart, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { TbPin, TbPinnedFilled } from "react-icons/tb";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface MenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

/** Row-level "⋯" menu, rendered as a SIBLING of the thread row `<button>`
 *  (never nested inside it) — see `.threadRowWrap` in MessagesPage.module.css.
 *  Pin/Favorite are CONVERSATION-scoped (a different concept from the existing
 *  message-level pin/star inside a thread). */
export function ThreadRowMenu({
  thread,
  onTogglePin,
  onToggleFavorite,
  onToggleMute,
  onDelete,
}: {
  /** Carries this row's own pinned/favorite/muted state — the pin cap check
   *  itself lives in `useTogglePin` (the caller computes and passes the
   *  pinned count into its `mutate()` call, not through this component). */
  thread: Conversation;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onToggleMute: () => void;
  /** Opens the delete-confirmation flow for this conversation. */
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isPinned = !!thread.pinnedAt;
  const isFavorite = !!thread.favorite;
  const isMuted = !!thread.muted;

  const items: MenuItemDef[] = useMemo(
    () => [
      {
        key: "pin",
        label: isPinned
          ? t("messages:thread.unpinChat")
          : t("messages:thread.pinChat"),
        icon: isPinned ? <TbPinnedFilled aria-hidden /> : <TbPin aria-hidden />,
        onSelect: onTogglePin,
      },
      {
        key: "favorite",
        label: isFavorite
          ? t("messages:thread.unfavoriteChat")
          : t("messages:thread.favoriteChat"),
        icon: <FiHeart aria-hidden />,
        onSelect: onToggleFavorite,
      },
      {
        key: "mute",
        label: isMuted
          ? t("messages:thread.unmuteChat")
          : t("messages:thread.muteChat"),
        icon: isMuted ? <FiBellOff aria-hidden /> : <FiBell aria-hidden />,
        onSelect: onToggleMute,
      },
      {
        key: "delete",
        label: t("messages:thread.deleteChat"),
        icon: <FiTrash2 aria-hidden />,
        onSelect: onDelete,
        danger: true,
      },
    ],
    [
      isPinned,
      isFavorite,
      isMuted,
      onTogglePin,
      onToggleFavorite,
      onToggleMute,
      onDelete,
      t,
    ],
  );

  useEffect(() => {
    if (!open) return;
    function onDocumentPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
    };
  }, [open]);

  // APG menu-button contract: move focus into the menu when it opens.
  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // APG menu keyboard contract, generalized to N items: Arrow Up/Down move a
  // roving focus, Home/End jump to the ends, Escape closes and restores focus
  // to the trigger.
  const moveTo = (index: number) => {
    const nextIndex = (index + items.length) % items.length;
    itemRefs.current[nextIndex]?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    const currentIndex = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(currentIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(items.length - 1);
        break;
    }
  };

  return (
    <div className={styles.rowMenu} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.rowMenuTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("messages:thread.menuAria")}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {open && (
        <div
          className={styles.rowMenuPopover}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={
                item.danger ? styles.rowMenuItemDanger : styles.rowMenuItem
              }
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
