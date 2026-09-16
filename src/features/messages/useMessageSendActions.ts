import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { nextLocalId } from "./useMessagesController.helpers";
import { mediaKindOf, type MediaKind } from "./messageSending.helpers";
import { replyQuoteSourceFromMessage } from "./replyQuoteSource";
import { clockLabel } from "./api/messages.adapters";
import { useAttachmentMessageSendActions } from "./useAttachmentMessageSendActions";

/** Targets an explicit thread instead of whichever one is currently open,
 *  carrying its own reply quote with it (see the file doc below and
 *  `buildReplySnapshot`). Given by `useAttachmentSendQueue` for a GIF/image/
 *  document send that may resolve long after the member has switched
 *  threads or dismissed the reply-preview banner. */
export interface ExplicitSendOptions {
  conversationId: string;
  replyToId?: string;
  replyTo?: ChatMessage["replyTo"];
}

/** Builds the reply-quote block for a new send from the CURRENT reply draft.
 *  A plain function (not a hook) so `useAttachmentQueueLifecycle.sendStaged`
 *  can call it at the exact moment "Send" is pressed and snapshot the result
 *  onto the batch's first item, fixing it at that instant even if the reply
 *  draft changes again before the batch actually finishes sending. */
export function buildReplySnapshot(
  replyDraft: ChatMessage | null | undefined,
  active: Conversation | null | undefined,
  t: TFunction,
): { replyToId?: string; replyTo?: ChatMessage["replyTo"] } {
  if (!replyDraft || !active) return {};
  // The same kind/thumbnail/file name the composer preview shows, so the
  // optimistic quote already matches the server copy that later replaces it.
  const quoteSource = replyQuoteSourceFromMessage(replyDraft);
  return {
    replyToId: replyDraft.id,
    replyTo: {
      id: replyDraft.id!,
      snippet: replyDraft.text.slice(0, 120),
      senderName:
        replyDraft.from === "me" ? t("messages:conversation.you") : active.name,
      deleted: false,
      kind: quoteSource.kind,
      thumbnailUrl: quoteSource.thumbnailUrl,
      fileName: quoteSource.fileName,
    },
  };
}

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
  /** Send a GIF as its own message, through the same pipeline as `send()`.
   *  `options`, when given, targets a thread explicitly (and carries its own
   *  reply quote) instead of whichever one is currently open: see the file
   *  doc below and `ExplicitSendOptions`. */
  sendGif: (attachment: GifAttachment, options?: ExplicitSendOptions) => void;
  /** Send an uploaded image as its own message. `attachment` is the SEND
   *  payload (its `url`/`previewUrl` are the private storage key the upload
   *  minted); `localAttachment`, when given, is what the OPTIMISTIC bubble
   *  renders instead: the upload's local blob preview, immediately
   *  paintable, since the storage key alone isn't a fetchable URL until the
   *  server round-trip resolves it. `options`, when given, targets a thread
   *  explicitly, see the file doc below and `ExplicitSendOptions`. */
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
 * `send`/`sendGif`/`sendImage`/`retrySend`, built on the `appendOptimistic`/
 * `setStatus`/`deliver` primitives from `useMessageDeliverCore`. Extracted
 * from `useMessageSending`.
 *
 * `sendGif`/`sendImage`/`sendDocument` accept an explicit `ExplicitSendOptions`
 * because `useAttachmentSendQueue` (DES-198/DES-199) can call any of them
 * long after an upload started: an attachment whose "Send" was pressed while
 * it was still uploading keeps uploading in the background even if the
 * member switches to a different thread before it finishes, and its send
 * must always land in the thread it was staged in, carrying the exact reply
 * quote that was armed when "Send" was pressed (see
 * `useAttachmentQueueLifecycle.sendStaged`'s own doc), regardless of
 * whichever thread happens to be `active` or whichever reply is currently
 * drafted by the time the upload resolves. When `options.conversationId` is
 * given, the send bypasses the ACTIVE thread's own gates (`activeBlocked`,
 * `!active`, the current reply-preview banner) entirely and uses
 * `options.replyToId`/`options.replyTo` verbatim in place of the live reply
 * draft, since those only describe whichever thread the member currently has
 * open, which may differ from the one this send actually targets.
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
  const currentReplyPreview = useCallback(
    (): ChatMessage["replyTo"] =>
      buildReplySnapshot(replyDraft, active, t).replyTo,
    [replyDraft, active, t],
  );

  const send = useCallback(
    (body: string) => {
      const trimmedBody = body.trim();
      if (!trimmedBody || activeBlocked || !active) return;
      const convId = active.id;
      const localId = nextLocalId();
      const replyTo = currentReplyPreview();
      // Stamp the optimistic bubble with a REAL send time, formatted with the
      // same `clockLabel` the server rows use, rather than a "Just now"
      // placeholder, so the label is final from the first paint and never
      // changes on ack. That keeps the bubble's width, its run grouping (a
      // same-sender run only splits on a >15 min gap when both messages carry
      // `at`), and the group "Seen by N" maths (which needs `at` to compare
      // against read watermarks) stable across the optimistic-to-server swap,
      // so nothing re-lays out.
      const at = new Date().toISOString();
      // Optimistic append — instant feedback in both modes. In live mode the
      // server refetch is authoritative, so clear the optimistic copy on success.
      appendOptimistic(convId, {
        from: "me",
        text: trimmedBody,
        time: clockLabel(at),
        at,
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
    (attachment: GifAttachment, options?: ExplicitSendOptions) => {
      const convId = options?.conversationId ?? active?.id;
      if (!convId) return;
      if (!options?.conversationId && (activeBlocked || !active)) return;
      const localId = nextLocalId();
      // An explicit target carries the reply it was snapshotted with (see
      // `ExplicitSendOptions`); otherwise the live reply draft describes the
      // thread that's open right now.
      const replyTo = options?.conversationId
        ? options.replyTo
        : currentReplyPreview();
      const replyToId = options?.conversationId
        ? options.replyToId
        : replyDraft?.id;
      // See `send`: a real `at` plus a final clock label from the first paint,
      // so the ack cannot resize the bubble, re-group its run, or flash a
      // premature "Seen by N".
      const at = new Date().toISOString();
      appendOptimistic(convId, {
        from: "me",
        text: "GIF",
        kind: "gif",
        attachment,
        time: clockLabel(at),
        at,
        status: "sending",
        localId,
        replyTo,
      });
      if (!options?.conversationId) setReplyDraft(null);
      deliver(convId, "GIF", localId, replyToId, false, attachment, "gif");
    },
    [
      activeBlocked,
      active,
      currentReplyPreview,
      appendOptimistic,
      replyDraft,
      setReplyDraft,
      deliver,
    ],
  );

  // `sendImage`/`sendDocument` live in the sibling `useAttachmentMessageSendActions`,
  // split out purely to stay under the line cap: same optimistic to
  // idempotent to outbox path as `sendGif` just above, built on the exact
  // same `currentReplyPreview`/`appendOptimistic`/`deliver` this hook already
  // has in scope.
  const { sendImage, sendDocument } = useAttachmentMessageSendActions({
    active,
    activeBlocked,
    replyDraft,
    setReplyDraft,
    t,
    currentReplyPreview,
    appendOptimistic,
    deliver,
  });

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
