import { useMemo } from "react";
import {
  useMutation,
  useMutationState,
  useQueryClient,
  type Query,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  invalidateConversationDetail,
  newestCachedMessage,
  patchConversationDetail,
  patchConversationPreview,
  patchConversationReadCoverage,
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
      kind?: "user" | "gif" | "image" | "sticker";
      /** Set only when `kind === "sticker"`: the catalogue sticker's id, the
       *  entire wire payload for a sticker send (see `sendMessage`'s own doc
       *  in `messages.api.ts` for why no attachment ever rides alongside). */
      stickerId?: string;
      /** The identity the message was composed as (a mailbox seat), read
       *  off the message itself. Omitted for a personal send. */
      asIdentityId?: string;
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
      stickerId,
      asIdentityId,
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
        stickerId,
        asIdentityId,
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Conversation | null, Error, string>({
    mutationFn: async (recipientHandle) => {
      if (demoMode) return null;
      const dto: ConversationResponse =
        await startConversation(recipientHandle);
      return conversationToView(dto, t);
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { title: string; memberHandles: string[]; avatarUrl?: string }
  >({
    // useGroupCreation's onError shows groupErrorMessage(...) for every
    // failure, so the global mutation-error toast would otherwise duplicate it.
    meta: { silentError: true },
    mutationFn: async ({ title, memberHandles, avatarUrl }) => {
      if (demoMode) return null;
      const dto = await createGroup(title, memberHandles, avatarUrl);
      return conversationToView(dto, t);
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
    onSuccess: (_result, conversationId) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // The departed thread's detail entry carries `hasLeft` and the roster
      // too; the controller's optimistic `leftGroupIds` covers the screen
      // until this read lands.
      void invalidateConversationDetail(queryClient, conversationId);
    },
  });
}

/** Patch the returned, already-fresh group `Conversation` into every cached
 *  `["conversations"]` list in place — instead of `invalidateQueries`, which
 *  would throw the returned DTO away and pay for a full `GET /conversations`
 *  round-trip the mutation's own response already made unnecessary. A no-op if
 *  the row isn't cached yet (falls back to the next real fetch). The thread's
 *  detail entry, when cached, takes the same fields (see
 *  `withFreshConversation`), so a thread opened past the loaded inbox pages
 *  shows the rename, roster or dissolve at once. Exported for
 *  `useGroupManagementMutations.ts` (section 8: transfer ownership, dissolve),
 *  which returns the SAME shape of already-fresh `Conversation` for an
 *  existing row and patches it the same way rather than forking this logic. */
export function patchConversationInList(
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
  const cancelledDetailKeys = cancelDetailReadsInFlight(
    queryClient,
    updated.id,
  );
  patchConversationDetail(queryClient, updated.id, (detail) =>
    withFreshConversation(detail, updated),
  );
  // A fresh read for each cancelled one, sent after the commit, so a change
  // another member made in the meantime still arrives.
  for (const queryKey of cancelledDetailKeys) {
    void queryClient.invalidateQueries({ queryKey, exact: true });
  }
}

/** Cancels the detail reads for `conversationId` that are in flight over
 *  data already cached, and returns their keys. Such a read may have left
 *  before the mutation committed, so its answer could land on top of the
 *  fresh patch and bring the old roster or title back. TanStack reverts a
 *  cancelled entry synchronously, so the patch that follows writes over the
 *  reverted state and the aborted answer is dropped. A first read (no data
 *  yet) keeps running: there is nothing cached for it to overwrite. */
function cancelDetailReadsInFlight(
  queryClient: QueryClient,
  conversationId: string,
): QueryKey[] {
  const filter = {
    queryKey: ["conversation-detail", conversationId],
    predicate: (query: Query) =>
      query.state.fetchStatus === "fetching" && query.state.data !== undefined,
  };
  const inFlightKeys = queryClient
    .getQueryCache()
    .findAll(filter)
    .map((query) => query.queryKey);
  if (inFlightKeys.length > 0) void queryClient.cancelQueries(filter);
  return inFlightKeys;
}

/** A cached detail entry overlaid with a mutation's fresh `Conversation`.
 *  The detail read is the one that always carries the full roster and the
 *  stored draft (ENG-253), so an empty roster or an absent draft in
 *  `updated` keeps the detail's own copy; a live group always has at least
 *  its owner, so an empty roster only ever means "not carried". */
function withFreshConversation<Detail extends Conversation>(
  detail: Detail,
  updated: Conversation,
): Detail {
  return {
    ...detail,
    ...updated,
    members:
      updated.members && updated.members.length > 0
        ? updated.members
        : detail.members,
    draft: updated.draft ?? detail.draft,
  };
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; memberHandles: string[] }
  >({
    // The add-members call's onError shows groupErrorMessage(...) for every
    // failure (DES-229's GROUP_FULL toast among them), so the global
    // mutation-error toast would otherwise duplicate it.
    meta: { silentError: true },
    mutationFn: async ({ conversationId, memberHandles }) => {
      if (demoMode) return null;
      return conversationToView(
        await addGroupMembers(conversationId, memberHandles),
        t,
      );
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

export function useRemoveGroupMember() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; userId: string }
  >({
    // useMessageGroupActions' onError shows groupErrorMessage(...) for every
    // failure, so the global mutation-error toast would otherwise duplicate it.
    meta: { silentError: true },
    mutationFn: async ({ conversationId, userId }) => {
      if (demoMode) return null;
      return conversationToView(
        await removeGroupMember(conversationId, userId),
        t,
      );
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

export function useChangeGroupMemberRole() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; userId: string; role: "admin" | "member" }
  >({
    // useMessageGroupActions' onError shows groupErrorMessage(...) for every
    // failure, so the global mutation-error toast would otherwise duplicate it.
    meta: { silentError: true },
    mutationFn: async ({ conversationId, userId, role }) => {
      if (demoMode) return null;
      return conversationToView(
        await changeGroupMemberRole(conversationId, userId, role),
        t,
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    {
      conversationId: string;
      title?: string;
      avatarUrl?: string;
      /** PRD-358: group description (max 500, trimmed server-side). Posts a
       *  `group_description_changed` pill, same as a title/avatar change
       *  posts `group_renamed`/`group_photo_changed`. */
      description?: string;
    }
  >({
    // useMessageGroupActions' onError shows groupErrorMessage(...) for every
    // failure, so the global mutation-error toast would otherwise duplicate it.
    meta: { silentError: true },
    mutationFn: async ({ conversationId, title, avatarUrl, description }) => {
      if (demoMode) return null;
      return conversationToView(
        await updateGroup(conversationId, { title, avatarUrl, description }),
        t,
      );
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
  });
}

/** Shared by `useMarkRead` and `useMarkReadActivity`, so every read POST
 *  (thread open, row menu, `useMarkReadOnInbound`) is visible to the latter. */
const MARK_READ_MUTATION_KEY = ["messages", "markRead"] as const;

/** POST /conversations/:id/read — clear the unread badge for a thread. The
 *  target conversation id is passed at mutate time, not bound when the hook
 *  runs: `openThread` fires this synchronously right after `setActiveId`, when
 *  the render-time `active` is still the *previous* thread — binding the id at
 *  creation would mark the wrong conversation read. Fires on every
 *  thread-open-with-unread, so the success patch zeroes the row's unread state
 *  in place rather than invalidating — the server frame carries no new data an
 *  invalidate would have picked up (we already know it's now read: we're the
 *  one who just read it), and the counterpart's `read` socket frame carries no
 *  cache-worthy state either (see `realtime.ts`'s `message:new`/`read` notes).
 *
 *  Sends `upToMessageId` — the newest message this tab has actually fetched
 *  into its OWN thread cache, which is exactly what `MessageArea` renders
 *  from (see `messageCache.ts`) — instead of the caller's wall clock. A
 *  wall-clock `lastReadAt` can stamp a message "read" that lands in the gap
 *  between this tab's last render and this POST, before the reader ever saw
 *  it; an id-based watermark can't, because the server derives the watermark
 *  from that exact message's own `created_at` (see
 *  `ConversationsService.markRead`). Falls back to the legacy wall-clock form
 *  only when nothing is cached yet for this thread (e.g. a just-opened
 *  conversation whose history hasn't loaded into this tab at all) — the same
 *  "mark fully caught up" intent `openThread` already relies on, just without
 *  a more precise id to send instead.
 *
 *  Resolves with the exact watermark the request carried (null in demo), so
 *  `onSuccess` patches what the server stored and `useMarkReadActivity` can
 *  report it. */
export function useMarkRead() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<string | null, Error, string>({
    mutationKey: MARK_READ_MUTATION_KEY,
    mutationFn: async (conversationId) => {
      if (demoMode || !conversationId) return null;
      const newest = newestCachedMessage(queryClient, conversationId);
      const readThrough = newest?.createdAt ?? new Date().toISOString();
      await markConversationRead(conversationId, {
        upToMessageId: newest?.id,
        lastReadAt: newest ? undefined : readThrough,
      });
      return readThrough;
    },
    onSuccess: (readThrough, conversationId) => {
      if (demoMode || !readThrough) return;
      const coverage = patchConversationReadCoverage(
        queryClient,
        conversationId,
        readThrough,
      );
      // Reading a thread clears its unread → refresh the cheap nav DM badge
      // (its own isolated key, so the list patch above doesn't touch it).
      void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
      // A short watermark means this POST came from a stale cached thread
      // tail (see `patchConversationRead`'s own doc), so that cache was
      // deliberately left unread; resync it with the server here so it
      // doesn't stay stuck until some unrelated refetch happens to run. Only
      // the cache that fell short is refetched: a thread past the loaded
      // inbox pages lives in its detail entry alone, and the inbox stays put.
      if (!coverage.isListCovered) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
      if (!coverage.isDetailCovered) {
        void invalidateConversationDetail(queryClient, conversationId);
      }
    },
  });
}

export interface MarkReadActivity {
  /** A read POST for this thread is on the wire, from any caller. */
  isInFlight: boolean;
  /** The newest watermark a successful read POST for this thread carried. */
  acknowledgedThrough: string | undefined;
  /** `submittedAt` (epoch ms) of the newest failed read POST for this thread. */
  latestFailedAt: number | undefined;
}

/** Every read POST for `conversationId` as the mutation cache sees it. Read
 *  from the cache instead of per-call `mutate` callbacks: TanStack only runs
 *  those for the LATEST `mutate` on a shared observer, and `openThread`, the
 *  row menu and `useMarkReadOnInbound` all share `useMarkRead`'s one observer,
 *  so a callback could silently never fire. The selection ignores
 *  `conversationId` (it is filtered afterwards) because `useMutationState`
 *  only picks up new options on its next cache event. */
export function useMarkReadActivity(
  conversationId: string | null,
): MarkReadActivity {
  const attempts = useMutationState({
    filters: { mutationKey: MARK_READ_MUTATION_KEY },
    select: (mutation) => ({
      conversationId: mutation.state.variables,
      status: mutation.state.status,
      readThrough: mutation.state.data,
      submittedAt: mutation.state.submittedAt,
    }),
  });
  return useMemo(() => {
    const activity: MarkReadActivity = {
      isInFlight: false,
      acknowledgedThrough: undefined,
      latestFailedAt: undefined,
    };
    if (!conversationId) return activity;
    for (const attempt of attempts) {
      if (attempt.conversationId !== conversationId) continue;
      if (attempt.status === "pending") activity.isInFlight = true;
      if (
        attempt.status === "success" &&
        typeof attempt.readThrough === "string" &&
        (activity.acknowledgedThrough === undefined ||
          attempt.readThrough > activity.acknowledgedThrough)
      ) {
        activity.acknowledgedThrough = attempt.readThrough;
      }
      if (
        attempt.status === "error" &&
        (activity.latestFailedAt === undefined ||
          attempt.submittedAt > activity.latestFailedAt)
      ) {
        activity.latestFailedAt = attempt.submittedAt;
      }
    }
    return activity;
  }, [attempts, conversationId]);
}
