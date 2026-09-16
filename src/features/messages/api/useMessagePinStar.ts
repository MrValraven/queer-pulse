import { useMemo } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
// TEMPORARY — see ../scrollTrace.ts's revert instructions.
import {
  isScrollTraceLiveSimulationEnabled,
  useScrollTraceSimulatedPinnedMessages,
} from "../scrollTrace";
import {
  patchMessagePinned,
  patchMessageStarred,
} from "../../../shared/api/messageCache";
import type {
  MessageResponse,
  MessageSearchConversationGroup,
  StarredMessageHit,
  StarredMessagesResponse,
} from "../../../shared/contracts/contracts";
import type { StarredMessageFilterType } from "../starredMessagesFilter";
import {
  demoPinnedMessages,
  readDemoStarredMessages,
  rememberDemoStarToggle,
} from "./demoMessageLists";
import {
  assertDemoActionAllowed,
  DemoActionRefusedError,
} from "./demoActionGuards";
import {
  findDemoConversationIdForMessage,
  readDemoThread,
} from "./demoThreadCache";
import {
  getPinnedMessages,
  getStarredMessages,
  pinMessage,
  starMessage,
  unpinMessage,
  unstarMessage,
} from "./messages.api";

/** How long typing pauses before a starred-search keystroke fans out to the
 *  server (PRD-374): short enough to feel live, long enough that a fast
 *  typist doesn't fire one request per character. */
const STARRED_SEARCH_DEBOUNCE_MS = 250;

/** Concatenates every fetched page's items (server order is already
 *  newest-star-first within and across pages), deduping by message id, first
 *  occurrence wins: a stale or a forged `cursor` restarting the keyset from
 *  page 1 would otherwise repeat a row already on an earlier page, which
 *  duplicates the React key `StarredMessagesModal` renders each item under.
 *  Also dedupes `conversations` by `conversationId`, first occurrence wins,
 *  since every page repeats a group's metadata verbatim for any hit that
 *  lands in it, so the first copy is as good as the last. The final page's
 *  `nextCursor`/`hasMore` carry forward, since that is the one page not yet
 *  fully consumed. */
function mergeStarredMessagesPages(
  pages: StarredMessagesResponse[],
): StarredMessagesResponse {
  const itemsById = new Map<string, StarredMessageHit>();
  const conversationsById = new Map<string, MessageSearchConversationGroup>();
  for (const page of pages) {
    for (const item of page.items) {
      if (!itemsById.has(item.id)) {
        itemsById.set(item.id, item);
      }
    }
    for (const group of page.conversations) {
      if (!conversationsById.has(group.conversationId)) {
        conversationsById.set(group.conversationId, group);
      }
    }
  }
  const lastPage = pages[pages.length - 1];
  return {
    items: [...itemsById.values()],
    conversations: [...conversationsById.values()],
    nextCursor: lastPage?.nextCursor ?? null,
    hasMore: lastPage?.hasMore ?? false,
  };
}

/**
 * Forward / Pin / Star data hooks. Each branches on `demoMode`: live mode calls
 * the API then patches/refetches only the affected keys (never a blanket thread
 * invalidation). Demo mode has no server but the same seeded message ids: the
 * toggles patch the demo thread cache through the same helpers, and the pinned
 * and starred lists are derived from that cache (`demoMessageLists.ts`), so the
 * banner and the Starred modal show the seeded marks plus this session's. No
 * network in demo.
 */

const EMPTY_PINS: MessageResponse[] = [];

/** The demo thread a pin or star lands in. `useConversationPinStar` hands a
 *  null id to a demo DM whose id equals its slug, so a seeded message id
 *  resolves its own thread instead. */
function demoTargetConversationId(
  conversationId: string | null,
  messageId: string,
): string | null {
  return conversationId ?? findDemoConversationIdForMessage(messageId);
}

