// src/features/messages/useConversationSheetTargets.ts
import { useEffect, useState } from "react";
import { registerWhoReactedOpener } from "./whoReacted";

/**
 * The two message sheets `ConversationOverlays` opens itself: "Info"
 * (PRD-351) and "who reacted" (PRD-352). Each holds the server id of its
 * message, so the surface re-reads the live thread instead of a snapshot.
 *
 * `ConversationPanel` stays mounted across a thread switch, so both targets
 * are cleared when `conversationId` changes. Without that, a sheet open in
 * one thread would hide in the next (its message is absent there) and pop
 * back open on return.
 */
export function useConversationSheetTargets(conversationId: string) {
  const [infoTargetId, setInfoTargetId] = useState<string | null>(null);
  // Also opened through the `whoReacted` channel, by a long-press on a
  // bubble's reaction chips.
  const [reactionsTargetId, setReactionsTargetId] = useState<string | null>(
    null,
  );
  useEffect(() => registerWhoReactedOpener(setReactionsTargetId), []);
  // Adjusted during render, so the stale sheet never paints in the new thread.
  const [targetsConversationId, setTargetsConversationId] =
    useState(conversationId);
  if (targetsConversationId !== conversationId) {
    setTargetsConversationId(conversationId);
    setInfoTargetId(null);
    setReactionsTargetId(null);
  }
  return {
    infoTargetId,
    setInfoTargetId,
    reactionsTargetId,
    setReactionsTargetId,
  };
}
