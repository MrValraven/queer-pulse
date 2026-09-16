// src/features/messages/useBubbleGestures.ts
import type { RefObject } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { findReactionMine } from "./reactionKeys";
import { retryIfPhotoFailed } from "./photoRetry";
import type { LongPressOrigin } from "./useLongPress";
import { useMessageGestures } from "./useMessageGestures";
import { isViewablePhoto } from "./useThreadImageGallery";
import { useChatImageViewer } from "./ChatImageViewerContext";
import type { ChatMessage } from "./data";

/** One bubble's touch/pointer gestures, wired to that bubble's handlers:
 *  long-press/right-click opens the action overlay, a swipe arms a reply, a
 *  double-tap toggles love, and a single tap on a photo opens the viewer (or
 *  retries a photo that failed to load). Split out of `MessageBubble` so that
 *  component stays under the line cap; every gate below is unchanged. */
export function useBubbleGestures({
  message,
  isSent,
  canInteract,
  canOpenActions = canInteract,
  onOpenActions,
  onReply,
  onReactionToggle,
  wrapRef,
  hintRef,
}: {
  message: ChatMessage;
  isSent: boolean;
  /** Server id and not deleted: reply, quick-react and (unless overridden by
   *  `canOpenActions` below) the action overlay. */
  canInteract: boolean;
  /** Gates the action overlay alone (long-press/right-click), separately from
   *  `canInteract`: a reportable tombstone (a "deleted for everyone" message
   *  still within the server's evidence-hold window, `ChatMessage.canReport`)
   *  opens the overlay even though `canInteract` stays false for it, so reply,
   *  quick-react and tap-to-open-photo all still stay inert. Defaults to
   *  `canInteract`, unchanged for every other bubble. */
  canOpenActions?: boolean;
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
  onReply?: (message: ChatMessage) => void;
  onReactionToggle?: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  wrapRef: RefObject<HTMLDivElement | null>;
  hintRef: RefObject<HTMLSpanElement | null>;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const { openImage } = useChatImageViewer();
  // A photo/GIF bubble opens the viewer on a single tap, and gives up its
  // double-tap reaction so the open is instant (reactions stay one long-press,
  // right-click, hover-bar or Enter away, exactly as on any other bubble).
  const canOpenPhoto = isViewablePhoto(message);
  // Gestures themselves must be live even before a message has a server id, as
  // long as its bubble has some tap action to reach: a viewable photo opens on
  // tap in demo mode, and in live mode for the whole window between an
  // optimistic send and its ack, or after an outbox restore. `canOpenPhoto`
  // already excludes deleted messages (see `isViewablePhoto`), so this can't
  // re-enable a tombstoned bubble. The action overlay itself is gated on
  // `canOpenActions` (defaults to `canInteract`) at the `onOpenActions` call
  // below.
  const canGesture = canInteract || canOpenPhoto || canOpenActions;
  // Double-tap/double-click toggles the love reaction through the EXISTING handler
  // (no second reaction path). WhatsApp-style: the feedback is simply the
  // reaction chip landing under the bubble (it has its own subtle entrance),
  // with no separate overlay flourish.
  function quickReact() {
    const loveMine = findReactionMine(message.reactions ?? [], "love");
    onReactionToggle?.(message, "love", loveMine);
  }

  return useMessageGestures({
    enabled: canGesture,
    // Only a message with a server id can open the action overlay (Reply,
    // Forward, Star, Edit, Delete, Report all need one). Undefined here keeps
    // long-press/right-click genuinely inert for an id-less bubble even though
    // `canGesture` now lets it through for tap-to-open-photo or a reportable
    // tombstone (`canOpenActions`).
    onOpenActions: canOpenActions
      ? (origin) => onOpenActions?.(message, origin, isSent)
      : undefined,
    // Reuse the overlay's reply handler; only a message with a server id can be
    // replied to (optimistic ones can't), so swipe is inert until then.
    onReply: canInteract && onReply ? () => onReply(message) : undefined,
    onActivate: canOpenPhoto
      ? () => {
          // The tappable span around this bubble's photo, marked by
          // `PhotoBubbleImage`. Read at tap time rather than held in a ref,
          // because the gesture hook already owns `wrapRef` and the photo
          // node is whatever this bubble currently renders.
          const opener = wrapRef.current?.querySelector<HTMLElement>(
            "[data-photo-opener]",
          );
          // A photo that failed to load retries on tap instead of opening.
          if (retryIfPhotoFailed(opener)) return;
          openImage(message, opener);
        }
      : undefined,
    onQuickReact:
      canInteract && onReactionToggle && !canOpenPhoto ? quickReact : undefined,
    // Received (left-aligned) bubbles swipe right to reply; sent (own,
    // right-aligned) bubbles swipe left: always away from where they sit.
    replyDirection: isSent ? "left" : "right",
    // The hook writes the follow-transform/hint-progress straight to these
    // same nodes, with no React state and no per-frame re-render of this
    // bubble's subtree.
    bubbleRef: wrapRef,
    hintRef,
    reducedMotion,
  });
}
