// src/features/messages/useDraftSync.ts
import { useEffect, useRef } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { updateConversationPrefs } from "./api/messages.api";
import { isServerConversationId } from "./useMessagesController.helpers";

/** How long to wait after the last keystroke before syncing the draft to the
 *  server — long enough that a normal typing burst never fires more than one
 *  write, short enough that switching devices mid-thought still picks up
 *  something close to current. */
const SYNC_DEBOUNCE_MS = 1500;

/**
 * Cross-device sync for one conversation's composer draft (SOC-16) — the
 * server-side layer on top of `drafts.ts`'s always-on, per-keystroke
 * localStorage copy, which stays the instant LOCAL layer and is never
 * replaced by this. Debounced so a typing burst writes to the server once,
 * not on every keystroke — `PATCH /conversations/:id { draft }` is
 * throttled at 30/min server-side, the same bucket every other
 * `updateConversationPrefs` caller shares.
 *
 * Inert in demo mode (there is no server) and inert without a real
 * conversation id (a just-picked recipient placeholder, id === slug, would
 * 404 against `ParseUUIDPipe` the same way the live message-thread queries
 * already avoid — see `useMessagesController`'s `liveConversationId`).
 *
 * Returns `scheduleSync`, called on every draft change, and `syncNow`, an
 * immediate (non-debounced) write for a deliberate action — sending clears
 * the draft, which should reach the server right away, not after the debounce
 * window. Both are no-ops in demo mode. The pending timer is cleared on
 * unmount/conversation switch so a stale timer can never fire a write against
 * a conversation this composer instance no longer represents; whatever was
 * pending at that point is flushed immediately instead of being dropped
 * silently, so switching threads mid-debounce still lands the latest text.
 */
export function useDraftSync(conversationId: string): {
  scheduleSync: (draft: string) => void;
  syncNow: (draft: string) => void;
} {
  const { demoMode } = useDemoMode();
  const isSyncable = !demoMode && isServerConversationId(conversationId);
  const timerRef = useRef<number | undefined>(undefined);
  const pendingRef = useRef<string | null>(null);

  function writeThrough(draft: string) {
    pendingRef.current = null;
    // Best-effort: a failed sync leaves the server draft stale until the next
    // keystroke schedules another attempt, and the localStorage copy (the
    // authoritative instant layer) is entirely unaffected either way.
    void updateConversationPrefs(conversationId, { draft }).catch(() => {});
  }

  function scheduleSync(draft: string) {
    if (!isSyncable) return;
    pendingRef.current = draft;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const value = pendingRef.current;
      if (value !== null) writeThrough(value);
    }, SYNC_DEBOUNCE_MS);
  }

  function syncNow(draft: string) {
    if (!isSyncable) return;
    window.clearTimeout(timerRef.current);
    writeThrough(draft);
  }

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
      // Flush whatever was still pending rather than losing up to
      // SYNC_DEBOUNCE_MS of text a device switch would otherwise miss.
      if (isSyncable && pendingRef.current !== null) {
        writeThrough(pendingRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return { scheduleSync, syncNow };
}
