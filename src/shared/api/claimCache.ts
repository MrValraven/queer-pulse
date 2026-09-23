import type { QueryClient } from "@tanstack/react-query";
import type { Conversation } from "../../features/messages/data";
import type { ClaimState } from "./conversationClaim";

/** The row with `state` applied when it is the thread, the same row otherwise. */
function withClaim<Row extends Conversation>(
  row: Row,
  conversationId: string,
  state: ClaimState,
): Row {
  return row.id === conversationId ? { ...row, ...state } : row;
}

/**
 * Write a thread's claim into every cached inbox list (each mailbox scope has
 * its own `["conversations", ...]` entry) and into its detail entry, shaped
 * like `patchConversationPinned` in messageCache.ts. A list without the
 * thread keeps its array identity, and every other row keeps its object
 * identity, so nothing re-renders that did not change. A no-op for entries
 * that are not cached.
 */
export function patchConversationClaim(
  queryClient: QueryClient,
  conversationId: string,
  state: ClaimState,
): void {
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) => {
      if (!previous?.some((row) => row.id === conversationId)) {
        return previous;
      }
      return previous.map((row) => withClaim(row, conversationId, state));
    },
  );
  queryClient.setQueriesData<Conversation>(
    { queryKey: ["conversation-detail", conversationId] },
    (previous) =>
      previous ? withClaim(previous, conversationId, state) : previous,
  );
}

/**
 * Applied `conversation:claim` frames per thread. The counter is the whole
 * ordering contract between frames and claim REST responses: a caller
 * snapshots `claimFrameCount` before its request and drops the response once
 * the count has moved, because a frame that landed meanwhile is newer truth.
 * No clock comparison is used, because server and client clocks differ.
 */
const claimFramesByConversationId = new Map<string, number>();

export function recordClaimFrame(conversationId: string): void {
  claimFramesByConversationId.set(
    conversationId,
    claimFrameCount(conversationId) + 1,
  );
}

export function claimFrameCount(conversationId: string): number {
  return claimFramesByConversationId.get(conversationId) ?? 0;
}

/** Test seam: forget every counted frame. */
export function resetClaimFrames(): void {
  claimFramesByConversationId.clear();
}
