// src/features/messages/messageRows.ts
import { buildTimeline, type MessageRun } from "./messageRuns";
import type { ChatMessage } from "./data";

/**
 * One flattened, independently-virtualizable row of the message log. Before
 * virtualization, `MessageArea` nested a day's runs inside a `.dayGroup` >
 * `.runs` flex column (the unread divider and the group "Seen by" line were
 * plain flex SIBLINGS of a run inside that same `.runs` container — see the
 * git history of `MessageArea.tsx`). `@tanstack/react-virtual` needs one flat,
 * stably-keyed array instead, so every one of those siblings becomes its own
 * `MessageRow` here; `gapAfterRow` below reproduces the exact three gap values
 * that flexbox used to give for free (10px around a day boundary, 12px between
 * ordinary content, 0 for the very last row, where `.areaContent`'s own gap to
 * the typing row still applies).
 */
export type MessageRow =
  | { kind: "daySeparator"; key: string; day: string }
  | { kind: "unreadDivider"; key: string }
  | { kind: "run"; key: string; day: string; run: MessageRun }
  | { kind: "system"; key: string; day: string; message: ChatMessage }
  | { kind: "groupSeenBy"; key: string };

/**
 * Stable identity for a message across its whole lifetime, and the ONE
 * identity every row key and the unread divider's anchor are matched on.
 *
 * The client-generated `localId` comes first because an acked send KEEPS it
 * (`messageToChat` carries it over) while its server `id` only appears on the
 * ack, so preferring `id` flipped the row key at the ack and remounted the
 * just-sent run. Same order as the gallery's `ViewerPhoto.key`. The server
 * `id` covers everything this client did not send, `at` covers a message with
 * neither, and the position in the flattened loaded list is the last resort
 * for demo mock messages, which carry none of the three. That position is
 * stable in demo mode because demo history never pages older messages in.
 */
export function messageIdentity(
  message: ChatMessage,
  flatIndex: number,
): string {
  return message.localId ?? message.id ?? message.at ?? `pos-${flatIndex}`;
}

/** Index of the last message in `items` that is not a soft-deleted tombstone,
 *  or -1. A tombstone renders no meta, so the read/delivered escalation has
 *  to ride the newest bubble that can still show it. */
export function lastUndeletedIndex(items: ChatMessage[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]!.deletedAt) return index;
  }
  return -1;
}

/**
 * Flattens `messageGroups` (day → messages) into the ordered row list the
 * virtualizer renders, reproducing exactly what the pre-virtualization JSX
 * produced: a day separator, then each day's timeline blocks (via the SAME
 * `buildTimeline` grouping pass `MessageRun.tsx` always used), with the
 * one-time unread divider inserted immediately before the block headed by the
 * message whose `messageIdentity` is `dividerAnchorKey`, and the group "Seen
 * by" line immediately after the run whose newest undeleted item is
 * `lastOutbound`.
 */
