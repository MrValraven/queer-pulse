import { useMemo, useRef } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useUnreadDivider } from "./useUnreadDivider";
import { useGroupIndicators } from "./useGroupIndicators";
import { useMessageRowVirtualizer } from "./useMessageRowVirtualizer";
import { useMessageScroll } from "./useMessageScroll";
import { useMessageRowJump } from "./useMessageRowJump";
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
  hasMoreOlder: boolean,
  loadingOlder: boolean,
  onLoadOlder: () => void,
  jumpToMessageId: string | null | undefined,
  onJumpHandled: (() => void) | undefined,
): MessageLogState {
  const flatMessages = useMemo(
    () => messageGroups.flatMap((group) => group.items),
    [messageGroups],
  );
  const messageCount = flatMessages.length;
  // Inbound-only tally for the jump-pill count — a reader's own sends never count as "new".
  const inboundCount = useMemo(
    () => flatMessages.filter((message) => message.from === "them").length,
    [flatMessages],
  );
  const dividerAnchorMessage = useUnreadDivider(flatMessages, active.id, active.unreadCount ?? 0);

  // "Seen": the last message I sent, and whether the counterpart's read
  // watermark has caught up to it — only that message's run shows the label. A
  // single backward walk (not a copy+reverse of the whole history, which grows
  // unbounded as the thread does) finds it in the fewest steps.
  const lastOutbound = useMemo(() => {
    for (let index = flatMessages.length - 1; index >= 0; index -= 1) {
      const candidate = flatMessages[index]!;
      if (candidate.from === "me") return candidate;
    }
    return undefined;
  }, [flatMessages]);
  const seenActive =
    !!lastOutbound?.at && !!counterpartLastReadAt && lastOutbound.at <= counterpartLastReadAt;
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
    dividerAnchorMessage,
    lastOutbound,
    active.isGroup,
    groupSeenBy.length > 0,
    areaRef,
  );

  const { showJumpPill, newMessagesCount, handleAreaScroll, jumpToLatest } = useMessageScroll(
    messageCount,
    inboundCount,
    active.id,
    hasMoreOlder,
    loadingOlder,
    onLoadOlder,
    areaRef,
    contentRef,
    rowVirtualizer,
  );

  // Reply-quote / pinned-banner / cross-inbox-search jumps all resolve
  // through this one virtualizer-aware function (see the hook).
  const jumpToMessageVirtualized = useMessageRowJump(
    rows,
    rowVirtualizer,
    jumpToMessageId,
    onJumpHandled,
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
