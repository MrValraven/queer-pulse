import { useState, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import type { GroupMemberPick } from "./NewGroupModal";
import type {
  useCreateGroup,
  useStartConversation,
} from "./api/useMessageMutations";
import type { StrangerMemberResult } from "./api/useStrangerMemberSearch";
import { useThreadCreation } from "./useThreadCreation";
import { useGroupCreation } from "./useGroupCreation";
import { useMessageForwarding } from "./useMessageForwarding";
import { useMessageDeepLinks } from "./useMessageDeepLinks";
import type { CreationOutcome } from "./messageCreation.types";
import type { MediaKind } from "./messageSending.helpers";

export type { CreationOutcome } from "./messageCreation.types";

interface CreationDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined;
  t: TFunction;
  /** The currently open thread's id, so a failed `startThread` can restore
   *  whatever was open before the optimistic placeholder took over. */
  activeId: string;
  setComposing: Dispatch<SetStateAction<boolean>>;
  setQuery: Dispatch<SetStateAction<string>>;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setActiveId: Dispatch<SetStateAction<string>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setView: Dispatch<SetStateAction<"list" | "thread">>;
  setLocallyDeletedIds: Dispatch<SetStateAction<Set<string>>>;
  startConversation: ReturnType<typeof useStartConversation>;
  createGroupMutation: ReturnType<typeof useCreateGroup>;
  /** From the navigation sub-hook — opens (and marks read) an existing thread. */
  openThread: (id: string) => void;
  /** From the navigation sub-hook — opens a thread and arms a scroll-to +
   *  highlight of one of its messages. */
  openThreadAtMessage: (conversationId: string, messageId?: string) => void;
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

export interface MessageCreation {
  startThread: (recipient: Conversation) => void;
  startGroup: (
    title: string,
    members: GroupMemberPick[],
    avatarUrl?: string,
    outcome?: CreationOutcome,
  ) => void;
  forwardMessage: (
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
  ) => Promise<boolean>;
  /**
   * PRD-343: set when `startThread` hit the "not an accepted connection"
   * refusal, naming who was being messaged. The caller opens
   * `NewMessageModal`'s `initialRequestTarget` step with this instead of the
   * blank picker, so a "Message" CTA for a non-connection lands on the
   * request composer for that exact person. `null` the rest of the time.
   */
  pendingRequestTarget: StrangerMemberResult | null;
  /** Clears `pendingRequestTarget`, e.g. when the modal it opened closes. */
  clearPendingRequestTarget: () => void;
}

/** A `Conversation` (the shape `startThread` receives) has everything a
 *  `StrangerMemberResult` needs except `sub` (a subtitle the picker's search
 *  results carry and a known recipient does not), which is left blank. */
function conversationToStrangerResult(
  recipient: Conversation,
): StrangerMemberResult | null {
  if (!recipient.slug) return null;
  return {
    slug: recipient.slug,
    name: recipient.name,
    sub: "",
    initials: recipient.initials,
    tint: recipient.tint,
    avatarUrl: recipient.avatarUrl,
  };
}

/**
 * Thread + group creation and forwarding — plus the two deep-link effects
 * ("Message <member>" and the notification-tap `?c=<id>`). All materialize or
 * open a thread, so they live together. Extracted from `useMessagesController`;
 * behaviour is unchanged. This hook composes four cohesive slices, each in its
 * own file: `useThreadCreation` (`startThread`), `useGroupCreation`
 * (`startGroup`), `useMessageForwarding` (`forwardMessage`), and
 * `useMessageDeepLinks` (the two deep-link effects, which call back into
 * `startThread`).
 */
export function useMessageCreation({
  demoMode,
  allThreads,
  myProfile,
  t,
  activeId,
  setComposing,
  setQuery,
  setExtraThreads,
  setActiveId,
  setReadIds,
  setView,
  setLocallyDeletedIds,
  startConversation,
  createGroupMutation,
  openThread,
  openThreadAtMessage,
  appendOptimistic,
  deliver,
  migrateOutboxConversation,
}: CreationDeps): MessageCreation {
  const [pendingRequestTarget, setPendingRequestTarget] =
    useState<StrangerMemberResult | null>(null);

  const { startThread } = useThreadCreation({
    demoMode,
    allThreads,
    activeId,
    setComposing,
    setQuery,
    setExtraThreads,
    setActiveId,
    setReadIds,
    setView,
    setLocallyDeletedIds,
    startConversation,
    migrateOutboxConversation,
    // PRD-343: reuses the SAME `composing` flag `NewMessageModal` already
    // mounts on, seeded with a target so it opens straight to the request
    // step instead of the blank picker. Keeps `composing` the single source
    // of truth for "is this modal open" (`onClose` clears both).
    onRequiresConnection: (recipient) => {
      setPendingRequestTarget(conversationToStrangerResult(recipient));
      setComposing(true);
    },
  });

  const { startGroup } = useGroupCreation({
    demoMode,
    myProfile,
    t,
    setExtraThreads,
    setActiveId,
    setReadIds,
    setView,
    createGroupMutation,
  });

  const { forwardMessage } = useMessageForwarding({
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
  });

  useMessageDeepLinks({
    allThreads,
    openThread,
    openThreadAtMessage,
    startThread,
  });

  return {
    startThread,
    startGroup,
    forwardMessage,
    pendingRequestTarget,
    clearPendingRequestTarget: () => setPendingRequestTarget(null),
  };
}