/** GET /conversations/:id/pins: the SHARED pinned-messages list for the banner.
 *  Its own query key (`conversation-pins`), NOT under `["messages", id]`, so the
 *  thread cache-patch helpers never touch it. Demo derives it from the demo
 *  thread cache and refreshes on the same invalidation a live pin uses. */
export function usePinnedMessages(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // TEMPORARY: see ../scrollTrace.ts's revert instructions. The simulation
  // swaps the demo pins for one that arrives late, to exercise the
  // async-arrival timing this investigation needed; the simulation hook is
  // called unconditionally (stable across renders) and its result substituted
  // below only when the flag is on.
  const simulateLiveTiming = demoMode && isScrollTraceLiveSimulationEnabled();
  const simulatedPins = useScrollTraceSimulatedPinnedMessages(
    conversationId,
    demoMode,
  );
  const readDemoPins = () =>
    conversationId
      ? demoPinnedMessages(readDemoThread(queryClient, conversationId))
      : EMPTY_PINS;
  const query = useQuery<MessageResponse[]>({
    queryKey: ["conversation-pins", conversationId, demoMode],
    enabled: !!conversationId,
    queryFn: () => {
      if (demoMode) return readDemoPins();
      return conversationId
        ? getPinnedMessages(conversationId)
        : Promise.resolve(EMPTY_PINS);
    },
    initialData: demoMode ? readDemoPins : undefined,
  });
  if (simulateLiveTiming) {
    return { ...query, data: simulatedPins as unknown as MessageResponse[] };
  }
  return query;
}

export interface UseStarredMessagesOptions {
  /** The toolbar's RAW (not-yet-debounced) search text. Passed straight
   *  through to `starredMessagesFilter.ts`'s client-side pass in demo mode
   *  and for live mode's instant narrowing of whatever page has already
   *  landed; the hook debounces its own copy before it becomes part of the
   *  live query key, so a fast typist fans out only one request per pause
   *  in their typing. */
  q?: string;
  /** The toolbar's type tab. `"all"` means no server-side kind filter. */
  type?: StarredMessageFilterType;
}

export interface UseStarredMessagesResult {
  data: StarredMessagesResponse | undefined;
  /** True only while the FIRST page has no data yet (initial open). */
  isLoading: boolean;
  /** Live mode only, always false in demo mode: true while `data` cannot yet
   *  be trusted as the answer to the CURRENT `q`/`type`. Two windows set it:
   *  the 250ms debounce timer hasn't fired yet (`rawQuery` and
   *  `debouncedQuery` still differ), or it has fired but the server hasn't
   *  answered the new key yet (`isPlaceholderData`, held over from
   *  `keepPreviousData`). Every empty or no-match verdict the modal renders
   *  should be gated on this being false. */
  isSearchPending: boolean;
  /** Whether `data.items` still needs `filterStarredMessages` run over it
   *  client-side before it is safe to render: always true in demo mode (the
   *  server never narrows the list, so the client filter is the only
   *  filter), and true in live mode for exactly the `isSearchPending` window,
   *  when the still-visible page belongs to a stale key and can only ever be
   *  narrowed, its trustworthiness as the full answer still pending. Once
   *  live mode settles, `data.items` IS the answer and renders unfiltered.
   *  The two passes are not pixel-identical matchers: the client
   *  (`starredMessagesFilter.ts`) NFD-decomposes and strips combining marks,
   *  and scans "Links" over the 160-char `snippet`, while the server
   *  (`search-text.ts`) folds a fixed Latin-1 letter set and scans "Links"
   *  over the full body. A row can briefly appear during the debounce window
   *  and drop out again once the server's own page settles, or the reverse. */
  shouldFilterClientSide: boolean;
  isError: boolean;
  refetch: () => void;
  /** Live mode only; always false in demo mode (the whole list already
   *  comes back in one page). */
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** True when the most recent `fetchNextPage()` call failed. The loaded
   *  rows stay on screen either way, so the caller can render an inline
   *  retry in the load-more footer and keep the full error state for a
   *  first-page failure only. */
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** GET /messages/starred: the caller's private starred messages (PRD-374: now
 *  keyset-paginated and server-searchable). Demo derives the full list from
 *  the demo thread cache (`readDemoStarredMessages`) in one page and keeps
 *  filtering it client-side (`starredMessagesFilter.ts`), unchanged from
 *  before: there is no server to search or page against. Live mode fans
 *  `q`/`type` out to the server via `useInfiniteQuery`, debounced so typing
 *  doesn't fire a request per keystroke, and pages are merged
 *  (`mergeStarredMessagesPages`) into the same `{ items, conversations }`
 *  shape demo mode returns so `StarredMessagesModal` renders either
 *  identically. `isSearchPending`/`shouldFilterClientSide` tell the caller
 *  which of the two states it is in: while pending, `data.items` is a stale
 *  page that only `filterStarredMessages` can safely narrow for display
 *  (the server hit could be sitting on a page not yet fetched, so `snippet`
 *  is the only text available to check against); once settled, `data.items`
 *  IS the server's authoritative answer and renders as-is, matches beyond
 *  `snippet`'s 160 characters and all. */
