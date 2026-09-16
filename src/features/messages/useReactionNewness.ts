// src/features/messages/useReactionNewness.ts
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import type { ChatMessage } from "./data";

/** Composite identity for one reaction chip on a message. Only meaningful
 *  once the message has a server id (reactions don't exist on demo/optimistic
 *  messages, see `ChatMessage.reactions`). */
function reactionIdentity(
  message: ChatMessage,
  key: string,
): string | undefined {
  return message.id ? `${message.id}::reaction::${key}` : undefined;
}

/** Adds every live reaction-chip identity on `message` to `identities`. */
function addReactionIdentities(
  message: ChatMessage,
  identities: Set<string>,
): void {
  for (const reaction of message.reactions ?? []) {
    if (reaction.count <= 0) continue;
    const identity = reactionIdentity(message, reaction.key);
    if (identity) identities.add(identity);
  }
}

/** Every reaction-chip identity currently in `messageGroups`, as a fresh `Set`
 *  (a plain value, never a persisted mutable reference, so safe to compute
 *  directly in a render body). Walks the whole list, so it only runs on mount
 *  and on a thread switch. */
function collectReactionIdentities(
  messageGroups: { day: string; items: ChatMessage[] }[],
): Set<string> {
  const identities = new Set<string>();
  for (const group of messageGroups) {
    for (const message of group.items)
      addReactionIdentities(message, identities);
  }
  return identities;
}

/**
 * Tracks which reaction-chip identities have already been on screen for this
 * conversation, so a chip's `msgBubbleIn` pop plays ONLY for a genuinely new
 * one: never for every chip in the thread on open/switch (which would pop
 * 20-50 at once, a "swarm"), and never replayed for a chip an unrelated
 * re-render happens to touch again. Bubbles themselves have no entrance to
 * gate: they pop straight in (see the note above `.bubble` in the stylesheet).
 *
 * Two layers, deliberately split so neither needs a ref read/write in the
 * render body (`react-hooks/refs` disallows that outright):
 *  - `baseSeenSet` (real state) is everything that was ALREADY on screen the
 *    moment we most recently arrived at `conversationId`. Reseeded via
 *    React's sanctioned "adjust state while rendering" idiom (matching
 *    `useFeedPage.tsx`'s `prevDemo` pattern), so even the FIRST paint of a
 *    freshly opened thread treats every chip in it as already-known. Because
 *    this only changes on an actual thread switch, `isNewReaction`'s
 *    `useCallback` reference stays stable across ordinary arrivals within the
 *    same thread, so passing it down doesn't defeat the memoized row tree.
 *  - `accumulatedRef` layers in everything that has arrived SINCE the thread
 *    settled, written only inside the `useLayoutEffect`s below and read only
 *    from inside the `useCallback` body.
 *
 * Incremental: a cache patch used to re-walk every loaded message and rebuild
 * every chip identity string per frame. `scannedMessagesRef` remembers which
 * message OBJECTS were already folded in, and adapted messages are
 * referentially stable across cache patches, so each patch only builds
 * identities for the messages whose reference changed (a new reaction, an
 * edit, a new arrival). A message whose reactions changed always arrives as a
 * new object, so nothing can be missed by skipping a known reference.
 */
export function useReactionNewness(
  conversationId: string,
  messageGroups: { day: string; items: ChatMessage[] }[],
) {
  const [settledConversationId, setSettledConversationId] =
    useState(conversationId);
  const [baseSeenSet, setBaseSeenSet] = useState(() =>
    collectReactionIdentities(messageGroups),
  );
  if (conversationId !== settledConversationId) {
    setSettledConversationId(conversationId);
    setBaseSeenSet(collectReactionIdentities(messageGroups));
  }

  const accumulatedRef = useRef<Set<string>>(new Set());
  const scannedMessagesRef = useRef<WeakSet<ChatMessage>>(new WeakSet());

  // Thread switch: drop whatever the PREVIOUS conversation accumulated. It's
  // for a different set of message ids and would just grow this ref forever
  // across a long session otherwise. Declared before the mark-effect below so
  // it clears first within the same commit when both fire together.
  useLayoutEffect(() => {
    accumulatedRef.current = new Set();
    scannedMessagesRef.current = new WeakSet();
  }, [conversationId]);

  useLayoutEffect(() => {
    const scannedMessages = scannedMessagesRef.current;
    for (const group of messageGroups) {
      for (const message of group.items) {
        if (scannedMessages.has(message)) continue;
        scannedMessages.add(message);
        addReactionIdentities(message, accumulatedRef.current);
      }
    }
  }, [messageGroups]);

  const isNewReaction = useCallback(
    (message: ChatMessage, key: MessageReactionKey): boolean => {
      const identity = reactionIdentity(message, key);
      if (!identity) return false;
      return (
        !baseSeenSet.has(identity) && !accumulatedRef.current.has(identity)
      );
    },
    [baseSeenSet],
  );

  return { isNewReaction };
}
