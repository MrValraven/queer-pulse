// src/features/messages/useGalleryPhotoJumpHandoff.ts
import { useEffect, useRef, useState } from "react";
import {
  getJumpGeneration,
  useIsMessageHighlighted,
  useJumpGeneration,
  useMessageJumpPhase,
  type MessageJumpPhase,
} from "./messageJumpStore";
import type { MessageGroup } from "./useMessagesController.helpers";
import type { ChatMessage } from "./data";

/** Outcomes `messageJumpHunt` reports when it gives up looking. `"finding"`
 *  means the hunt is still paging back and is deliberately excluded. */
const JUMP_FAILURE_PHASES: ReadonlySet<MessageJumpPhase> = new Set([
  "notFound",
  "tooFar",
  "loadFailed",
]);

interface PendingPhotoJump {
  messageId: string;
  /** The jump generation `messageJumpHunt`'s `jump()` minted for this
   *  request, captured right after starting it. A later jump, whether this
   *  hand-off's own next tap or any other jump entry point (reply-quote,
   *  pinned banner, search), bumps the generation again and can end without
   *  publishing an outcome of its own (a reader takeover, a row that leaves
   *  the loaded rows mid-settle, the final mount grace running out). The
   *  generation moving on is the general signal this intent has gone stale,
   *  covering those silent endings alongside an explicit failure phase or a
   *  fresh highlight on the same message id from an unrelated later jump. */
  generation: number;
}

/**
 * Hands a media-gallery photo tap for an UNLOADED message over to the
 * thread's jump-to-message hunt, then opens the full-screen viewer the
 * moment that jump actually lands on the target, signalled by the same
 * highlight flash `revealMessageRow` fires once the row has settled
 * (PRD-373). A jump that cannot reach the message (deleted, moderated, or
 * exhausts history) shows the hunt's own status pill on screen, with nothing
 * opened.
 *
 * Owns one pending intent at a time, tied to its own jump generation: a
 * fresh call replaces whatever was pending, a later jump of any kind
 * supersedes it the moment `messageJumpStore`'s generation moves on, and
 * leaving the conversation the jump was chasing clears it too. Together
 * these keep a stale hand-off from ever opening the wrong photo, or a photo
 * in a thread the member has since left.
 */
export function useGalleryPhotoJumpHandoff(
  conversationId: string,
  messageGroups: MessageGroup[],
  openImage: (message: ChatMessage, origin?: HTMLElement | null) => void,
  jumpToMessage: (messageId: string) => boolean,
): (messageId: string) => void {
  const [pending, setPending] = useState<PendingPhotoJump | null>(null);
  // Read inside the effect below, so only arrival (the highlight turning on)
  // triggers it. Assigned inside an effect too (render-time assignment trips
  // `react-hooks/refs`), mirroring `useAttachmentUploadQueue`'s own
  // `callbacksRef`.
  const messageGroupsRef = useRef(messageGroups);
  useEffect(() => {
    messageGroupsRef.current = messageGroups;
  });

  const hasArrived = useIsMessageHighlighted(pending?.messageId);
  const jumpPhase = useMessageJumpPhase(conversationId);
  const currentGeneration = useJumpGeneration();

  // Arrival: the jump landed on the target and `messageJumpStore` flashed its
  // ring, a genuine external-system sync from the jump hunt running outside
  // React. Only accepted while the generation still matches this hand-off's
  // own jump, so a later, unrelated jump that happens to land on the same
  // message id can never pop the viewer open on this hand-off's behalf.
  useEffect(() => {
    if (!pending || !hasArrived || currentGeneration !== pending.generation) {
      return;
    }
    const target = pending.messageId;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clears the pending intent the moment the jump's own highlight (an external, non-React signal) confirms arrival; nothing to derive during render.
    setPending(null);
    const message = messageGroupsRef.current
      .flatMap((group) => group.items)
      .find((item) => item.id === target || item.localId === target);
    if (message) openImage(message);
  }, [pending, hasArrived, currentGeneration, openImage]);

  // Failure: the hunt gave up looking and published a failure phase.
  useEffect(() => {
    if (!pending || !jumpPhase || !JUMP_FAILURE_PHASES.has(jumpPhase)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors messageJumpStore's own failure phase, another external, non-React signal.
    setPending(null);
  }, [pending, jumpPhase]);

  // Superseded: a later jump started before this one arrived or failed.
  useEffect(() => {
    if (!pending || currentGeneration === pending.generation) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors messageJumpStore's own generation counter, another external, non-React signal.
    setPending(null);
  }, [pending, currentGeneration]);

  // The member left the conversation the pending jump belongs to.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the pending intent on thread switch, mirrors useTypingIndicator's own reset-on-thread-switch effect.
    setPending(null);
  }, [conversationId]);

  return (messageId: string) => {
    jumpToMessage(messageId);
    // Read right after starting the jump, which mints the generation this
    // request owns synchronously (`messageJumpHunt`'s `jump()`).
    setPending({ messageId, generation: getJumpGeneration() });
  };
}
