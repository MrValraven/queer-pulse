import { useMemo, useSyncExternalStore } from "react";
import {
  useQueryClient,
  type Query,
  type QueryClient,
} from "@tanstack/react-query";
import type { Conversation } from "./data";

const DETAIL_KEY_ROOT = "conversation-detail";
const NO_CONVERSATION_IDS: readonly string[] = [];
const NO_DETAILS: ReadonlyMap<string, Conversation> = new Map();

/** The live detail key `useConversationDetail` reads and writes. */
function liveDetailKey(conversationId: string) {
  return [DETAIL_KEY_ROOT, conversationId, false] as const;
}

/**
 * A read-only view over the cached detail entries for a set of ids. The
 * snapshot keeps its identity until one of those entries changes (a fetch, a
 * cache patch, a revert, a removal), which is what `useSyncExternalStore`
 * needs from it. `dataUpdateCount` moves on every write, so two patches in
 * the same millisecond still count as two changes.
 */
function createCachedDetailStore(queryClient: QueryClient) {
  let lastSignature = "";
  let lastDetails = NO_DETAILS;
  return {
    subscribe: (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe((event) => {
        const { queryKey } = event.query as Query;
        if (queryKey[0] !== DETAIL_KEY_ROOT) return;
        if (
          event.type === "added" ||
          event.type === "removed" ||
          event.type === "updated"
        ) {
          onStoreChange();
        }
      }),
    read: (conversationIds: readonly string[]) => {
      const states = conversationIds.map((conversationId) => ({
        conversationId,
        state: queryClient.getQueryState<Conversation>(
          liveDetailKey(conversationId),
        ),
      }));
      const signature = states
        .map(
          ({ conversationId, state }) =>
            `${conversationId}:${state?.data ? state.dataUpdateCount : -1}`,
        )
        .join("|");
      if (signature === lastSignature) return lastDetails;
      const details = new Map<string, Conversation>();
      for (const { conversationId, state } of states) {
        if (state?.data) details.set(conversationId, state.data);
      }
      lastSignature = signature;
      lastDetails = details;
      return details;
    },
  };
}

/**
 * The cached by-id reads (`GET /conversations/:id`) for `conversationIds`,
 * kept live without observing the queries themselves: it fires no request
 * and changes no query's options, it only follows what the cache already
 * holds. `useMessagesController` hands it the session rows the list pages
 * lack, so `mergeInboxThreads` can show their freshest copy. Returns an empty
 * map when `isEnabled` is false (demo mode has no detail reads).
 */
export function useCachedConversationDetails(
  conversationIds: readonly string[],
  isEnabled: boolean,
): ReadonlyMap<string, Conversation> {
  const queryClient = useQueryClient();
  const store = useMemo(
    () => createCachedDetailStore(queryClient),
    [queryClient],
  );
  const idsToRead = isEnabled ? conversationIds : NO_CONVERSATION_IDS;
  return useSyncExternalStore(store.subscribe, () => store.read(idsToRead));
}
