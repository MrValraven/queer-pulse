// src/features/messages/isComposerBlocked.ts
import type { Conversation } from "./data";

/** An official thread the member may not answer: the server has not opened
 *  replies on it (`isOfficialReplyOpen`), so it keeps the read-only notice. */
export function isOfficialReadOnly(
  active: Pick<Conversation, "official" | "isOfficialReplyOpen">,
): boolean {
  return !!active.official && !active.isOfficialReplyOpen;
}

/** Whether a thread's composer must show a severed-state notice
 *  (`ComposerBlockedState`) instead of the ordinary input row: a read-only
 *  official thread, a blocked counterpart, a group the member has left, a
 *  counterpart who erased their account (ENG-243), a cold enquiry still
 *  needing a connection (PRD-220), or a business mailbox moderation removed
 *  (`isMailboxReadOnly`: readable, and nothing can be sent as it). The same
 *  conditions `ComposerBlockedState` branches on internally, exposed
 *  separately (in its own file, so it stays a plain function and keeps a
 *  component and a non-component export out of one module) so `Composer` can
 *  choose between it and the normal input row without evaluating that
 *  component's own body twice. */
export function isComposerBlocked(
  active: Conversation,
  blocked: boolean,
): boolean {
  return Boolean(
    active.isCounterpartErased ||
    isOfficialReadOnly(active) ||
    blocked ||
    (active.isGroup && active.hasLeft) ||
    active.replyRequiresConnection ||
    active.isMailboxReadOnly,
  );
}
