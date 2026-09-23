import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { nextLocalId } from "./useMessagesController.helpers";
import type { useStartConversation } from "./api/useMessageMutations";
import type { MediaKind } from "./messageSending.helpers";

interface ForwardingDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  t: TFunction;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setLocallyDeletedIds: Dispatch<SetStateAction<Set<string>>>;
  startConversation: ReturnType<typeof useStartConversation>;
  /** From the sending sub-hook. Appends an optimistic bubble to a conversation. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  /** From the sending sub-hook. Drives a message down the send ladder. */
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    stickerId?: string,
    asIdentityId?: string,
  ) => void;
  /** From the sending sub-hook. Re-keys and re-drives any outbox entries
   *  queued under a placeholder id once its real conversation exists. */
  migrateOutboxConversation: (oldConvId: string, newConvId: string) => void;
}

export interface MessageForwarding {
  /**
   * Resolves `true` once the send is underway: the optimistic bubble is up
   * and the message is either delivered (demo), on the outbox, or riding the
   * live send ladder. That is the same bar the rest of the composer holds a
   * send to, so a later server rejection of an accepted send (a block, a
   * network fault on the actual POST) surfaces as a failed bubble in that
   * thread, not as a rejected forward here. Resolves `false` only when a
   * brand-new conversation could not be created at all, so there is nowhere
   * to send to.
   */
  forwardMessage: (
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    stickerId?: string,
  ) => Promise<boolean>;
}

/**
 * Forward a message's content to `recipient` as a NEW message, through the
 * ordinary idempotent send path (a fresh `clientMessageId`, the outbox, cache
 * patching). Only the body is carried; reactions/receipts are not copied. An
 * existing thread receives the forward instantly; a brand-new live thread is
 * created first (POST /conversations), then the forward is sent on its real
 * UUID. Demo mode is local-only (optimistic bubble, no network).
 *
 * The member's own view stays put: forwarding used to jump the active
 * thread to `recipient` (DES-206), which could send to the wrong person on a
 * mis-tap and lose the member's place in the thread they were reading.
 * `forwardMessage` only ever appends the optimistic bubble and drives the
 * send on `recipient`'s conversation id, leaving whatever thread/view was
 * open exactly as it was. `ForwardPickerModal` (via `useForwardSend`) calls
 * this once per selected recipient and stays open, or closes on full
 * success, on top of whatever thread was already open.
 *
 * Extracted from `useMessageCreation`; the send/outbox mechanics are
 * unchanged from the single-recipient flow this replaced.
 */
