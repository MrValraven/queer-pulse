import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  withMailboxSeat,
  type ConversationListScope,
} from "../mailboxes/mailboxScope";
import type { Conversation } from "../data";
import { getConversationsPage } from "./messages.api";
import { conversationToView } from "./messages.adapters";

/** How long typing pauses before the server search runs. */
const FORWARD_GROUP_SEARCH_DEBOUNCE_MS = 250;
/** One bounded page of matches: more than a picker can usefully list. */
const FORWARD_GROUP_SEARCH_LIMIT = 50;
/** The query-key root; segment 1 is the mailbox identity id. */
const FORWARD_GROUP_SEARCH_KEY = "forward-group-search";

/** Lowercased and stripped of accents, so "sao" finds "São" the way the
 *  server's own accent fold does. */
function foldForMatch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** A group the member can forward into: one they still belong to. */
function isForwardableGroup(conversation: Conversation): boolean {
  return conversation.isGroup === true && !conversation.hasLeft;
}

export interface ForwardGroupSearch {
  /** The groups to list for the current query. */
  groups: Conversation[];
  /** The server search for the current query has not answered yet. */
  isSearching: boolean;
  /** The server search failed for the term on screen, so only the loaded
   *  groups are listed. */
  isError: boolean;
}

/**
 * The Groups section of the forward picker (ENG-403). `loadedGroups` are the
 * forwardable groups on the inbox pages already loaded, which carry this
 * session's optimistic state.
 *
 * - An empty query lists `loadedGroups` as they are. Nothing more is paged in.
 * - A query lists the loaded groups whose name matches at once, then appends
 *   what the server search finds past the loaded pages:
 *   `GET /conversations?q=&kind=group&excludeLeft=true`, debounced, one cache
 *   entry per mailbox and term, its request aborted when the term moves on.
 *   The server keeps every visibility rule of the inbox and drops groups the
 *   member left, so the search reaches exactly the groups a message can go
 *   to.
 * - While the next term loads, the last answer stays on screen, narrowed to
 *   the rows whose name still matches the typed text, so the list never
 *   collapses and regrows per keystroke and never shows a row the text rules
 *   out.
 * - Each picker opening asks the server afresh (`gcTime: 0` drops the cache
 *   entry once the picker closes), so an answer from an earlier opening can
 *   never bring back a group the member has since left or renamed.
 * - The picker lists the first page alone and leaves `pageInfo.hasMore`
 *   unread: a term that matches more than 50 forwardable groups is narrowed
 *   by typing more, which is how a picker search is used.
 * - Demo mode filters `loadedGroups` locally: the whole scripted inbox is
 *   one loaded page there.
 */
export function useForwardGroupSearch(
  query: string,
  loadedGroups: Conversation[],
  scope: ConversationListScope | null,
): ForwardGroupSearch {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(
    trimmedQuery,
    FORWARD_GROUP_SEARCH_DEBOUNCE_MS,
  );
  const hasQuery = trimmedQuery.length > 0;
  const scopeIdentityId = scope?.identityId ?? null;
  const isServerSearchEnabled =
    !demoMode && scope !== null && debouncedQuery.length > 0;

  const serverSearch = useQuery<Conversation[]>({
    queryKey: [FORWARD_GROUP_SEARCH_KEY, scopeIdentityId, debouncedQuery],
    enabled: isServerSearchEnabled,
    gcTime: 0,
    // The previous term's answer, from the same mailbox only.
    placeholderData: (previousGroups, previousQuery) =>
      previousQuery?.queryKey[1] === scopeIdentityId
        ? previousGroups
        : undefined,
    queryFn: async ({ signal }) => {
      if (!scope) return [];
      const page = await getConversationsPage({
        q: debouncedQuery,
        kind: "group",
        excludeLeft: true,
        limit: FORWARD_GROUP_SEARCH_LIMIT,
        as: scope.identityId,
        signal,
      });
      return page.data
        .map((row) => withMailboxSeat(conversationToView(row, t), scope))
        .filter(isForwardableGroup);
    },
  });

  const forwardableLoadedGroups = useMemo(
    () => loadedGroups.filter(isForwardableGroup),
    [loadedGroups],
  );

  const groups = useMemo(() => {
    if (!hasQuery) return forwardableLoadedGroups;
    const needle = foldForMatch(trimmedQuery);
    const isMatch = (group: Conversation) =>
      foldForMatch(group.name).includes(needle);
    const loadedIds = new Set(loadedGroups.map((group) => group.id));
    // The server answer may belong to an earlier term (the placeholder while
    // the next one loads): only its rows the typed text still matches stay.
    const unloadedMatches = demoMode
      ? []
      : (serverSearch.data ?? []).filter(
          (group) => !loadedIds.has(group.id) && isMatch(group),
        );
    return [...forwardableLoadedGroups.filter(isMatch), ...unloadedMatches];
  }, [
    hasQuery,
    trimmedQuery,
    loadedGroups,
    forwardableLoadedGroups,
    demoMode,
    serverSearch.data,
  ]);

  const isLiveSearch = hasQuery && !demoMode && scope !== null;
  const isSettling = isDebounceSettling(trimmedQuery, debouncedQuery);
  return {
    groups,
    isSearching: isLiveSearch && (isSettling || serverSearch.isFetching),
    isError: isLiveSearch && !isSettling && serverSearch.isError,
  };
}
