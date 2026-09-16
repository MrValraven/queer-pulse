import type { Virtualizer } from "@tanstack/react-virtual";
import { findRowIndexForMessage, type MessageRow } from "./messageRows";
import {
  bumpJumpGeneration,
  clearMessageJumpStatus,
  showMessageJumpStatus,
  type MessageJumpPhase,
} from "./messageJumpStore";
import { revealMessageRow } from "./revealMessageRow";
import type { JumpScrollBridge } from "./useOlderPageAnchor";

/** Upper bound on older pages one jump may load before it stops looking. */
export const MAX_HUNT_PAGES = 25;
/** Upper bound on how long one jump may keep looking, whatever the pages. */
const HUNT_DEADLINE_MS = 15_000;
/** A requested page that has not started loading after this long is treated
 *  as settled, so a request the fetch layer ignored can never stall the hunt. */
const PAGE_PICKUP_GRACE_MS = 1500;
/** A page that lands this fast never flashes the status pill on screen. */
const FINDING_STATUS_DELAY_MS = 300;

/** Everything the hunt reads from the open thread, refreshed every commit. */
export interface JumpThreadSnapshot {
  conversationId: string;
  rows: MessageRow[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  hasMoreOlder: boolean;
  isLoadingOlder: boolean;
  /** Page 0 is current (see `useMessageThread`). Until then the loaded rows
   *  may be stale or only the reader's own queued sends: no basis to decide. */
  isHistorySettled: boolean;
  /** Page 0's last fetch failed (an older page failing never sets this). */
  isHistoryError: boolean;
  /** The same load-older trigger the scroll-to-top path uses. */
  onLoadOlder: () => void;
  /** The scroll layer's side of a jump (see `JumpScrollBridge`). */
  scroll: JumpScrollBridge;
}

export interface HuntProgress {
  messageId: string;
  conversationId: string;
  pagesRequested: number;
  isAwaitingPage: boolean;
  hasSeenLoading: boolean;
  requestedAt: number;
  oldestKeyAtRequest: string | undefined;
}

export type HuntDecision =
  | { kind: "reveal" }
  | { kind: "wait" }
  | { kind: "requestPage" }
  | { kind: "giveUp"; phase: MessageJumpPhase };

/** Identity of the oldest loaded message, used to tell whether a page landed. */
export function oldestMessageKey(rows: MessageRow[]): string | undefined {
  for (const row of rows) {
    if (row.kind === "run") {
      const first = row.run.items[0];
      return first?.id ?? first?.localId ?? first?.at;
    }
    if (row.kind === "system") {
      return row.message.id ?? row.message.localId ?? row.message.at;
    }
  }
  return undefined;
}

/**
 * One step of page-until-found, as a pure decision over the current thread.
 * Order matters: a loaded target always wins; an in-flight page, or a page 0
 * still (re)loading, is always waited out; a page that settled without adding
 * older history ends the hunt (exhausted, or the request failed) instead of
 * re-requesting forever; a failed fetch reads as a load failure.
 */
export function decideHuntStep(
  hunt: HuntProgress,
  snapshot: Pick<
    JumpThreadSnapshot,
    | "rows"
    | "hasMoreOlder"
    | "isLoadingOlder"
    | "isHistorySettled"
    | "isHistoryError"
  >,
  now: number,
): HuntDecision {
  const { rows, hasMoreOlder, isLoadingOlder } = snapshot;
  const { isHistorySettled, isHistoryError } = snapshot;
  if (findRowIndexForMessage(rows, hunt.messageId) !== -1) {
    return { kind: "reveal" };
  }
  if (isLoadingOlder) return { kind: "wait" };
  // Page 0 failed. An older page failing never sets this, so an earlier
  // failed page never ends a new hunt; this hunt's own failed request is
  // caught by the oldest-message check below.
  if (isHistoryError) return { kind: "giveUp", phase: "loadFailed" };
  if (!isHistorySettled) return { kind: "wait" };
  if (hunt.isAwaitingPage) {
    const isPickupPending =
      !hunt.hasSeenLoading && now - hunt.requestedAt < PAGE_PICKUP_GRACE_MS;
    if (isPickupPending) return { kind: "wait" };
    if (oldestMessageKey(rows) === hunt.oldestKeyAtRequest) {
      return {
        kind: "giveUp",
        phase: hasMoreOlder || isHistoryError ? "loadFailed" : "notFound",
      };
    }
  }
  if (!hasMoreOlder) return { kind: "giveUp", phase: "notFound" };
  if (hunt.pagesRequested >= MAX_HUNT_PAGES) {
    return { kind: "giveUp", phase: "tooFar" };
  }
  return { kind: "requestPage" };
}

/** What the hunt deadline reports. A fetch still in flight (a slow, retrying
 *  link) or one that failed is a load problem; only a hunt that kept paging
 *  successfully is genuinely too far back. */
function deadlineOutcome(
  snapshot: JumpThreadSnapshot | null,
): MessageJumpPhase {
  if (!snapshot) return "notFound";
  const isFetchInFlight = snapshot.isLoadingOlder || !snapshot.isHistorySettled;
  if (isFetchInFlight || snapshot.isHistoryError) return "loadFailed";
  return snapshot.rows.length > 0 ? "tooFar" : "notFound";
}

export interface MessageJumpHunter {
  /** Feeds the latest thread state in and advances any hunt in progress. */
  sync: (snapshot: JumpThreadSnapshot) => void;
  /** Starts a jump. True when the message was already loaded. */
  jump: (messageId: string) => boolean;
  /** Stops any hunt and settle loop (unmount). */
  dispose: () => void;
}

/**
 * The single jump engine for one conversation panel: reveal a loaded message,
 * or page back one older page at a time until it loads, history runs out, or
 * a bound is hit, then reveal it or say why it could not be reached. A newer
 * jump or a thread switch cancels whatever is in flight. Plain closures
 * outside React so the timers and frame loops never depend on render timing.
 */
export function createMessageJumpHunter(): MessageJumpHunter {
  let latest: JumpThreadSnapshot | null = null;
  let hunt: HuntProgress | null = null;
  let cancelReveal: (() => void) | null = null;
  const timers = new Set<number>();

  function schedule(callback: () => void, delayMs: number) {
    const timerId = window.setTimeout(() => {
      timers.delete(timerId);
      callback();
    }, delayMs);
    timers.add(timerId);
  }

  function stopReveal() {
    cancelReveal?.();
    cancelReveal = null;
  }

  function stopHunt(outcome?: MessageJumpPhase) {
    for (const timerId of timers) window.clearTimeout(timerId);
    timers.clear();
    const stopped = hunt;
    hunt = null;
    if (!stopped) return;
    if (outcome) showMessageJumpStatus(stopped.conversationId, outcome);
    else clearMessageJumpStatus(stopped.conversationId);
  }

  function reveal(messageId: string, shouldAllowGlide: boolean) {
    if (!latest) return;
    stopReveal();
    cancelReveal = revealMessageRow(
      latest.rowVirtualizer,
      () => latest?.rows ?? [],
      messageId,
      shouldAllowGlide,
      // Every reveal scroll first takes the viewport from the scroll layer, so
      // a bottom re-pin or a settling anchor cannot overwrite it, and hands it
      // back once the reveal ends.
      latest.scroll.beginProgrammaticJump,
      latest.scroll.endProgrammaticJump,
    );
  }

  function requestPage(current: HuntProgress, snapshot: JumpThreadSnapshot) {
    current.pagesRequested += 1;
    current.isAwaitingPage = true;
    current.hasSeenLoading = false;
    current.requestedAt = Date.now();
    current.oldestKeyAtRequest = oldestMessageKey(snapshot.rows);
    schedule(advance, PAGE_PICKUP_GRACE_MS);
    // Each page prepends above the reader: anchor it so a hunt that ends
    // without a reveal leaves them exactly where they were.
    snapshot.scroll.armHistoryPageAnchor();
    snapshot.onLoadOlder();
  }

  function advance() {
    const current = hunt;
    const snapshot = latest;
    if (!current || !snapshot) return;
    if (snapshot.conversationId !== current.conversationId) {
      stopHunt();
      return;
    }
    if (current.isAwaitingPage && snapshot.isLoadingOlder) {
      current.hasSeenLoading = true;
    }
    const decision = decideHuntStep(current, snapshot, Date.now());
    if (decision.kind === "reveal") {
      stopHunt();
      // Pages were prepended while looking: an instant landing reads better
      // than a glide across freshly-inserted, still-unmeasured rows.
      reveal(current.messageId, current.pagesRequested === 0);
    } else if (decision.kind === "giveUp") {
      stopHunt(decision.phase);
    } else if (decision.kind === "requestPage") {
      requestPage(current, snapshot);
    }
  }

  return {
    sync(snapshot) {
      const previousConversationId = latest?.conversationId;
      const hasSwitchedThread =
        previousConversationId !== undefined &&
        previousConversationId !== snapshot.conversationId;
      latest = snapshot;
      if (hasSwitchedThread) {
        stopReveal();
        // An outcome belongs to the visit that produced it: coming back to
        // that thread must not show it again.
        clearMessageJumpStatus(previousConversationId);
      }
      if (hunt) advance();
    },
    jump(messageId) {
      const snapshot = latest;
      if (!snapshot) return false;
      // Every real jump attempt mints a fresh generation, whatever it starts
      // and however it ends, so a caller that handed its own intent off to
      // this jump can tell a later one has superseded it.
      bumpJumpGeneration();
      stopHunt();
      stopReveal();
      // A fresh jump replaces an earlier "could not find it" notice.
      clearMessageJumpStatus(snapshot.conversationId);
      if (findRowIndexForMessage(snapshot.rows, messageId) !== -1) {
        reveal(messageId, true);
        return true;
      }
      const started: HuntProgress = {
        messageId,
        conversationId: snapshot.conversationId,
        pagesRequested: 0,
        isAwaitingPage: false,
        hasSeenLoading: false,
        requestedAt: 0,
        oldestKeyAtRequest: undefined,
      };
      hunt = started;
      // A pending unread landing must not move the reader mid-hunt.
      snapshot.scroll.cancelUnreadLanding();
      schedule(() => {
        if (hunt === started) {
          showMessageJumpStatus(started.conversationId, "finding");
        }
      }, FINDING_STATUS_DELAY_MS);
      schedule(() => {
        if (hunt !== started) return;
        stopHunt(deadlineOutcome(latest));
      }, HUNT_DEADLINE_MS);
      advance();
      return false;
    },
    dispose() {
      stopHunt();
      stopReveal();
      if (latest) clearMessageJumpStatus(latest.conversationId);
    },
  };
}
