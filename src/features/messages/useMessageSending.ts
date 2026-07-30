import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import { saveOutbox } from "./outbox";
import { nextLocalId } from "./useMessagesController.helpers";
import type { useSendMessage } from "./api/useMessageMutations";
import type { GifAttachment } from "../../shared/api/gifs";

interface SendingDeps {
  sent: Record<string, ChatMessage[]>;
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>;
  active: Conversation | null;
  activeBlocked: boolean;
  replyDraft: ChatMessage | null;
  setReplyDraft: Dispatch<SetStateAction<ChatMessage | null>>;
  demoMode: boolean;
  t: TFunction;
  sendMessage: ReturnType<typeof useSendMessage>;
}

export interface MessageSending {
  /** Sends `body` as a new message in the open thread. The composer OWNS the
   *  draft text and passes its current value here on submit — the controller
   *  never reads a draft itself. */
  send: (body: string) => void;
  retrySend: (message: ChatMessage) => void;
  /** Append an optimistic bubble to a conversation's session sends. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  /** Drive a message down the send ladder (demo-simulated, or the live mutation). */
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment,
  ) => void;
  /** Send a GIF as its own message, through the same pipeline as `send()`. */
  sendGif: (attachment: GifAttachment) => void;
}

/**
 * Optimistic send + the offline outbox: the send ladder (demo-simulated
 * sent→delivered→seen, or the live idempotent mutation), retry, plus
 * persisting and replaying the outbox. Extracted from `useMessagesController`;
 * behaviour is unchanged. Operates on the controller's `sent` state (a
 * demo↔live flip resets it in the controller). The composer draft itself lives
 * in `Composer` — this hook only ever receives a message body to send, never
 * reads or writes draft text/localStorage.
 *
 * Every returned function is `useCallback`-stabilized so a message-list leaf
 * (e.g. `MessageRunView`'s `onRetry`) that receives it can be `React.memo`'d
 * without an unstable prop defeating the memo.
 */
