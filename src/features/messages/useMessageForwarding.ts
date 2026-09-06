import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { nextLocalId } from "./useMessagesController.helpers";
import type { useStartConversation } from "./api/useMessageMutations";
import type { CreationOutcome } from "./messageCreation.types";
import type { MediaKind } from "./messageSending.helpers";

interface ForwardingDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  t: TFunction;
  /** The currently open thread's id, so a failed `startConversation` can
   *  restore whatever was open before the optimistic placeholder took over. */
  activeId: string;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setActiveId: Dispatch<SetStateAction<string>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setView: Dispatch<SetStateAction<"list" | "thread">>;
  setLocallyDeletedIds: Dispatch<SetStateAction<Set<string>>>;
  startConversation: ReturnType<typeof useStartConversation>;
  /** From the navigation sub-hook — opens (and marks read) an existing thread. */
  openThread: (id: string) => void;
  /** From the sending sub-hook — appends an optimistic bubble to a conversation. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  /** From the sending sub-hook — drives a message down the send ladder. */
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
  ) => void;
  /** From the sending sub-hook — re-keys and re-drives any outbox entries
   *  queued under a placeholder id once its real conversation exists. */
  migrateOutboxConversation: (oldConvId: string, newConvId: string) => void;
}

export interface MessageForwarding {
  forwardMessage: (
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    outcome?: CreationOutcome,
  ) => void;
}

/**
 * Forward a message's content to `recipient` as a NEW message, through the
 * ordinary idempotent send path (a fresh `clientMessageId`, the outbox, cache
 * patching) — never a bypass. Only the body is carried; reactions/receipts are
 * not copied. An existing thread receives the forward instantly; a brand-new
 * live thread is created first (POST /conversations), then the forward is sent
 * on its real UUID. Demo mode is local-only (optimistic bubble, no network).
 * Extracted from `useMessageCreation`; behaviour is unchanged.
 */
export function useMessageForwarding({
  demoMode,
  allThreads,
  t,
  activeId,
  setExtraThreads,
  setActiveId,
  setReadIds,
  setView,
  setLocallyDeletedIds,
  startConversation,
  openThread,
  appendOptimistic,
  deliver,
  migrateOutboxConversation,
}: ForwardingDeps): MessageForwarding {
  function forwardMessage(
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    outcome?: CreationOutcome,
  ) {
    const localId = nextLocalId();
    const optimistic: ChatMessage = {
      from: "me",
      text,
      // Forwarding a GIF/image carries its attachment so it renders (and
      // re-sends) as one, not as bare fallback text. `mediaKind` is the
      // ORIGINAL message's kind (passed in by the caller from the message
      // being forwarded) — it can't be re-derived from "an attachment is
      // present" alone, since that's true for both kinds.
      kind: attachment ? mediaKind : undefined,
      attachment,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      forwarded: true,
    };
    // Group target: the conversation already exists (real UUID in live, mock id
    // in demo), so there is nothing to materialize — append + deliver on the
    // group's own id, exactly like an existing DM thread. `deliver` no-ops the
    // network in demo and rides the normal idempotent outbox in live.
    if (recipient.isGroup) {
      appendOptimistic(recipient.id, optimistic);
      openThread(recipient.id);
      deliver(
        recipient.id,
        text,
        localId,
        undefined,
        true,
        attachment,
        mediaKind,
      );
      outcome?.onSuccess?.();
      return;
    }
    const existing = allThreads.find(
      (thread) => thread.slug && thread.slug === recipient.slug,
    );
    if (existing) {
      appendOptimistic(existing.id, optimistic);
      openThread(existing.id);
      deliver(
        existing.id,
        text,
        localId,
        undefined,
        true,
        attachment,
        mediaKind,
      );
      outcome?.onSuccess?.();
      return;
    }
    // New thread. Captured BEFORE the optimistic switch below, so a failed
    // `startConversation` can restore whatever thread was open beforehand.
    const previousActiveId = activeId;
    // Open the placeholder immediately; in demo (or an official/
    // no-slug target) that's the whole story — no network.
    setExtraThreads((prev) =>
      prev.some((thread) => thread.id === recipient.id)
        ? prev
        : [recipient, ...prev],
    );
    setActiveId(recipient.id);
    setReadIds((current) => new Set(current).add(recipient.id));
    setView("thread");
    if (demoMode || !recipient.slug) {
      appendOptimistic(recipient.id, optimistic);
      // Demo mode simulates the honest ladder locally (sent -> delivered ->
      // seen) exactly like the existing-thread/group branches above — without
      // this call the bubble is stuck at "sending" forever, and since the
      // outbox persists demo sends, it survives reloads too.
      deliver(
        recipient.id,
        text,
        localId,
        undefined,
        true,
        attachment,
        mediaKind,
      );
      outcome?.onSuccess?.();
      return;
    }
    // Live: materialize the conversation, then append + deliver on the real id
    // (optimistic is keyed by conversation id, so it must wait for the UUID).
    startConversation.mutate(recipient.slug, {
      onError: () => {
        // The conversation never materialized — drop the dead placeholder
        // (never sent, so there's no orphaned optimistic bubble to clean up)
        // and restore whatever thread was open before. The caller
        // (MessagesPage) uses this to keep the forward picker open on the
        // same message so the member can retry or pick another recipient;
        // the global mutation-error toast already surfaced the failure.
        setExtraThreads((prev) =>
          prev.filter((thread) => thread.id !== recipient.id),
        );
        setReadIds((current) => {
          if (!current.has(recipient.id)) return current;
          const next = new Set(current);
          next.delete(recipient.id);
          return next;
        });
        setActiveId((current) =>
          current === recipient.id ? previousActiveId : current,
        );
        setView(previousActiveId ? "thread" : "list");
        outcome?.onError?.();
      },
      onSuccess: (conversation) => {
        if (!conversation) return;
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
        setActiveId((current) =>
          current === recipient.id ? conversation.id : current,
        );
        setReadIds((current) => new Set(current).add(conversation.id));
        // A concurrent ordinary send (the composer stayed live on this
        // placeholder while the forward's own startConversation was in
        // flight) may have queued outbox entries under `recipient.id` too —
        // migrate those before adding this forward's own optimistic bubble.
        migrateOutboxConversation(recipient.id, conversation.id);
        appendOptimistic(conversation.id, optimistic);
        deliver(
          conversation.id,
          text,
          localId,
          undefined,
          true,
          attachment,
          mediaKind,
        );
        outcome?.onSuccess?.();
      },
    });
  }

  return { forwardMessage };
}
