// src/features/messages/MessageAlbumTile.tsx
import { useEffect, useId, useRef, type MouseEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import { useFocusFollowsMessageRemount } from "./messageFocusRestore";
import { PhotoBubbleImage } from "./PhotoBubbleImage";
import { useBubbleGestures } from "./useBubbleGestures";
import {
  useIsAnyMessageHighlighted,
  useIsMessageHighlighted,
} from "./messageJumpStore";
import type { LongPressOrigin } from "./useLongPress";
import type { ChatMessage } from "./data";
import pageStyles from "./MessagesPage.module.css";
import styles from "./MessageAlbum.module.css";

/**
 * Swallows the browser's own `contextmenu` that can follow a keyboard open of
 * the action overlay. Windows raises one after the Menu key or Shift+F10, and
 * the tile's right-click handler would open the overlay a second time; macOS
 * raises none, which is why the keyboard path exists at all. The guard holds
 * from the keydown until just after that key's keyup, since the event lands
 * right after keyup, and is released on unmount.
 */
function useKeyboardContextMenuGuard() {
  const isGuardingRef = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);
  useEffect(() => () => releaseRef.current?.(), []);

  function guardUntilKeyUp() {
    releaseRef.current?.();
    isGuardingRef.current = true;
    let releaseTimer: number | undefined;
    const handleKeyUp = () => {
      window.removeEventListener("keyup", handleKeyUp, true);
      releaseTimer = window.setTimeout(release, 0);
    };
    const release = () => {
      window.removeEventListener("keyup", handleKeyUp, true);
      window.clearTimeout(releaseTimer);
      isGuardingRef.current = false;
      releaseRef.current = null;
    };
    window.addEventListener("keyup", handleKeyUp, true);
    releaseRef.current = release;
  }

  /** True (and the native menu cancelled) for a guarded `contextmenu`. */
  function shouldSwallow(event: MouseEvent) {
    if (!isGuardingRef.current) return false;
    event.preventDefault();
    return true;
  }

  return { guardUntilKeyUp, shouldSwallow };
}

/**
 * One photo inside an album. The tile is that photo's own gesture surface,
 * wired through the same `useBubbleGestures` a single photo bubble uses, so a
 * tap opens the viewer at THIS photo (with the tile's opener as the zoom
 * origin), a failed photo retries on tap, and a long-press or right-click
 * opens the action overlay for this tile's message. Tiles have no focusable
 * wrapper or hover bar, so the focused opener also opens the overlay on the
 * Menu key or Shift+F10 through a keydown, which fires on every OS.
 *
 * Swipe-to-reply is left off (no `onReply`): the swipe follow transforms the
 * gesture node, and sliding one tile out of the grid reads as a broken
 * layout. Double-tap love is already off for photos inside the hook.
 *
 * `hiddenCount` above 0 marks the last visible tile, which paints "+N" over
 * its photo and still opens the viewer at its own (the fourth) photo.
 */
export function MessageAlbumTile({
  message,
  isSent,
  senderName,
  position,
  total,
  hiddenCount,
  hiddenMessageIds,
  onOpenActions,
}: {
  message: ChatMessage;
  isSent: boolean;
  senderName: string;
  /** Zero-based position of this photo in the album. */
  position: number;
  /** Photos in the whole album, including the hidden ones. */
  total: number;
  hiddenCount: number;
  /** Server ids of the photos this "+N" tile hides; empty on other tiles. */
  hiddenMessageIds: readonly string[];
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
}) {
  const { t } = useTranslation();
  const tileRef = useRef<HTMLDivElement>(null);
  // Required by the gesture hook and never attached: with swipe off there is
  // no reply hint to drive, and the hook skips a null node.
  const hintRef = useRef<HTMLSpanElement>(null);
  const contentLabelId = useId();
  const isOwnPhotoHighlighted = useIsMessageHighlighted(message.id);
  const isHiddenPhotoHighlighted = useIsAnyMessageHighlighted(hiddenMessageIds);
  const isHighlighted = isOwnPhotoHighlighted || isHiddenPhotoHighlighted;
  // Same gate as a bubble: only a server-acked message opens the overlay. The
  // tap to open the photo stays live without one (see `useBubbleGestures`).
  const canInteract = !!message.id && !message.deletedAt;
  const gestures = useBubbleGestures({
    message,
    isSent,
    canInteract,
    onOpenActions,
    wrapRef: tileRef,
    hintRef,
  });
  const contextMenuGuard = useKeyboardContextMenuGuard();
  // A reaction, pin or star from the keyboard breaks this photo out of the
  // album; focus follows it to the bubble that replaces this tile.
  useFocusFollowsMessageRemount(tileRef, message.id);
  // The keyboard twin of `MessageBubble`'s `openOverlayFromBubble`: the same
  // origin shape, measured from this tile.
  function openOverlayFromKeyboard() {
    const node = tileRef.current;
    if (!node) return;
    contextMenuGuard.guardUntilKeyUp();
    const rect = node.getBoundingClientRect();
    onOpenActions?.(
      message,
      {
        rect,
        source: "pointer",
        point: { x: isSent ? rect.right : rect.left, y: rect.top },
      },
      isSent,
    );
  }
  const attachment =
    message.attachment && !isDocumentAttachment(message.attachment)
      ? message.attachment
      : null;
  // `canJoinAlbum` only admits photos with an attachment; this keeps the
  // types honest rather than handling a case that cannot reach here.
  if (!attachment) return null;

  return (
    <div
      ref={tileRef}
      // The jump target id a single bubble carries, so a jump to any album
      // member lands on, and rings, its own tile.
      id={message.id ? `message-${message.id}` : undefined}
      className={[
        styles.tile,
        isHighlighted && pageStyles.messageHighlight,
        isHighlighted && styles.tileHighlighted,
      ]
        .filter(Boolean)
        .join(" ")}
      {...gestures.handlers}
      // After the spread, so a `contextmenu` that only echoes a keyboard open
      // is swallowed before the right-click path opens the overlay again.
      onContextMenu={(event) => {
        if (contextMenuGuard.shouldSwallow(event)) return;
        gestures.handlers.onContextMenu(event);
      }}
    >
      <PhotoBubbleImage
        onKeyboardOpenActions={
          canInteract && onOpenActions ? openOverlayFromKeyboard : undefined
        }
        message={message}
        senderName={senderName}
        url={attachment.url}
        width={attachment.width}
        height={attachment.height}
        // The tile owns the square; the opener and frame fill it.
        aspectRatio={1}
        imageAlt={t("messages:attachments.imageAlt")}
        contentLabelId={contentLabelId}
        openLabel={t("messages:attachments.thumbnailPhoto", {
          index: position + 1,
          count: total,
        })}
      />
      {hiddenCount > 0 && (
        <span className={styles.moreOverlay} aria-hidden="true">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
