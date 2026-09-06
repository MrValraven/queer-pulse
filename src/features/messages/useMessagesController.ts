import { useEffect, useMemo, useState } from "react";
import { useMediaQuery, useSimulatedLoad } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/useSocial";
import { useAuth } from "../../app/providers/authContext";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { useJoinConversation } from "../../shared/api/realtime";
import { type ChatMessage, type Conversation } from "./data";
import { clearConversationPrefs } from "./conversationPrefs";
import { clearOutbox, loadOutbox, setMessageOutboxScope } from "./outbox";
import { clearDrafts } from "./drafts";
import { useConversations, useUnreadMessages } from "./api/useConversations";
import { useMessageThread } from "./api/useMessageThread";
import { useDeleteConversation } from "./api/useMessageActions";
import {
  useAddGroupMembers,
  useChangeGroupMemberRole,
  useCreateGroup,
  useLeaveGroup,
  useMarkRead,
  useRemoveGroupMember,
  useSendMessage,
  useStartConversation,
  useUpdateGroup,
} from "./api/useMessageMutations";
import {
  mergeOptimisticGroups,
  realConversationId,
} from "./useMessagesController.helpers";
import { useMessageThreadNav } from "./useMessageThreadNav";
import { useMessageThreadList } from "./useMessageThreadList";
import { useMessageSending } from "./useMessageSending";
import { useMessageCreation } from "./useMessageCreation";
import { useMessageGroupActions } from "./useMessageGroupActions";
import { useMarkThreadUnread } from "./useMarkThreadUnread";

export { nextLocalId } from "./useMessagesController.helpers";

/**
 * All Messages page state, data wiring, and handlers — extracted from
 * `MessagesPage` so the component stays a thin render. Behaviour is unchanged:
 * demo/live dual-mode, realtime join, optimistic send, live conversation
 * reconciliation, deep-link "Message <member>", and the mobile list↔thread
 * `view` toggle all live here. Cohesive sub-concerns (thread navigation,
 * optimistic send + outbox, thread/group creation, group management) live in
 * colocated `useMessage*` sub-hooks called below. Read receipts and the
 * per-thread typing indicator are deliberately NOT here — they live inside
 * `ConversationPanel`/`MessageArea` so a receipt or typing frame re-renders
 * only the open conversation, never this page's thread list.
 */