export function useStarredMessages(
  enabled: boolean,
  options: UseStarredMessagesOptions = {},
): UseStarredMessagesResult {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const rawQuery = options.q ?? "";
  const trimmedRawQuery = rawQuery.trim();
  const type = options.type ?? "all";
  const debouncedQuery = useDebouncedValue(
    trimmedRawQuery,
    STARRED_SEARCH_DEBOUNCE_MS,
  );
  const serverType = type === "all" ? undefined : type;

  const demoQuery = useQuery<StarredMessagesResponse>({
    queryKey: ["starred-messages", demoMode],
    enabled: enabled && demoMode,
    queryFn: () => readDemoStarredMessages(queryClient),
    initialData: demoMode
      ? () => readDemoStarredMessages(queryClient)
      : undefined,
  });

  const liveQuery = useInfiniteQuery<StarredMessagesResponse>({
    queryKey: ["starred-messages", demoMode, debouncedQuery, type],
    enabled: enabled && !demoMode,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      getStarredMessages({
        q: debouncedQuery || undefined,
        type: serverType,
        cursor: pageParam as string | undefined,
        signal,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // A starred search result is short-lived context worth caching only
    // briefly; mirrors `useMessageSearch`'s own cross-inbox search staleTime.
    staleTime: 15_000,
    // Keeps the PREVIOUS key's pages on screen while a new `q`/`type` key
    // fetches (`isPlaceholderData` flips true, `data` does not go
    // undefined). Without this, changing the key blanks `data` for the round
    // trip and the modal's client-side filter would flash "no matches" on
    // the empty list, when it should be narrowing the still-visible previous
    // results instead.
    placeholderData: keepPreviousData,
  });

  const mergedLiveData = useMemo(
    () =>
      liveQuery.data
        ? mergeStarredMessagesPages(liveQuery.data.pages)
        : undefined,
    [liveQuery.data],
  );
  const isSearchPending =
    !demoMode &&
    (trimmedRawQuery !== debouncedQuery || liveQuery.isPlaceholderData);

  if (demoMode) {
    return {
      data: demoQuery.data,
      isLoading: demoQuery.isLoading,
      isSearchPending: false,
      shouldFilterClientSide: true,
      isError: demoQuery.isError,
      refetch: () => void demoQuery.refetch(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      fetchNextPage: () => {},
    };
  }
  return {
    data: mergedLiveData,
    isLoading: liveQuery.isLoading,
    isSearchPending,
    shouldFilterClientSide: isSearchPending,
    isError: liveQuery.isError,
    refetch: () => void liveQuery.refetch(),
    hasNextPage: liveQuery.hasNextPage ?? false,
    isFetchingNextPage: liveQuery.isFetchingNextPage,
    isFetchNextPageError: liveQuery.isFetchNextPageError,
    fetchNextPage: () => void liveQuery.fetchNextPage(),
  };
}

export interface PinInput {
  messageId: string;
  /** Whether the message is currently pinned — decides pin vs. unpin. */
  pinned: boolean;
}

/** Pin/unpin a message (SHARED). Patches the in-bubble indicator on success
 *  and refreshes the pinned-messages banner; the counterpart is reconciled by
 *  the `message:pinned` socket frame. Toasts on success (DES-211): every
 *  entry point (long-press overlay, desktop context menu, the photo viewer)
 *  shares this one hook, so the toast fires exactly once per toggle no
 *  matter which entry point triggered it. The toast doubles as the
 *  screen-reader announcement, since `ToastProvider` already renders a live
 *  region for it. A failed toggle is already toasted by the app-wide
 *  mutation-error handler (`handleMutationError` in
 *  `shared/api/errorHandling.ts`); this only adds the success side, keeping
 *  exactly one toast per outcome. That handler is silent in demo mode, so a
 *  demo pin the server would refuse (`demoActionGuards.ts`) toasts here. */
export function useTogglePin(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const targetConversationId = (messageId: string) =>
    demoMode
      ? demoTargetConversationId(conversationId, messageId)
      : conversationId;
  return useMutation<void, Error, PinInput>({
    mutationFn: async ({ messageId, pinned }) => {
      const target = targetConversationId(messageId);
      if (!target) return;
      if (demoMode) {
        assertDemoActionAllowed(queryClient, target, messageId, "pin");
        return;
      }
      if (pinned) await unpinMessage(target, messageId);
      else await pinMessage(target, messageId);
    },
    onError: (error) => {
      if (error instanceof DemoActionRefusedError) {
        showToast(t("shared:apiError.forbidden"), "error");
      }
    },
    onSuccess: (_result, { messageId, pinned }) => {
      const target = targetConversationId(messageId);
      if (!target) return;
      patchMessagePinned(
        queryClient,
        target,
        messageId,
        pinned ? null : new Date().toISOString(),
      );
      void queryClient.invalidateQueries({
        queryKey: ["conversation-pins", target],
      });
      showToast(
        pinned
          ? t("messages:pinned.toastUnpinned")
          : t("messages:pinned.toastPinned"),
      );
    },
  });
}

export interface StarInput {
  messageId: string;
  /** Whether the message is currently starred — decides star vs. unstar. */
  starred: boolean;
}

/** Star/unstar a message (PRIVATE). Patches the owner-only indicator on
 *  success and refreshes the starred-messages list. No socket: stars stay on
 *  the caller's device. Toasts on success (DES-211); see `useTogglePin`'s
 *  doc for why this is the one place that does, and why errors aren't
 *  toasted again here. */
export function useToggleStar(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const targetConversationId = (messageId: string) =>
    demoMode
      ? demoTargetConversationId(conversationId, messageId)
      : conversationId;
  return useMutation<void, Error, StarInput>({
    mutationFn: async ({ messageId, starred }) => {
      const target = targetConversationId(messageId);
      if (!target) return;
      if (demoMode) {
        assertDemoActionAllowed(queryClient, target, messageId, "star");
        rememberDemoStarToggle(messageId, !starred);
        return;
      }
      if (starred) await unstarMessage(target, messageId);
      else await starMessage(target, messageId);
    },
    // The app-wide mutation error toast is silent in demo mode, so a demo
    // star the server would refuse (`demoActionGuards.ts`) toasts here.
    onError: (error) => {
      if (error instanceof DemoActionRefusedError) {
        showToast(t("shared:apiError.forbidden"), "error");
      }
    },
    onSuccess: (_result, { messageId, starred }) => {
      const target = targetConversationId(messageId);
      if (!target) return;
      patchMessageStarred(queryClient, target, messageId, !starred);
      void queryClient.invalidateQueries({ queryKey: ["starred-messages"] });
      showToast(
        starred
          ? t("messages:starred.toastUnstarred")
          : t("messages:starred.toastStarred"),
      );
    },
  });
}
