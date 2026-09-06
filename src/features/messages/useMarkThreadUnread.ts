import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useToggleMarkUnread } from "./api/useConversationPrefs";

/**
 * Mark a thread unread from the row menu (PRD-225). Extracted out of
 * `useMessagesController` purely to keep that hook under the 200-line cap
 * (mirrors `useConversationPinStar`'s own split).
 *
 * Also drops the thread's id out of the LOCAL `readIds` "read this session"
 * set — without that, a thread opened earlier this session would keep
 * suppressing its own unread badge (`isThreadUnread` checks
 * `!readIds.has(id)`) even after the server confirms `markedUnreadAt`,
 * silently undoing the mark the instant this row next re-renders.
 * `markThreadRead` needs no such counterpart: it already patches
 * `unread: false` straight into the cache the badge reads.
 */
export function useMarkThreadUnread(
  setReadIds: Dispatch<SetStateAction<Set<string>>>,
): (conversationId: string) => void {
  const { mutate: markConversationUnread } = useToggleMarkUnread();

  return useCallback(
    (conversationId: string) => {
      markConversationUnread({ conversationId, markedUnread: false });
      setReadIds((current) => {
        if (!current.has(conversationId)) return current;
        const next = new Set(current);
        next.delete(conversationId);
        return next;
      });
    },
    [markConversationUnread, setReadIds],
  );
}
