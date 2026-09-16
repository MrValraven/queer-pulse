import { useRef } from "react";
import { messageIdentity } from "./messageRows";
import type { ChatMessage } from "./data";

interface DividerLatch {
  threadId: string;
  /** The server unread count as it stood on the thread's first render. */
  count: number;
  /** The viewer's own read watermark as it stood on the thread's first
   *  render, before any mark-read for this open advances it. */
  watermarkMs: number | null;
  isLatched: boolean;
  anchorKey: string | undefined;
}

/** `undefined` while the loaded history cannot yet prove where the boundary
 *  is; otherwise the anchor's identity, or `null` for "no divider". */
type AnchorResolution = string | null | undefined;

/** Where the divider goes, and whether that is decided yet. */
export interface UnreadDividerResolution {
  /** `messageIdentity` of the message the divider sits before, if any. */
  anchorKey: string | undefined;
  /** True once the divider has latched, to an anchor or to "no divider", so
   *  a caller can tell "none" apart from "not decided yet". */
  isResolved: boolean;
}

/** Whether a message can head the divider: someone else sent it, and it is a
 *  bubble. The reader's own message and a system pill never can. */
function canAnchorDivider(message: ChatMessage): boolean {
  return message.from === "them" && message.kind !== "system";
}

/** A send this client has not had confirmed yet (queued, failed, or a forward
 *  just sent): it has a client id and no server id. It can render before
 *  history loads, so it says nothing about where the unread boundary is.
 *  Demo mock messages carry neither id and still count. */
function isUnconfirmedSend(message: ChatMessage): boolean {
  return message.localId !== undefined && message.id === undefined;
}

/**
 * Live rule: the first message, oldest to newest, that can anchor the divider
 * (`canAnchorDivider`) after the frozen watermark. It only counts once the
 * loaded history provably contains the boundary: a loaded message at or
 * before the watermark exists, or there is nothing older left to page in.
 * Before that, the true first unread may still be in an unloaded page (a
 * reopened thread's cache is trimmed to its newest page, so this is common).
 * With a frozen unread count and nothing anchorable after the watermark yet,
 * it keeps waiting until history runs out.
 */
function resolveFromWatermark(
  flatMessages: ChatMessage[],
  watermarkMs: number,
  count: number,
  hasOlderHistory: boolean,
): AnchorResolution {
  let hasBoundary = false;
  for (let index = 0; index < flatMessages.length; index += 1) {
    const message = flatMessages[index]!;
    if (isUnconfirmedSend(message)) continue;
    const createdMs = message.at ? Date.parse(message.at) : Number.NaN;
    if (Number.isNaN(createdMs)) continue;
    if (createdMs <= watermarkMs) {
      hasBoundary = true;
      continue;
    }
    if (!canAnchorDivider(message)) continue;
    if (!hasBoundary && hasOlderHistory) return undefined;
    return messageIdentity(message, index);
  }
  if (!hasOlderHistory) return null;
  // Marked unread by hand with no count: nothing more to wait for.
  if (hasBoundary && count <= 0) return null;
  return undefined;
}

/**
 * Fallback rule, for any thread without a watermark (most demo rows seed no
 * `myLastReadAt`; the long demo thread does): count the frozen unread
 * total back from the end of the list, then step forward to the first message
 * that can anchor the divider. The resulting message's IDENTITY is what gets
 * latched, since the list keeps growing as the reader replies and a live
 * cache patch can rebuild message objects. With no older history to page in,
 * a count longer than the list starts from its first message.
 */
function resolveFromCount(
  flatMessages: ChatMessage[],
  count: number,
  hasOlderHistory: boolean,
): AnchorResolution {
  // Marked unread by hand with no count: nothing to place by counting.
  if (count <= 0) return null;
  const confirmedIndexes: number[] = [];
  flatMessages.forEach((message, index) => {
    if (!isUnconfirmedSend(message)) confirmedIndexes.push(index);
  });
  if (confirmedIndexes.length < count && hasOlderHistory) return undefined;
  const startPosition = Math.max(0, confirmedIndexes.length - count);
  for (
    let position = startPosition;
    position < confirmedIndexes.length;
    position += 1
  ) {
    const index = confirmedIndexes[position]!;
    const message = flatMessages[index]!;
    if (canAnchorDivider(message)) return messageIdentity(message, index);
  }
  return null;
}

/**
 * Where the "New messages" divider sits: the `messageIdentity` of the message
 * it precedes, plus whether that is decided. `buildMessageRows` resolves the
 * identity back to a message on every build, so the divider survives socket
 * frames, reactions, edits and sends that replace every `ChatMessage` object.
 *
 * Latched once per open thread: after it resolves (to an anchor or to "no
 * divider"), neither the reader's own replies nor new live messages move it.
 * It resets only when the thread changes. A thread that opened with nothing
 * unread (no unread count and not marked unread) gets no divider even when
 * it has a watermark, because the cached watermark can lag a local mark-read.
 * Nothing resolves before `isHistoryReady`: a reopened thread first renders
 * its stale cached page, which cannot show what arrived while it was closed.
 */
export function useUnreadDivider(
  flatMessages: ChatMessage[],
  activeId: string,
  unreadCount: number,
  isFlaggedUnread: boolean,
  myLastReadAt: string | null | undefined,
  hasOlderHistory: boolean,
  /** Page 0 is current and its last fetch succeeded. */
  isHistoryReady: boolean,
): UnreadDividerResolution {
  const latchRef = useRef<DividerLatch>({
    threadId: "",
    count: 0,
    watermarkMs: null,
    isLatched: true,
    anchorKey: undefined,
  });

  // This hook DELIBERATELY reads and writes the ref during render. It latches
  // state ACROSS renders (the unread count and read watermark frozen on the
  // thread's first render, before openThread's mark-read moves them, then the
  // anchor identity once the history can prove it) and must return that
  // anchor synchronously on the SAME render that builds the rows, which the
  // initial scroll lands on. Deferring these writes into an effect would place
  // the divider a render late. The writes are guarded (thread-change reset,
  // and a one-shot `isLatched` latch) so they are idempotent and cannot loop.
  // It relies on a thread switch being a sync-lane update, never a transition:
  // a discarded transition render would have reset the latch for a thread
  // that never committed.
  /* eslint-disable react-hooks/refs -- intentional, guarded cross-render latch that must be computed synchronously during render; see note above. */
  if (latchRef.current.threadId !== activeId) {
    const watermarkMs = myLastReadAt ? Date.parse(myLastReadAt) : Number.NaN;
    latchRef.current = {
      threadId: activeId,
      count: unreadCount,
      watermarkMs: Number.isNaN(watermarkMs) ? null : watermarkMs,
      // Nothing unread when the thread opened means no divider for this open.
      isLatched: unreadCount <= 0 && !isFlaggedUnread,
      anchorKey: undefined,
    };
  }
  const latch = latchRef.current;
  if (
    !latch.isLatched &&
    isHistoryReady &&
    flatMessages.some((message) => !isUnconfirmedSend(message))
  ) {
    const resolution =
      latch.watermarkMs === null
        ? resolveFromCount(flatMessages, latch.count, hasOlderHistory)
        : resolveFromWatermark(
            flatMessages,
            latch.watermarkMs,
            latch.count,
            hasOlderHistory,
          );
    if (resolution !== undefined) {
      latch.isLatched = true;
      latch.anchorKey = resolution ?? undefined;
    }
  }
  return { anchorKey: latch.anchorKey, isResolved: latch.isLatched };
  /* eslint-enable react-hooks/refs */
}
