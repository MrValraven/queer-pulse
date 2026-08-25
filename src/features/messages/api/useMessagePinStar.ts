import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  patchMessagePinned,
  patchMessageStarred,
} from "../../../shared/api/messageCache";
import type {
  MessageResponse,
  StarredMessagesResponse,
} from "../../../shared/contracts/contracts";
import {
  getPinnedMessages,
  getStarredMessages,
  pinMessage,
  starMessage,
  unpinMessage,
  unstarMessage,
} from "./messages.api";

/**
 * Forward / Pin / Star data hooks. Each branches on `demoMode`: live mode calls
 * the API then patches/refetches only the affected keys (never a blanket thread
 * invalidation); demo mode is inert — pin/star, like reactions/edit/delete, are
 * only reachable on a message with a server id, which demo mock messages lack,
 * so the mutations no-op and the lists come back empty. No network in demo.
 */

const EMPTY_PINS: MessageResponse[] = [];
const EMPTY_STARRED: StarredMessagesResponse = { items: [], conversations: [] };

/** GET /conversations/:id/pins — the SHARED pinned-messages list for the banner.
 *  Its own query key (`conversation-pins`), NOT under `["messages", id]`, so the
 *  thread cache-patch helpers never touch it. */
export function usePinnedMessages(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<MessageResponse[]>({
    queryKey: ["conversation-pins", conversationId, demoMode],
    enabled: !demoMode && !!conversationId,
    queryFn: () =>
      conversationId
        ? getPinnedMessages(conversationId)
        : Promise.resolve(EMPTY_PINS),
    initialData: demoMode ? EMPTY_PINS : undefined,
  });
}

/** GET /messages/starred — the caller's private starred messages. */
export function useStarredMessages(enabled: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery<StarredMessagesResponse>({
    queryKey: ["starred-messages", demoMode],
    enabled: enabled && !demoMode,
    queryFn: () => getStarredMessages(),
    initialData: demoMode ? EMPTY_STARRED : undefined,
  });
}

export interface PinInput {
  messageId: string;
  /** Whether the message is currently pinned — decides pin vs. unpin. */
  pinned: boolean;
}

/** Pin/unpin a message (SHARED). Optimistically patches the in-bubble indicator
 *  and refreshes the pinned-messages banner; the counterpart is reconciled by the
 *  `message:pinned` socket frame. */
export function useTogglePin(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, PinInput>({
    mutationFn: async ({ messageId, pinned }) => {
      if (demoMode || !conversationId) return;
      if (pinned) await unpinMessage(conversationId, messageId);
      else await pinMessage(conversationId, messageId);
    },
    onSuccess: (_result, { messageId, pinned }) => {
      if (demoMode || !conversationId) return;
      patchMessagePinned(
        queryClient,
        conversationId,
        messageId,
        pinned ? null : new Date().toISOString(),
      );
      void queryClient.invalidateQueries({
        queryKey: ["conversation-pins", conversationId],
      });
    },
  });
}

export interface StarInput {
  messageId: string;
  /** Whether the message is currently starred — decides star vs. unstar. */
  starred: boolean;
}

/** Star/unstar a message (PRIVATE). Optimistically patches the owner-only
 *  indicator and refreshes the starred-messages list. No socket — stars never
 *  leave the caller. */
export function useToggleStar(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, StarInput>({
    mutationFn: async ({ messageId, starred }) => {
      if (demoMode || !conversationId) return;
      if (starred) await unstarMessage(conversationId, messageId);
      else await starMessage(conversationId, messageId);
    },
    onSuccess: (_result, { messageId, starred }) => {
      if (demoMode || !conversationId) return;
      patchMessageStarred(queryClient, conversationId, messageId, !starred);
      void queryClient.invalidateQueries({ queryKey: ["starred-messages"] });
    },
  });
}
