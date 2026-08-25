import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ChatMessage } from "./data";
import { isServerConversationId } from "./useMessagesController.helpers";
import type { useSendMessage } from "./api/useMessageMutations";
import type { GifAttachment } from "../../shared/api/gifs";
import { revokeBlobPreview, type MediaKind } from "./messageSending.helpers";

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
              revokeBlobPreview(
                current.find((item) => item.localId === localId),
              );
              const remaining = current.filter(
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

  return { appendOptimistic, setStatus, deliver };
}
