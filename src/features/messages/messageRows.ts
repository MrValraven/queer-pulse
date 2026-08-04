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

/** Stable identity for a message across its lifetime (server id, then the
 *  client-generated `localId` while still optimistic, then its timestamp as a
 *  last resort) — mirrors `MessageArea`'s own `messageIdentities` so a row's
 *  virtualizer key never changes as an optimistic send gets acked. */
function stableMessageKey(message: ChatMessage | undefined): string | undefined {
  return message?.id ?? message?.localId ?? message?.at;
}

/**
 * Flattens `messageGroups` (day → messages) into the ordered row list the
 * virtualizer renders, reproducing exactly what the pre-virtualization JSX
 * produced: a day separator, then each day's timeline blocks (via the SAME
 * `buildTimeline` grouping pass `MessageRun.tsx` always used), with the
 * one-time unread divider inserted immediately before its anchor block and the
 * group "Seen by" line immediately after the run ending in `lastOutbound`.
 */
export function buildMessageRows(
  messageGroups: { day: string; items: ChatMessage[] }[],
  dividerAnchorMessage: ChatMessage | undefined,
  lastOutbound: ChatMessage | undefined,
  isGroup: boolean | undefined,
  hasGroupSeenBy: boolean,
): MessageRow[] {
  const rows: MessageRow[] = [];
  for (const group of messageGroups) {
    rows.push({ kind: "daySeparator", key: `day-sep-${group.day}`, day: group.day });
    const blocks = buildTimeline(group.items, undefined, dividerAnchorMessage);
    for (const block of blocks) {
      const anchor = block.kind === "run" ? block.run.items[0] : block.message;
      if (dividerAnchorMessage !== undefined && anchor === dividerAnchorMessage) {
        rows.push({ kind: "unreadDivider", key: "unread-divider" });
      }
      if (block.kind === "system") {
        rows.push({
          kind: "system",
          key: stableMessageKey(block.message) ?? `sys-${rows.length}`,
          day: group.day,
          message: block.message,
        });
        continue;
      }
      const lastItem = block.run.items[block.run.items.length - 1];
      rows.push({
        kind: "run",
        key: stableMessageKey(block.run.items[0]) ?? `run-${rows.length}`,
        day: group.day,
        run: block.run,
      });
      if (isGroup && hasGroupSeenBy && lastItem !== undefined && lastItem === lastOutbound) {
        rows.push({ kind: "groupSeenBy", key: `group-seen-by-${stableMessageKey(lastItem) ?? "x"}` });
      }
    }
  }
  return rows;
}

/** Row index of the block containing `messageId`, or -1 if it isn't in any
 *  currently-loaded row (either genuinely not loaded — an older, unpaged
 *  message — or a bug). Used to scroll a message that's virtualized off-screen
 *  into view BEFORE the DOM-based highlight (`useJumpToMessage`) looks for it. */
export function findRowIndexForMessage(rows: MessageRow[], messageId: string): number {
  return rows.findIndex((row) => {
    if (row.kind === "run") return row.run.items.some((item) => item.id === messageId);
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

/** The vertical space that used to come from flexbox `gap` between this row
 *  and the next: 10px across a day boundary (day separator ↔ its first block,
 *  or a day's last block ↔ the next day separator — matches `.dayGroup`'s and
 *  `.areaContent`'s own 10px gaps), 12px between ordinary content in the same
 *  day (matches `.runs`' 12px), and 0 for the very last row — `.areaContent`
 *  is still a flex column with its own 10px gap between the virtualized sizer
 *  and the typing-indicator row that follows it, so baking in a trailing gap
 *  here would double it. Applied as `paddingBottom` (not `margin`) on the
 *  row's own measured element, so it's counted in `measureElement`'s
 *  `getBoundingClientRect()` and the virtualizer's offsets stay correct. */
export function gapAfterRow(row: MessageRow, nextRow: MessageRow | undefined): number {
  if (!nextRow) return 0;
  if (row.kind === "daySeparator" || nextRow.kind === "daySeparator") return 10;
  return 12;
}
