import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { GroupMemberPick } from "./NewGroupModal";
import type {
  useCreateGroup,
  useStartConversation,
} from "./api/useMessageMutations";
import { useThreadCreation } from "./useThreadCreation";
import { useGroupCreation } from "./useGroupCreation";
import { useMessageForwarding } from "./useMessageForwarding";
import { useMessageDeepLinks } from "./useMessageDeepLinks";
import type { CreationOutcome } from "./messageCreation.types";

export type { CreationOutcome } from "./messageCreation.types";

interface CreationDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined;
  t: TFunction;
  /** The currently open thread's id, so a failed `startThread`/`forwardMessage`
   *  can restore whatever was open before the optimistic placeholder took over. */
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
    attachment?: GifAttachment,
    mediaKind?: "gif" | "image",
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
    attachment?: GifAttachment,
    mediaKind?: "gif" | "image",
    outcome?: CreationOutcome,
  ) => void;
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
  });

  useMessageDeepLinks({
    allThreads,
    openThread,
    openThreadAtMessage,
    startThread,
  });

  return { startThread, startGroup, forwardMessage };
}
