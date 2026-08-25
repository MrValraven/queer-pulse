import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { useSendMessage } from "./api/useMessageMutations";
import { useMessageDeliverCore } from "./useMessageDeliverCore";
import { useMessageSendActions } from "./useMessageSendActions";
import { useMessageOutbox } from "./useMessageOutbox";
import type { MediaKind } from "./messageSending.helpers";

export type { MediaKind } from "./messageSending.helpers";

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
  sendImage: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
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
 * Every returned function is `useCallback`-stabilized (inside the sub-hooks
 * below) so a message-list leaf (e.g. `MessageRunView`'s `onRetry`) that
 * receives it can be `React.memo`'d without an unstable prop defeating the
 * memo. This hook composes three cohesive slices, each in its own file:
 * `useMessageDeliverCore` (optimistic append + the send-to-server primitive),
 * `useMessageSendActions` (`send`/`sendGif`/`sendImage`/`retrySend`), and
 * `useMessageOutbox` (persistence, replay, and conversation-id migration).
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
  const { appendOptimistic, setStatus, deliver } = useMessageDeliverCore({
    setSent,
    demoMode,
    sendMessage,
  });

  const { send, sendGif, sendImage, retrySend } = useMessageSendActions({
    active,
    activeBlocked,
    replyDraft,
    setReplyDraft,
    t,
    appendOptimistic,
    setStatus,
    deliver,
  });

  const { migrateOutboxConversation } = useMessageOutbox({
    sent,
    setSent,
    demoMode,
    deliver,
  });

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
