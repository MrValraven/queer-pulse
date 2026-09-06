import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "./data";
import { isServerConversationId } from "./useMessagesController.helpers";
import type { useSendMessage } from "./api/useMessageMutations";
import { sendDocumentMessage } from "./api/messages.api";
import { ApiError } from "../../shared/api/client";
import type { GifAttachment } from "../../shared/api/gifs";
import {
  isDocumentAttachment,
  type DocumentAttachment,
} from "../../shared/api/documentAttachment";
import type { MessageResponse } from "../../shared/contracts/contracts";
import {
  patchConversationPreview,
  upsertMessage,
} from "../../shared/api/messageCache";
import { revokeBlobPreview, type MediaKind } from "./messageSending.helpers";

/**
 * The live mutation behind a `kind:"document"` send (PRD-226) — a standalone
 * `useMutation` rather than a `useMessageMutations.useSendMessage` widening,
 * since that hook's file is owned by a parallel build pass. Mirrors
 * `useSendMessage`'s own demo/live cache-patch contract exactly: on success,
 * the server row replaces the optimistic bubble in place (deduped by
 * `clientMessageId`) and the inbox preview is patched, never invalidated.
 */
function useSendDocumentMessage() {
  const queryClient = useQueryClient();
  return useMutation<
    MessageResponse,
    Error,
    {
      conversationId: string;
      body: string;
      attachment: DocumentAttachment;
      replyToId?: string;
      clientMessageId?: string;
      forwarded?: boolean;
    }
  >({
    mutationFn: ({
      conversationId,
      body,
      attachment,
      replyToId,
      clientMessageId,
      forwarded,
    }) =>
      sendDocumentMessage(
        conversationId,
        body,
        attachment,
        replyToId,
        clientMessageId,
        forwarded,
      ),
    onSuccess: (message, { conversationId }) => {
      upsertMessage(queryClient, conversationId, message);
      patchConversationPreview(queryClient, conversationId, message);
    },
  });
}

/** HTTP statuses the server will never reconcile by re-POSTing the SAME
 *  payload — a blocked pair (403), a thread that no longer accepts replies
 *  (403 — e.g. a housing enquiry thread the recipient closed), a deleted
 *  conversation (404/409), a payload too large (413), or one the validator
 *  rejects (400/422). `useMessageOutbox`'s automatic replay (mount / `online`
 *  / reconnect) must never resend one of these; a MANUAL `retrySend` still
 *  can, since the member may have fixed the underlying cause (unblocked,
 *  reworded, etc). Everything else — network errors (no `ApiError` at all),
 *  5xx, 429, 408 timeouts — is transient and stays eligible for automatic
 *  replay, bounded by `useMessageOutbox`'s own retry cap + backoff. */
const PERMANENT_FAILURE_STATUS_CODES = new Set([400, 403, 404, 409, 413, 422]);

interface DeliverCoreDeps {
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>;
  demoMode: boolean;
  sendMessage: ReturnType<typeof useSendMessage>;
}

