// src/features/messages/useAttachmentMessageSendActions.ts
import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { nextLocalId } from "./useMessagesController.helpers";
import { clockLabel } from "./api/messages.adapters";
import type { ExplicitSendOptions } from "./useMessageSendActions";

interface AttachmentSendActionsDeps {
  active: Conversation | null;
  activeBlocked: boolean;
  replyDraft: ChatMessage | null;
  setReplyDraft: Dispatch<SetStateAction<ChatMessage | null>>;
  t: TFunction;
  /** The reply-quote block for the CURRENT reply draft, built by
   *  `useMessageSendActions` (shared with its own `send`/`sendGif`) so both
   *  siblings agree on the exact same snippet/sender-name logic. */
  currentReplyPreview: () => ChatMessage["replyTo"];
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: "image" | "document",
  ) => void;
}

export interface AttachmentMessageSendActions {
  /** Send an uploaded image as its own message. `attachment` is the SEND
   *  payload (its `url`/`previewUrl` are the private storage key the upload
   *  minted); `localAttachment`, when given, is what the OPTIMISTIC bubble
   *  renders instead: the upload's local blob preview, immediately
   *  paintable, since the storage key alone isn't a fetchable URL until the
   *  server round-trip resolves it. `options`, when given, targets a thread
   *  explicitly, see `useMessageSendActions`'s own doc and
   *  `ExplicitSendOptions`. */
  sendImage: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  /** Send an uploaded document as its own message (PRD-226), through the same
   *  pipeline as `sendImage`, including its explicit `options`. */
  sendDocument: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
    options?: ExplicitSendOptions,
  ) => void;
}

/**
 * `sendImage`/`sendDocument`, split out of `useMessageSendActions` purely to
 * stay under the line cap: both share the exact same optimistic to
 * idempotent to outbox path as `sendGif`, plus the local-preview/real-payload
 * split (`localAttachment` paints the OPTIMISTIC bubble instantly,
 * `attachment` is what `deliver` actually sends). Built on the same
 * `appendOptimistic`/`deliver` primitives and `currentReplyPreview` helper
 * its sibling already has in scope, so both hooks stay in lockstep on how a
 * reply/explicit-conversation send behaves.
 */
export function useAttachmentMessageSendActions({
  active,
  activeBlocked,
  replyDraft,
  setReplyDraft,
  t,
  currentReplyPreview,
  appendOptimistic,
  deliver,
}: AttachmentSendActionsDeps): AttachmentMessageSendActions {
  const sendImage = useCallback(
    (
      attachment: GifAttachment,
      localAttachment?: GifAttachment,
      options?: ExplicitSendOptions,
    ) => {
      const convId = options?.conversationId ?? active?.id;
      if (!convId) return;
      if (!options?.conversationId && (activeBlocked || !active)) return;
      const localId = nextLocalId();
      const replyTo = options?.conversationId
        ? options.replyTo
        : currentReplyPreview();
      const replyToId = options?.conversationId
        ? options.replyToId
        : replyDraft?.id;
      const fallbackText = t("messages:attachments.fallbackText");
      // See `useMessageSendActions.send`: a real `at` plus a final clock
      // label from the first paint, so the ack cannot resize the bubble,
      // re-group its run, or flash a premature "Seen by N".
      const at = new Date().toISOString();
      appendOptimistic(convId, {
        from: "me",
        text: fallbackText,
        kind: "image",
        // Render the local blob preview (paintable now); resend the real
        // storage key (`sendAttachment`) if this ever needs a retry/replay.
        attachment: localAttachment ?? attachment,
        sendAttachment: attachment,
        time: clockLabel(at),
        at,
        status: "sending",
        localId,
        replyTo,
      });
      if (!options?.conversationId) setReplyDraft(null);
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

  const sendDocument = useCallback(
    (
      attachment: DocumentAttachment,
      localAttachment?: DocumentAttachment,
      options?: ExplicitSendOptions,
    ) => {
      const convId = options?.conversationId ?? active?.id;
      if (!convId) return;
      if (!options?.conversationId && (activeBlocked || !active)) return;
      const localId = nextLocalId();
      const replyTo = options?.conversationId
        ? options.replyTo
        : currentReplyPreview();
      const replyToId = options?.conversationId
        ? options.replyToId
        : replyDraft?.id;
      const fallbackText = t("messages:attachments.documentFallbackText");
      // See `useMessageSendActions.send`: a real `at` plus a final clock
      // label from the first paint, so the ack cannot resize the bubble,
      // re-group its run, or flash a premature "Seen by N".
      const at = new Date().toISOString();
      appendOptimistic(convId, {
        from: "me",
        text: fallbackText,
        kind: "document",
        attachment: localAttachment ?? attachment,
        sendAttachment: attachment,
        time: clockLabel(at),
        at,
        status: "sending",
        localId,
        replyTo,
      });
      if (!options?.conversationId) setReplyDraft(null);
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

  return { sendImage, sendDocument };
}