export function useMessagesController() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isBlocked } = useSocial();
  const { user } = useAuth();
  const myUserId = user?.id ?? null;
  const simLoading = useSimulatedLoad();
  // The same per-user cache scope drafts/saved/vouches already key off (see
  // `useStorageScope`'s own doc) — so a shared device never replays one
  // signed-in member's persisted outbox in the next member's session. Pushed
  // into the module-level store in an effect (declared before any hook below
  // that can trigger a `saveOutbox`, so it's flushed first on every commit —
  // see `outbox.ts`'s own comment); the INITIAL `sent` hydration further down
  // passes this value straight in rather than waiting for that effect, so the
  // very first read of a freshly-mounted Messages page already uses the
  // correct scope.
  const outboxScope = useStorageScope();
  useEffect(() => {
    setMessageOutboxScope(outboxScope);
  }, [outboxScope]);
  // Messaging uses a 768px tablet cutover (list vs thread split), intentionally
  // off the shared ladder — the two-pane layout needs the extra width.
  const isMobile = useMediaQuery(mediaMax(768));
  const [view, setView] = useState<"list" | "thread">("list");

  // The realtime socket is opened app-wide by `AppChrome` now (so live DMs/
  // notifications stream in from anywhere, not only while this page is
  // mounted) — no need for this page to additionally request it; `request()`
  // is refcounted, so the old call here was harmless but redundant.

  // Source of truth for the inbox: demo returns the scripted mock, live calls
  // GET /conversations. Either way the page renders the same view-model.
  const convosQuery = useConversations();
  const baseThreads = useMemo(() => convosQuery.data ?? [], [convosQuery.data]);
  const loading = demoMode ? simLoading : convosQuery.isLoading;
  const unread = useUnreadMessages();

  const [extraThreads, setExtraThreads] = useState<Conversation[]>([]);
  /** Conversation ids deleted this session, ahead of the async cache prune —
   *  filtered out of `allThreads` immediately so the deleted thread can't
   *  flicker back into view (default-select, `active`, `visibleThreads`) while
   *  the delete mutation is still in flight. */
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<Set<string>>(
    new Set(),
  );
  /** Group ids the member left THIS session, ahead of the refetch — so the
   *  composer severs and Group info reflect the departure immediately in both
   *  modes. A live refetch then carries `hasLeft` from the server. */
  const [leftGroupIds, setLeftGroupIds] = useState<Set<string>>(new Set());

  const [activeId, setActiveId] = useState<string>("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  /** Per-thread optimistic messages, keyed by conversation id. Hydrated from the
   *  PERSISTED outbox (localStorage) so a send in flight — or a demo message —
   *  survives a reload; live `sending`/`failed` entries are replayed on mount. */
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>(() =>
    loadOutbox(outboxScope),
  );
  // Any storage-scope change wipes the outbox — a demo↔live flip, a sign-out,
  // or switching accounts on the same device. Demo's optimistic fiction must
  // never bleed into a real session (nor a real pending send into demo), and
  // just as importantly, member A's unsent outbox must never surface — let
  // alone REPLAY — in member B's session on a shared device (the outbox is
  // persisted; without this, only a demo↔live flip ever cleared it). Mirrors
  // DeletedConversationsProvider's mode-flip reset; setState-during-render is
  // the documented way to reset state on a prop change without an extra frame.
  // `clearOutbox()` runs here — during render, before the scope effect above
  // has flushed for the NEW `outboxScope` — so it still clears under the
  // OUTGOING scope, not the incoming one.
  const [previousOutboxScope, setPreviousOutboxScope] = useState(outboxScope);
  if (previousOutboxScope !== outboxScope) {
    setPreviousOutboxScope(outboxScope);
    setSent({});
    clearOutbox();
    // Drafts are equally scoped: a draft typed under one identity must not
    // surface under another. Wipe the persisted store — the composer itself
    // remounts (its `key` is the newly-selected thread's id, which is never
    // the same string across a scope change) so its in-memory text resets too.
    clearDrafts();
    // Session-scoped group state must not cross the boundary either.
    setLeftGroupIds(new Set());
    // Demo pin/favorite is local fiction (see conversationPrefs.ts) — it must
    // never bleed into a real session, nor a real pin into demo.
    clearConversationPrefs();
  }
  const [composing, setComposing] = useState(false);
  /** The message currently being quoted for a reply, or null. Only a message
   *  with a stable server `id` can be replied to (optimistic messages can't). */
  const [replyDraft, setReplyDraft] = useState<ChatMessage | null>(null);

  const { allThreads, visibleThreads, forwardableGroups } =
    useMessageThreadList({
      extraThreads,
      baseThreads,
      locallyDeletedIds,
      query,
      isBlocked,
    });

  // Default the open thread to the first available once threads load. Adjusting
  // state during render (not in an effect) avoids a cascading re-render frame.
  // The composer (keyed on the thread id) seeds its own persisted draft on
  // mount, so there's nothing to hydrate here.
  if (!activeId && allThreads.length > 0) {
    const firstThreadId = allThreads[0]!.id;
    setActiveId(firstThreadId);
  }

  const rawActive = useMemo(
    () => allThreads.find((c) => c.id === activeId) ?? allThreads[0] ?? null,
    [allThreads, activeId],
  );
  // Apply the optimistic "left this group" flag so the composer severs + Group
  // info update the instant the member leaves, before the refetch lands.
  const active = useMemo(
    () =>
      rawActive && leftGroupIds.has(rawActive.id)
        ? { ...rawActive, hasLeft: true }
        : rawActive,
    [rawActive, leftGroupIds],
  );

  // Real conversation UUID for the open thread, or null while it's still a
  // just-picked placeholder (id === slug). The live conversation-scoped hooks
  // below key off this, not `active.id`, so they never fire against a slug and
  // trip the backend's `ParseUUIDPipe` before reconciliation lands the UUID.
  const liveConversationId = demoMode ? null : realConversationId(active);

  // Join the open thread's realtime room so the gateway's per-conversation
  // frames (a new message from either side, read receipts) stream in live
  // instead of only appearing after a refresh. Inert in demo mode.
  useJoinConversation(liveConversationId);

  // Live message history for the open thread (inert in demo mode).
  const thread = useMessageThread(liveConversationId);
  const hasMoreOlder = demoMode ? false : (thread.hasNextPage ?? false);
  const loadingOlder = demoMode ? false : thread.isFetchingNextPage;
  function loadOlder() {
    if (!demoMode && thread.hasNextPage && !thread.isFetchingNextPage) {
      void thread.fetchNextPage();
    }
  }

  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const startConversation = useStartConversation();
  const createGroupMutation = useCreateGroup();
  const leaveGroupMutation = useLeaveGroup();
  const addMembersMutation = useAddGroupMembers();
  const removeMemberMutation = useRemoveGroupMember();
  const changeRoleMutation = useChangeGroupMemberRole();
  const updateGroupMutation = useUpdateGroup();
  const deleteConversationMutation = useDeleteConversation();

  const activeBlocked = active?.slug ? isBlocked(active.slug) : false;

  /** Base history (mock groups in demo, fetched groups in live) + session sends. */
  const messageGroups = useMemo(
    () =>
      active
        ? mergeOptimisticGroups(active, demoMode, thread.groups, sent)
        : [],
    [active, demoMode, thread.groups, sent],
  );

  // Open-thread selection, cross-inbox jump-to-message, thread deletion.
  const navigation = useMessageThreadNav({
    demoMode,
    allThreads,
    baseThreads,
    activeId,
    setActiveId,
    setReadIds,
    setView,
    setReplyDraft,
    setQuery,
    setLocallyDeletedIds,
    setExtraThreads,
    markRead,
    deleteConversationMutation,
  });
  const { openThread, openThreadAtMessage } = navigation;

  // Optimistic send + the offline outbox (operates on `sent` above; the
  // composer's own draft text is passed straight into `send`/`sendGif`).
  const sending = useMessageSending({
    sent,
    setSent,
    active,
    activeBlocked,
    replyDraft,
    setReplyDraft,
    demoMode,
    t,
    sendMessage,
  });
  const {
    send,
    sendGif,
    sendImage,
    sendDocument,
    retrySend,
    appendOptimistic,
    deliver,
    migrateOutboxConversation,
  } = sending;

  // Thread + group creation, forwarding, and the deep-link effects.
  const creation = useMessageCreation({
    demoMode,
    allThreads,
    myProfile: user?.profile,
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
  });

  // Group management (feature #17 Phase 2): leave, add/remove, role, edit info.
  const groupActions = useMessageGroupActions({
    demoMode,
    allThreads,
    myProfile: user?.profile,
    setExtraThreads,
    setLeftGroupIds,
    t,
    leaveGroupMutation,
    addMembersMutation,
    removeMemberMutation,
    changeRoleMutation,
    updateGroupMutation,
  });

  // Row menu "Mark as unread" (PRD-225) — own hook purely to keep this
  // controller under the 200-line cap; see its own doc for the `readIds`
  // interaction it has to handle.
  const markThreadUnread = useMarkThreadUnread(setReadIds);

  return {
    isMobile,
    view,
    setView,
    loading,
    unread,
    visibleThreads,
    forwardableGroups,
    activeId,
    readIds,
    query,
    setQuery,
    composing,
    setComposing,
    replyDraft,
    setReplyDraft,
    active,
    activeBlocked,
    messageGroups,
    hasMoreOlder,
    loadingOlder,
    loadOlder,
    ...navigation,
    ...creation,
    ...groupActions,
    myUserId,
    send,
    sendGif,
    sendImage,
    sendDocument,
    retrySend,
    markThreadRead: markRead.mutate,
    markThreadUnread,
  };
}
