import { useRef } from "react";
import type { ChatMessage } from "./data";

/**
 * The message the "New messages" divider should sit before, or `undefined`.
 *
 * Freezes the unread count captured the first time a thread renders (before
 * openThread's mark-read zeroes it), then latches the anchor MESSAGE OBJECT the
 * first render history is available and never recomputes it. The count is
 * frozen, but the flattened list GROWS as the reader replies, so an
 * index-from-the-end would drift the divider forward onto later — even own —
 * messages. Freezing the object keeps it pinned; the caller matches it by
 * reference (mock messages have no id) and force-breaks its run so it heads one.
 */
export function useUnreadDivider(
  flatMessages: ChatMessage[],
  activeId: string,
  unreadCount: number,
): ChatMessage | undefined {
  const dividerRef = useRef<{
    threadId: string;
    count: number;
    anchor: ChatMessage | null;
  }>({ threadId: "", count: 0, anchor: null });

  // This hook DELIBERATELY reads and writes the ref during render. It latches
  // state ACROSS renders — freeze the unread count the first time a thread
  // renders (before openThread's mark-read zeroes it), then pin the anchor
  // message object once enough history is present and never recompute it — and
  // must return that anchor synchronously on the SAME render that consumes it.
  // Deferring these writes into an effect would compute the anchor a render too
  // late and change behavior. The writes are guarded (thread-change reset, and a
  // one-shot `anchor === null` latch) so they are idempotent and cannot loop.
  /* eslint-disable react-hooks/refs -- intentional, guarded cross-render latch that must be computed synchronously during render; see note above. */
  if (dividerRef.current.threadId !== activeId) {
    dividerRef.current = { threadId: activeId, count: unreadCount, anchor: null };
  }
  if (
    dividerRef.current.anchor === null &&
    dividerRef.current.count > 0 &&
    flatMessages.length >= dividerRef.current.count
  ) {
    dividerRef.current.anchor =
      flatMessages[flatMessages.length - dividerRef.current.count] ?? null;
  }
  return dividerRef.current.anchor ?? undefined;
  /* eslint-enable react-hooks/refs */
}
