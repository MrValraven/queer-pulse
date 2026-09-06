import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { nextLocalId } from "./useMessagesController.helpers";
import { mediaKindOf, type MediaKind } from "./messageSending.helpers";

interface SendActionsDeps {
  active: Conversation | null;
  activeBlocked: boolean;
  replyDraft: ChatMessage | null;
  setReplyDraft: Dispatch<SetStateAction<ChatMessage | null>>;
  t: TFunction;
  /** From `useMessageDeliverCore`. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  setStatus: (
    convId: string,
    localId: string,
    status: ChatMessage["status"],
  ) => void;
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
  ) => void;
}

export interface MessageSendActions {
  /** Sends `body` as a new message in the open thread. The composer OWNS the
   *  draft text and passes its current value here on submit — the controller
   *  never reads a draft itself. */
  send: (body: string) => void;
  retrySend: (message: ChatMessage) => void;
  /** Send a GIF as its own message, through the same pipeline as `send()`. */
  sendGif: (attachment: GifAttachment) => void;
  /** Send an uploaded image as its own message. `attachment` is the SEND
   *  payload (its `url`/`previewUrl` are the private storage key the upload
   *  minted); `localAttachment`, when given, is what the OPTIMISTIC bubble
   *  renders instead — the upload's local blob preview, immediately
   *  paintable, since the storage key alone isn't a fetchable URL until the
   *  server round-trip resolves it. */
  sendImage: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  /** Send an uploaded document as its own message (PRD-226), through the same
   *  pipeline as `sendImage`. */
  sendDocument: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
  ) => void;
}

/**
 * `send`/`sendGif`/`sendImage`/`retrySend`, built on the `appendOptimistic`/
 * `setStatus`/`deliver` primitives from `useMessageDeliverCore`. Extracted
 * from `useMessageSending`; behaviour is unchanged.
 */
export function useMessageSendActions({
  active,
  activeBlocked,
  replyDraft,
  setReplyDraft,
  t,
  appendOptimistic,
  setStatus,
  deliver,
}: SendActionsDeps): MessageSendActions {
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
      deliver(
        convId,
        fallbackText,
        localId,
        replyToId,
        false,
        attachment,
        "image",
      );
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

  /** Send an uploaded document as its own message (PRD-226) — the same
   *  optimistic → idempotent → outbox path as `sendImage`, with the same
   *  local-preview/real-payload split: `localAttachment` (the upload's local
   *  blob preview) paints the OPTIMISTIC bubble instantly, `attachment` (the
   *  private storage key) is what `deliver` actually sends. */
  const sendDocument = useCallback(
    (attachment: DocumentAttachment, localAttachment?: DocumentAttachment) => {
      if (activeBlocked || !active) return;
      const convId = active.id;
      const localId = nextLocalId();
      const replyTo = currentReplyPreview();
      const fallbackText = t("messages:attachments.documentFallbackText");
      appendOptimistic(convId, {
        from: "me",
        text: fallbackText,
        kind: "document",
        attachment: localAttachment ?? attachment,
        sendAttachment: attachment,
        time: t("messages:time.justNow"),
        status: "sending",
        localId,
        replyTo,
      });
      const replyToId = replyDraft?.id;
      setReplyDraft(null);
      deliver(
        convId,
        fallbackText,
        localId,
        replyToId,
        false,
        attachment,
        "document",
      );
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
        // Resend the real payload (`sendAttachment`, an image/document's
        // storage key) when present — `attachment` alone may be the local
        // blob preview, which the server can't validate/store.
        message.sendAttachment ?? message.attachment,
        mediaKindOf(message),
      );
    },
    [active, setStatus, deliver],
  );

  return { send, sendGif, sendImage, sendDocument, retrySend };
}
