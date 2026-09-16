// src/features/messages/useWhoReactedGesture.ts
import { useRef, type MouseEvent, type PointerEvent } from "react";
import { useLongPress } from "./useLongPress";
import { hasWhoReactedOpener, openWhoReacted } from "./whoReacted";
import styles from "./MessagesPage.module.css";

/** `MessageBubble` stamps `id="message-<server id>"` on its wrap, which is
 *  where the reaction chips render. */
const MESSAGE_DOM_ID_PREFIX = "message-";

/** The server id of the bubble `element` sits in, or null outside one (an
 *  optimistic or demo bubble carries no id). Read from the DOM so the chips
 *  need no message prop from the memoized bubble. */
function bubbleMessageId(element: Element): string | null {
  const bubbleWrapClass = styles.bubbleWrap;
  if (!bubbleWrapClass) return null;
  const bubble = element.closest(
    `.${CSS.escape(bubbleWrapClass)}[id^="${MESSAGE_DOM_ID_PREFIX}"]`,
  );
  return bubble ? bubble.id.slice(MESSAGE_DOM_ID_PREFIX.length) : null;
}

/** How long after a touch release the click it produces may still arrive. */
const RELEASE_CLICK_WINDOW_MS = 600;

/** Marks the chip row, so `useMessageGestures` can recognise its presses. */
const REACTION_CHIPS_SELECTOR = "[data-reaction-chips]";

/** Whether the reaction chip row under `target` handles a long-press or
 *  right-click itself: a conversation is listening and the bubble has a server
 *  id. `useMessageGestures` leaves exactly these presses alone, so a hold on the
 *  chips never also arms the bubble's action overlay. The check runs where the
 *  bubble reads the event instead of stopping it at the row, so document-level
 *  outside-dismiss listeners (composer popovers, kebab menus) still see it. */
export function isWhoReactedGestureTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const chipRow = target.closest(REACTION_CHIPS_SELECTOR);
  return (
    !!chipRow && hasWhoReactedOpener() && bubbleMessageId(chipRow) !== null
  );
}

/**
 * Long-press (touch) and right-click (pointer) on a bubble's reaction chip row
 * open the "who reacted" sheet (PRD-352), while a tap on a chip still toggles
 * that reaction. Spread the result on the chips container.
 *
 * - The bubble's own long-press and context menu step aside for the row's
 *   presses (`isWhoReactedGestureTarget`); nothing stops propagation here. The
 *   chips are buttons, so `isInteractiveTarget` already keeps the bubble's
 *   swipe and double-tap away from them.
 * - The click a touch hold releases is swallowed once, so opening the sheet
 *   never also toggles the chip under the finger. It arms only while a touch
 *   pointer is actually down, becomes a short window on release or cancel, and
 *   resets on the next press, so a keyboard Enter or Space on a chip (or a
 *   Menu key context menu) is never eaten.
 * - With no conversation listening, or outside a bubble with a server id,
 *   every handler steps aside and the bubble behaves exactly as before.
 *
 * The keyboard and screen-reader path is the "Reactions" item in the message
 * action menu.
 */
export function useWhoReactedGesture() {
  const pendingMessageIdRef = useRef<string | null>(null);
  /** True only while a touch or pen pointer is down on the row. */
  const isTouchPointerDownRef = useRef(false);
  /** Epoch ms until which one click is swallowed: `Infinity` while the hold
   *  that opened the sheet is still down, 0 when nothing is armed. */
  const swallowClickUntilRef = useRef(0);

  function armClickSwallow() {
    // Only a touch hold releases a click onto a chip; a mouse right-click and
    // a keyboard context menu release none.
    if (isTouchPointerDownRef.current) {
      swallowClickUntilRef.current = Number.POSITIVE_INFINITY;
    }
  }

  const longPress = useLongPress(() => {
    const messageId = pendingMessageIdRef.current;
    if (messageId && openWhoReacted(messageId)) armClickSwallow();
  });

  function resolveMessageId(element: Element): string | null {
    return hasWhoReactedOpener() ? bubbleMessageId(element) : null;
  }

  function endPress() {
    isTouchPointerDownRef.current = false;
    // The release click follows within a moment, or never (a cancelled
    // pointer), so an unused swallow expires on its own.
    if (swallowClickUntilRef.current === Number.POSITIVE_INFINITY) {
      swallowClickUntilRef.current = Date.now() + RELEASE_CLICK_WINDOW_MS;
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swallowClickUntilRef.current = 0;
    isTouchPointerDownRef.current = event.pointerType !== "mouse";
    const messageId = resolveMessageId(event.currentTarget);
    pendingMessageIdRef.current = messageId;
    if (messageId) longPress.onPointerDown(event);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    longPress.onPointerUp(event);
    endPress();
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    longPress.onPointerLeave(event);
    endPress();
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    longPress.onPointerCancel(event);
    endPress();
  }

  function onContextMenu(event: MouseEvent<HTMLDivElement>) {
    const messageId = resolveMessageId(event.currentTarget);
    if (!messageId) return;
    event.preventDefault();
    // Android fires `contextmenu` during a touch hold as well: clear the
    // pending timer so the sheet opens once.
    longPress.onPointerCancel(event as unknown as PointerEvent);
    if (openWhoReacted(messageId)) armClickSwallow();
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (Date.now() >= swallowClickUntilRef.current) return;
    swallowClickUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    "data-reaction-chips": "",
    onPointerDown,
    onPointerMove: longPress.onPointerMove,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onContextMenu,
    onClickCapture,
  };
}
