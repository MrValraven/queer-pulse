import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMediaQuery, useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/useSocial";
import { useAuth } from "../../app/providers/authContext";
import {
  useDeliveredFrames,
  useJoinConversation,
  useReadFrames,
  useRealtimeConnection,
} from "../../shared/api/realtime";
import {
  type ChatMessage,
  type Conversation,
  type GroupMemberView,
} from "./data";
import { buildRecipientConversation } from "./recipient";
import type { GroupMemberPick } from "./NewGroupModal";
import { clearOutbox, loadOutbox, saveOutbox } from "./outbox";
import { clearDraft, clearDrafts, loadDraft, saveDraft } from "./drafts";
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
import type { ChatSystemEvent } from "./data";

/** Group avatar initials from a title ("Pride Brunch Crew" → "PB"). */
function groupInitialsFromTitle(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return title.trim().slice(0, 2).toUpperCase() || "GP";
}

/**
 * A client-generated idempotency id for an optimistic message. Sent to the
 * server as `clientMessageId` on the POST, so the dual HTTP + WS write paths and
 * any offline-outbox retry all collapse to a single stored row (the server
 * dedupes on it) and the optimistic bubble reconciles against its server copy by
 * the same key. Falls back to a random-enough token where `crypto.randomUUID` is
 * unavailable (older embedded webviews), which still satisfies uniqueness.
 */
export function nextLocalId(): string {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }
  // Fallback for older embedded webviews without `crypto.randomUUID`. Must still
  // be a valid v4 UUID — the server validates `clientMessageId` as one (a plain
  // token would 400) — so synthesize the canonical v4 shape.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * The real server conversation id for `active`, or null while it's still a
 * just-picked placeholder. A picked-but-not-yet-created recipient uses the
 * member's slug as its `id` (see `buildRecipientConversation` /
 * `connectionToRecipient`); a real conversation's id is a server UUID, always
 * distinct from the counterpart's handle. Live conversation-scoped requests
 * (message history, realtime join, mark-read) must NOT fire against the
 * placeholder — the backend validates `/conversations/:id` with `ParseUUIDPipe`,
 * so a slug returns `400 "Validation failed (uuid is expected)"`. Returning null
 * keeps those hooks inert until `startConversation` reconciles the real UUID.
 */
function realConversationId(conversation: Conversation | null): string | null {
  if (!conversation) return null;
  return conversation.id === conversation.slug ? null : conversation.id;
}

/**
 * All Messages page state, data wiring, and handlers — extracted from
 * `MessagesPage` so the component stays a thin render. Behaviour is unchanged:
 * demo/live dual-mode, realtime join, optimistic send, live conversation
 * reconciliation, deep-link "Message <member>", and the mobile list↔thread
 * `view` toggle all live here.
 */
