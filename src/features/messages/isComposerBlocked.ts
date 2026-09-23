// src/features/messages/isComposerBlocked.ts
import type { Conversation } from "./data";

/** Whether a thread's composer must show a severed-state notice
 *  (`ComposerBlockedState`) instead of the ordinary input row: an official
 *  thread, a blocked counterpart, a group the member has left, a
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
    active.official ||
    blocked ||
    (active.isGroup && active.hasLeft) ||
    active.replyRequiresConnection ||
    active.isMailboxReadOnly,
  );
}
