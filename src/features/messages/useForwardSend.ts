import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import type { ChatMessage, Conversation } from "./data";
import type { MessageForwarding } from "./useMessageForwarding";
import { mediaKindOf } from "./messageSending.helpers";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";

export interface ForwardSendResult {
  /** Fires one `forwardMessage` call per recipient, in parallel, and calls
   *  `onAllSucceeded` once every one of them has settled successfully (never
   *  on a partial or total failure). */
  send: (recipients: Conversation[], onAllSucceeded: () => void) => void;
  isSending: boolean;
  /** Ids of the recipients from the LAST send attempt that failed. Read by
   *  the caller to narrow the picker's selection down to exactly them. */
  failedRecipientIds: Set<string>;
}

/**
 * Drives one `forwardMessage` call per selected recipient, each its own
 * idempotent send through `useMessageForwarding` (fresh `clientMessageId`,
 * the outbox, `forwarded: true`), and reduces the settled results into a
 * single outcome:
 *
 * - **All succeeded:** a plural-aware "Forwarded to N chats" toast, then
 *   `onAllSucceeded` (the caller closes the picker; the member was never
 *   moved off the thread they had open, see `useMessageForwarding`'s doc).
 * - **Some/all failed:** a toast naming who failed, and the picker stays
 *   open with exactly those recipients still selected for a retry.
 *
 * "Succeeded" here means `forwardMessage` accepted the send: the optimistic
 * bubble is up and the message is delivered, queued on the outbox, or riding
 * the live send ladder, the same bar the rest of the composer holds a send
 * to. A later server rejection of an ACCEPTED send (a blocked recipient, a
 * network fault on the actual POST) shows up as a failed bubble in that
 * thread, not as a forward failure here. This hook's own "failed" only
 * covers a brand-new conversation whose own `POST /conversations` rejected
 * synchronously, so there was nowhere to send to at all.
 *
 * That synchronous failure already triggers the app-wide generic
 * mutation-error toast (see `errorHandling.ts`), once per failed recipient.
 * This hook's own named toast below is the one that tells the member WHO
 * failed and that they stay selected to retry, so on a failed forward the
 * member may briefly see both. Fully suppressing the generic one for just
 * this path would need the shared `startConversation` mutation
 * (`useMessageMutations.ts`) to accept a `meta.silentError` opt-out; that
 * file is outside forwarding's own files, so it's left as a follow-up
 * rather than changed here.
 *
 * Uses `Promise.allSettled` over every recipient's own `forwardMessage`
 * call, not `.mutate` callbacks on a shared TanStack mutation observer, so a
 * batch of several brand-new-conversation recipients resolves independently
 * for each one. See `useMessageForwarding`'s own doc for why a shared
 * observer's per-call callbacks can't do that.
 *
 * Extracted from `ForwardPickerModal` purely to keep that component under
 * the line cap.
 */
export function useForwardSend(
  message: ChatMessage,
  forwardMessage: MessageForwarding["forwardMessage"],
): ForwardSendResult {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [failedRecipientIds, setFailedRecipientIds] = useState<Set<string>>(
    new Set(),
  );
  // A synchronous in-flight guard, separate from the `isSending` state: a
  // fast double-tap on Send can fire a second call before React has
  // re-rendered with the disabled button, and state alone can't catch that.
  const isSendingRef = useRef(false);
  // The message this hook is currently wired to, kept current on every
  // render (not just at `send`-call time) via an effect rather than a
  // during-render write. `ForwardPickerModal` remounts on a different
  // message (see `useForwardPicker`'s `key`), so under normal operation
  // this can't actually go stale mid-send; kept as a defensive check
  // against a caller that reuses the instance across messages.
  const currentMessageRef = useRef(message);
  useEffect(() => {
    currentMessageRef.current = message;
  });

  const send = useCallback(
    (recipients: Conversation[], onAllSucceeded: () => void) => {
      if (recipients.length === 0 || isSendingRef.current) return;
      isSendingRef.current = true;
      setIsSending(true);
      setFailedRecipientIds(new Set());
      const requestedForMessage = message;
      // The shared `mediaKindOf` helper recognizes every kind `deliver`
      // understands, sticker included, so a forwarded sticker carries its
      // kind onward the same way any other media kind does.
      const mediaKind = mediaKindOf(message);
      const stickerId =
        message.attachment && isStickerAttachment(message.attachment)
          ? message.attachment.stickerId
          : undefined;
      void (async () => {
        const outcomes = await Promise.allSettled(
          recipients.map((recipient) =>
            forwardMessage(
              recipient,
              message.text,
              message.attachment,
              mediaKind,
              stickerId,
            ),
          ),
        );
        isSendingRef.current = false;
        setIsSending(false);
        // The message this send was for is no longer the current one: don't
        // toast or close on behalf of whatever the picker shows now.
        if (currentMessageRef.current !== requestedForMessage) return;
        const failed = recipients.filter((_recipient, index) => {
          const outcome = outcomes[index];
          // Missing/rejected both count as a failure; `Promise.allSettled`
          // always returns one entry per input in the same order, so a
          // missing entry can't happen in practice, but `outcomes[index]`
          // is typed as possibly `undefined` regardless (noUncheckedIndexedAccess).
          if (!outcome || outcome.status === "rejected") return true;
          return outcome.value === false;
        });
        if (failed.length === 0) {
          showToast(
            t("messages:forward.sentToast", { count: recipients.length }),
            "success",
          );
          onAllSucceeded();
          return;
        }
        setFailedRecipientIds(new Set(failed.map((recipient) => recipient.id)));
        showToast(
          t("messages:forward.failedToast", {
            names: failed.map((recipient) => recipient.name).join(", "),
          }),
          "error",
        );
      })();
    },
    [forwardMessage, message, showToast, t],
  );

  return { send, isSending, failedRecipientIds };
}
