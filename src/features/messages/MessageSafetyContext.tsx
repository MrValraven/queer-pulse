// src/features/messages/MessageSafetyContext.tsx
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Conversation } from "./data";

interface MessageSafetyApi {
  /** True while the open thread is a DM the two aren't accepted connections
   *  in yet (mirrors `Conversation.replyRequiresConnection`, SERVER-
   *  AUTHORITATIVE — see that field's own doc in `data.ts`): a cold enquiry
   *  that hasn't been accepted, or a first message still awaiting the other
   *  side's reply. There is no separate "are we connected" flag on the wire,
   *  so this is the closest reliable proxy the DTO exposes; always false for
   *  official/group threads and for an ordinary, already-connected DM.
   *  Gates the inbound off-platform caution (`InboundSafetyCaution`, PRD-367)
   *  and the inbound-document open-confirm (`MessageDocumentAttachment`,
   *  PRD-369) to content from someone who isn't yet a trusted contact. */
  isPendingConnection: boolean;
}

const NOOP_API: MessageSafetyApi = { isPendingConnection: false };

const MessageSafetyContext = createContext<MessageSafetyApi>(NOOP_API);

/**
 * Carries the open thread's connection state from `ConversationPanel` down to
 * `MessageBubbleBody`/`MessageDocumentAttachment` several levels below it,
 * the same way `ChatImageViewerContext` carries the photo-viewer handle — a
 * context rather than a prop threaded through `MessageArea`/`MessageAreaRow`/
 * `MessageRunView`/`MessageBubble`, none of which have any interest in
 * connection state, and `MessageBubble` is memoized: a new prop there would
 * force every one of those to accept and forward it.
 *
 * The value is memoized on the one flag it carries, so a re-render this
 * thread's OWN unrelated state (a typing frame, a receipt tick) never
 * invalidates the memo `MessageBubble` relies on to skip re-rendering the log.
 */
export function MessageSafetyProvider({
  active,
  children,
}: {
  active: Conversation;
  children: ReactNode;
}) {
  const isPendingConnection = !!active.replyRequiresConnection;
  const value = useMemo(() => ({ isPendingConnection }), [isPendingConnection]);
  return (
    <MessageSafetyContext.Provider value={value}>
      {children}
    </MessageSafetyContext.Provider>
  );
}

/** The connection-state flag, or the safe default (`false`) when no provider
 *  is mounted (a bubble rendered in tests, or any future surface without a
 *  panel around it). */
export function useMessageSafetyContext(): MessageSafetyApi {
  return useContext(MessageSafetyContext);
}
