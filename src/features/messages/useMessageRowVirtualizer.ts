// src/features/messages/useMessageRowVirtualizer.ts
import { useCallback, useMemo, useState, type RefObject } from "react";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import {
  buildMessageRows,
  estimateRowHeight,
  type MessageRow,
} from "./messageRows";
import { createMessageRowReuser } from "./messageRowReuse";
import type { ChatMessage } from "./data";

export interface UseMessageRowVirtualizerResult {
  rows: MessageRow[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

/**
 * Builds the flattened, virtualizable row list for one conversation's message
 * log (day separators, the one-time unread divider, message runs, system
 * pills, and the group "Seen by" line — see `messageRows.ts` for the exact
 * ordering/gap semantics this reproduces from the pre-virtualization DOM) and
 * hands it to `@tanstack/react-virtual`'s dynamic-size virtualizer, so a long
 * or very active conversation only ever mounts the visible window (+ a small
 * overscan) instead of every loaded message.
 *
 * Keyed by stable row identity (`getItemKey`), never by index —
 * `@tanstack/react-virtual` caches each row's measured height against that
 * key, so prepending older history (which shifts every later row's index)
 * reuses the already-known heights of rows that were already on screen
 * instead of re-measuring them from scratch. `useMessageScroll` still owns
 * translating that into "the viewport doesn't move" (see its prepend-anchor
 * comment) — this hook only owns the row list + the virtualizer instance.
 */
export function useMessageRowVirtualizer(
  messageGroups: { day: string; items: ChatMessage[] }[],
  /** `messageIdentity` of the unread divider's anchor (see `useUnreadDivider`). */
  dividerAnchorKey: string | undefined,
  lastOutbound: ChatMessage | undefined,
  isGroup: boolean | undefined,
  hasGroupSeenBy: boolean,
  scrollElementRef: RefObject<HTMLDivElement | null>,
): UseMessageRowVirtualizerResult {
  // @tanstack/react-virtual's `useVirtualizer()` returns functions (e.g.
  // `measureElement`) that close over internal mutable state and are not
  // safe for React Compiler to memoize — memoizing them risks the stale-UI
  // failure mode the compiler itself warns about. `"use no memo"` is React's
  // documented directive that opts this hook out of compiler memoization
  // entirely, matching what the compiler already does automatically once it
  // detects this pattern.
  "use no memo";

  // Structural sharing across cache patches: an unchanged row keeps its
  // previous object (and its run keeps its previous `items` array), so the
  // memoized `MessageAreaRow`/`MessageRunView` skip every row whose messages
  // didn't change. See `createMessageRowReuser` for why a lazily created
  // closure cache is safe here.
  const [reuseRows] = useState(createMessageRowReuser);
  const rows = useMemo(
    () =>
      reuseRows(
        buildMessageRows(
          messageGroups,
          dividerAnchorKey,
          lastOutbound,
          isGroup,
          hasGroupSeenBy,
        ),
      ),
    [
      reuseRows,
      messageGroups,
      dividerAnchorKey,
      lastOutbound,
      isGroup,
      hasGroupSeenBy,
    ],
  );

  // `getItemKey` is part of virtual-core's measurement memo deps, so a fresh
  // closure on every render rebuilt the whole measurement array on every
  // render, including each visible-range change while scrolling. Tied to
  // `rows` instead, it only rebuilds when the row list really changed.
  const getItemKey = useCallback(
    (index: number) => rows[index]?.key ?? index,
    [rows],
  );
  const estimateSize = useCallback(
    (index: number) => estimateRowHeight(rows[index]),
    [rows],
  );

  // The lint rule still flags this call even with the "use no memo" directive
  // above (it reports every known-incompatible-library call site regardless
  // of opt-out directives) — the directive is what actually controls
  // compiler behavior, so the warning below is purely informational once it
  // is in place. Suppressed here rather than left failing lint.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize,
    getItemKey,
    // A little deeper than the default: a swipe-to-reply gesture or the
    // long-press overlay's lifted-bubble clone briefly reads layout off a
    // neighbour, and a generous overscan keeps those neighbours mounted
    // through ordinary scroll speed instead of popping in/out at the edge.
    overscan: 8,
  });

  return { rows, rowVirtualizer };
}
