import { useMemo, useState } from "react";
import { useMediaQuery, useSimulatedLoad } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/useSocial";
import { useAuth } from "../../app/providers/authContext";
import {
  useJoinConversation,
  useRealtimeConnection,
} from "../../shared/api/realtime";
import { type ChatMessage, type Conversation } from "./data";
import { clearConversationPrefs } from "./conversationPrefs";
import { clearOutbox, loadOutbox } from "./outbox";
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
import { useMessageSending } from "./useMessageSending";
import { useMessageCreation } from "./useMessageCreation";
import { useMessageGroupActions } from "./useMessageGroupActions";

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
  // Messaging uses a 768px tablet cutover (list vs thread split), intentionally
  // off the shared ladder — the two-pane layout needs the extra width.
  const isMobile = useMediaQuery(mediaMax(768));
  const [view, setView] = useState<"list" | "thread">("list");

  // Open the realtime socket only while this page is mounted — live DMs/read
  // receipts should stream here, not app-wide. Inert in demo/logged-out.
  useRealtimeConnection();

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
    loadOutbox(),
  );
  // A demo↔live flip wipes the outbox: demo's optimistic fiction must never
  // bleed into a real session (nor a real pending send into demo). Mirrors
  // DeletedConversationsProvider's mode-flip reset; setState-during-render is the
  // documented way to reset state on a prop change without an extra frame.
  const [previousDemoMode, setPreviousDemoMode] = useState(demoMode);
  if (previousDemoMode !== demoMode) {
    setPreviousDemoMode(demoMode);
    setSent({});
    clearOutbox();
    // Drafts are equally mode-scoped: a draft typed in demo must not surface in
    // a real session (nor vice-versa). Wipe the persisted store — the composer
    // itself remounts (its `key` is the newly-selected thread's id, which is
    // never the same string across a demo↔live flip) so its in-memory text
    // resets too.
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

  // Session-started threads first, then the fetched inbox — deduped by id. A
  // just-started conversation lives in `extraThreads` until the inbox refetch
  // catches up, at which point the same row arrives from `baseThreads` too;
  // without this dedupe it would render (and key) twice.
  const allThreads = useMemo(() => {
    const seenIds = new Set<string>();
    const merged: Conversation[] = [];
    for (const thread of [...extraThreads, ...baseThreads]) {
      if (seenIds.has(thread.id) || locallyDeletedIds.has(thread.id)) continue;
      seenIds.add(thread.id);
      merged.push(thread);
    }
    // Pinned chats float to the top (WhatsApp-style), newest pin first; every
    // other pair keeps its merge-order position. `Array.prototype.sort` is
    // spec-stable, so returning 0 for two threads with no ordering preference
    // here (both unpinned) never reshuffles them relative to each other — this
    // is what keeps the pinned-first order intact inside every inbox tab too.
    return merged.sort((a, b) => {
      if (!!a.pinnedAt === !!b.pinnedAt) {
        return a.pinnedAt && b.pinnedAt ? b.pinnedAt.localeCompare(a.pinnedAt) : 0;
      }
      return a.pinnedAt ? -1 : 1;
    });
  }, [extraThreads, baseThreads, locallyDeletedIds]);

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

  // DM severance (spec 03): a blocked counterpart's thread is hidden. Their
  // history stays server-side for moderation; here we just stop surfacing it.
  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allThreads.filter(
      (c) =>
        !(c.slug && isBlocked(c.slug)) &&
        (!q || c.name.toLowerCase().includes(q)),
    );
  }, [allThreads, query, isBlocked]);

  // Active group chats the member can forward INTO — every group they still
  // belong to (owner, admin, or member), never one they've left. Search inside
  // the forward picker filters this further; unfiltered here so opening the
  // picker always shows the full set regardless of the inbox search box.
  const forwardableGroups = useMemo(
    () => allThreads.filter((thread) => thread.isGroup && !thread.hasLeft),
    [allThreads],
  );

  const activeBlocked = active?.slug ? isBlocked(active.slug) : false;

  /** Base history (mock groups in demo, fetched groups in live) + session sends. */
  const messageGroups = useMemo(
    () =>
      active ? mergeOptimisticGroups(active, demoMode, thread.groups, sent) : [],
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
  const { openThread } = navigation;

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
  const { send, sendGif, sendImage, retrySend, appendOptimistic, deliver } =
    sending;

  // Thread + group creation, forwarding, and the deep-link effects.
  const creation = useMessageCreation({
    demoMode,
    allThreads,
    myProfile: user?.profile,
    t,
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
    appendOptimistic,
    deliver,
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
    retrySend,
  };
}
