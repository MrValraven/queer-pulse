// src/features/messages/api/threadWindow.ts
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "./messages.api";
import {
  getMessages,
  getMessagesAround,
  getMessagesNewer,
} from "./messages.api";
import {
  DEMO_OLDER_PAGE_DELAY_MS,
  DEMO_THREAD_PAGE_SIZE,
  demoThreadPage,
  ensureDemoThreadStore,
  waitForDemoRoundTrip,
} from "./demoThreadCache";
import type { MessagePage } from "./threadCacheTrim";
import { ApiError } from "../../../shared/api/client";

// ── PRD-401 detached history window ──────────────────────────────────────────
// A jump to a message older than the loaded pages fetches one window centred
// on it (`GET …/messages?around=`) into its own infinite query, keyed under
// the thread's `["messages", id]` prefix so every `messageCache.ts` patch
// (edit, reaction, delete, hide, pin) reaches it too. Pages are newest-first
// like the live thread: `fetchNextPage` pages older, `fetchPreviousPage`
// pages newer. A page whose `newerCursor` is set is NOT the live tail, and
// `messageCache.ts`'s `insertInOrder` refuses to append a newer live message
// to it, so a message that arrives while the window is shown lands only in
// the live query. The window is merged into the live query once it reaches
// the tail (`mergeWindowIntoLiveThread`) and dropped when the reader returns
// to the latest message.

/** Messages per newer page of a window: the server's default page size. */
export const THREAD_WINDOW_NEWER_PAGE_SIZE = 30;

/** One window page. `newerCursor` is null once the page reaches the newest
 *  message (live: `after|afterId`; demo: the demo store's own cursor). */
export interface ThreadWindowPage extends MessagePage {
  newerCursor: string | null;
}

export type ThreadWindowPageParam =
  | { direction: "around"; messageId: string }
  | { direction: "older"; cursor: string }
  | { direction: "newer"; cursor: string };

export type ThreadWindowData = InfiniteData<
  ThreadWindowPage,
  ThreadWindowPageParam
>;

export function threadWindowKey(
  conversationId: string,
  demoMode: boolean,
  anchorMessageId: string,
) {
  return ["messages", conversationId, demoMode, "window", anchorMessageId];
}

function splitCursor(cursor: string): { createdAt: string; id: string } {
  const separatorIndex = cursor.lastIndexOf("|");
  return {
    createdAt: cursor.slice(0, separatorIndex),
    id: cursor.slice(separatorIndex + 1),
  };
}

function plainCursor(message: MessageResponse): string {
  return `${message.createdAt}|${message.id}`;
}

function isNewerThan(message: MessageResponse, cursor: string): boolean {
  const { createdAt, id } = splitCursor(cursor);
  return (
    message.createdAt > createdAt ||
    (message.createdAt === createdAt && message.id > id)
  );
}

async function fetchLiveWindowPage(
  conversationId: string,
  pageParam: ThreadWindowPageParam,
  signal: AbortSignal,
): Promise<ThreadWindowPage> {
  if (pageParam.direction === "around") {
    const aroundPage = await getMessagesAround(
      conversationId,
      pageParam.messageId,
      signal,
    );
    const { hasMore, nextCursor, hasNewer, newerAfter, newerAfterId } =
      aroundPage.pageInfo;
    return {
      items: aroundPage.data,
      nextCursor: hasMore && nextCursor ? nextCursor : null,
      newerCursor:
        hasNewer && newerAfter && newerAfterId
          ? `${newerAfter}|${newerAfterId}`
          : null,
    };
  }
  if (pageParam.direction === "older") {
    const page = await getMessages(conversationId, pageParam.cursor, signal);
    const { hasMore, nextCursor } = page.pageInfo;
    return {
      items: page.data,
      nextCursor: hasMore && nextCursor ? nextCursor : null,
      newerCursor: null,
    };
  }
  const { createdAt, id } = splitCursor(pageParam.cursor);
  const oldestFirst = await getMessagesNewer(
    conversationId,
    createdAt,
    id,
    THREAD_WINDOW_NEWER_PAGE_SIZE,
    signal,
  );
  const items = [...oldestFirst].reverse();
  const newest = items[0];
  const oldest = items.at(-1);
  return {
    items,
    // Only a refetch of the window reads this: it re-pages older from here.
    // The DTO carries milliseconds, which the server's history cursor accepts.
    nextCursor: oldest ? btoa(plainCursor(oldest)) : null,
    newerCursor:
      newest && oldestFirst.length >= THREAD_WINDOW_NEWER_PAGE_SIZE
        ? plainCursor(newest)
        : null,
  };
}

/** The demo counterpart, served from the demo session store with the same
 *  simulated round trip an older demo page takes. */
