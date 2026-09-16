// src/features/messages/MessageContextMenu.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../shared/hooks";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageActionMenu, TombstoneReportMenu } from "./MessageActionMenu";
import { focusMessageNextFrame } from "./messageFocusRestore";
import { ReactionPicker } from "./ReactionPicker";
import styles from "./MessagesPage.module.css";

export interface MessageContextMenuProps {
  /** Where to open — the cursor for a right-click, or the bubble corner for a
   *  keyboard/"⋯" open. Viewport coordinates. */
  anchor: { x: number; y: number };
  /** True for a reportable tombstone — see `MessageActionOverlay`'s own doc.
   *  Defaults to false. */
  isTombstone?: boolean;
  /** Server-authoritative: own message AND within the server's edit window. */
  canEdit: boolean;
  /** Server-authoritative: own message OR staff. */
  canDelete: boolean;
  /** Server-authoritative: NOT own message. */
  canReport: boolean;
  /** May pin/unpin this message (server-authoritative). */
  canPin: boolean;
  /** Message is currently pinned (SHARED). */
  pinned: boolean;
  /** Viewer has privately starred it. */
  starred: boolean;
  /** The signed-in member's current reaction keys on this message, forwarded
   *  straight to `ReactionPicker`'s `myReactionKeys`: derive with
   *  `myReactionKeys`/`findReactionMine` from `reactionKeys.ts`. */
  myReactionKeys: MessageReactionKey[];
  onReact: (key: MessageReactionKey) => void;
  onReply: () => void;
  onForward: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
  onEdit: () => void;
  onCopy: () => void;
  canCopy?: boolean;
  /** PRD-351 "Info": see `MessageActionMenu`'s own doc. */
  canShowInfo?: boolean;
  onInfo?: () => void;
  /** PRD-352 "Reactions": see `MessageActionMenu`'s own doc. */
  canShowReactions?: boolean;
  onReactions?: () => void;
  onDelete: () => void;
  /** "Delete for me" (PRD-227) — see `MessageActionMenu`'s own doc. */
  onDeleteForMe: () => void;
  onReport: () => void;
  onClose: () => void;
}

/** Gap kept between the menu and any viewport edge. */
const EDGE_GAP = 8;

/**
 * Desktop right-click / keyboard action surface: a compact, cursor-anchored
 * context menu (reaction row + Reply / Edit / Copy / Delete / Report) — the
 * native-feeling counterpart to the touch long-press `MessageActionOverlay`.
 * No dimmed backdrop and no lifted bubble clone; it opens at the pointer, flips
 * to stay on-screen, and dismisses on outside click, Escape, scroll, or resize.
 */
export function MessageContextMenu({
  anchor,
  isTombstone = false,
  canEdit,
  canDelete,
  canReport,
  canPin,
  pinned,
  starred,
  myReactionKeys,
  onReact,
  onReply,
  onForward,
  onTogglePin,
  onToggleStar,
  onEdit,
  onCopy,
  canCopy,
  canShowInfo,
  onInfo,
  canShowReactions,
  onReactions,
  onDelete,
  onDeleteForMe,
  onReport,
  onClose,
}: MessageContextMenuProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{
    left: number;
    top: number;
    transformOrigin: string;
  } | null>(null);

  // Measure and clamp/flip into the viewport *before* paint, so the menu never
  // spills off an edge and never flashes at the raw anchor first.
  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const { width, height } = node.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const openLeft = anchor.x + width + EDGE_GAP > viewportWidth;
    const openUp = anchor.y + height + EDGE_GAP > viewportHeight;
    let left = openLeft ? anchor.x - width : anchor.x;
    let top = openUp ? anchor.y - height : anchor.y;
    left = Math.min(
      Math.max(EDGE_GAP, left),
      Math.max(EDGE_GAP, viewportWidth - width - EDGE_GAP),
    );
    top = Math.min(
      Math.max(EDGE_GAP, top),
      Math.max(EDGE_GAP, viewportHeight - height - EDGE_GAP),
    );
    setPlacement({
      left,
      top,
      transformOrigin: `${openLeft ? "right" : "left"} ${openUp ? "bottom" : "top"}`,
    });
  }, [anchor.x, anchor.y]);

  // Keep the latest onClose reachable without re-running the mount effect —
  // the parent re-renders often (typing/presence/scroll state) and recreates
  // onClose each time, which would otherwise re-attach listeners and yank focus
  // back out of the menu on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Dismiss on outside pointer / Escape / scroll / resize; move focus into the
  // menu for keyboard use and restore it on unmount. Mount-only.
  useEffect(() => {
    const close = () => onCloseRef.current();
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // The bubble or album tile the menu opened from. When the action swaps
    // that row for another component in the same commit that closes the menu
    // (a photo breaking out of its album), the opener is gone by cleanup and
    // focus goes to whatever now carries this id instead.
    const openerMessageDomId =
      previouslyFocused?.closest?.('[id^="message-"]')?.id ?? null;
    menuRef.current?.focus();
    function handleMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    // A scroll or resize invalidates the anchor point — dismiss rather than
    // leave the menu floating away from the message.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      if (previouslyFocused && !previouslyFocused.isConnected) {
        if (openerMessageDomId) focusMessageNextFrame(openerMessageDomId);
        return;
      }
      previouslyFocused?.focus?.();
    };
  }, []);

  const runThenClose = (action: () => void) => () => {
    action();
    onClose();
  };

  return createPortal(
    <div
      ref={containerRef}
      className={styles.contextMenu}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      style={{
        left: placement?.left ?? anchor.x,
        top: placement?.top ?? anchor.y,
        transformOrigin: placement?.transformOrigin,
        // Keep the pre-measure frame invisible so it never paints at the raw anchor.
        visibility: placement ? "visible" : "hidden",
      }}
    >
      {/* A tombstone never had a reaction to begin with. */}
      {!isTombstone && (
        <div className={styles.overlayReactions}>
          <ReactionPicker
            onPick={(key) => runThenClose(() => onReact(key))()}
            myReactionKeys={myReactionKeys}
          />
        </div>
      )}
      {isTombstone ? (
        <TombstoneReportMenu
          menuRef={menuRef}
          onReport={onReport}
          onClose={onClose}
        />
      ) : (
        <MessageActionMenu
          menuRef={menuRef}
          canEdit={canEdit}
          canDelete={canDelete}
          canReport={canReport}
          canPin={canPin}
          pinned={pinned}
          starred={starred}
          onReply={onReply}
          onForward={onForward}
          onTogglePin={onTogglePin}
          onToggleStar={onToggleStar}
          onEdit={onEdit}
          onCopy={onCopy}
          canCopy={canCopy}
          canShowInfo={canShowInfo}
          onInfo={onInfo}
          canShowReactions={canShowReactions}
          onReactions={onReactions}
          onDelete={onDelete}
          onDeleteForMe={onDeleteForMe}
          onReport={onReport}
          onClose={onClose}
        />
      )}
    </div>,
    document.body,
  );
}
