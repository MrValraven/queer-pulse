// src/features/messages/useBubbleInteractionState.ts
import type { KeyboardEvent, RefObject } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import type { LongPressOrigin } from "./useLongPress";
import { useBubbleGestures } from "./useBubbleGestures";
import { useFocusFollowsMessageRemount } from "./messageFocusRestore";
import type { ChatMessage } from "./data";

/** True when a "deleted for everyone" tombstone is still within the server's
 *  30-day evidence hold and reportable by a non-author participant (e.g. an
 *  explicit image unsent seconds after it was seen): the ONE action a
 *  tombstone ever exposes; see `BubbleTombstone`'s own doc for the full
 *  picture. Mirrors the server's `canReport` flag; never recomputed. */
function isReportableTombstone(message: ChatMessage): boolean {
  return !!message.id && !!message.deletedAt && !!message.canReport;
}

interface UseBubbleInteractionStateOptions {
  message: ChatMessage;
  isSent: boolean;
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
}

/** Every piece of a bubble's interaction wiring that isn't pure JSX: the
 *  overlay-open/keyboard-entry gates, the touch/pointer gestures
 *  (`useBubbleGestures`) and the focus-follows-remount effect for a photo
 *  that joins an album. Split out of `MessageBubble` so that component's
 *  render function stays under the line cap; every gate and handler below
 *  is unchanged from its old inline form. */
export function useBubbleInteractionState({
  message,
  isSent,
  onOpenActions,
  onReply,
  onReactionToggle,
  wrapRef,
  hintRef,
}: UseBubbleInteractionStateOptions) {
  // A message with a server id can open the action overlay; give its bubble a
  // guaranteed keyboard entry point (Enter), mirroring long-press / right-click.
  const canOpenOverlay = !!message.id;
  const canInteract = canOpenOverlay && !message.deletedAt;
  const canReportThisTombstone = isReportableTombstone(message);
  const reactions = message.reactions ?? [];

  function openOverlayFromBubble() {
    const node = wrapRef.current;
    if (!node) return;
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

  function handleBubbleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Only when the bubble itself is focused; never when the event bubbled up
    // from a nested control (React/More buttons, reply-quote, reaction chips).
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter") {
      event.preventDefault();
      openOverlayFromBubble();
    }
  }

  // Long-press/right-click, swipe-to-reply, double-tap love and tap-to-open a
  // photo, with every gate documented in `useBubbleGestures`.
  const gestures = useBubbleGestures({
    message,
    isSent,
    canInteract,
    canOpenActions: canInteract || canReportThisTombstone,
    onOpenActions,
    onReply,
    onReactionToggle,
    wrapRef,
    hintRef,
  });

  // A photo that loses its last mark joins an album: focus follows it there.
  useFocusFollowsMessageRemount(wrapRef, message.id);

  return {
    canOpenOverlay,
    canInteract,
    canReportThisTombstone,
    reactions,
    gestures,
    openOverlayFromBubble,
    handleBubbleKeyDown,
  };
}
