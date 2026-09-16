// src/features/messages/whoReacted.ts
import type { ChatMessage } from "./data";

type WhoReactedOpener = (messageId: string) => void;

/**
 * The opener for the "who reacted" sheet (PRD-352), registered by the mounted
 * `ConversationOverlays`, which owns the sheet's state beside the Info sheet.
 *
 * A module channel because that component renders beside the message log
 * instead of above it, so a context it provided could never reach the reaction
 * chips; and a provider higher up would mean growing `ConversationPanel` and
 * threading a prop through the memoized bubble. A channel also costs the
 * bubbles nothing: nothing re-renders when the opener changes.
 *
 * With nothing registered (a chip rendered outside a conversation, or in a
 * test) opening is a no-op that reports `false`, so the caller falls back to
 * its ordinary behaviour.
 */
let registeredOpener: WhoReactedOpener | null = null;

/** Registers `opener` and returns the matching unregister, for a `useEffect`. */
export function registerWhoReactedOpener(opener: WhoReactedOpener): () => void {
  registeredOpener = opener;
  return () => {
    if (registeredOpener === opener) registeredOpener = null;
  };
}

export function hasWhoReactedOpener(): boolean {
  return registeredOpener !== null;
}

/** Opens the sheet for `messageId`. False when no conversation is listening. */
export function openWhoReacted(messageId: string): boolean {
  if (!registeredOpener) return false;
  registeredOpener(messageId);
  return true;
}

/** Whether to offer "Reactions" in a message's action menu: a server-confirmed,
 *  not-deleted message with at least one reaction. A display gate: the
 *  endpoint re-checks what the caller may see. Demo messages have no id, so
 *  the item never shows there. */
export function canShowMessageReactors(message: ChatMessage): boolean {
  return (
    !!message.id &&
    !message.deletedAt &&
    (message.reactions ?? []).some((reaction) => reaction.count > 0)
  );
}