export function useMessageSending({
  sent,
  setSent,
  active,
  activeBlocked,
  replyDraft,
  setReplyDraft,
  demoMode,
  t,
  sendMessage,
}: SendingDeps): MessageSending {
  const appendOptimistic = useCallback(
    (convId: string, message: ChatMessage) => {
      setSent((prev) => ({ ...prev, [convId]: [...(prev[convId] ?? []), message] }));
    },
    [setSent],
  );

  const setStatus = useCallback(
    (convId: string, localId: string, status: ChatMessage["status"]) => {
      setSent((prev) => ({
        ...prev,
        [convId]: (prev[convId] ?? []).map((item) =>
          item.localId === localId ? { ...item, status } : item,
        ),
      }));
    },
    [setSent],
  );

  /** The reply-quote block for a new send, from the current reply draft (shared
   *  by text `send` and `sendGif`). Undefined when nothing is being replied to. */
  const currentReplyPreview = useCallback((): ChatMessage["replyTo"] => {
    if (!replyDraft || !active) return undefined;
    return {
      id: replyDraft.id!,
      snippet: replyDraft.text.slice(0, 120),
      senderName:
        replyDraft.from === "me" ? t("messages:conversation.you") : active.name,
      deleted: false,
    };
  }, [replyDraft, active, t]);

  const deliver = useCallback(
    (
      convId: string,
      body: string,
      localId: string,
      replyToId?: string,
      forwarded?: boolean,
      attachment?: GifAttachment,
    ) => {
      if (demoMode) {
        // Simulate the honest ladder locally — no network. sent → delivered → seen
        // on a short timer, exactly the three rungs live mode drives from the
        // server ack + delivered/read watermarks. `setStatus` is a no-op once the
        // message is gone (thread switched/deleted), so stale timers are harmless.
        setStatus(convId, localId, "sent");
        window.setTimeout(() => setStatus(convId, localId, "delivered"), 700);
        window.setTimeout(() => setStatus(convId, localId, "seen"), 1900);
        return;
      }
      // `localId` IS the client idempotency id (`clientMessageId`) — a resend from
      // the offline outbox or the dual HTTP+WS path can't duplicate server-side.
      // `forwarded` rides the same idempotent send path (never a bypass).
      sendMessage.mutate(
        {
          conversationId: convId,
          body,
          replyToId,
          clientMessageId: localId,
          forwarded,
          attachment,
          kind: attachment ? "gif" : undefined,
        },
        {
          // Drop only THIS optimistic message (matched by localId) — a concurrent
          // second send in the same thread must survive. The mutation patches the
          // authoritative server copy into the thread cache (deduped by the same
          // client id), so it takes over the bubble's slot as this one clears.
          onSuccess: () =>
            setSent((prev) => {
              const remaining = (prev[convId] ?? []).filter(
                (item) => item.localId !== localId,
              );
              const next = { ...prev };
              if (remaining.length > 0) next[convId] = remaining;
              else delete next[convId];
              return next;
            }),
          onError: () => setStatus(convId, localId, "failed"),
        },
      );
    },
    // `sendMessage.mutate` is a stable reference (react-query wraps it in its
    // own `useCallback`); depending on it rather than the whole mutation
    // result object avoids recreating `deliver` on every isPending/isError flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, sendMessage.mutate, setStatus, setSent],
  );

  const send = useCallback(
    (body: string) => {
      const trimmedBody = body.trim();
      if (!trimmedBody || activeBlocked || !active) return;
      const convId = active.id;
      const localId = nextLocalId();
      const replyTo = currentReplyPreview();
      // Optimistic append — instant feedback in both modes. In live mode the
      // server refetch is authoritative, so clear the optimistic copy on success.
      appendOptimistic(convId, {
        from: "me",
        text: trimmedBody,
        time: t("messages:time.justNow"),
        status: "sending",
        localId,
        replyTo,
      });
      const replyToId = replyDraft?.id;
      setReplyDraft(null);
      deliver(convId, trimmedBody, localId, replyToId);
    },
    [
      activeBlocked,
      active,
      currentReplyPreview,
      appendOptimistic,
      t,
      replyDraft,
      setReplyDraft,
      deliver,
    ],
  );

  /** Send a GIF as its own message — same optimistic → idempotent → outbox path
   *  as a text send, carrying the provider attachment. Independent of the text
   *  draft (a typed-but-unsent message is left intact — the composer never
   *  clears its own text for a GIF send). */
  const sendGif = useCallback(
    (attachment: GifAttachment) => {
      if (activeBlocked || !active) return;
      const convId = active.id;
      const localId = nextLocalId();
      const replyTo = currentReplyPreview();
      appendOptimistic(convId, {
        from: "me",
        text: "GIF",
        kind: "gif",
        attachment,
        time: t("messages:time.justNow"),
        status: "sending",
        localId,
        replyTo,
      });
      const replyToId = replyDraft?.id;
      setReplyDraft(null);
      deliver(convId, "GIF", localId, replyToId, false, attachment);
    },
    [
      activeBlocked,
      active,
      currentReplyPreview,
      appendOptimistic,
      t,
      replyDraft,
      setReplyDraft,
      deliver,
    ],
  );

  const retrySend = useCallback(
    (message: ChatMessage) => {
      if (!active || !message.localId) return;
      setStatus(active.id, message.localId, "sending");
      deliver(
        active.id,
        message.text,
        message.localId,
        message.replyTo?.id,
        message.forwarded,
        message.attachment,
      );
    },
    [active, setStatus, deliver],
  );

  // Persist the outbox on every change so an in-flight (or demo) send survives a
  // reload. Demo entries stay as `sent`; live `sending`/`failed` entries are
  // replayed below and then cleared as the server acks them.
  useEffect(() => {
    saveOutbox(sent);
  }, [sent]);

  // Replay unsent messages once on mount (live mode only): anything left
  // `sending`/`failed` in the persisted outbox — a send that was in flight or
  // failed when the tab last closed — is resent. Idempotent, because each still
  // carries its original `clientMessageId` (== `localId`), so a message the
  // server already stored is deduped rather than duplicated.
  const outboxReplayedRef = useRef(false);
  useEffect(() => {
    if (demoMode || outboxReplayedRef.current) return;
    outboxReplayedRef.current = true;
    for (const [conversationId, messages] of Object.entries(sent)) {
      for (const message of messages) {
        if (
          message.localId &&
          (message.status === "sending" || message.status === "failed")
        ) {
          // Mount-once replay of the persisted outbox (sending/failed sends).
          deliver(
            conversationId,
            message.text,
            message.localId,
            message.replyTo?.id,
            message.forwarded,
            message.attachment,
          );
        }
      }
    }
    // Mount-once replay of the hydrated outbox; `deliver`/`sent` are intentionally
    // read from the first render and must not re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  return { send, retrySend, appendOptimistic, deliver, sendGif };
}