export function buildMessageRows(
  messageGroups: { day: string; items: ChatMessage[] }[],
  dividerAnchorKey: string | undefined,
  lastOutbound: ChatMessage | undefined,
  isGroup: boolean | undefined,
  hasGroupSeenBy: boolean,
): MessageRow[] {
  const rows: MessageRow[] = [];
  let flatOffset = 0;
  for (const group of messageGroups) {
    rows.push({
      kind: "daySeparator",
      key: `day-sep-${group.day}`,
      day: group.day,
    });
    const identities = new Map<ChatMessage, string>();
    let dividerAnchor: ChatMessage | undefined;
    group.items.forEach((message, index) => {
      const identity = messageIdentity(message, flatOffset + index);
      identities.set(message, identity);
      if (identity === dividerAnchorKey) dividerAnchor = message;
    });
    flatOffset += group.items.length;
    // The anchor is resolved from its identity on every build, so a live cache
    // patch that rebuilds every `ChatMessage` object still finds it. The object
    // it resolves to belongs to THIS build, which is what `buildTimeline`'s
    // `breakBefore` compares against.
    const blocks = buildTimeline(group.items, undefined, dividerAnchor);
    for (const block of blocks) {
      const head = block.kind === "run" ? block.run.items[0] : block.message;
      if (dividerAnchor !== undefined && head === dividerAnchor) {
        rows.push({ kind: "unreadDivider", key: "unread-divider" });
      }
      if (block.kind === "system") {
        rows.push({
          kind: "system",
          key: identities.get(block.message) ?? `sys-${rows.length}`,
          day: group.day,
          message: block.message,
        });
        continue;
      }
      const runItems = block.run.items;
      rows.push({
        kind: "run",
        key: identities.get(runItems[0]!) ?? `run-${rows.length}`,
        day: group.day,
        run: block.run,
      });
      const receiptItem = runItems[lastUndeletedIndex(runItems)];
      if (
        isGroup &&
        hasGroupSeenBy &&
        receiptItem !== undefined &&
        receiptItem === lastOutbound
      ) {
        rows.push({
          kind: "groupSeenBy",
          key: `group-seen-by-${identities.get(receiptItem) ?? "x"}`,
        });
      }
    }
  }
  return rows;
}

/** Row index of the block containing `messageId`, or -1 if it isn't in any
 *  currently-loaded row (either genuinely not loaded, an older unpaged
 *  message, or a bug). The jump hunter (`messageJumpHunt.ts`) uses it to decide
 *  between revealing a loaded message and paging back for it, and
 *  `revealMessageRow` re-reads it every frame as prepends shift the index. */
export function findRowIndexForMessage(
  rows: MessageRow[],
  messageId: string,
): number {
  return rows.findIndex((row) => {
    if (row.kind === "run")
      return row.run.items.some((item) => item.id === messageId);
    if (row.kind === "system") return row.message.id === messageId;
    return false;
  });
}

/** A reasonable pre-measurement guess per row kind, tuned to roughly match
 *  each kind's typical rendered height — `measureElement` corrects it to the
 *  real value the moment a row mounts, so this only affects how close the
 *  FIRST paint of a row that hasn't been on screen yet is to its final size
 *  (never a correctness issue, since `useMessageScroll`'s anchor logic reacts
 *  to the real, post-measurement `scrollHeight`, not this estimate). */
export function estimateRowHeight(row: MessageRow | undefined): number {
  if (!row) return 56;
  switch (row.kind) {
    case "daySeparator":
      return 32;
    case "unreadDivider":
      return 28;
    case "groupSeenBy":
      return 22;
    case "system":
      return 36;
    case "run":
      // One bubble ~56px (text + meta); each additional bubble in the same
      // run adds roughly its own height plus the run's inner gap.
      return 56 + (row.run.items.length - 1) * 40;
  }
}

/** The vertical space between two virtualized rows, applied as
 *  `paddingBottom` (not `margin`) on the row's own measured element so it is
 *  counted in `measureElement`'s `getBoundingClientRect()` and the
 *  virtualizer's offsets stay correct. It replaced the flexbox `gap` the
 *  day-groups used before the log was virtualized.
 *
 *  ONE value for every row, including the last one, and deliberately not a
 *  function of what comes next: a row's measured height must never change
 *  because of its neighbours, or the virtualizer only learns the new height a
 *  frame later and everything below hops. Measured, when the last row's gap
 *  was 0 and a followed row's was 10-12px: sending a message grew the row
 *  ABOVE the new one by 10px and the whole log jumped one frame after the new
 *  bubble had painted, which is the "tiny flash" this pane was reported for.
 *  The earlier 10px-across-a-day-boundary rhythm is folded into this single
 *  12px for the same reason — a 2px difference at day separators, against a
 *  height that is final the moment a row is measured. */
export const ROW_GAP_PX = 12;
