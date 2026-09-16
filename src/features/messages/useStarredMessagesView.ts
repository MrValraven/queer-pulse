// src/features/messages/useStarredMessagesView.ts
import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  MessageSearchConversationGroup,
  StarredMessageHit,
  StarredMessagesResponse,
} from "../../shared/contracts/contracts";
import { groupIdentity } from "./starredMessageIdentity";
import {
  filterStarredMessages,
  type StarredMessageFilterType,
} from "./starredMessagesFilter";

export interface StarredMessagesView {
  groupsById: Map<string, MessageSearchConversationGroup>;
  /** The rows to render: the server's own page once it is trustworthy
   *  (`shouldFilterClientSide` false), or that same page narrowed by
   *  `filterStarredMessages` while it is still stale (see
   *  `useStarredMessages`'s own doc for what makes it stale). */
  visibleItems: StarredMessageHit[];
  isFiltered: boolean;
  hasNoMatches: boolean;
  /** The true "you haven't starred anything yet" state: no filter is active
   *  or pending, and the caller has never starred a message. Distinct from
   *  `hasNoMatches`, which is a filtered search landing on zero results. */
  isNeverStarred: boolean;
  shouldShowToolbar: boolean;
  shouldAnnounceResultCount: boolean;
  resultCount: number;
  /** True when a further page could still add more matches under the
   *  current filters, making `resultCount` a floor on the eventual total. */
  resultCountIsPartial: boolean;
}

/**
 * Derives everything `StarredMessagesModal` renders from the raw hook state:
 * which rows are visible, and the toolbar/empty-state/announcement gates
 * that follow from that. Split out of the modal component to keep it under
 * the 200-line cap, and so the derivation itself stays independently
 * readable from the JSX consuming it.
 */
export function useStarredMessagesView(
  data: StarredMessagesResponse | undefined,
  query: string,
  filterType: StarredMessageFilterType,
  isLoading: boolean,
  isSearchPending: boolean,
  shouldFilterClientSide: boolean,
  hasNextPage: boolean,
): StarredMessagesView {
  const { t } = useTranslation();
  const items = useMemo(() => data?.items ?? [], [data]);

  const groupsById = useMemo(() => {
    const map = new Map<string, MessageSearchConversationGroup>();
    for (const group of data?.conversations ?? []) {
      map.set(group.conversationId, group);
    }
    return map;
  }, [data]);

  // The toolbar's text search also matches the conversation title, which the
  // wire hit doesn't carry on its own, so it's resolved here via the same
  // `groupIdentity` lookup each row's avatar/name already use.
  const filterableItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        conversationTitle: groupIdentity(groupsById.get(item.conversationId), t)
          .name,
      })),
    [items, groupsById, t],
  );

  const visibleItems = useMemo(
    () =>
      shouldFilterClientSide
        ? filterStarredMessages(filterableItems, query, filterType)
        : items,
    [shouldFilterClientSide, filterableItems, items, query, filterType],
  );

  const isFiltered = query.trim() !== "" || filterType !== "all";
  // Gated on `isSearchPending` (I1): while the server's answer to the
  // CURRENT filters hasn't landed yet, an empty narrowed list is just as
  // likely to be a stale snapshot as a genuine zero, so the verdict waits.
  const hasNoMatches =
    isFiltered && !isLoading && !isSearchPending && visibleItems.length === 0;
  // The I2 mirror of `hasNoMatches`: gated the identical way (never while
  // pending) so clearing a zero-match query cannot flash this in for the
  // instant before the cleared filters' own page has actually loaded.
  const isNeverStarred =
    !isFiltered && !isLoading && !isSearchPending && visibleItems.length === 0;
  // Kept mounted once there is anything to search, a filter is active, or a
  // debounced/in-flight request from a filter that was JUST cleared hasn't
  // settled yet (I2): clearing a zero-match query would otherwise unmount
  // the toolbar for the instant before `isFiltered` catches up, dropping
  // focus to the body and flashing the never-starred empty state.
  const shouldShowToolbar = items.length > 0 || isFiltered || isSearchPending;
  const shouldAnnounceResultCount =
    isFiltered && !hasNoMatches && !isSearchPending;

  return {
    groupsById,
    visibleItems,
    isFiltered,
    hasNoMatches,
    isNeverStarred,
    shouldShowToolbar,
    shouldAnnounceResultCount,
    resultCount: visibleItems.length,
    resultCountIsPartial: hasNextPage,
  };
}