export function useMessagesController() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isBlocked } = useSocial();
  const { user } = useAuth();
  const myUserId = user?.id ?? null;
  const simLoading = useSimulatedLoad();
  const isMobile = useMediaQuery("(max-width: 768px)");
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
  /** Live "Seen" watermark per conversation, from the counterpart's `read`
   *  frames — the max lastReadAt observed so far, keyed by conversation id. */
  const [readWatermarks, setReadWatermarks] = useState<Record<string, string>>({});
  /** Live "delivered" (double-check) watermark per conversation, from the
   *  counterpart's `message:delivered` frames — the max deliveredAt observed so
   *  far, keyed by conversation id. One rung below `readWatermarks`. */
  const [deliveredWatermarks, setDeliveredWatermarks] = useState<
    Record<string, string>
  >({});
  const [query, setQuery] = useState("");
  /** Server message id to scroll to + highlight once its thread is open — set
   *  when a cross-inbox search result is picked, cleared by the panel once it
   *  has jumped (or given up). Null when no jump is pending. */
  const [jumpMessageId, setJumpMessageId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
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
    // a real session (nor vice-versa). Wipe the store and the live draft state.
    setDraft("");
    clearDrafts();
    // Session-scoped group state must not cross the boundary either.
    setLeftGroupIds(new Set());
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
    return merged;
  }, [extraThreads, baseThreads, locallyDeletedIds]);

  // Default the open thread to the first available once threads load. Adjusting
  // state during render (not in an effect) avoids a cascading re-render frame.
  // Hydrate that thread's persisted draft too — this auto-select path never
  // runs through `openThread`, so without it the first thread's saved draft
  // would stay hidden (and the change-handler's next save would overwrite it).
  if (!activeId && allThreads.length > 0) {
    const firstThreadId = allThreads[0]!.id;
    setActiveId(firstThreadId);
    setDraft(loadDraft(firstThreadId));
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

  // Read receipts ("Seen"): the counterpart's `read` frame reports THEIR
  // lastReadAt, which advances the watermark for the message they've now read
  // up to. Ignore frames carrying my OWN userId — those are my own read
  // (drives the unread badge elsewhere), not a receipt on my sent messages.
  const onRead = useCallback(
    (frame: { conversationId: string; userId: string; lastReadAt: string }) => {
      if (myUserId && frame.userId === myUserId) return;
      setReadWatermarks((prev) => {
        const existing = prev[frame.conversationId];
        if (existing && existing >= frame.lastReadAt) return prev; // ISO strings compare lexicographically
        return { ...prev, [frame.conversationId]: frame.lastReadAt };
      });
    },
    [myUserId],
  );
  useReadFrames(onRead);

  // Delivered ("double check"): the counterpart's `message:delivered` frame
  // reports THEIR delivered watermark. Ignore frames carrying my OWN userId —
  // that's my own device acking receipt of the counterpart's messages, which
  // renders against THEIR bubbles for them, not mine.
  const onDelivered = useCallback(
    (frame: { conversationId: string; userId: string; deliveredAt: string }) => {
      if (myUserId && frame.userId === myUserId) return;
      setDeliveredWatermarks((prev) => {
        const existing = prev[frame.conversationId];
        if (existing && existing >= frame.deliveredAt) return prev; // ISO lexicographic
        return { ...prev, [frame.conversationId]: frame.deliveredAt };
      });
    },
    [myUserId],
  );
  useDeliveredFrames(onDelivered);

  /** Effective "Seen" watermark for the open thread: a live `read` frame wins
   *  once one has arrived, otherwise fall back to the conversation's last
   *  known `otherLastReadAt` from the inbox fetch. Null in demo mode (no read
   *  frames, no `otherLastReadAt` on mock threads) — "Seen" simply never shows. */
  const counterpartLastReadAt = active
    ? (readWatermarks[active.id] ?? active.otherLastReadAt ?? null)
    : null;

  /** Effective "delivered" watermark for the open thread: a live
   *  `message:delivered` frame wins, else the inbox's `otherDeliveredAt`. Null in
   *  demo mode — the demo ladder is simulated on the optimistic message instead. */
  const counterpartDeliveredAt = active
    ? (deliveredWatermarks[active.id] ?? active.otherDeliveredAt ?? null)
    : null;

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

  /** The signed-in member's display name, for demo-simulated system pills where
   *  the current user is always the actor (owner of the demo group). */
  const myDisplayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : t("messages:conversation.you");

  // Once the server re-surfaces a locally-deleted thread (the other member
  // messaged again, so it's back in the fetched inbox), stop suppressing it —
  // otherwise it would stay hidden until this page remounts. Skip while a
  // delete is in flight: an unrelated ["conversations"] refetch could resolve
  // before the server stamps clearedAt and momentarily re-include the thread.
  useEffect(() => {
    if (deleteConversationMutation.isPending) return;
    // Stops suppressing a thread once the fetched inbox re-surfaces it server-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocallyDeletedIds((previous) => {
      if (previous.size === 0) return previous;
      let changed = false;
      const next = new Set(previous);
      for (const thread of baseThreads) {
        if (next.delete(thread.id)) changed = true;
      }
      return changed ? next : previous;
    });
  }, [baseThreads, deleteConversationMutation.isPending]);

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

  const activeBlocked = active?.slug ? isBlocked(active.slug) : false;

  /** Base history (mock groups in demo, fetched groups in live) + session sends. */
  const messageGroups = useMemo(() => {
    if (!active) return [];
    const base = demoMode ? active.messages : thread.groups;
    const optimistic = sent[active.id];
    if (!optimistic || optimistic.length === 0) return base;
    // Drop any optimistic bubble whose server row has already landed in the base
    // history — the socket `message:new` patch (deduped by clientMessageId) can
    // arrive a beat before the send mutation removes the optimistic copy, and
    // without this filter both would render for that frame. The shared key is the
    // client id: `localId` on the optimistic bubble, carried onto the server
    // bubble by the adapter (`messageToChat`).
    const settledIds = new Set<string>();
    for (const group of base) {
      for (const item of group.items) {
        if (item.localId) settledIds.add(item.localId);
      }
    }
    const extra = optimistic.filter(
      (message) => !(message.localId && settledIds.has(message.localId)),
    );
    if (extra.length === 0) return base;
    const groups = base.map((g) => ({ ...g, items: [...g.items] }));
    const today = groups.find((g) => g.day === "Today");
    if (today) {
      today.items = [...today.items, ...extra];
      return groups;
    }
    return [...groups, { day: "Today", items: extra }];
  }, [active, demoMode, thread.groups, sent]);

  function openThread(id: string) {
    // Drop any armed reply when moving to a *different* conversation — otherwise
    // a reply-in-progress carries over and would quote a message from the thread
    // we just left. Re-opening the same thread keeps the reply intact.
    if (activeId !== id) setReplyDraft(null);
    setActiveId(id);
    setReadIds((current) => new Set(current).add(id));
    // Restore any draft typed-but-unsent for the thread we're opening (empty
    // string when none was persisted), instead of blanking the composer.
    setDraft(loadDraft(id));
    setView("thread");
    // Mark the thread we're *opening* read — not the render-time `active`,
    // which is still the previously open thread this synchronous frame. Resolve
    // the id to its real conversation UUID (skipping just-picked placeholders,
    // whose id is still the slug) so we never POST /read against a slug.
    if (demoMode) return;
    const opened = allThreads.find((thread) => thread.id === id) ?? null;
    const realId = realConversationId(opened);
    if (realId) markRead.mutate(realId);
  }

  /** Open a conversation from a cross-inbox search result and, when the hit
   *  carries a server message id, arm the jump-to + highlight of that bubble.
   *  Clears the search so the opened thread is fully in view (on mobile the
   *  thread pane replaces the list). Demo hits carry no id — the thread still
   *  opens, it just can't scroll to the exact message. */
  function openThreadAtMessage(conversationId: string, messageId?: string) {
    openThread(conversationId);
    setJumpMessageId(messageId ?? null);
    setQuery("");
  }

  // Stable identity: the conversation panel's jump effect depends on this, and a
  // fresh function each render would restart its retry loop (resetting the
  // attempt count) on unrelated re-renders (typing/presence frames).
  const clearJumpMessage = useCallback(() => setJumpMessageId(null), []);

  function deleteThread(conversationId: string) {
    // Optimistically prune from `allThreads` right away — otherwise the
    // deleted thread stays visible (and can even get re-selected) until the
    // mutation's async cache invalidation lands.
    setLocallyDeletedIds((previous) => {
      const next = new Set(previous);
      next.add(conversationId);
      return next;
    });
    // Drop any optimistic placeholder row immediately.
    setExtraThreads((previous) =>
      previous.filter((thread) => thread.id !== conversationId),
    );
    if (activeId === conversationId) {
      setView("list");
    }
    deleteConversationMutation.mutate(conversationId);
  }

  function startThread(recipient: Conversation) {
    setComposing(false);
    setQuery("");
    // The picker lists connections, some of whom you already have a thread with.
    // Reuse that thread rather than stacking an empty placeholder over its real
    // history (in demo the dedupe in `allThreads` would otherwise keep the empty
    // one; in live it saves a redundant POST /conversations).
    const existingThread = allThreads.find(
      (thread) => thread.slug && thread.slug === recipient.slug,
    );
    if (existingThread) {
      setActiveId(existingThread.id);
      setReadIds((current) => new Set(current).add(existingThread.id));
      setDraft(loadDraft(existingThread.id));
      setView("thread");
      return;
    }
    // Optimistic placeholder (keyed on the recipient's id from the picker) so the
    // thread opens instantly. In demo mode that's the whole story. In live mode
    // the picker id is NOT the conversation's id, so we must reconcile once the
    // server returns the real conversation — otherwise history fetch, sending,
    // and the realtime room-join all target an id no conversation has, and the
    // thread only works after a reload.
    setExtraThreads((prev) =>
      prev.some((existing) => existing.id === recipient.id)
        ? prev
        : [recipient, ...prev],
    );
    setActiveId(recipient.id);
    setReadIds((current) => new Set(current).add(recipient.id));
    setDraft(loadDraft(recipient.id));
    setView("thread");
    if (demoMode || !recipient.slug) return;
    startConversation.mutate(recipient.slug, {
      onSuccess: (conversation) => {
        if (!conversation) return;
        // Swap the placeholder for the real conversation row and repoint the
        // open thread at its UUID. Keeping the real row in `extraThreads`
        // bridges the gap until the inbox refetch surfaces it (dedupe in
        // `allThreads` collapses the overlap); if the member already had a
        // thread, this simply reuses the returned existing one.
        setExtraThreads((prev) => [
          conversation,
          ...prev.filter(
            (existing) =>
              existing.id !== recipient.id && existing.id !== conversation.id,
          ),
        ]);
        // Re-adding a previously deleted thread: the server hands back the SAME
        // conversation id (delete is just a `clearedAt` floor, not a destroy),
        // so it's still in `locallyDeletedIds` and `allThreads` would keep
        // suppressing it — the row would render only after a reload clears the
        // in-memory set. Lift the suppression now that the member re-opened it.
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
      },
    });
  }

  /**
   * Create a group from the picked members + name and open its thread. Live mode
   * POSTs /conversations/group and opens the returned thread; demo mode builds a
   * local mock group (owner = the signed-in member) with a `group_created`
   * system message so the prototype shows a working group with no network.
   */
  function startGroup(title: string, members: GroupMemberPick[]) {
    if (!title.trim() || members.length === 0) return;
    if (demoMode) {
      const myProfile = user?.profile;
      const myName = myProfile
        ? `${myProfile.firstName} ${myProfile.lastName}`.trim()
        : t("messages:conversation.you");
      const memberViews: GroupMemberView[] = [
        {
          name: myName,
          initials:
            (myProfile?.firstName?.[0] ?? "") + (myProfile?.lastName?.[0] ?? ""),
          tint: "plum",
          role: "owner",
          slug: myProfile?.slug,
        },
        ...members.map((member) => ({
          name: member.name,
          initials: member.initials,
          tint: member.tint,
          role: "member" as const,
          slug: member.slug,
        })),
      ];
      const groupId = `group-${Date.now()}`;
      const conversation: Conversation = {
        id: groupId,
        isGroup: true,
        initials: groupInitialsFromTitle(title),
        tint: "plum",
        name: title.trim(),
        pronouns: "",
        connectedSince: "",
        time: t("messages:time.justNow"),
        preview: "",
        unread: false,
        members: memberViews,
        memberCount: memberViews.length,
        messages: [
          {
            day: "Today",
            items: [
              {
                from: "me",
                text: "created the group",
                kind: "system",
                systemEvent: {
                  type: "group_created",
                  actorName: myName,
                  actorIsMe: true,
                },
              },
            ],
          },
        ],
      };
      setExtraThreads((previous) => [conversation, ...previous]);
      setActiveId(groupId);
      setReadIds((current) => new Set(current).add(groupId));
      setView("thread");
      return;
    }
    createGroupMutation.mutate(
      { title: title.trim(), memberHandles: members.map((member) => member.slug) },
      {
        onSuccess: (conversation) => {
          if (!conversation) return;
          setExtraThreads((previous) => [
            conversation,
            ...previous.filter((existing) => existing.id !== conversation.id),
          ]);
          setActiveId(conversation.id);
          setReadIds((current) => new Set(current).add(conversation.id));
          setView("thread");
        },
      },
    );
  }

  /** The signed-in member leaves a group. Optimistically marks it left (composer
   *  severs immediately); live also POSTs /conversations/:id/leave. */
  function leaveGroupThread(conversationId: string) {
    setLeftGroupIds((previous) => new Set(previous).add(conversationId));
    if (!demoMode) leaveGroupMutation.mutate(conversationId);
  }

  // ── Group management (feature #17 Phase 2) ────────────────────────────────
  // Live: the mutation calls the API (server re-checks the caller's role on EVERY
  // one — the can-flags are only a UI hint) and returns the updated group view,
  // patched straight into `extraThreads` so it wins the `allThreads` dedupe
  // ahead of the refetch. Demo: the same change is simulated locally on the mock
  // group (no network), including the matching system pill.

  /** Overlay an updated group view onto the thread list (extraThreads wins the
   *  allThreads dedupe, so this patches a base OR extra group in place). */
  function patchGroupThread(updated: Conversation) {
    setExtraThreads((previous) => [
      updated,
      ...previous.filter((existing) => existing.id !== updated.id),
    ]);
  }

  /** A demo group with `event` appended as a centred system pill in Today. */
  function withDemoSystemPill(
    conversation: Conversation,
    event: ChatSystemEvent,
  ): Conversation {
    const pill: ChatMessage = { from: "me", text: "", kind: "system", systemEvent: event };
    const messages = conversation.messages.map((group) => ({ ...group, items: [...group.items] }));
    const today = messages.find((group) => group.day === "Today");
    if (today) today.items.push(pill);
    else messages.push({ day: "Today", items: [pill] });
    return { ...conversation, messages };
  }

  function addGroupMembers(conversationId: string, picks: GroupMemberPick[]) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group || picks.length === 0) return;
    if (demoMode) {
      const existingSlugs = new Set((group.members ?? []).map((member) => member.slug));
      const additions: GroupMemberView[] = picks
        .filter((pick) => !existingSlugs.has(pick.slug))
        .map((pick) => ({
          name: pick.name,
          initials: pick.initials,
          tint: pick.tint,
          role: "member" as const,
          slug: pick.slug,
        }));
      if (additions.length === 0) return;
      const nextMembers = [...(group.members ?? []), ...additions];
      let next: Conversation = {
        ...group,
        members: nextMembers,
        memberCount: nextMembers.length,
      };
      for (const added of additions) {
        next = withDemoSystemPill(next, {
          type: "member_added",
          actorName: myDisplayName,
          targetName: added.name,
          actorIsMe: true,
        });
      }
      patchGroupThread(next);
      return;
    }
    addMembersMutation.mutate(
      { conversationId, memberHandles: picks.map((pick) => pick.slug) },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  function removeGroupMember(conversationId: string, member: GroupMemberView) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group) return;
    if (demoMode) {
      const nextMembers = (group.members ?? []).filter(
        (candidate) => candidate.slug !== member.slug,
      );
      const next = withDemoSystemPill(
        { ...group, members: nextMembers, memberCount: nextMembers.length },
        {
          type: "member_removed",
          actorName: myDisplayName,
          targetName: member.name,
          actorIsMe: true,
        },
      );
      patchGroupThread(next);
      return;
    }
    if (!member.id) return;
    removeMemberMutation.mutate(
      { conversationId, userId: member.id },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  function changeGroupMemberRole(
    conversationId: string,
    member: GroupMemberView,
    role: "admin" | "member",
  ) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group) return;
    if (demoMode) {
      const nextMembers = (group.members ?? []).map((candidate) =>
        candidate.slug === member.slug ? { ...candidate, role } : candidate,
      );
      patchGroupThread({ ...group, members: nextMembers });
      return;
    }
    if (!member.id) return;
    changeRoleMutation.mutate(
      { conversationId, userId: member.id, role },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  function updateGroupInfo(
    conversationId: string,
    changes: { title?: string; avatarUrl?: string },
  ) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group) return;
    if (demoMode) {
      const trimmedTitle = changes.title?.trim();
      const renamed = !!trimmedTitle && trimmedTitle !== group.name;
      let next: Conversation = {
        ...group,
        name: trimmedTitle || group.name,
        avatarUrl: changes.avatarUrl ?? group.avatarUrl,
      };
      if (renamed) {
        next = withDemoSystemPill(next, {
          type: "group_renamed",
          actorName: myDisplayName,
          value: trimmedTitle,
          actorIsMe: true,
        });
      }
      patchGroupThread(next);
      return;
    }
    updateGroupMutation.mutate(
      { conversationId, ...changes },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  const location = useLocation();
  const navigate = useNavigate();
  const pendingRecipient = (
    location.state as { to?: { slug: string; name: string } } | null
  )?.to;

  // One-shot: honor a "Message <member>" deep-link. Open the existing thread for
  // that slug, or seed+start a new one. Clear the state so back/refresh doesn't
  // re-fire. Works in both modes; live also find-or-creates via startThread.
  useEffect(() => {
    if (!pendingRecipient) return;
    const existingThread = allThreads.find(
      (thread) => thread.slug === pendingRecipient.slug,
    );
    if (existingThread) {
      // One-shot "Message <member>" deep-link; cleared via navigate replace below.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openThread(existingThread.id);
    } else {
      startThread(
        buildRecipientConversation(pendingRecipient.slug, pendingRecipient.name),
      );
    }
    void navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRecipient?.slug]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Notification tap deep-link: the service worker's notificationclick opens
  // `/messages?c=<conversationId>`. Wait until the inbox actually contains
  // that conversation (it may still be loading), then open it the same way a
  // normal thread-row tap does — on mobile the thread pane is gated on
  // `view === "thread"`, so just setting `activeId` selects the conversation
  // without ever showing it — and clear the param so it can't re-fire on a
  // later manual thread switch. Coexists with the pendingRecipient effect
  // above: that one deep-links to a person (existing-or-new thread via slug),
  // this one deep-links to an existing conversation by id.
  useEffect(() => {
    const conversationId = searchParams.get("c");
    if (!conversationId) return;
    const exists = allThreads.some((thread) => thread.id === conversationId);
    if (!exists) return;
    // One-shot notification-tap deep-link; the `c` param is cleared right after.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    openThread(conversationId);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allThreads, setSearchParams]);

  function appendOptimistic(convId: string, message: ChatMessage) {
    setSent((prev) => ({ ...prev, [convId]: [...(prev[convId] ?? []), message] }));
  }

  function setStatus(convId: string, localId: string, status: ChatMessage["status"]) {
    setSent((prev) => ({
      ...prev,
      [convId]: (prev[convId] ?? []).map((item) =>
        item.localId === localId ? { ...item, status } : item,
      ),
    }));
  }

  function deliver(
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
  ) {
    if (demoMode) {
      // Simulate the honest ladder locally — no network. sent → delivered → seen
      // on a short timer, exactly the three rungs live mode drives from the
      // server ack + delivered/read watermarks. `setStatus` is a no-op once the
      // message is gone (thread switched/deleted), so stale timers are harmless.
      setStatus(convId, localId, "sent");
      window.setTimeout(() => setStatus(convId, localId, "delivered"), 700);
      window.setTimeout(() => setStatus(convId, localId, "seen"), 1900);
      return;
    }
    // `localId` IS the client idempotency id (`clientMessageId`) — a resend from
    // the offline outbox or the dual HTTP+WS path can't duplicate server-side.
    // `forwarded` rides the same idempotent send path (never a bypass).
    sendMessage.mutate(
      { conversationId: convId, body, replyToId, clientMessageId: localId, forwarded },
      {
        // Drop only THIS optimistic message (matched by localId) — a concurrent
        // second send in the same thread must survive. The mutation patches the
        // authoritative server copy into the thread cache (deduped by the same
        // client id), so it takes over the bubble's slot as this one clears.
        onSuccess: () =>
          setSent((prev) => {
            const remaining = (prev[convId] ?? []).filter(
              (item) => item.localId !== localId,
            );
            const next = { ...prev };
            if (remaining.length > 0) next[convId] = remaining;
            else delete next[convId];
            return next;
          }),
        onError: () => setStatus(convId, localId, "failed"),
      },
    );
  }

  function send() {
    const body = draft.trim();
    if (!body || activeBlocked || !active) return;
    const convId = active.id;
    const localId = nextLocalId();
    const replyTo = replyDraft
      ? {
          id: replyDraft.id!,
          snippet: replyDraft.text.slice(0, 120),
          senderName:
            replyDraft.from === "me"
              ? t("messages:conversation.you")
              : active.name,
          deleted: false,
        }
      : undefined;
    // Optimistic append — instant feedback in both modes. In live mode the
    // server refetch is authoritative, so clear the optimistic copy on success.
    appendOptimistic(convId, {
      from: "me",
      text: body,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      replyTo,
    });
    setDraft("");
    // The composer emptied this frame, so drop the persisted draft too —
    // otherwise a reload would rehydrate text the member has already sent.
    clearDraft(convId);
    const replyToId = replyDraft?.id;
    setReplyDraft(null);
    deliver(convId, body, localId, replyToId);
  }

  /** Composer change handler exposed as `setDraft`: updates the in-memory draft
   *  AND persists it for the open thread, so typed-but-unsent text survives a
   *  thread switch or a reload. Persisting on every change (like the outbox
   *  next door) keeps the store in lock-step with the composer; empty text
   *  clears the stored key. Local-only in both modes — nothing hits the network
   *  until the member actually sends. */
  function changeDraft(value: string) {
    setDraft(value);
    if (active) saveDraft(active.id, value);
  }

  function retrySend(message: ChatMessage) {
    if (!active || !message.localId) return;
    setStatus(active.id, message.localId, "sending");
    deliver(
      active.id,
      message.text,
      message.localId,
      message.replyTo?.id,
      message.forwarded,
    );
  }

  /**
   * Forward a message's content to `recipient` as a NEW message, through the
   * ordinary idempotent send path (a fresh `clientMessageId`, the outbox, cache
   * patching) — never a bypass. Only the body is carried; reactions/receipts are
   * not copied. An existing thread receives the forward instantly; a brand-new
   * live thread is created first (POST /conversations), then the forward is sent
   * on its real UUID. Demo mode is local-only (optimistic bubble, no network).
   */
  function forwardMessage(recipient: Conversation, text: string) {
    const localId = nextLocalId();
    const optimistic: ChatMessage = {
      from: "me",
      text,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      forwarded: true,
    };
    const existing = allThreads.find(
      (thread) => thread.slug && thread.slug === recipient.slug,
    );
    if (existing) {
      appendOptimistic(existing.id, optimistic);
      openThread(existing.id);
      deliver(existing.id, text, localId, undefined, true);
      return;
    }
    // New thread. Open the placeholder immediately; in demo (or an official/
    // no-slug target) that's the whole story — no network.
    setExtraThreads((prev) =>
      prev.some((thread) => thread.id === recipient.id) ? prev : [recipient, ...prev],
    );
    setActiveId(recipient.id);
    setReadIds((current) => new Set(current).add(recipient.id));
    setView("thread");
    if (demoMode || !recipient.slug) {
      appendOptimistic(recipient.id, optimistic);
      return;
    }
    // Live: materialize the conversation, then append + deliver on the real id
    // (optimistic is keyed by conversation id, so it must wait for the UUID).
    startConversation.mutate(recipient.slug, {
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
        appendOptimistic(conversation.id, optimistic);
        deliver(conversation.id, text, localId, undefined, true);
      },
    });
  }

  // Persist the outbox on every change so an in-flight (or demo) send survives a
  // reload. Demo entries stay as `sent`; live `sending`/`failed` entries are
  // replayed below and then cleared as the server acks them.
  useEffect(() => {
    saveOutbox(sent);
  }, [sent]);

  // Replay unsent messages once on mount (live mode only): anything left
  // `sending`/`failed` in the persisted outbox — a send that was in flight or
  // failed when the tab last closed — is resent. Idempotent, because each still
  // carries its original `clientMessageId` (== `localId`), so a message the
  // server already stored is deduped rather than duplicated.
  const outboxReplayedRef = useRef(false);
  useEffect(() => {
    if (demoMode || outboxReplayedRef.current) return;
    outboxReplayedRef.current = true;
    for (const [conversationId, messages] of Object.entries(sent)) {
      for (const message of messages) {
        if (
          message.localId &&
          (message.status === "sending" || message.status === "failed")
        ) {
          // Mount-once replay of the persisted outbox (sending/failed sends).
          // eslint-disable-next-line react-hooks/set-state-in-effect
          deliver(
            conversationId,
            message.text,
            message.localId,
            message.replyTo?.id,
            message.forwarded,
          );
        }
      }
    }
    // Mount-once replay of the hydrated outbox; `deliver`/`sent` are intentionally
    // read from the first render and must not re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  return {
    isMobile,
    view,
    setView,
    loading,
    unread,
    visibleThreads,
    activeId,
    readIds,
    query,
    setQuery,
    draft,
    setDraft: changeDraft,
    composing,
    setComposing,
    replyDraft,
    setReplyDraft,
    active,
    activeBlocked,
    counterpartLastReadAt,
    counterpartDeliveredAt,
    messageGroups,
    hasMoreOlder,
    loadingOlder,
    loadOlder,
    openThread,
    openThreadAtMessage,
    jumpMessageId,
    clearJumpMessage,
    startThread,
    startGroup,
    leaveGroupThread,
    leavePending: leaveGroupMutation.isPending,
    myUserId,
    addGroupMembers,
    removeGroupMember,
    changeGroupMemberRole,
    updateGroupInfo,
    groupManaging:
      addMembersMutation.isPending ||
      removeMemberMutation.isPending ||
      changeRoleMutation.isPending ||
      updateGroupMutation.isPending,
    deleteThread,
    deletePending: deleteConversationMutation.isPending,
    send,
    retrySend,
    forwardMessage,
  };
}
