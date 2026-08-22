import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import { useRealtime } from "../../shared/api/realtime";
import type { ChatMessage, Conversation } from "./data";
import { saveOutbox } from "./outbox";
import { isServerConversationId, nextLocalId } from "./useMessagesController.helpers";
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

/** The two media send kinds — a picked provider GIF or a member-uploaded
 *  image — both carry a `GifAttachment` (see that type's own doc) and both
 *  render identically in the bubble; only this tag (and the DTO/DB kind it
 *  becomes) tells them apart. */
export type MediaKind = "gif" | "image";

/** `ChatMessage.kind` → the `MediaKind` its attachment was sent as, or
 *  undefined for a plain text/system message. Used by `retrySend`/the outbox
 *  replay loop to resend a media message as the SAME kind it was, rather than
 *  re-deriving it from "an attachment is present" (which can't distinguish
 *  gif from image). */
function mediaKindOf(message: ChatMessage): MediaKind | undefined {
  return message.kind === "gif" || message.kind === "image"
    ? message.kind
    : undefined;
}

/** Release a still-optimistic image send's local `blob:` preview (see
 *  `ImageComposerButton`) once nothing will ever render it again — the
 *  server's own copy takes over the bubble with a resolved URL, so the object
 *  URL this tab created is now pure leak. A no-op for GIFs/text (no local
 *  blob was ever minted) and for an already-revoked/foreign URL. */
function revokeBlobPreview(message: ChatMessage | undefined): void {
  if (message?.attachment?.url.startsWith("blob:")) {
    URL.revokeObjectURL(message.attachment.url);
  }
}

export interface MessageSending {
  /** Sends `body` as a new message in the open thread. The composer OWNS the
   *  draft text and passes its current value here on submit — the controller
   *  never reads a draft itself. */
  send: (body: string) => void;
  retrySend: (message: ChatMessage) => void;
  /** Append an optimistic bubble to a conversation's session sends. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  /** Drive a message down the send ladder (demo-simulated, or the live
   *  mutation). `mediaKind` is required whenever `attachment` is set — it's
   *  what tells the server (and a resend/outbox-replay) a `gif` message from
   *  an `image` one; both carry the same `GifAttachment` shape. */
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment,
    mediaKind?: MediaKind,
  ) => void;
  /** Send a GIF as its own message, through the same pipeline as `send()`. */
  sendGif: (attachment: GifAttachment) => void;
  /** Send an uploaded image as its own message. `attachment` is the SEND
   *  payload (its `url`/`previewUrl` are the private storage key the upload
   *  minted); `localAttachment`, when given, is what the OPTIMISTIC bubble
   *  renders instead — the upload's local blob preview, immediately
   *  paintable, since the storage key alone isn't a fetchable URL until the
   *  server round-trip resolves it. */
  sendImage: (attachment: GifAttachment, localAttachment?: GifAttachment) => void;
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
      mediaKind?: MediaKind,
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
      if (!isServerConversationId(convId)) {
        // The conversation doesn't exist server-side yet — `convId` is still a
        // just-picked recipient's placeholder id (its handle, not a UUID; see
        // `recipient.ts`). POSTing here would 400 against
        // `/conversations/<handle>/messages` (`ParseUUIDPipe`). Leave the
        // bubble exactly as `sending` (never `failed` — nothing was actually
        // attempted) rather than firing the doomed request: once
        // `startConversation` resolves, `migrateOutboxConversation` re-keys
        // this outbox entry to the real UUID and re-drives it through THIS
        // same function.
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
          kind: attachment ? mediaKind : undefined,
        },
        {
          // Drop only THIS optimistic message (matched by localId) — a concurrent
          // second send in the same thread must survive. The mutation patches the
          // authoritative server copy into the thread cache (deduped by the same
          // client id), so it takes over the bubble's slot as this one clears.
          onSuccess: () =>
            setSent((prev) => {
              const current = prev[convId] ?? [];
              // The server row has landed — its own resolved URL now renders
              // the bubble, so this tab's local blob preview (if any) is safe
              // to release.
              revokeBlobPreview(current.find((item) => item.localId === localId));
              const remaining = current.filter((item) => item.localId !== localId);
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
      deliver(convId, "GIF", localId, replyToId, false, attachment, "gif");
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

  /** Send an uploaded image as its own message — the same optimistic →
   *  idempotent → outbox path as `sendGif`, with one twist: the OPTIMISTIC
   *  bubble renders `localAttachment` (the upload's local blob preview,
   *  paintable instantly) while `deliver` sends `attachment` (the private
   *  storage key) to the server. Falls back to `attachment` itself for both
   *  if no separate local preview was given. */
  const sendImage = useCallback(
    (attachment: GifAttachment, localAttachment?: GifAttachment) => {
      if (activeBlocked || !active) return;
      const convId = active.id;
      const localId = nextLocalId();
      const replyTo = currentReplyPreview();
      const fallbackText = t("messages:attachments.fallbackText");
      appendOptimistic(convId, {
        from: "me",
        text: fallbackText,
        kind: "image",
        // Render the local blob preview (paintable now); resend the real
        // storage key (`sendAttachment`) if this ever needs a retry/replay.
        attachment: localAttachment ?? attachment,
        sendAttachment: attachment,
        time: t("messages:time.justNow"),
        status: "sending",
        localId,
        replyTo,
      });
      const replyToId = replyDraft?.id;
      setReplyDraft(null);
      deliver(convId, fallbackText, localId, replyToId, false, attachment, "image");
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
        // Resend the real payload (`sendAttachment`, an image's storage key)
        // when present — `attachment` alone may be the local blob preview,
        // which the server can't validate/store.
        message.sendAttachment ?? message.attachment,
        mediaKindOf(message),
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

  return {
    send,
    retrySend,
    appendOptimistic,
    deliver,
    sendGif,
    sendImage,
    migrateOutboxConversation,
  };
}
