import { useEffect, useMemo, useRef } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
// TEMPORARY — see scrollTrace.ts's revert instructions.
import { traceScrollEvent, isScrollTraceEnabled } from "./scrollTrace";
import { useUnreadDivider } from "./useUnreadDivider";
import { useGroupIndicators } from "./useGroupIndicators";
import { useMessageRowVirtualizer } from "./useMessageRowVirtualizer";
import { useMessageScroll } from "./useMessageScroll";
import type { ThreadHistory } from "./useOlderPageAnchor";
import { useMessageRowJump } from "./useMessageRowJump";
import { useMarkReadOnInbound } from "./useMarkReadOnInbound";
import { realConversationId } from "./useMessagesController.helpers";
import { type RunParticipant } from "./MessageRun";
import type { MessageRow } from "./messageRows";
import type { SeenByEntry } from "./groupReceipts";
import { type ChatMessage, type Conversation } from "./data";

export interface MessageLogState {
  /** The scroll container + its stable inner wrapper (see `MessageArea`'s
   *  `.area`/`.areaContent`) — created here so the SAME refs seed the
   *  virtualizer's `getScrollElement` and `useMessageScroll`'s resize-follow
   *  observer in turn. */
  areaRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  rows: MessageRow[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  showJumpPill: boolean;
  newMessagesCount: number;
  handleAreaScroll: () => void;
  jumpToLatest: () => void;
  /** Reply-quote / pinned-banner / cross-inbox-search jumps all resolve
   *  through this one virtualizer-aware function. */
  jumpToMessageVirtualized: (messageId: string) => boolean;
  /** Memoized counterpart avatar identity — stable across unrelated
   *  re-renders so `MessageRunView`/`MessageBubble` (both `React.memo`'d)
   *  aren't defeated by an unstable object prop. */
  counterpart: RunParticipant;
  groupSeenBy: SeenByEntry[];
  lastOutbound: ChatMessage | undefined;
  seenActive: boolean;
  deliveredActive: boolean;
}

/**
 * Every value the scrolling message log (`MessageArea`) is derived from: the
 * flattened message list, the unread-divider anchor, the "Seen"/"Delivered"
 * watermark comparison, the GROUP "Seen by N" receipt, the virtualized row
 * list + `@tanstack/react-virtual` instance, stick-to-bottom/jump-pill scroll
 * state, and the jump-to-message resolver. Extracted from `ConversationPanel`
 * (a pre-existing oversized orchestrator) to keep it under the component-size
 * cap — this is the single cohesive "message log" concern, distinct from the
 * panel's other extracted concerns (pin/star, the action menu).
 */
export function useMessageLogState(
  active: Conversation,
  messageGroups: { day: string; items: ChatMessage[] }[],
  myUserId: string | null | undefined,
  mySlug: string | undefined,
  counterpartLastReadAt: string | null,
  counterpartDeliveredAt: string | null,
  /** Paging state plus whether page 0 is current (see `ThreadHistory`). */
  history: ThreadHistory,
  jumpToMessageId: string | null | undefined,
  onJumpHandled: (() => void) | undefined,
  /** Acks the thread read against the server. Called on thread-open by the
   *  parent already; also (re-)invoked here as new inbound messages arrive
   *  while the thread stays open — see `useMarkReadOnInbound`. */
  onMarkThreadRead: (conversationId: string) => void,
): MessageLogState {
  const flatMessages = useMemo(
    () => messageGroups.flatMap((group) => group.items),
    [messageGroups],
  );
  const messageCount = flatMessages.length;
  // Inbound-only tally for the jump-pill count (a reader's own sends never
  // count as "new"), plus the newest inbound timestamp, which is what
  // `useMarkReadOnInbound` compares against its last mark. One pass for both.
  const { inboundCount, newestInboundAt } = useMemo(() => {
    let count = 0;
    let newestAt: string | undefined;
    for (const message of flatMessages) {
      if (message.from !== "them") continue;
      count += 1;
      if (message.at && (newestAt === undefined || message.at > newestAt)) {
        newestAt = message.at;
      }
    }
    return { inboundCount: count, newestInboundAt: newestAt };
  }, [flatMessages]);
  const divider = useUnreadDivider(
    flatMessages,
    active.id,
    active.unreadCount ?? 0,
    active.unread,
    active.myLastReadAt,
    history.hasMoreOlder,
    history.isHistorySettled && !history.isHistoryError,
  );

  // "Seen": the last message I sent that still shows a meta, and whether the
  // counterpart's read watermark has caught up to it; only that bubble shows
  // the escalation. A deleted message is skipped because its tombstone renders
  // no meta, so pointing at it dropped the tick from the bubble before it. A
  // system pill is skipped for the same reason. The group "Seen by" row and
  // `useGroupIndicators` read this same value. A single backward walk (not a
  // copy+reverse of the whole history) finds it in the fewest steps.
  const lastOutbound = useMemo(() => {
    for (let index = flatMessages.length - 1; index >= 0; index -= 1) {
      const candidate = flatMessages[index]!;
      if (
        candidate.from === "me" &&
        !candidate.deletedAt &&
        candidate.kind !== "system"
      ) {
        return candidate;
      }
    }
    return undefined;
  }, [flatMessages]);
  const seenActive =
    !!lastOutbound?.at &&
    !!counterpartLastReadAt &&
    lastOutbound.at <= counterpartLastReadAt;
  // "Delivered" (double check): the counterpart's delivered watermark has caught
  // the last outbound message. One rung below seen — resolved with lower
  // precedence in the run view, so a seen message never regresses to delivered.
  const deliveredActive =
    !!lastOutbound?.at &&
    !!counterpartDeliveredAt &&
    lastOutbound.at <= counterpartDeliveredAt;

  // The scroll container + its stable inner wrapper — see the file comment for
  // why these live alongside the virtualizer/scroll hooks that consume them.
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GROUP-only "Seen by N" (the aggregated typing label lives inside
  // `TypingIndicatorRow` instead — mounted by `MessageArea` itself, driven by
  // its own `useTypingIndicator` subscription — so a typing frame never
  // reaches this hook or the panel above it).
  const { groupSeenBy } = useGroupIndicators(active, lastOutbound, {
    id: myUserId ?? null,
    slug: mySlug,
  });

  // The flattened, virtualizer-keyed row list + the `@tanstack/react-virtual`
  // instance MessageArea renders from (see `messageRows.ts`/
  // `useMessageRowVirtualizer`).
  const { rows, rowVirtualizer } = useMessageRowVirtualizer(
    messageGroups,
    divider.anchorKey,
    lastOutbound,
    active.isGroup,
    groupSeenBy.length > 0,
    areaRef,
  );

  const {
    showJumpPill,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
    jumpScroll,
  } = useMessageScroll(
    messageCount,
    inboundCount,
    active.id,
    history,
    areaRef,
    contentRef,
    rowVirtualizer,
    rows,
    {
      unreadCount: active.unreadCount ?? 0,
      isFlaggedUnread: active.unread,
      isDividerResolved: divider.isResolved,
      hasPendingJump: !!jumpToMessageId,
    },
  );

  // TEMPORARY — see scrollTrace.ts's revert instructions. A SECOND,
  // independent ResizeObserver purely for tracing `areaRef` itself (the
  // scroll VIEWPORT), separate from `useMessageScroll`'s own resize-follow
  // observer on `contentRef` (the content wrapper). This one never writes
  // scroll position — it only logs `.area`'s own `clientHeight`/`scrollTop`
  // whenever the viewport box itself changes size, e.g. a sibling banner
  // (`ConnectionStatusBanner`/`ConversationPinnedBanner`) mounting/growing
  // above `.area` in the flex column and shrinking it from a fixed `scrollTop`
  // — exactly the shape hypothesis H2 describes, made directly observable.
  useEffect(() => {
    if (!isScrollTraceEnabled()) return;
    const area = areaRef.current;
    if (!area || typeof ResizeObserver === "undefined") return;
    let lastClientHeight = area.clientHeight;
    const observer = new ResizeObserver(() => {
      if (area.clientHeight === lastClientHeight) return;
      traceScrollEvent(
        "areaRef:viewportResize",
        area,
        rowVirtualizer,
        undefined,
        {
          previousClientHeight: lastClientHeight,
          nextClientHeight: area.clientHeight,
        },
      );
      lastClientHeight = area.clientHeight;
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [active.id, areaRef, rowVirtualizer]);

  // Re-ack read as new inbound messages land while this thread stays open
  // (`openThread` only covers the moment it's FIRST opened) — see the hook's
  // own file comment. `realConversationId` is null in demo mode and for a
  // just-picked placeholder thread, so this is inert until a real UUID exists.
  useMarkReadOnInbound(
    realConversationId(active),
    newestInboundAt,
    showJumpPill,
    history.isHistorySettled,
    !!active.unread || (active.unreadCount ?? 0) > 0,
    onMarkThreadRead,
  );

  // Reply-quote / pinned-banner / cross-inbox-search jumps all resolve
  // through this one virtualizer-aware function (see the hook). It pages back
  // for an unloaded message through the same load-older trigger as scrolling.
  const jumpToMessageVirtualized = useMessageRowJump(
    rows,
    rowVirtualizer,
    jumpToMessageId,
    onJumpHandled,
    {
      conversationId: active.id,
      hasMoreOlder: history.hasMoreOlder,
      isLoadingOlder: history.loadingOlder,
      isHistorySettled: history.isHistorySettled,
      isHistoryError: history.isHistoryError,
      onLoadOlder: history.onLoadOlder,
      scroll: jumpScroll,
    },
  );

  // Memoized on the counterpart's actual identity fields (not `active` itself,
  // which also carries fast-changing bits like `hasLeft`) so this object's
  // reference stays stable across unrelated re-renders — `MessageRunView` and
  // `MessageBubble` are `React.memo`'d, and an unstable object prop here would
  // defeat that on every panel render.
  const counterpart: RunParticipant = useMemo(
    () => ({
      initials: active.initials,
      tint: active.tint,
      src: active.avatarUrl,
    }),
    [active.initials, active.tint, active.avatarUrl],
  );

  return {
    areaRef,
    contentRef,
    rows,
    rowVirtualizer,
    showJumpPill,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
    jumpToMessageVirtualized,
    counterpart,
    groupSeenBy,
    lastOutbound,
    seenActive,
    deliveredActive,
  };
}