export interface MessageDeliverCore {
  /** Append an optimistic bubble to a conversation's session sends. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  setStatus: (
    convId: string,
    localId: string,
    status: ChatMessage["status"],
  ) => void;
  /** Drive a message down the send ladder (demo-simulated, or the live
   *  mutation). `mediaKind` is required whenever `attachment` is set — it's
   *  what tells the server (and a resend/outbox-replay) a `gif`/`image`
   *  message (both carry a `GifAttachment`) from a `document` one (carries a
   *  `DocumentAttachment`, routed to its own mutation below). */
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

/**
 * The core send-to-server primitive: optimistic append, status transitions,
 * and `deliver` (the demo-simulated ladder or the live idempotent mutation).
 * Extracted from `useMessageSending`; behaviour is unchanged.
 */
export function useMessageDeliverCore({
  setSent,
  demoMode,
  sendMessage,
}: DeliverCoreDeps): MessageDeliverCore {
  // A `kind:"document"` send routes to its own mutation (see
  // `useSendDocumentMessage`'s own doc for why this isn't a widened
  // `sendMessage` instead) — same idempotent-on-`clientMessageId` endpoint,
  // same cache-patch contract, just a separate react-query mutation object.
  const sendDocumentMessageMutation = useSendDocumentMessage();

  const appendOptimistic = useCallback(
    (convId: string, message: ChatMessage) => {
      setSent((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] ?? []), message],
      }));
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

  // Shared by both mutations below (the ordinary text/gif/image send and the
  // document send) so their success/failure handling can never drift apart.
  const handleDeliverSuccess = useCallback(
    (convId: string, localId: string) => {
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
      });
    },
    [setSent],
  );

  const handleDeliverError = useCallback(
    (convId: string, localId: string, error: unknown) => {
      // Classify right where the failure actually happens — see
      // `PERMANENT_FAILURE_STATUS_CODES`. `isRetryable` is written fresh
      // from THIS attempt's outcome (not merged with any prior value),
      // so a manual retry that now fails only transiently (the
      // underlying cause resolved) clears an earlier permanent flag
      // rather than staying stuck.
      const isPermanentFailure =
        error instanceof ApiError &&
        PERMANENT_FAILURE_STATUS_CODES.has(error.status);
      setSent((prev) => ({
        ...prev,
        [convId]: (prev[convId] ?? []).map((item) =>
          item.localId === localId
            ? {
                ...item,
                status: "failed",
                isRetryable: !isPermanentFailure,
                lastAttemptAt: Date.now(),
              }
            : item,
        ),
      }));
    },
    [setSent],
  );

  const deliver = useCallback(
    (
      convId: string,
      body: string,
      localId: string,
      replyToId?: string,
      forwarded?: boolean,
      attachment?: GifAttachment | DocumentAttachment,
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
      //
      // Narrowed on the ATTACHMENT's own shape (`isDocumentAttachment`), never
      // on `mediaKind` alone: `attachment`/`mediaKind` are independent
      // parameters, so only a real type-guard check on `attachment` itself
      // lets TypeScript (and a reader) know which mutation's payload shape is
      // actually safe to build — no `as` cast standing in for that proof.
      if (attachment && isDocumentAttachment(attachment)) {
        sendDocumentMessageMutation.mutate(
          {
            conversationId: convId,
            body,
            attachment,
            replyToId,
            clientMessageId: localId,
            forwarded,
          },
          {
            onSuccess: () => handleDeliverSuccess(convId, localId),
            onError: (error) => handleDeliverError(convId, localId, error),
          },
        );
        return;
      }
      // `attachment` is narrowed to `GifAttachment | undefined` here (the
      // `DocumentAttachment` case returned above). `mediaKind` still isn't
      // provably `"gif" | "image"` from types alone (it's an independent
      // param), so it's checked with a real comparison, not a cast.
      const gifOrImageKind =
        mediaKind === "gif" || mediaKind === "image" ? mediaKind : undefined;
      sendMessage.mutate(
        {
          conversationId: convId,
          body,
          replyToId,
          clientMessageId: localId,
          forwarded,
          attachment,
          kind: attachment ? gifOrImageKind : undefined,
        },
        {
          // Drop only THIS optimistic message (matched by localId) — a concurrent
          // second send in the same thread must survive. The mutation patches the
          // authoritative server copy into the thread cache (deduped by the same
          // client id), so it takes over the bubble's slot as this one clears.
          onSuccess: () => handleDeliverSuccess(convId, localId),
          onError: (error) => handleDeliverError(convId, localId, error),
        },
      );
    },
    // `sendMessage.mutate`/`sendDocumentMessageMutation.mutate` are stable
    // references (react-query wraps them in their own `useCallback`);
    // depending on them rather than the whole mutation result object avoids
    // recreating `deliver` on every isPending/isError flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      demoMode,
      sendMessage.mutate,
      sendDocumentMessageMutation.mutate,
      setStatus,
      handleDeliverSuccess,
      handleDeliverError,
    ],
  );

  return { appendOptimistic, setStatus, deliver };
}