async function fetchDemoWindowPage(
  queryClient: QueryClient,
  conversationId: string,
  pageParam: ThreadWindowPageParam,
  signal: AbortSignal,
): Promise<ThreadWindowPage> {
  await waitForDemoRoundTrip(DEMO_OLDER_PAGE_DELAY_MS, signal);
  const newestFirst = ensureDemoThreadStore(queryClient, conversationId);
  if (pageParam.direction === "older") {
    return {
      ...demoThreadPage(newestFirst, pageParam.cursor),
      newerCursor: null,
    };
  }
  let newestIndex: number;
  let oldestIndex: number;
  if (pageParam.direction === "around") {
    const targetIndex = newestFirst.findIndex(
      (message) => message.id === pageParam.messageId,
    );
    if (targetIndex === -1) throw new ApiError(404, "Message not found");
    const olderCount = Math.floor((DEMO_THREAD_PAGE_SIZE - 1) / 2);
    const newerCount = DEMO_THREAD_PAGE_SIZE - 1 - olderCount;
    newestIndex = Math.max(0, targetIndex - newerCount);
    oldestIndex = Math.min(newestFirst.length - 1, targetIndex + olderCount);
  } else {
    const cursor = pageParam.cursor;
    const firstNotNewer = newestFirst.findIndex(
      (message) => !isNewerThan(message, cursor),
    );
    const boundary = firstNotNewer === -1 ? newestFirst.length : firstNotNewer;
    newestIndex = Math.max(0, boundary - THREAD_WINDOW_NEWER_PAGE_SIZE);
    oldestIndex = boundary - 1;
  }
  const items = newestFirst.slice(newestIndex, oldestIndex + 1);
  const newest = items[0];
  const oldest = items.at(-1);
  return {
    items,
    nextCursor:
      oldest && oldestIndex < newestFirst.length - 1
        ? plainCursor(oldest)
        : null,
    newerCursor: newest && newestIndex > 0 ? plainCursor(newest) : null,
  };
}

/** The window query's options, shared by the prefetch that opens a window
 *  and the observer that renders it, so both address one cache entry. */
export function threadWindowQueryOptions(
  queryClient: QueryClient,
  conversationId: string,
  demoMode: boolean,
  anchorMessageId: string,
) {
  return {
    queryKey: threadWindowKey(conversationId, demoMode, anchorMessageId),
    initialPageParam: {
      direction: "around",
      messageId: anchorMessageId,
    } as ThreadWindowPageParam,
    queryFn: ({
      pageParam,
      signal,
    }: {
      pageParam: ThreadWindowPageParam;
      signal: AbortSignal;
    }) =>
      demoMode
        ? fetchDemoWindowPage(queryClient, conversationId, pageParam, signal)
        : fetchLiveWindowPage(conversationId, pageParam, signal),
    getNextPageParam: (lastPage: ThreadWindowPage) =>
      lastPage.nextCursor
        ? ({ direction: "older", cursor: lastPage.nextCursor } as const)
        : undefined,
    getPreviousPageParam: (firstPage: ThreadWindowPage) =>
      firstPage.newerCursor
        ? ({ direction: "newer", cursor: firstPage.newerCursor } as const)
        : undefined,
    // A missing message stays missing: retrying a 404 only delays the notice.
    retry: (failureCount: number, error: Error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  };
}

function isNewerMessage(
  candidate: MessageResponse,
  reference: MessageResponse,
): boolean {
  return (
    candidate.createdAt > reference.createdAt ||
    (candidate.createdAt === reference.createdAt && candidate.id > reference.id)
  );
}

/**
 * A window that has paged newer up to the tail becomes the live thread: its
 * pages replace the live query's, topped with any live message newer than
 * the window's newest (one that arrived while the window was shown, which
 * the window itself refused). The rows on screen keep their ids, so the
 * reader's place survives the switch back to the live query. Repeats across
 * window pages are dropped (a newer page's millisecond boundary can repeat
 * the previous page's newest row).
 */
export function mergeWindowIntoLiveThread(
  queryClient: QueryClient,
  liveKey: readonly unknown[],
  windowData: ThreadWindowData,
): void {
  const seenIds = new Set<string>();
  const windowPages: MessagePage[] = windowData.pages.map((page) => ({
    items: page.items.filter((message) => {
      if (seenIds.has(message.id)) return false;
      seenIds.add(message.id);
      return true;
    }),
    nextCursor: page.nextCursor,
  }));
  const newestInWindow = windowPages.find((page) => page.items.length > 0)
    ?.items[0];
  queryClient.setQueryData<InfiniteData<MessagePage>>(liveKey, (live) => {
    const newerLive = (live?.pages ?? [])
      .flatMap((page) => page.items)
      .filter(
        (message) =>
          !seenIds.has(message.id) &&
          (!newestInWindow || isNewerMessage(message, newestInWindow)),
      );
    const [firstPage, ...olderPages] = windowPages;
    const pages = [
      {
        items: [...newerLive, ...(firstPage?.items ?? [])],
        nextCursor: firstPage?.nextCursor ?? null,
      },
      ...olderPages,
    ];
    return {
      pages,
      pageParams: [
        undefined,
        ...pages.slice(0, -1).map((page) => page.nextCursor ?? undefined),
      ],
    };
  });
}
