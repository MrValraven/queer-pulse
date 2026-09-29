import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery, useSimulatedLoad } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/useSocial";
import { useAuth } from "../../app/providers/authContext";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { useJoinConversation } from "../../shared/api/realtime";
import { isThreadCacheBehindConversation } from "../../shared/api/messageCache";
import { type ChatMessage, type Conversation } from "./data";
import { clearConversationPrefs } from "./conversationPrefs";
import { clearOutbox, loadOutbox, setMessageOutboxScope } from "./outbox";
import { clearDrafts } from "./drafts";
import { useConversations, useUnreadMessages } from "./api/useConversations";
import { useMessageThread } from "./api/useMessageThread";
import { useActiveMailbox } from "./mailboxes/useActiveMailbox";
import { isNotStaffError } from "./mailboxes/mailboxScope";
import { withDemoLocalOnlyMessages } from "./api/demoThreadCache";
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
  useCreateGroupInviteLink,
  useDisableGroupInviteLink,
  useDissolveGroup,
  useRevokeGroupInvite,
  useTransferGroupOwnership,
} from "./api/useGroupManagementMutations";
import {
  isServerConversationId,
  mergeOptimisticGroups,
  realConversationId,
} from "./useMessagesController.helpers";
// TEMPORARY — see scrollTrace.ts's revert instructions.
import {
  buildScrollTraceInflatedMessages,
  isScrollTraceLiveSimulationEnabled,
  useScrollTraceDemoHistoryDelay,
} from "./scrollTrace";
import { useMessageThreadNav } from "./useMessageThreadNav";
import {
  useMessageThreadList,
  withoutListedExtraThreads,
} from "./useMessageThreadList";
import { useCachedConversationDetails } from "./useCachedConversationDetails";
import { useMessageSending } from "./useMessageSending";
import { useMessageCreation } from "./useMessageCreation";
import { useMessageGroupActions } from "./useMessageGroupActions";
import { useGroupOwnershipActions } from "./useGroupOwnershipActions";
import { useMarkThreadUnread } from "./useMarkThreadUnread";
import { useRequestedActiveThread } from "./useRequestedActiveThread";
import {
  sessionSendsForThreadWindow,
  useThreadWindowSends,
} from "./useThreadWindowSends";
import type { ThreadHistory } from "./useOlderPageAnchor";

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
// TEMPORARY — the scrolltrace simulation branch (see scrollTrace.ts) pushes
// this hook over the line budget; remove the disable alongside that branch.
// eslint-disable-next-line max-lines-per-function
export function useMessagesController() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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

  // The active mailbox (`?as=`): the inbox lists that mailbox only.
  const activeMailbox = useActiveMailbox();
  const mailboxScope = activeMailbox.scope;
  const activeMailboxIdentityId = activeMailbox.active?.identityId ?? null;

  // Source of truth for the inbox: demo returns the scripted mock, live calls
  // GET /conversations?as=. Either way the page renders the same view-model.
  const convosQuery = useConversations(mailboxScope);
  const baseThreads = useMemo(() => convosQuery.data ?? [], [convosQuery.data]);
  // The server refused the active mailbox (the member stopped staffing it):
  // `reportLostAccess` falls back to the personal mailbox, so the generic
  // load error never shows for it.
  const isMailboxRefused = isNotStaffError(convosQuery.error);
  const { reportLostAccess } = activeMailbox;
  useEffect(() => {
    if (isNotStaffError(convosQuery.error)) reportLostAccess();
  }, [convosQuery.error, reportLostAccess]);
  // Live: still loading while no mailbox scope has resolved, since the inbox
  // query waits for one, and while a refused mailbox falls back, so the
  // empty-list state never paints for that frame.
  const loading = demoMode
    ? simLoading
    : (mailboxScope === null && !activeMailbox.isError) ||
      isMailboxRefused ||
      convosQuery.isLoading;
  // DES-183: the list body needs to tell "genuinely empty" apart from "failed
  // to load". Demo mode's mock query never errors, so this stays false there,
  // the same way `loading` special-cases it above. A failed mailbox list
  // leaves the inbox with no scope to load, so it counts as a load error too.
  const inboxLoadError =
    !demoMode &&
    (activeMailbox.isError || (convosQuery.isError && !isMailboxRefused));
  // `() => void` (not `refetch` itself) so this can be handed straight to a
  // void-typed `onRetry` prop without an unhandled-promise lint complaint,
  // mirroring `useConnectionsList`'s own `refetch: () => void query.refetch()`.
  const refetchInbox = () => {
    if (activeMailbox.isError) {
      activeMailbox.refetch();
      return;
    }
    void convosQuery.refetch();
  };
  const unread = useUnreadMessages();
  // ENG-253: cursor-pagination for the inbox list itself (`useConversations`'s
  // own `fetchNextPage`/`hasNextPage`/`isFetchingNextPage`), forwarded so
  // `MessagesThreadList` can drive its "load more" sentinel/footer. Always
  // `false`/inert in demo mode (the seeded inbox is one page; see
  // `useConversations`'s own doc). No dedicated error surface here: a failed
  // page fetch simply leaves `hasMoreThreads` exactly as it was (the cursor is
  // only advanced on success), so scrolling back to the sentinel retries it,
  // the same "no separate failure UI" shape `fetchNextPage` was already built
  // with. Swallowing the rejection here (rather than letting it become an
  // unhandled promise rejection) is what makes that retry-by-rescroll the
  // whole story instead of also logging a spurious console error every time.
  const loadMoreThreads = () => {
    void convosQuery.fetchNextPage().catch(() => {});
  };
  const hasMoreThreads = convosQuery.hasNextPage;
  const isLoadingMoreThreads = convosQuery.isFetchingNextPage;

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
  /** The optimistic reason beside `leftGroupIds`, so a live dissolve reads
   *  "This group has ended" rather than the generic "You left this group"
   *  before the refetch lands with the server's own `leftReason`. Demo mode
   *  never needs this: its simulators already return a full `Conversation`
   *  with `leftReason` set on the patched object itself. */
  const [leftGroupReasons, setLeftGroupReasons] = useState<
    Map<string, "left" | "removed" | "dissolved">
  >(new Map());

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
    setLeftGroupReasons(new Map());
    // Demo pin/favorite is local fiction (see conversationPrefs.ts) — it must
    // never bleed into a real session, nor a real pin into demo.
    clearConversationPrefs();
  }
  const [composing, setComposing] = useState(false);
  /** The message currently being quoted for a reply, or null. Only a message
   *  with a stable server `id` can be replied to (optimistic messages can't). */
  const [replyDraft, setReplyDraft] = useState<ChatMessage | null>(null);

  // A mailbox switch starts the new mailbox fresh: no open thread, no search,
  // no quoted reply, and no thread carried over from the previous mailbox's
  // list. Same setState-during-render reset as the outbox scope above. The
  // first resolve (nothing to a mailbox) is no switch, so a thread a deep
  // link started before the mailboxes loaded survives it.
  const [previousMailboxIdentityId, setPreviousMailboxIdentityId] = useState(
    activeMailboxIdentityId,
  );
  if (previousMailboxIdentityId !== activeMailboxIdentityId) {
    setPreviousMailboxIdentityId(activeMailboxIdentityId);
    if (previousMailboxIdentityId !== null && activeMailboxIdentityId) {
      setActiveId("");
      setReadIds(new Set());
      setQuery("");
      setReplyDraft(null);
      setExtraThreads([]);
      setLocallyDeletedIds(new Set());
      if (isMobile) setView("list");
    }
  }

  // Live, a session row the list pages now hold is pruned (render-phase, the
  // same reset pattern as above), and a session row they lack follows its
  // cached detail read, so a later remote change reaches both (see
  // `mergeInboxThreads`). Demo keeps its session rows as they are.
  const shouldPreferCachedRows = !demoMode;
  const listedThreadIds = useMemo(
    () => new Set(baseThreads.map((thread) => thread.id)),
    [baseThreads],
  );
  const prunedExtraThreads = withoutListedExtraThreads(
    extraThreads,
    listedThreadIds,
    shouldPreferCachedRows,
  );
  if (prunedExtraThreads !== extraThreads) {
    // The updater form, so a mailbox reset queued above in this same render
    // keeps its empty list.
    setExtraThreads((previous) =>
      withoutListedExtraThreads(
        previous,
        listedThreadIds,
        shouldPreferCachedRows,
      ),
    );
  }
  const unlistedExtraThreadIds = useMemo(
    () =>
      prunedExtraThreads
        .map((thread) => thread.id)
        .filter(isServerConversationId),
    [prunedExtraThreads],
  );
  const detailThreadsById = useCachedConversationDetails(
    unlistedExtraThreadIds,
    shouldPreferCachedRows,
  );
  const { allThreads, visibleThreads, forwardableGroups } =
    useMessageThreadList({
      extraThreads: prunedExtraThreads,
      baseThreads,
      detailThreadsById,
      shouldPreferCachedRows,
      locallyDeletedIds,
      query,
      isBlocked,
    });

  // ENG-403: the open thread for `activeId`. The default select holds while
  // a `?c=` deep link resolves; a requested id only ever resolves to its own
  // thread, merged with its by-id detail read (see the hook).
  const { rawActive, activeWithDetail, activeThreadStatus, retryActiveThread } =
    useRequestedActiveThread({
      activeId,
      setActiveId,
      allThreads,
      isInboxLoading: loading,
      mailboxScope,
      demoMode,
    });

  // Real conversation UUID for the open thread, or null while it's still a
  // just-picked placeholder (id === slug), still resolving, unavailable, or
  // in demo mode. The live conversation-scoped hooks further down key off
  // this, so they never fire against a slug (tripping the backend's
  // `ParseUUIDPipe` before reconciliation lands the UUID) or against a
  // thread the member cannot read.
  const liveConversationId = demoMode ? null : realConversationId(rawActive);

  // Apply the optimistic "left this group" flag so the composer severs + Group
  // info update the instant the member leaves, before the refetch lands.
  const active = useMemo(
    () =>
      activeWithDetail && leftGroupIds.has(activeWithDetail.id)
        ? {
            ...activeWithDetail,
            hasLeft: true,
            leftReason:
              leftGroupReasons.get(activeWithDetail.id) ??
              activeWithDetail.leftReason,
          }
        : activeWithDetail,
    [activeWithDetail, leftGroupIds, leftGroupReasons],
  );

  // Join the open thread's realtime room so the gateway's per-conversation
  // frames (a new message from either side, read receipts) stream in live
  // instead of only appearing after a refresh. Inert in demo mode.
  useJoinConversation(liveConversationId);

  // Message history for the open thread. Demo pages the seeded thread from a
  // local session store through the same query (see `demoThreadCache.ts`), so
  // load-older and the prepend anchor run exactly as they do live.
  const thread = useMessageThread(
    demoMode ? (active?.id ?? null) : liveConversationId,
  );
  const hasMoreOlder = thread.hasMoreOlder;
  const loadingOlder = thread.isLoadingOlder;
  const { isHistorySettled, isHistoryError, threadWindow } = thread;
  function loadOlder() {
    // Page 0 failed: an older page would append to the stale page and stamp
    // it fresh, so retry page 0 itself instead.
    if (isHistoryError) {
      thread.retryHistory();
      return;
    }
    // No older page while page 0 is (re)fetching, for the same reason: it
    // would hide whatever arrived while the thread was closed.
    // `cancelRefetch: false` also keeps a caller holding a render-old closure
    // from cancelling that refetch.
    if (hasMoreOlder && !loadingOlder && isHistorySettled) {
      thread.requestOlderPage();
    }
  }
  const threadHistory: ThreadHistory = {
    hasMoreOlder,
    loadingOlder,
    onLoadOlder: loadOlder,
    isHistorySettled,
    isHistoryError,
    hasLoadedThreadData: thread.hasLoadedThreadData,
    threadWindow,
  };

  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  // PRD-341: on desktop the open thread's messages render the instant it's
  // selected. There is no separate "open" tap the way mobile's list->thread
  // swap requires (`useMessageThreadNav.openThread` marks read there). So a
  // thread that becomes `active` on desktop, including the render-time
  // default-select above, IS being read the moment it's on screen, and must
  // go through the SAME mark-read path a tap would, or the nav badge
  // (`useUnreadMessages`), the Unread tab and this very thread disagree about
  // whether it's read. Guarded by `readIds` so it only ever fires once per
  // thread per session; a tap-driven `openThread` already added its target to
  // `readIds` itself, so this is a no-op for that path, not a duplicate mark.
  // Mobile is exempt: the list stays in "list" view until an explicit tap
  // opens the thread, which is what marks it read there.
  useEffect(() => {
    if (isMobile || !active) return;
    if (!active.unread && !active.unreadCount) return;
    if (readIds.has(active.id)) return;
    // Deliberate: `readIds` must stay in sync with WHICH thread is on screen
    // right now (switching straight from this thread to another must not
    // flash it back to "unread" before the mark-read patch below lands), not
    // just be derived from render-time props, and the guard above already
    // makes this idempotent per thread per session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReadIds((current) => new Set(current).add(active.id));
    if (demoMode) return;
    const realId = realConversationId(active);
    if (!realId) return;
    // If this tab's cached thread tail is behind what the list row already
    // knows arrived (a dropped-socket gap never fetched into THIS thread's
    // own cache), sending it as `upToMessageId` would under-report what's
    // actually unread (see `isThreadCacheBehindConversation`'s own doc).
    // Skip the stale POST here and let `useMarkReadOnInbound`'s heal path
    // send the true watermark once page 0 refetches and the reader has
    // genuinely caught up.
    if (
      isThreadCacheBehindConversation(queryClient, realId, active.updatedAt)
    ) {
      return;
    }
    markRead.mutate(realId);
  }, [isMobile, active, readIds, demoMode, markRead, queryClient]);
  const startConversation = useStartConversation();
  const createGroupMutation = useCreateGroup();
  const leaveGroupMutation = useLeaveGroup();
  const addMembersMutation = useAddGroupMembers();
  const removeMemberMutation = useRemoveGroupMember();
  const changeRoleMutation = useChangeGroupMemberRole();
  const updateGroupMutation = useUpdateGroup();
  const transferOwnershipMutation = useTransferGroupOwnership();
  const dissolveGroupMutation = useDissolveGroup();
  const createInviteLinkMutation = useCreateGroupInviteLink();
  const disableInviteLinkMutation = useDisableGroupInviteLink();
  const revokeInviteMutation = useRevokeGroupInvite();
  const deleteConversationMutation = useDeleteConversation();

  const activeBlocked = active?.slug ? isBlocked(active.slug) : false;

  // TEMPORARY — see scrollTrace.ts's revert instructions. No-op unless
  // `?scrolltrace&simulatelive` is set; `demoHistoryReady` is `true` otherwise.
  const demoHistoryReady = useScrollTraceDemoHistoryDelay(activeId, demoMode);

  const isThreadWindowShown = threadWindow.anchorMessageId !== null;
  /** Base history (the paged thread cache, in both modes) + session sends. */
  const messageGroups = useMemo(() => {
    if (!active) return [];
    if (demoMode && !demoHistoryReady) return [];
    // `false`: the base is always the thread cache now. Demo also carries the
    // bubbles its store never pages (a pill a demo group action appended, a
    // thread created this session), merged in beside the session sends.
    // PRD-401: a detached history window renders no session sends.
    const base = mergeOptimisticGroups(
      active,
      false,
      thread.groups,
      sessionSendsForThreadWindow(
        demoMode ? withDemoLocalOnlyMessages(sent, active) : sent,
        isThreadWindowShown,
      ),
    );
    // TEMPORARY: see scrollTrace.ts's revert instructions. The demo GROUP
    // threads are too short to reliably overflow the viewport; inject
    // filler ahead of its real tail so H1/H2 have real overflow to strand the
    // reader against. No-op unless `?scrolltrace&simulatelive` is set.
    if (
      demoMode &&
      active.isGroup &&
      base.length > 0 &&
      isScrollTraceLiveSimulationEnabled()
    ) {
      const filler = buildScrollTraceInflatedMessages();
      return base.map((group, index) =>
        index === 0 ? { ...group, items: [...filler, ...group.items] } : group,
      );
    }
    return base;
  }, [
    active,
    demoMode,
    thread.groups,
    sent,
    demoHistoryReady,
    isThreadWindowShown,
  ]);

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
  const { appendOptimistic, deliver, migrateOutboxConversation } = sending;
  // PRD-401: a send or a retry from the open thread returns it to the latest
  // message first, cancelling a jump hunt on its way (see the hook).
  const { onReturnToLatest } = threadWindow;
  const { send, sendGif, sendSticker, sendImage, sendDocument, retrySend } =
    useThreadWindowSends(sending, onReturnToLatest);

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
    // A forward into the open thread returns it to the latest message first.
    returnToLatest: onReturnToLatest,
  });

  // Group management (feature #17 Phase 2): leave, add/remove, role, edit info.
  const groupActions = useMessageGroupActions({
    demoMode,
    allThreads,
    myProfile: user?.profile,
    setExtraThreads,
    setLeftGroupIds,
    setLeftGroupReasons,
    t,
    leaveGroupMutation,
    addMembersMutation,
    removeMemberMutation,
    changeRoleMutation,
    updateGroupMutation,
  });

  // Section 8 (Groups): transfer ownership (DES-228), dissolve (PRD-357), and
  // the invite-link lifecycle (PRD-358). See `useGroupOwnershipActions`'s own
  // doc for why this is a sibling hook rather than folded into the one above.
  const groupOwnershipActions = useGroupOwnershipActions({
    demoMode,
    allThreads,
    myProfile: user?.profile,
    setExtraThreads,
    setLeftGroupIds,
    setLeftGroupReasons,
    t,
    transferOwnershipMutation,
    dissolveGroupMutation,
    createInviteLinkMutation,
    disableInviteLinkMutation,
    revokeInviteMutation,
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
    inboxLoadError,
    refetchInbox,
    unread,
    hasMoreThreads,
    isLoadingMoreThreads,
    loadMoreThreads,
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
    activeThreadStatus,
    retryActiveThread,
    activeBlocked,
    messageGroups,
    threadHistory,
    ...navigation,
    ...creation,
    ...groupActions,
    ...groupOwnershipActions,
    myUserId,
    send,
    sendGif,
    sendSticker,
    sendImage,
    sendDocument,
    retrySend,
    markThreadRead: markRead.mutate,
    markThreadUnread,
    activeMailbox,
  };
}
