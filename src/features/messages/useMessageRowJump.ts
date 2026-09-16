// src/features/messages/useMessageRowJump.ts
import type { Virtualizer } from "@tanstack/react-virtual";
import type { MessageRow } from "./messageRows";
import type { JumpThreadSnapshot } from "./messageJumpHunt";
import { useJumpToMessage } from "./useJumpToMessage";
import { useSearchJump } from "./useSearchJump";

/** The open thread's identity, its load-older path and history readiness, as
 *  the panel already receives them (`useMessagesController` via
 *  `ConversationPanel`), plus the scroll layer's jump bridge. The hunt pages
 *  back through this same trigger; it never owns a second fetch. */
export type MessageRowJumpHistory = Omit<
  JumpThreadSnapshot,
  "rows" | "rowVirtualizer"
>;

/**
 * The ONE scroll-to-a-message entry point for a virtualized log: reply-quote
 * clicks, the pinned-message banner, in-thread search, and a cross-inbox
 * search/starred pick all resolve through the function this returns.
 *
 * Every caller gets the same behaviour from `useJumpToMessage`: a loaded
 * message is scrolled to by the virtualizer alone and highlighted once it has
 * settled; an unloaded one pages back until it loads, history is exhausted, or
 * a bound is hit, with visible status and a clear outcome. There are no
 * per-caller retry loops: waiting for rows to mount or for a freshly-opened
 * thread's first page lives inside that one mechanism.
 */
export function useMessageRowJump(
  rows: MessageRow[],
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  jumpToMessageId: string | null | undefined,
  onJumpHandled: (() => void) | undefined,
  history: MessageRowJumpHistory,
): (messageId: string) => boolean {
  const jumpToMessageVirtualized = useJumpToMessage({
    ...history,
    rows,
    rowVirtualizer,
  });

  useSearchJump(jumpToMessageId, jumpToMessageVirtualized, onJumpHandled);

  return jumpToMessageVirtualized;
}
