import type { QueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import {
  patchConversationPreview,
  upsertMessage,
  withMessagePreview,
} from "../../../shared/api/messageCache";
import {
  demoOutgoingMessageResponse,
  ensureDemoThreadStore,
} from "../api/demoThreadCache";
import type { ConversationWithPreview } from "../api/messages.adapters";

/** The newest demo share landed in each thread this page session, in landing
 *  order (oldest first). The demo inbox rebuilds its rows from the static
 *  seed on every refetch, so `withLandedDemoShares` folds these back in. */
const landedShareByConversationId = new Map<string, MessageResponse>();

/**
 * A demo share lands in its thread the way a live send's ack does: the
 * session store is created from the seed first (so the patch reaches it as
 * well as any rendered page), then the message is upserted into every
 * `["messages", id]` entry and the inbox row moves to the top with the new
 * preview. Nothing touches the network.
 */
export function landDemoShare(
  queryClient: QueryClient,
  conversationId: string,
  body: string,
  clientMessageId: string,
  createdAt: string = new Date().toISOString(),
): MessageResponse {
  ensureDemoThreadStore(queryClient, conversationId);
  const message = demoOutgoingMessageResponse(
    conversationId,
    body,
    clientMessageId,
    createdAt,
  );
  upsertMessage(queryClient, conversationId, message);
  patchConversationPreview(queryClient, conversationId, message);
  // Deleting first moves a thread shared to again to the end of the order.
  landedShareByConversationId.delete(conversationId);
  landedShareByConversationId.set(conversationId, message);
  return message;
}

/** The demo inbox rows with every landed share applied the way
 *  `patchConversationPreview` applied it: the share's preview on the row and
 *  the row moved to the top, the newest share first. A thread the rows do not
 *  hold (deleted, or in another mailbox) is left out. */
export function withLandedDemoShares(
  rows: ConversationWithPreview[],
): ConversationWithPreview[] {
  let ordered = rows;
  for (const [conversationId, message] of landedShareByConversationId) {
    const row = ordered.find((candidate) => candidate.id === conversationId);
    if (!row) continue;
    ordered = [
      withMessagePreview(row, message),
      ...ordered.filter((candidate) => candidate.id !== conversationId),
    ];
  }
  return ordered;
}

/** Forgets every landed share. Tests call it between cases. */
export function resetLandedDemoShares(): void {
  landedShareByConversationId.clear();
}
