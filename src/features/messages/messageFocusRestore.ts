// src/features/messages/messageFocusRestore.ts
import { useLayoutEffect, type RefObject } from "react";

/** The DOM id a message's bubble or album tile carries (see `MessageBubble`
 *  and `MessageAlbumTile`), and the one a jump to that message looks up. */
export function messageDomId(messageId: string): string {
  return `message-${messageId}`;
}

/**
 * On the next frame, moves focus onto whatever element now carries
 * `domId`: a bubble is focusable itself, while an album tile is a plain
 * wrapper whose photo opener takes the focus. Does nothing unless focus has
 * genuinely dropped (the active element is the body, or there is none) and
 * the element exists, so a thread switch or a member who already moved on
 * keeps their focus where it is.
 */
export function focusMessageNextFrame(domId: string) {
  requestAnimationFrame(() => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) return;
    const target = document.getElementById(domId);
    if (!target) return;
    const focusTarget =
      target.tabIndex >= 0
        ? target
        : target.querySelector<HTMLElement>('[tabindex="0"]');
    focusTarget?.focus();
  });
}

/**
 * Keeps keyboard focus on a message whose row is swapped for a different
 * component. A photo that gains a reaction, pin or star breaks out of its
 * album (`canJoinAlbum`), and one that loses its last mark joins one, so the
 * tile unmounts and a bubble mounts in its place (or the reverse) under the
 * same `message-<id>`. When focus sat inside the leaving node, it follows the
 * message to its new element.
 *
 * A layout effect because its cleanup runs while the node is still attached,
 * which is the last moment `contains(document.activeElement)` can answer.
 */
export function useFocusFollowsMessageRemount(
  nodeRef: RefObject<HTMLElement | null>,
  messageId: string | undefined,
) {
  useLayoutEffect(() => {
    const node = nodeRef.current;
    return () => {
      if (!messageId || !node?.contains(document.activeElement)) return;
      focusMessageNextFrame(messageDomId(messageId));
    };
  }, [nodeRef, messageId]);
}
