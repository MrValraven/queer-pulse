/**
 * The client frame queue (contract 7.4 "Client rule"). Screens, the remote
 * mirror and the demo keep received stage frames here, ordered by revision
 * after the 6.5 epoch and revision check, and apply each at its `applyAt` on
 * the synced clock. Pure: every function takes the server time it reads.
 *
 * - A frame with `applyAt: null` applies at once and drops every waiting
 *   frame (its state is cumulative, so it includes theirs).
 * - A due `applyAt` applies at once after every earlier waiting frame.
 * - `applyAt` never goes backwards: a frame lands no earlier than the frame
 *   waiting before it.
 * - An ack state carries no `applyAt`; it waits behind the waiting frames
 *   with the last one's `applyAt`, so it never reveals a quantized change
 *   early (plan call 3). With nothing waiting it is held until the frame of
 *   its own revision brings the real `applyAt` (the backend sends the ack
 *   first and the frame right after), and applies on its own once
 *   `VJ_LIMITS.quantizeMinLeadMs` passes with no such frame.
 * - That frame takes the held ack's place and lands at its own `applyAt`.
 * - A new `stageEpoch` clears the waiting frames.
 */
import {
  VJ_LIMITS,
  type VjStageCause,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { shouldApplyVjStageState, vjVersionOf } from "./vjStageVersion";

export interface VjQueuedFrame {
  state: VjStageState;
  /** Null for a state an ack carried. */
  cause: VjStageCause | null;
  sourceClientId: string | null;
  applyAt: number | null;
}

/** A frame waiting in the queue always holds the server time it applies at. */
export interface VjWaitingFrame extends VjQueuedFrame {
  applyAt: number;
}

export interface VjUpcomingFrame {
  state: VjStageState;
  applyAt: number;
}

export interface VjFrameQueue {
  applied: VjQueuedFrame | null;
  /** Waiting for applyAt, ascending revision. */
  waiting: readonly VjWaitingFrame[];
  /** The newest frame received (applied or waiting), for the remote's controls. */
  latest: VjQueuedFrame | null;
}

export const EMPTY_VJ_FRAME_QUEUE: VjFrameQueue = {
  applied: null,
  waiting: [],
  latest: null,
};

/** The 6.5 version check against the newest accepted frame. */
function isFreshVjState(queue: VjFrameQueue, state: VjStageState): boolean {
  const latestVersion =
    queue.latest === null ? null : vjVersionOf(queue.latest.state);
  return shouldApplyVjStageState(latestVersion, state);
}

/** The waiting frames a state queues behind: none when it opens a new epoch. */
function waitingBeforeState(
  queue: VjFrameQueue,
  state: VjStageState,
): readonly VjWaitingFrame[] {
  const isNewEpoch =
    queue.latest !== null && queue.latest.state.stageEpoch !== state.stageEpoch;
  return isNewEpoch ? [] : queue.waiting;
}

function lastWaitingOf(
  waiting: readonly VjWaitingFrame[],
): VjWaitingFrame | undefined {
  return waiting[waiting.length - 1];
}

function appliedAtOnce(frame: VjQueuedFrame): VjFrameQueue {
  return { applied: frame, waiting: [], latest: frame };
}

/** Applies a frame whose time has come, or appends it to the waiting frames. */
function placeVjFrame(
  queue: VjFrameQueue,
  waiting: readonly VjWaitingFrame[],
  frame: VjWaitingFrame,
  serverNow: number,
): VjFrameQueue {
  // Every waiting frame lands at or before this one, so a due frame finds
  // them due as well and its cumulative state covers them.
  if (frame.applyAt <= serverNow) return appliedAtOnce(frame);
  return {
    applied: queue.applied,
    waiting: [...waiting, frame],
    latest: frame,
  };
}

/** An ack-carried state still waiting: cause is null only for a state an ack carried. */
function isVjAckHold(
  frame: VjQueuedFrame | undefined,
): frame is VjWaitingFrame {
  return frame !== undefined && frame.cause === null && frame.applyAt !== null;
}

function isSameVjVersion(left: VjStageState, right: VjStageState): boolean {
  return (
    left.stageEpoch === right.stageEpoch && left.revision === right.revision
  );
}

/** The waiting frames when a held ack ends the queue: a newer frame never
 *  waits on the hold's fallback time, so the hold lands no later than it. */
function waitingWithHoldCapped(
  waiting: readonly VjWaitingFrame[],
  frameApplyAt: number,
): readonly VjWaitingFrame[] {
  const lastWaiting = lastWaitingOf(waiting);
  if (!isVjAckHold(lastWaiting) || lastWaiting.applyAt <= frameApplyAt) {
    return waiting;
  }
  const beforeHold = waiting.slice(0, -1);
  const floorApplyAt = lastWaitingOf(beforeHold)?.applyAt ?? frameApplyAt;
  const cappedApplyAt = Math.max(floorApplyAt, frameApplyAt);
  return [...beforeHold, { ...lastWaiting, applyAt: cappedApplyAt }];
}

/** The frame of a held ack's revision replaces the hold and brings its applyAt. */
function replaceVjAckHold(
  queue: VjFrameQueue,
  frame: VjQueuedFrame,
  serverNow: number,
): VjFrameQueue {
  if (frame.applyAt === null) return appliedAtOnce(frame);
  const beforeHold = queue.waiting.slice(0, -1);
  const lastBefore = lastWaitingOf(beforeHold);
  const applyAt =
    lastBefore === undefined
      ? frame.applyAt
      : Math.max(frame.applyAt, lastBefore.applyAt);
  return placeVjFrame(queue, beforeHold, { ...frame, applyAt }, serverNow);
}

/** Whether a frame brings the revision of the held ack that ends the queue. */
function isFrameForVjAckHold(
  queue: VjFrameQueue,
  frame: VjQueuedFrame,
): boolean {
  const lastWaiting = lastWaitingOf(queue.waiting);
  return (
    isVjAckHold(lastWaiting) &&
    queue.latest === lastWaiting &&
    isSameVjVersion(lastWaiting.state, frame.state)
  );
}

/** Takes one received `stage:state` frame. A stale frame returns the same queue object. */
export function receiveVjFrame(
  queue: VjFrameQueue,
  frame: VjQueuedFrame,
  serverNow: number,
): VjFrameQueue {
  if (isFrameForVjAckHold(queue, frame)) {
    return replaceVjAckHold(queue, frame, serverNow);
  }
  if (!isFreshVjState(queue, frame.state)) return queue;
  if (frame.applyAt === null) return appliedAtOnce(frame);
  const waiting = waitingWithHoldCapped(
    waitingBeforeState(queue, frame.state),
    frame.applyAt,
  );
  const lastWaiting = lastWaitingOf(waiting);
  const applyAt =
    lastWaiting === undefined
      ? frame.applyAt
      : Math.max(frame.applyAt, lastWaiting.applyAt);
  return placeVjFrame(queue, waiting, { ...frame, applyAt }, serverNow);
}

/** Takes the state an ack carried. A stale state returns the same queue object. */
export function receiveVjAckState(
  queue: VjFrameQueue,
  state: VjStageState,
  serverNow: number,
): VjFrameQueue {
  if (!isFreshVjState(queue, state)) return queue;
  const waiting = waitingBeforeState(queue, state);
  const lastWaiting = lastWaitingOf(waiting);
  const ackFrame: VjQueuedFrame = {
    state,
    cause: null,
    sourceClientId: null,
    applyAt: null,
  };
  // With nothing waiting, the frame of this revision is still on its way and
  // may carry a beat-timed applyAt: hold until it comes, or until the
  // shortest quantize lead passes without it.
  const applyAt =
    lastWaiting === undefined
      ? serverNow + VJ_LIMITS.quantizeMinLeadMs
      : lastWaiting.applyAt;
  return placeVjFrame(queue, waiting, { ...ackFrame, applyAt }, serverNow);
}

/** Applies every waiting frame whose applyAt has come, in order. Nothing due returns the same queue object. */
export function releaseDueVjFrames(
  queue: VjFrameQueue,
  serverNow: number,
): VjFrameQueue {
  const firstLaterIndex = queue.waiting.findIndex(
    (waitingFrame) => waitingFrame.applyAt > serverNow,
  );
  const dueCount =
    firstLaterIndex === -1 ? queue.waiting.length : firstLaterIndex;
  const lastDue = queue.waiting[dueCount - 1];
  if (lastDue === undefined) return queue;
  return {
    applied: lastDue,
    waiting: queue.waiting.slice(dueCount),
    latest: queue.latest,
  };
}

/** Server time the earliest waiting frame applies at; null when none waits. */
export function nextVjFrameDueAt(queue: VjFrameQueue): number | null {
  return queue.waiting[0]?.applyAt ?? null;
}

/** The earliest waiting frame; null when none waits. */
export function upcomingVjFrameOf(queue: VjFrameQueue): VjUpcomingFrame | null {
  const earliest = queue.waiting[0];
  if (earliest === undefined) return null;
  return { state: earliest.state, applyAt: earliest.applyAt };
}
