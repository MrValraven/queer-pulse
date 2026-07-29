import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import { saveOutbox } from "./outbox";
import { clearDraft, saveDraft } from "./drafts";
import { nextLocalId } from "./useMessagesController.helpers";
import type { useSendMessage } from "./api/useMessageMutations";
import type { GifAttachment } from "../../shared/api/gifs";

interface SendingDeps {
  sent: Record<string, ChatMessage[]>;
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>;
  active: Conversation | null;
  activeBlocked: boolean;
  draft: string;
  setDraftState: Dispatch<SetStateAction<string>>;
  replyDraft: ChatMessage | null;
  setReplyDraft: Dispatch<SetStateAction<ChatMessage | null>>;
  demoMode: boolean;
  t: TFunction;
  sendMessage: ReturnType<typeof useSendMessage>;
}

export interface MessageSending {
  send: () => void;
  retrySend: (message: ChatMessage) => void;
  /** Composer change handler exposed as `setDraft`. */
  setDraft: (value: string) => void;
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
 * Optimistic send + the offline outbox: the composer draft, the send ladder
 * (demo-simulated sent→delivered→seen, or the live idempotent mutation),
 * retry, plus persisting and replaying the outbox. Extracted from
 * `useMessagesController`; behaviour is unchanged. Operates on the controller's
 * `sent`/`draft` state (a demo↔live flip resets those in the controller).
 */
export function useMessageSending({
  sent,
  setSent,
  active,
  activeBlocked,
  draft,
  setDraftState,
  replyDraft,
  setReplyDraft,
  demoMode,
  t,
  sendMessage,
}: SendingDeps): MessageSending {
  function appendOptimistic(convId: string, message: ChatMessage) {
    setSent((prev) => ({ ...prev, [convId]: [...(prev[convId] ?? []), message] }));
  }

  function setStatus(convId: string, localId: string, status: ChatMessage["status"]) {
    setSent((prev) => ({
      ...prev,
      [convId]: (prev[convId] ?? []).map((item) =>
        item.localId === localId ? { ...item, status } : item,
      ),
    }));
  }

  /** The reply-quote block for a new send, from the current reply draft (shared
   *  by text `send` and `sendGif`). Undefined when nothing is being replied to. */
  function currentReplyPreview(): ChatMessage["replyTo"] {
    if (!replyDraft || !active) return undefined;
    return {
      id: replyDraft.id!,
      snippet: replyDraft.text.slice(0, 120),
      senderName:
        replyDraft.from === "me" ? t("messages:conversation.you") : active.name,
      deleted: false,
    };
  }

  function deliver(
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment,
  ) {
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
  }

  function send() {
    const body = draft.trim();
    if (!body || activeBlocked || !active) return;
    const convId = active.id;
    const localId = nextLocalId();
    const replyTo = currentReplyPreview();
    // Optimistic append — instant feedback in both modes. In live mode the
    // server refetch is authoritative, so clear the optimistic copy on success.
    appendOptimistic(convId, {
      from: "me",
      text: body,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      replyTo,
    });
    setDraftState("");
    // The composer emptied this frame, so drop the persisted draft too —
    // otherwise a reload would rehydrate text the member has already sent.
    clearDraft(convId);
    const replyToId = replyDraft?.id;
    setReplyDraft(null);
    deliver(convId, body, localId, replyToId);
  }

  /** Send a GIF as its own message — same optimistic → idempotent → outbox path
   *  as a text send, carrying the provider attachment. Independent of the text
   *  draft (a typed-but-unsent message is left intact). */
  function sendGif(attachment: GifAttachment) {
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
  }

  /** Composer change handler exposed as `setDraft`: updates the in-memory draft
   *  AND persists it for the open thread, so typed-but-unsent text survives a
   *  thread switch or a reload. Persisting on every change (like the outbox
   *  next door) keeps the store in lock-step with the composer; empty text
   *  clears the stored key. Local-only in both modes — nothing hits the network
   *  until the member actually sends. */
  function changeDraft(value: string) {
    setDraftState(value);
    if (active) saveDraft(active.id, value);
  }

  function retrySend(message: ChatMessage) {
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
  }

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

  return { send, retrySend, setDraft: changeDraft, appendOptimistic, deliver, sendGif };
}
