import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  patchConversationPreview,
  patchConversationRead,
  upsertMessage,
} from "../../../shared/api/messageCache";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import type { GifAttachment } from "../../../shared/api/gifs";
import {
  addGroupMembers,
  changeGroupMemberRole,
  createGroup,
  leaveGroup,
  markConversationRead,
  removeGroupMember,
  sendMessage,
  startConversation,
  updateGroup,
  type ConversationResponse,
} from "./messages.api";
import { conversationToView } from "./messages.adapters";
import { UNREAD_COUNT_KEY } from "./useConversations";
import type { Conversation } from "../data";

/**
 * Each mutation branches on `demoMode`: in demo it's a no-op (the page keeps its
 * optimistic local state, exactly as the prototype already does); live mode calls
 * the API then invalidates the affected keys. The realtime layer additionally
 * reconciles other sessions. A blocked pair is rejected server-side with a typed
 * 403 — the composer is already severed client-side (SocialProvider.isBlocked).
 */

/** POST /conversations/:id/messages. `clientMessageId` is the sender's
 *  idempotency key (see the outbox in `useMessagesController`). The conversation
 *  id is passed at mutate time — not bound at hook creation — so the offline
 *  outbox can replay a pending message to ANY thread, not just the open one. On
 *  success the server row is patched straight into the thread cache (deduped
 *  against our optimistic bubble by that same client id) instead of refetching,
 *  and the inbox row's preview/time is patched the same way — NOT invalidated.
 *  (The backend also echoes `message:new` back to the sender's own socket;
 *  `patchConversationPreview` is idempotent so that second application is a
 *  harmless no-op, not a second `GET /conversations`.) */
export function useSendMessage() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    MessageResponse | null,
    Error,
    {
      conversationId: string;
      body: string;
      replyToId?: string;
      clientMessageId?: string;
      forwarded?: boolean;
      attachment?: GifAttachment;
      kind?: "user" | "gif";
    }
  >({
    mutationFn: async ({
      conversationId,
      body,
      replyToId,
      clientMessageId,
      forwarded,
      attachment,
      kind,
    }) => {
      if (demoMode) return null;
      return sendMessage(
        conversationId,
        body,
        replyToId,
        clientMessageId,
        forwarded,
        attachment,
        kind,
      );
    },
    onSuccess: (message, { conversationId }) => {
      if (demoMode || !message) return;
      upsertMessage(queryClient, conversationId, message);
      patchConversationPreview(queryClient, conversationId, message);
    },
  });
}

/** POST /conversations — New Message modal. Returns the opened thread view. */
export function useStartConversation() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<Conversation | null, Error, string>({
    mutationFn: async (recipientHandle) => {
      if (demoMode) return null;
      const dto: ConversationResponse =
        await startConversation(recipientHandle);
      return conversationToView(dto);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** POST /conversations/group — create a group. Returns the opened thread view
 *  (null in demo, where the controller builds the local mock group instead). */
export function useCreateGroup() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { title: string; memberHandles: string[]; avatarUrl?: string }
  >({
    mutationFn: async ({ title, memberHandles, avatarUrl }) => {
      if (demoMode) return null;
      const dto = await createGroup(title, memberHandles, avatarUrl);
      return conversationToView(dto);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** POST /conversations/:id/leave — leave a group. Demo is a local no-op (the
 *  controller marks the thread left in memory). */
export function useLeaveGroup() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      if (demoMode || !conversationId) return;
      await leaveGroup(conversationId);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** Patch the returned, already-fresh group `Conversation` into every cached
 *  `["conversations"]` list in place — instead of `invalidateQueries`, which
 *  would throw the returned DTO away and pay for a full `GET /conversations`
 *  round-trip the mutation's own response already made unnecessary. A no-op if
 *  the row isn't cached yet (falls back to the next real fetch). */
function patchConversationInList(
  queryClient: QueryClient,
  updated: Conversation,
): void {
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === updated.id ? updated : conversation,
      ),
  );
}

/**
 * Group management (feature #17 Phase 2). Each live mutation calls the API — the
 * SERVER re-checks the caller's role on every one, so the client's can-flags are
 * only a UI hint — then patches the returned group `Conversation` straight into
 * the cached `["conversations"]` list (the realtime layer also fans the same
 * frame to affected members). Demo mode is a local no-op: the returned null
 * tells the controller to simulate the change on the in-memory mock group.
 */
export function useAddGroupMembers() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; memberHandles: string[] }
  >({
    mutationFn: async ({ conversationId, memberHandles }) => {
      if (demoMode) return null;
      return conversationToView(await addGroupMembers(conversationId, memberHandles));
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

export function useRemoveGroupMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; userId: string }
  >({
    mutationFn: async ({ conversationId, userId }) => {
      if (demoMode) return null;
      return conversationToView(await removeGroupMember(conversationId, userId));
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

export function useChangeGroupMemberRole() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; userId: string; role: "admin" | "member" }
  >({
    mutationFn: async ({ conversationId, userId, role }) => {
      if (demoMode) return null;
      return conversationToView(
        await changeGroupMemberRole(conversationId, userId, role),
      );
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

export function useUpdateGroup() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; title?: string; avatarUrl?: string }
  >({
    mutationFn: async ({ conversationId, title, avatarUrl }) => {
      if (demoMode) return null;
      return conversationToView(
        await updateGroup(conversationId, { title, avatarUrl }),
      );
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

/** POST /conversations/:id/read — clear the unread badge for a thread. The
 *  target conversation id is passed at mutate time, not bound when the hook
 *  runs: `openThread` fires this synchronously right after `setActiveId`, when
 *  the render-time `active` is still the *previous* thread — binding the id at
 *  creation would mark the wrong conversation read. Fires on every
 *  thread-open-with-unread, so the success patch zeroes the row's unread state
 *  in place rather than invalidating — the server frame carries no new data an
 *  invalidate would have picked up (we already know it's now read: we're the
 *  one who just read it), and the counterpart's `read` socket frame carries no
 *  cache-worthy state either (see `realtime.ts`'s `message:new`/`read` notes). */
export function useMarkRead() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      if (demoMode || !conversationId) return;
      await markConversationRead(conversationId, new Date().toISOString());
    },
    onSuccess: (_result, conversationId) => {
      if (demoMode) return;
      patchConversationRead(queryClient, conversationId);
      // Reading a thread clears its unread → refresh the cheap nav DM badge
      // (its own isolated key, so the list patch above doesn't touch it).
      void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });
}
