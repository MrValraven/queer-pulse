import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRealtime } from "../../shared/api/realtime";
import type { ChatMessage } from "./data";
import { saveOutbox } from "./outbox";
import type { GifAttachment } from "../../shared/api/gifs";
import {
  mediaKindOf,
  revokeBlobPreview,
  type MediaKind,
} from "./messageSending.helpers";

type DeliverFunction = (
  convId: string,
  body: string,
  localId: string,
  replyToId?: string,
  forwarded?: boolean,
  attachment?: GifAttachment,
  mediaKind?: MediaKind,
) => void;

interface OutboxDeps {
  sent: Record<string, ChatMessage[]>;
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>;
  demoMode: boolean;
  /** From `useMessageDeliverCore`. */
  deliver: DeliverFunction;
}

export interface MessageOutbox {
  /** Re-key every optimistic send queued under a just-picked recipient's
   *  placeholder id (see `recipient.ts`) to the real server conversation id,
   *  and re-drive `deliver` for anything still `sending`/`failed` — `deliver`
   *  never actually reached the server for those while the id was a
   *  placeholder (see its own UUID guard), so without this call they'd stay
   *  orphaned once `activeId` flips to the real id. Called from
   *  `useMessageCreation`'s `startConversation.onSuccess`. A no-op if nothing
   *  was queued under `oldConvId`. */
  migrateOutboxConversation: (oldConvId: string, newConvId: string) => void;
}

/**
 * The offline outbox: persisting `sent` on every change, replaying anything
 * still `sending`/`failed` on mount / network-online / socket-reconnect, and
 * migrating a placeholder conversation's queued sends onto its real id once
 * the server materializes it. Extracted from `useMessageSending`; behaviour is
 * unchanged.
 */
export function useMessageOutbox({
  sent,
  setSent,
  demoMode,
  deliver,
}: OutboxDeps): MessageOutbox {
  // Persist the outbox on every change so an in-flight (or demo) send survives a
  // reload. Demo entries stay as `sent`; live `sending`/`failed` entries are
  // replayed below and then cleared as the server acks them.
  useEffect(() => {
    saveOutbox(sent);
  }, [sent]);

  // Latest `sent`/`deliver` held in refs so the replay loop below — fired from
  // window/socket events, never from render — always reads the CURRENT outbox
  // and the current idempotent `deliver`, without those event effects needing to
  // resubscribe on every keystroke-driven `sent` change.
  const sentRef = useRef(sent);
  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);
  const deliverRef = useRef(deliver);
  useEffect(() => {
    deliverRef.current = deliver;
  }, [deliver]);

  // Safety net: release every remaining local blob preview when the Messages
  // page itself unmounts (the member navigates away entirely — a thread
  // switch does NOT unmount this hook, `sent` persists across those). Most
  // image sends resolve well before that, and `deliver`'s `onSuccess` above
  // already revokes theirs; this only catches whatever is still `sending`/
  // `failed` (or a demo send, which never resolves to a server copy) at the
  // moment the page closes, so the tab never accumulates leaked object URLs
  // across repeated visits to Messages.
  useEffect(() => {
    return () => {
      for (const messages of Object.values(sentRef.current)) {
        for (const message of messages) revokeBlobPreview(message);
      }
    };
  }, []);

  const migrateOutboxConversation = useCallback(
    (oldConvId: string, newConvId: string) => {
      if (oldConvId === newConvId) return;
      const pending = sentRef.current[oldConvId];
      if (!pending || pending.length === 0) return;
      setSent((previous) => {
        const stillPending = previous[oldConvId];
        if (!stillPending || stillPending.length === 0) return previous;
        const next = { ...previous };
        delete next[oldConvId];
        next[newConvId] = [...(next[newConvId] ?? []), ...stillPending];
        return next;
      });
      // Re-drive anything that never actually reached the server — `deliver`'s
      // UUID guard skipped the request while `oldConvId` was still a
      // placeholder, so a `sending` entry here was never attempted, and a
      // `failed` one (a genuine send error before the id even resolved,
      // effectively unreachable today but kept for safety) deserves the same
      // automatic retry `replayOutbox` gives every other failed send.
      for (const message of pending) {
        if (
          message.localId &&
          (message.status === "sending" || message.status === "failed")
        ) {
          deliver(
            newConvId,
            message.text,
            message.localId,
            message.replyTo?.id,
            message.forwarded,
            message.sendAttachment ?? message.attachment,
            mediaKindOf(message),
          );
        }
      }
    },
    [deliver, setSent],
  );

  // Resend everything still `sending`/`failed` in the outbox (live mode only).
  // Idempotent: each entry keeps its original `clientMessageId` (== `localId`),
  // so a message the server already stored is deduped rather than duplicated —
  // safe to fire on every connectivity flap. A send that succeeds is cleared
  // from `sent` by `deliver`'s onSuccess, so a later replay simply skips it.
  const replayOutbox = useCallback(() => {
    if (demoMode) return;
    for (const [conversationId, messages] of Object.entries(sentRef.current)) {
      for (const message of messages) {
        if (
          message.localId &&
          (message.status === "sending" || message.status === "failed")
        ) {
          deliverRef.current(
            conversationId,
            message.text,
            message.localId,
            message.replyTo?.id,
            message.forwarded,
            // Same real-payload preference as `retrySend` above.
            message.sendAttachment ?? message.attachment,
            mediaKindOf(message),
          );
        }
      }
    }
  }, [demoMode]);

  // Replay once on mount: the persisted outbox may hold a send that was in
  // flight or failed when the tab last closed.
  const outboxReplayedRef = useRef(false);
  useEffect(() => {
    if (demoMode || outboxReplayedRef.current) return;
    outboxReplayedRef.current = true;
    replayOutbox();
  }, [demoMode, replayOutbox]);

  // Re-flush whenever the browser regains network. A send that failed while the
  // tab stayed open (offline) now auto-recovers — WhatsApp/Signal style — instead
  // of sitting `failed` until a manual retry or reload.
  useEffect(() => {
    if (demoMode) return;
    const onOnline = () => replayOutbox();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [demoMode, replayOutbox]);

  // Re-flush on socket reconnect. `connected` flips false→true after a drop; the
  // socket buffered nothing while it was down (see RealtimeClient), so anything
  // that failed mid-gap must be resent. Guarded on the false→true transition so
  // a steady connection never re-fires, and idempotent regardless.
  const { connected } = useRealtime();
  const wasConnectedRef = useRef(connected);
  useEffect(() => {
    if (!demoMode && connected && !wasConnectedRef.current) replayOutbox();
    wasConnectedRef.current = connected;
  }, [connected, demoMode, replayOutbox]);

  return { migrateOutboxConversation };
}
