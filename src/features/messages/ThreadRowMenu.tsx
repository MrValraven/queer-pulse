import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiMoreHorizontal } from "react-icons/fi";
import { useAnchoredPopover } from "../../shared/components/ui/useAnchoredPopover";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useConversationClaim,
  useTakeOverConfirm,
  type ClaimStatus,
} from "./api/useConversationClaim";
import { TakeOverConfirmDialog } from "./mailboxes/ComposerMailboxBar";
import { useThreadRowMenuItems } from "./useThreadRowMenuItems";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/** Row-level "⋯" menu, rendered as a SIBLING of the thread row `<button>`
 *  (never nested inside it) — see `.threadRowWrap` in MessagesPage.module.css.
 *  Pin/Favorite are CONVERSATION-scoped (a different concept from the existing
 *  message-level pin/star inside a thread).
 *
 *  The dropdown is portalled to `<body>` and placed `fixed` by
 *  `useAnchoredPopover`: the thread list is a scroll container, so an
 *  absolutely-positioned panel on one of the last rows was clipped by the
 *  list's own overflow. Placed in viewport coordinates it flips above the
 *  trigger when there is no room below. Any scroll closes it, so it never
 *  floats over the list footer after its row has scrolled away. */
export function ThreadRowMenu({
  thread,
  isUnread,
  onTogglePin,
  onToggleFavorite,
  onToggleMute,
  onToggleArchive,
  onToggleReadUnread,
  onDelete,
  claimStatus = "none",
}: {
  /** Carries this row's own pinned/favorite/muted/archived state — the pin cap
   *  check itself lives in `useTogglePin` (the caller computes and passes the
   *  pinned count into its `mutate()` call, not through this component). */
  thread: Conversation;
  /** Whether the row is CURRENTLY showing as unread (real unread count OR a
   *  manual "mark unread", PRD-225) — decides the Mark as read/unread label,
   *  computed by the caller (`isThreadUnread`) so this stays in lockstep with
   *  the row's own badge. */
  isUnread: boolean;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  /** Marks read (reuses the real read-watermark mutation) when `isUnread` is
   *  true, or marks unread (PRD-225) when it's false. */
  onToggleReadUnread: () => void;
  /** Opens the delete-confirmation flow for this conversation. */
  onDelete: () => void;
  /** Business mailboxes: the row's claim, computed once by the row. */
  claimStatus?: ClaimStatus;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const placement = useAnchoredPopover(triggerRef, menuRef, open);
  const isPlaced = placement !== null;
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const {
    claim,
    release,
    takeOver,
    isPending: isClaimPending,
  } = useConversationClaim(thread);
  const takeOverConfirm = useTakeOverConfirm(thread, claimStatus);

  // Item definitions live in their own hook purely to keep this component
  // under the 200-line cap — see `useThreadRowMenuItems`'s own doc.
  const items = useThreadRowMenuItems(thread, isUnread, {
    onTogglePin,
    onToggleFavorite,
    onToggleMute,
    onToggleArchive,
    onToggleReadUnread,
    onDelete,
    claimStatus,
    onClaim: () => void claim(),
    onRelease: () => void release(),
    onRequestTakeOver: () => {
      // The chosen menu item unmounts as the menu closes: park focus on the
      // trigger first, so the confirm returns focus there.
      triggerRef.current?.focus();
      takeOverConfirm.open();
    },
  });

  useEffect(() => {
    if (!open) return;
    function onDocumentPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      // The panel is portalled out of `containerRef`, so an outside press has
      // to miss both the trigger's wrapper and the panel itself.
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onAnyScroll() {
      // Hand focus back only when it sat in the panel, which is about to
      // unmount and would otherwise drop focus to `<body>`.
      if (menuRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus({ preventScroll: true });
      }
      setOpen(false);
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    // Capture phase: the thread list scrolls itself, and its scroll events
    // never reach `window` by bubbling.
    window.addEventListener("scroll", onAnyScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      window.removeEventListener("scroll", onAnyScroll, true);
    };
  }, [open]);

  // APG menu-button contract: move focus into the menu when it opens. Waits
  // for placement so focus never lands on the panel for the one commit it is
  // still unplaced; `preventScroll`, because a scroll now closes the menu.
  useEffect(() => {
    if (open && isPlaced) itemRefs.current[0]?.focus({ preventScroll: true });
  }, [open, isPlaced]);

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
    // Tab closes too: the portalled panel sits at the end of `<body>`, so a
    // Tab from inside it would otherwise leave the page instead of moving on
    // from the trigger.
    if (event.key === "Escape" || event.key === "Tab") {
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
        data-tap-target
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
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={[
              styles.rowMenuPopover,
              styles.rowMenuPopoverPortal,
              placement === null && styles.rowMenuPopoverUnplaced,
              placement?.isFlipped && styles.rowMenuPopoverFlipped,
            ]
              .filter(Boolean)
              .join(" ")}
            style={placement?.style}
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
          </div>,
          document.body,
        )}
      {/* The same take-over confirm the composer bar uses. */}
      <TakeOverConfirmDialog
        open={takeOverConfirm.isOpen}
        claimantName={takeOverConfirm.claimantName}
        loading={isClaimPending}
        onClose={takeOverConfirm.close}
        onConfirm={() => {
          takeOverConfirm.close();
          void takeOver();
        }}
      />
    </div>
  );
}
