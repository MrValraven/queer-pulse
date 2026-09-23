import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import {
  isFromViewerSide,
  type MessageViewer,
} from "../../../shared/api/mailboxViewer";
import { activeLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { MessageSearchResponse } from "../../../shared/contracts/contracts";
import type { TFunction } from "../../../shared/i18n/types";
import { conversations as mockConversations, type ChatMessage } from "../data";
import { demoIdentityAuthor } from "../demoIdentities.data";
import {
  belongsToMailbox,
  isNotStaffError,
  type ConversationListScope,
} from "../mailboxes/mailboxScope";
import { useActiveMailbox } from "../mailboxes/useActiveMailbox";
import { useMessageViewer } from "../useMessageViewer";
import { colleagueSenderLabel, isTypedByViewer } from "../viewerSideSender";
import { groupInitials } from "./messages.adapters";
import { searchMessages } from "./messages.api";

/** Least query length that fans out — a single character matches too much to be
 *  useful (and, in live mode, is a wasteful whole-corpus scan). */
export const MIN_SEARCH_LENGTH = 2;
const SEARCH_LIMIT = 30;

/** One matched message, ready to render as a result row. `id` is the server
 *  message id used to jump to the exact bubble; undefined for demo hits (mock
 *  messages carry no id), which still open the conversation. */
export interface MessageSearchHitView {
  id?: string;
  conversationId: string;
  snippet: string;
  time: string;
  from: "me" | "them";
  senderName: string;
}

/** Hits grouped under the conversation they belong to, with the identity chrome
 *  (name/avatar) the inbox row already uses. */
export interface MessageSearchGroupView {
  conversationId: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl?: string;
  official: boolean;
  hits: MessageSearchHitView[];
}

export interface MessageSearchState {
  groups: MessageSearchGroupView[];
  totalHits: number;
  isLoading: boolean;
  /** True once the (trimmed) query is long enough to have searched. */
  enabled: boolean;
  /** True when the live search request failed. Surfaced rather than swallowed
   *  (DES-22) so "no matches" is never printed over an outage. */
  isError: boolean;
  /** Re-runs the failed search. */
  refetch: () => void;
}

/** A short window of `text` around the first case-insensitive match of `query`,
 *  ellipsed where cut — the demo counterpart of the backend's snippet builder. */
function snippetAround(text: string, query: string): string {
  const LEAD = 40;
  const TRAIL = 90;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) {
    return text.length > LEAD + TRAIL
      ? `${text.slice(0, LEAD + TRAIL).trimEnd()}…`
      : text;
  }
  const start = Math.max(0, index - LEAD);
  const end = Math.min(text.length, index + query.length + TRAIL);
  const core = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${core}${end < text.length ? "…" : ""}`;
}

/** Adapts the live GET /messages/search payload into render-ready groups,
 *  preserving the newest-first hit order (and therefore group order). `t`
 *  resolves `messages:conversation.officialName` for an official thread's
 *  name and `messages:group.untitled` for a nameless group, the same keys the
 *  thread adapter's `conversationToView`/`groupConversationToView`
 *  (`messages.adapters.ts`) resolve for the identical fallback cases.
 *
 * ENG-251: a hit inside a GROUP conversation (`meta.kind === "group"`) is
 * labelled with the group's own title/avatar, never an arbitrary member's,
 * before this fix `otherParticipant` was only nulled for the official
 * thread, so a group hit rendered under whichever non-caller participant the
 * backend's grouping query happened to pick first. */
function toGroups(
  response: MessageSearchResponse,
  viewer: MessageViewer,
  t: TFunction,
): MessageSearchGroupView[] {
  const metaByConversation = new Map(
    response.conversations.map((group) => [group.conversationId, group]),
  );
  const groupByConversation = new Map<string, MessageSearchGroupView>();
  const order: string[] = [];
  for (const hit of response.hits) {
    let group = groupByConversation.get(hit.conversationId);
    if (!group) {
      const meta = metaByConversation.get(hit.conversationId);
      const isGroupConversation = meta?.kind === "group";
      const other = meta?.otherParticipant ?? null;
      const official = meta?.isOfficial ?? !other;
      const name = isGroupConversation
        ? (meta?.title ?? t("messages:group.untitled"))
        : official
          ? t("messages:conversation.officialName")
          : (other?.displayName ?? "Member");
      const parts = name.trim().split(/\s+/);
      group = {
        conversationId: hit.conversationId,
        name,
        // Brand mark "QP": invariant across languages, matching the thread
        // adapter's official-avatar fallback and `orgBadgeInitials`'s default
        // (`shared/lib/initials.ts`). A group's initials come from its own
        // title, mirroring the inbox row's `groupInitials`.
        initials: isGroupConversation
          ? groupInitials(name)
          : official
            ? "QP"
            : initialsOf(parts[0] ?? "", parts.length > 1 ? parts.at(-1)! : ""),
        // Groups always render "plum", matching the inbox row's group tint,
        // a group has no single member's handle to derive a tint from.
        tint:
          isGroupConversation || official || !other
            ? "plum"
            : tintForSlug(other.handle),
        avatarUrl: isGroupConversation
          ? (meta?.avatarUrl ?? undefined)
          : (other?.avatarUrl ?? undefined),
        official,
        hits: [],
      };
      groupByConversation.set(hit.conversationId, group);
      order.push(hit.conversationId);
    }
    group.hits.push({
      id: hit.id,
      conversationId: hit.conversationId,
      snippet: hit.snippet,
      time: shortTime(hit.createdAt),
      // A reply sent as a business the viewer staffs is on the viewer's side.
      from: isFromViewerSide(hit.sender, viewer) ? "me" : "them",
      // ENG-243: an erased sender's hit is labelled in the viewer's language.
      senderName: hit.sender.isFormerMember
        ? t("messages:formerMember")
        : hit.sender.displayName,
    });
  }
  return order.map((conversationId) =>
    groupByConversation.get(conversationId)!,
  );
}

/** Compact "9:14 PM" / weekday / date label for a hit's timestamp. */
function shortTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const locale = activeLocale();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  const days = Math.round((now.getTime() - date.getTime()) / 86_400_000);
  if (days < 7) return date.toLocaleDateString(locale, { weekday: "short" });
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

/** A demo hit's sender: "You" for the member's own message, the business
 *  with the colleague's first name for a colleague's business reply, the
 *  thread's name otherwise. A seed carries the identity it was sent as and
 *  the business name comes from the demo directory, as the thread's own
 *  sender does (`demoThreadCache.ts`). */
function demoHitSenderName(
  item: ChatMessage,
  conversationName: string,
  youLabel: string,
  t: TFunction,
): string {
  if (isTypedByViewer(item)) return youLabel;
  if (item.from !== "me") return conversationName;
  const business = item.senderIdentityId
    ? demoIdentityAuthor(item.senderIdentityId).displayName
    : undefined;
  return colleagueSenderLabel(
    { senderName: business, senderStaffFirstName: item.senderStaffFirstName },
    t,
  );
}

/** Demo search: filter the colocated mock message set locally — no network.
 *  `scopedToConversationId`, when set, only searches that one conversation's
 *  mock messages (the "search in this chat" mode), mirroring the live-mode
 *  `conversationId` query param. `mailboxScope` keeps the hits of the active
 *  mailbox's threads, mirroring the live-mode `as` query param. */
function searchDemo(
  query: string,
  deletedIds: ReadonlySet<string>,
  youLabel: string,
  mailboxScope: ConversationListScope,
  t: TFunction,
  scopedToConversationId?: string,
): MessageSearchGroupView[] {
  const needle = query.toLowerCase();
  const groups: MessageSearchGroupView[] = [];
  for (const conversation of mockConversations) {
    if (deletedIds.has(conversation.id)) continue;
    if (!belongsToMailbox(conversation, mailboxScope)) continue;
    if (scopedToConversationId && conversation.id !== scopedToConversationId) {
      continue;
    }
    const hits: MessageSearchHitView[] = [];
    for (const day of conversation.messages) {
      for (const item of day.items) {
        if (!item.text.toLowerCase().includes(needle)) continue;
        hits.push({
          id: item.id,
          conversationId: conversation.id,
          snippet: snippetAround(item.text, query),
          time: item.time ?? conversation.time,
          from: item.from,
          senderName: demoHitSenderName(item, conversation.name, youLabel, t),
        });
      }
    }
    if (hits.length === 0) continue;
    groups.push({
      conversationId: conversation.id,
      name: conversation.name,
      initials: conversation.initials,
      tint: conversation.tint,
      avatarUrl: conversation.avatarUrl,
      official: Boolean(conversation.official),
      hits,
    });
  }
  return groups;
}

/**
 * Cross-inbox message-body search, dual-mode. Live mode calls GET
 * /messages/search (permission-scoped + `clearedAt`-floored server-side); demo
 * mode filters the colocated mock messages locally with no network. Pass an
 * ALREADY-DEBOUNCED query — this hook does not debounce. `youLabel` is the
 * translated "You" so demo-mode own-message hits read naturally.
 *
 * `scopedToConversationId`, when supplied, narrows the search to that single
 * thread instead of the caller's whole inbox — the "search in this chat" mode
 * opened from an already-open conversation (`ThreadSearchModal`). Omitted
 * (the default) searches every conversation, as the inbox-root search box does.
 *
 * Both modes search the active mailbox only: live sends its identity as `as`
 * (together with `conversationId` when scoped; the server applies both), and
 * the query key carries it. A refused mailbox (`IDENTITY_NOT_STAFF`) falls
 * back to the personal one through `reportLostAccess`.
 */
export function useMessageSearch(
  debouncedQuery: string,
  youLabel: string,
  scopedToConversationId?: string,
): MessageSearchState {
  const { demoMode } = useDemoMode();
  const { deletedIds } = useDeletedConversations();
  const viewer = useMessageViewer();
  const { t } = useTranslation();
  const activeMailbox = useActiveMailbox();
  const mailboxScope = activeMailbox.scope;
  const mailboxIdentityId = mailboxScope?.identityId ?? null;
  const trimmed = debouncedQuery.trim();
  const enabled = trimmed.length >= MIN_SEARCH_LENGTH;
  const deletedToken = [...deletedIds].sort().join(",");

  const liveQuery = useQuery<MessageSearchResponse>({
    queryKey: [
      "messageSearch",
      trimmed,
      demoMode,
      scopedToConversationId ?? null,
      mailboxIdentityId,
    ],
    enabled: enabled && !demoMode && mailboxIdentityId !== null,
    // Forward react-query's own cancellation signal into the fetch — a fast
    // retype (new `trimmed` → new queryKey) cancels the previous keystroke's
    // request at the network layer, not just in the query cache.
    queryFn: ({ signal }) =>
      searchMessages(
        trimmed,
        SEARCH_LIMIT,
        signal,
        scopedToConversationId,
        mailboxIdentityId ?? undefined,
      ),
    // A search term is short-lived; keep results briefly so re-typing the same
    // query doesn't refetch, but don't hoard stale corpora.
    staleTime: 30_000,
  });

  const { reportLostAccess } = activeMailbox;
  useEffect(() => {
    if (isNotStaffError(liveQuery.error)) reportLostAccess();
  }, [liveQuery.error, reportLostAccess]);

  const demoGroups = useMemo(
    () =>
      demoMode && enabled && mailboxScope
        ? searchDemo(
            trimmed,
            deletedIds,
            youLabel,
            mailboxScope,
            t,
            scopedToConversationId,
          )
        : [],
    // deletedToken stands in for the deletedIds set identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      demoMode,
      enabled,
      trimmed,
      deletedToken,
      youLabel,
      mailboxScope,
      t,
      scopedToConversationId,
    ],
  );

  const liveGroups = useMemo(
    () => (liveQuery.data ? toGroups(liveQuery.data, viewer, t) : []),
    [liveQuery.data, viewer, t],
  );

  const groups = demoMode ? demoGroups : liveGroups;
  const totalHits = groups.reduce((sum, group) => sum + group.hits.length, 0);

  return {
    groups,
    totalHits,
    // Live: still loading while no mailbox has resolved, since the search
    // waits for one.
    isLoading:
      enabled &&
      !demoMode &&
      ((mailboxIdentityId === null && !activeMailbox.isError) ||
        liveQuery.isLoading),
    enabled,
    isError:
      enabled && !demoMode && (liveQuery.isError || activeMailbox.isError),
    refetch: () => {
      if (activeMailbox.isError) {
        activeMailbox.refetch();
        return;
      }
      void liveQuery.refetch();
    },
  };
}
