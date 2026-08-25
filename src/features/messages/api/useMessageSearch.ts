import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import { useAuth } from "../../../app/providers/authContext";
import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import { activeLocale } from "../../../shared/i18n/locale";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { MessageSearchResponse } from "../../../shared/contracts/contracts";
import { conversations as mockConversations } from "../data";
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
}

const OFFICIAL_NAME = "QueerPulse Team";

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
 *  preserving the newest-first hit order (and therefore group order). */
function toGroups(
  response: MessageSearchResponse,
  myHandle: string | null,
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
      const other = meta?.otherParticipant ?? null;
      const official = meta?.isOfficial ?? !other;
      const name = official ? OFFICIAL_NAME : (other?.displayName ?? "Member");
      const parts = name.trim().split(/\s+/);
      group = {
        conversationId: hit.conversationId,
        name,
        initials: official
          ? "QP"
          : initialsOf(parts[0] ?? "", parts.length > 1 ? parts.at(-1)! : ""),
        tint: official || !other ? "plum" : tintForSlug(other.handle),
        avatarUrl: other?.avatarUrl ?? undefined,
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
      from: myHandle && hit.sender.handle === myHandle ? "me" : "them",
      senderName: hit.sender.displayName,
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

/** Demo search: filter the colocated mock message set locally — no network.
 *  `scopedToConversationId`, when set, only searches that one conversation's
 *  mock messages (the "search in this chat" mode), mirroring the live-mode
 *  `conversationId` query param. */
function searchDemo(
  query: string,
  deletedIds: ReadonlySet<string>,
  youLabel: string,
  scopedToConversationId?: string,
): MessageSearchGroupView[] {
  const needle = query.toLowerCase();
  const groups: MessageSearchGroupView[] = [];
  for (const conversation of mockConversations) {
    if (deletedIds.has(conversation.id)) continue;
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
          senderName: item.from === "me" ? youLabel : conversation.name,
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
 */
export function useMessageSearch(
  debouncedQuery: string,
  youLabel: string,
  scopedToConversationId?: string,
): MessageSearchState {
  const { demoMode } = useDemoMode();
  const { deletedIds } = useDeletedConversations();
  const { user } = useAuth();
  const myHandle = user?.profile.slug ?? null;
  const trimmed = debouncedQuery.trim();
  const enabled = trimmed.length >= MIN_SEARCH_LENGTH;
  const deletedToken = [...deletedIds].sort().join(",");

  const liveQuery = useQuery<MessageSearchResponse>({
    queryKey: [
      "messageSearch",
      trimmed,
      demoMode,
      scopedToConversationId ?? null,
    ],
    enabled: enabled && !demoMode,
    // Forward react-query's own cancellation signal into the fetch — a fast
    // retype (new `trimmed` → new queryKey) cancels the previous keystroke's
    // request at the network layer, not just in the query cache.
    queryFn: ({ signal }) =>
      searchMessages(trimmed, SEARCH_LIMIT, signal, scopedToConversationId),
    // A search term is short-lived; keep results briefly so re-typing the same
    // query doesn't refetch, but don't hoard stale corpora.
    staleTime: 30_000,
  });

  const demoGroups = useMemo(
    () =>
      demoMode && enabled
        ? searchDemo(trimmed, deletedIds, youLabel, scopedToConversationId)
        : [],
    // deletedToken stands in for the deletedIds set identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      demoMode,
      enabled,
      trimmed,
      deletedToken,
      youLabel,
      scopedToConversationId,
    ],
  );

  const liveGroups = useMemo(
    () => (liveQuery.data ? toGroups(liveQuery.data, myHandle) : []),
    [liveQuery.data, myHandle],
  );

  const groups = demoMode ? demoGroups : liveGroups;
  const totalHits = groups.reduce((sum, group) => sum + group.hits.length, 0);

  return {
    groups,
    totalHits,
    isLoading: enabled && !demoMode && liveQuery.isLoading,
    enabled,
  };
}