export function useMessageForwarding({
  demoMode,
  allThreads,
  t,
  setExtraThreads,
  setReadIds,
  setLocallyDeletedIds,
  startConversation,
  appendOptimistic,
  deliver,
  migrateOutboxConversation,
}: ForwardingDeps): MessageForwarding {
  async function forwardMessage(
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    stickerId?: string,
  ): Promise<boolean> {
    const localId = nextLocalId();
    const optimistic: ChatMessage = {
      from: "me",
      text,
      // Forwarding a GIF/image/document carries its attachment so it renders
      // (and re-sends) as one, rather than as bare fallback text; `mediaKind`
      // is the ORIGINAL message's kind (passed in by the caller from the
      // message being forwarded), since it can't be re-derived from "an
      // attachment is present" alone (true for every media kind). A sticker
      // is resolved from `stickerId` explicitly, the same way
      // `resolveSendKind` (`useMessageDeliverCore.ts`) resolves it for an
      // ordinary send: a forwarded sticker still carries its attachment (for
      // the bubble to render), so "an attachment is present" alone would
      // stay true for it too, and only `stickerId` tells the two apart.
      kind: stickerId ? "sticker" : attachment ? mediaKind : undefined,
      attachment,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      forwarded: true,
    };
    // Append and send into one target thread, as that thread's own mailbox
    // seat: the forward is stamped with the identity it goes out as, so a
    // retry or replay sends the same one. Undefined (a personal thread, a
    // group, a brand-new first contact) sends as the member's own profile.
    const forwardInto = (
      conversationId: string,
      seatIdentityId: string | undefined,
    ): void => {
      appendOptimistic(conversationId, {
        ...optimistic,
        sendAsIdentityId: seatIdentityId,
      });
      deliver(
        conversationId,
        text,
        localId,
        undefined,
        true,
        attachment,
        mediaKind,
        stickerId,
        seatIdentityId,
      );
    };
    // Group target: the conversation already exists (real UUID in live, mock
    // id in demo), so there is nothing to materialize. Append + deliver on
    // the group's own id, exactly like an existing DM thread below.
    // `deliver` no-ops the network in demo and rides the normal idempotent
    // outbox in live. The thread's own read state is left untouched: it may
    // already carry real unread messages the member hasn't seen, and forcing
    // it to "read" here for an unrelated reason (the member's own outgoing
    // forward) would hide those from them.
    if (recipient.isGroup) {
      forwardInto(recipient.id, recipient.mailboxSeatIdentityId);
      return true;
    }
    const existing = allThreads.find(
      (thread) => thread.slug && thread.slug === recipient.slug,
    );
    if (existing) {
      forwardInto(existing.id, existing.mailboxSeatIdentityId);
      return true;
    }
    // New thread: no existing conversation to append to yet, so add the
    // placeholder row to the inbox first. This placeholder has no real
    // unread history to hide (it was just created by this forward), so
    // marking it read here is safe, and keeps the member's own just-sent
    // message from showing an unread badge on a thread they opened
    // themselves.
    setExtraThreads((prev) =>
      prev.some((thread) => thread.id === recipient.id)
        ? prev
        : [recipient, ...prev],
    );
    setReadIds((current) => new Set(current).add(recipient.id));
    if (demoMode || !recipient.slug) {
      // Demo mode simulates the honest ladder locally (sent -> delivered ->
      // seen), exactly like the existing-thread/group branches above.
      // Without the delivery the bubble is stuck at "sending" forever, and
      // since the outbox persists demo sends, it survives reloads too.
      forwardInto(recipient.id, recipient.mailboxSeatIdentityId);
      return true;
    }
    // Live: materialize the conversation first, then append + deliver on the
    // real id (the optimistic bubble is keyed by conversation id, so it has
    // to wait for the UUID).
    //
    // `mutateAsync`, not `mutate` with per-call callbacks: every recipient in
    // a multi-select forward shares this SAME `startConversation` mutation
    // observer. `mutate`'s per-call `onSuccess`/`onError` are stored as the
    // observer's one current set of callbacks (TanStack Query v5's
    // `MutationObserver#mutate` overwrites `#mutateOptions` on every call),
    // so firing it for a second recipient before the first has settled loses
    // the first recipient's own callbacks and it never resolves. Each
    // `mutateAsync` call instead builds its own `Mutation` instance and
    // returns THAT instance's own promise (verified in
    // `@tanstack/query-core`'s `mutationObserver.ts`/`mutation.ts`), so
    // several concurrent forwards to brand-new recipients each resolve, or
    // reject, independently on their own timeline.
    try {
      const conversation = await startConversation.mutateAsync(recipient.slug);
      // `Conversation | null`: null is the demo-mode return shape. This
      // branch only runs when `demoMode` is false, so it's unreachable in
      // practice; the guard just keeps the type honest.
      if (!conversation) return true;
      setExtraThreads((prev) => [
        conversation,
        ...prev.filter(
          (existingThread) =>
            existingThread.id !== recipient.id &&
            existingThread.id !== conversation.id,
        ),
      ]);
      setLocallyDeletedIds((previous) => {
        if (!previous.has(conversation.id)) return previous;
        const next = new Set(previous);
        next.delete(conversation.id);
        return next;
      });
      setReadIds((current) => new Set(current).add(conversation.id));
      // A concurrent ordinary send (the composer stayed live on this
      // placeholder while this forward's own `startConversation` call was in
      // flight) may have queued outbox entries under `recipient.id` too.
      // Migrate those before adding this forward's own optimistic bubble.
      migrateOutboxConversation(recipient.id, conversation.id);
      // A conversation `startConversation` just opened is a personal first
      // contact, so its seat is the member's own profile.
      forwardInto(conversation.id, conversation.mailboxSeatIdentityId);
      return true;
    } catch {
      // The conversation never materialized: drop the dead placeholder.
      // Nothing was ever sent, so there is no orphaned optimistic bubble to
      // clean up. The caller (`useForwardSend`) keeps exactly this recipient
      // selected so the member can retry or drop it; the global
      // mutation-error toast already surfaced the failure.
      setExtraThreads((prev) =>
        prev.filter((thread) => thread.id !== recipient.id),
      );
      setReadIds((current) => {
        if (!current.has(recipient.id)) return current;
        const next = new Set(current);
        next.delete(recipient.id);
        return next;
      });
      return false;
    }
  }

  return { forwardMessage };
}
