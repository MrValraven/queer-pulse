import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  VJ_LIMITS,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  EMPTY_VJ_FRAME_QUEUE,
  nextVjFrameDueAt,
  receiveVjAckState,
  receiveVjFrame,
  releaseDueVjFrames,
  upcomingVjFrameOf,
  type VjFrameQueue,
  type VjQueuedFrame,
} from "./vjFrameQueue";

function stateAt(revision: number, stageEpoch = "epoch-a"): VjStageState {
  return { ...createVjStageState(stageEpoch, 0), revision };
}

function frameAt(
  revision: number,
  applyAt: number | null,
  stageEpoch = "epoch-a",
): VjQueuedFrame {
  return {
    state: stateAt(revision, stageEpoch),
    cause: "command",
    sourceClientId: "remote-1",
    applyAt,
  };
}

/** A queue with revision 1 applied and revisions 2 and 3 waiting for 1000 and 1500. */
function queueWithTwoWaiting(): VjFrameQueue {
  const withApplied = receiveVjFrame(EMPTY_VJ_FRAME_QUEUE, frameAt(1, null), 0);
  const withFirstWaiting = receiveVjFrame(withApplied, frameAt(2, 1000), 100);
  return receiveVjFrame(withFirstWaiting, frameAt(3, 1500), 100);
}

function revisionsOf(frames: readonly VjQueuedFrame[]): number[] {
  return frames.map((frame) => frame.state.revision);
}

describe("vjFrameQueue", () => {
  it("applies a frame with no applyAt at once", () => {
    const frame = frameAt(1, null);
    const queue = receiveVjFrame(EMPTY_VJ_FRAME_QUEUE, frame, 500);
    expect(queue.applied).toBe(frame);
    expect(queue.latest).toBe(frame);
    expect(queue.waiting).toEqual([]);
  });

  it("queues a future frame and releases it when due", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const queued = receiveVjFrame(withApplied, frameAt(2, 1000), 100);
    expect(queued.applied?.state.revision).toBe(1);
    expect(revisionsOf(queued.waiting)).toEqual([2]);

    const early = releaseDueVjFrames(queued, 999);
    expect(early).toBe(queued);

    const released = releaseDueVjFrames(queued, 1000);
    expect(released.applied?.state.revision).toBe(2);
    expect(released.applied?.applyAt).toBe(1000);
    expect(released.waiting).toEqual([]);
    expect(released.latest?.state.revision).toBe(2);
  });

  it("releases due frames in order and keeps the later ones waiting", () => {
    const queue = queueWithTwoWaiting();
    const released = releaseDueVjFrames(queue, 1200);
    expect(released.applied?.state.revision).toBe(2);
    expect(revisionsOf(released.waiting)).toEqual([3]);

    const releasedAll = releaseDueVjFrames(queue, 5000);
    expect(releasedAll.applied?.state.revision).toBe(3);
    expect(releasedAll.waiting).toEqual([]);
  });

  it("a null applyAt frame drops the waiting frames", () => {
    const queue = queueWithTwoWaiting();
    const immediate = frameAt(4, null);
    const next = receiveVjFrame(queue, immediate, 200);
    expect(next.applied).toBe(immediate);
    expect(next.waiting).toEqual([]);
    expect(next.latest).toBe(immediate);
  });

  it("a past applyAt applies after earlier waiting frames", () => {
    const queue = queueWithTwoWaiting();
    const next = receiveVjFrame(queue, frameAt(4, 1550), 1600);
    expect(next.applied?.state.revision).toBe(4);
    expect(next.waiting).toEqual([]);
  });

  it("a past applyAt behind a later waiting frame lands with that frame", () => {
    const queue = queueWithTwoWaiting();
    const next = receiveVjFrame(queue, frameAt(4, 50), 200);
    expect(next.applied?.state.revision).toBe(1);
    expect(revisionsOf(next.waiting)).toEqual([2, 3, 4]);
    expect(next.waiting[2]?.applyAt).toBe(1500);
  });

  it("drops a stale revision and keeps the same object", () => {
    const queue = queueWithTwoWaiting();
    expect(receiveVjFrame(queue, frameAt(3, null), 200)).toBe(queue);
    expect(receiveVjFrame(queue, frameAt(2, 2000), 200)).toBe(queue);
    expect(receiveVjAckState(queue, stateAt(3), 200)).toBe(queue);
  });

  it("a new epoch clears the queue", () => {
    const queue = queueWithTwoWaiting();
    const fromNewEpoch = frameAt(0, 3000, "epoch-b");
    const next = receiveVjFrame(queue, fromNewEpoch, 200);
    expect(next.applied?.state.revision).toBe(1);
    expect(next.applied?.state.stageEpoch).toBe("epoch-a");
    expect(next.waiting).toHaveLength(1);
    expect(next.waiting[0]?.state.stageEpoch).toBe("epoch-b");
    expect(next.waiting[0]?.applyAt).toBe(3000);
    expect(next.latest?.state.stageEpoch).toBe("epoch-b");
  });

  it("a new epoch frame due now applies without waiting for the old frames", () => {
    const queue = queueWithTwoWaiting();
    const next = receiveVjFrame(queue, frameAt(0, 150, "epoch-b"), 200);
    expect(next.applied?.state.stageEpoch).toBe("epoch-b");
    expect(next.waiting).toEqual([]);
  });

  it("an ack state waits behind queued frames", () => {
    const queue = queueWithTwoWaiting();
    const ackState = stateAt(4);
    const next = receiveVjAckState(queue, ackState, 200);
    expect(next.applied?.state.revision).toBe(1);
    expect(revisionsOf(next.waiting)).toEqual([2, 3, 4]);
    expect(next.waiting[2]).toEqual({
      state: ackState,
      cause: null,
      sourceClientId: null,
      applyAt: 1500,
    });
    expect(next.latest?.state).toBe(ackState);

    const beforeLast = releaseDueVjFrames(next, 1499);
    expect(beforeLast.applied?.state.revision).toBe(2);
    const afterLast = releaseDueVjFrames(next, 1500);
    expect(afterLast.applied?.state).toBe(ackState);
    expect(afterLast.waiting).toEqual([]);
  });

  it("latest tracks the newest frame while applied waits", () => {
    const queue = queueWithTwoWaiting();
    expect(queue.applied?.state.revision).toBe(1);
    expect(queue.latest?.state.revision).toBe(3);

    const released = releaseDueVjFrames(queue, 1000);
    expect(released.applied?.state.revision).toBe(2);
    expect(released.latest?.state.revision).toBe(3);
  });

  it("nextVjFrameDueAt and upcomingVjFrameOf read the earliest waiting frame", () => {
    expect(nextVjFrameDueAt(EMPTY_VJ_FRAME_QUEUE)).toBeNull();
    expect(upcomingVjFrameOf(EMPTY_VJ_FRAME_QUEUE)).toBeNull();

    const queue = queueWithTwoWaiting();
    expect(nextVjFrameDueAt(queue)).toBe(1000);
    expect(upcomingVjFrameOf(queue)).toEqual({
      state: stateAt(2),
      applyAt: 1000,
    });

    const released = releaseDueVjFrames(queue, 1000);
    expect(nextVjFrameDueAt(released)).toBe(1500);
    expect(upcomingVjFrameOf(released)?.state.revision).toBe(3);
  });
});

describe("vjFrameQueue ack holds", () => {
  it("an ack state with nothing waiting is held for the shortest quantize lead", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const ackState = stateAt(2);
    const next = receiveVjAckState(withApplied, ackState, 100);
    const heldUntil = 100 + VJ_LIMITS.quantizeMinLeadMs;
    expect(next.applied?.state.revision).toBe(1);
    expect(next.latest?.state).toBe(ackState);
    expect(next.waiting).toEqual([
      {
        state: ackState,
        cause: null,
        sourceClientId: null,
        applyAt: heldUntil,
      },
    ]);
    expect(nextVjFrameDueAt(next)).toBe(heldUntil);

    expect(releaseDueVjFrames(next, heldUntil - 1)).toBe(next);
    const released = releaseDueVjFrames(next, heldUntil);
    expect(released.applied).toEqual({
      state: ackState,
      cause: null,
      sourceClientId: null,
      applyAt: heldUntil,
    });
    expect(released.waiting).toEqual([]);
  });

  it("the frame of a held ack's revision replaces it and keeps its own beat-timed applyAt", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const held = receiveVjAckState(withApplied, stateAt(2), 100);
    const beatFrame = frameAt(2, 900);
    const next = receiveVjFrame(held, beatFrame, 110);
    expect(next.applied?.state.revision).toBe(1);
    expect(next.waiting).toEqual([beatFrame]);
    expect(next.latest).toEqual(beatFrame);

    expect(releaseDueVjFrames(next, 100 + VJ_LIMITS.quantizeMinLeadMs)).toBe(
      next,
    );
    const released = releaseDueVjFrames(next, 900);
    expect(released.applied).toEqual(beatFrame);
    expect(released.applied?.cause).toBe("command");
  });

  it("the frame of a held ack's revision with no applyAt applies at once", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const held = receiveVjAckState(withApplied, stateAt(2), 100);
    const immediate = frameAt(2, null);
    const next = receiveVjFrame(held, immediate, 110);
    expect(next.applied).toBe(immediate);
    expect(next.waiting).toEqual([]);
  });

  it("a frame for an ack that already applied stays stale", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const held = receiveVjAckState(withApplied, stateAt(2), 100);
    const released = releaseDueVjFrames(
      held,
      100 + VJ_LIMITS.quantizeMinLeadMs,
    );
    expect(receiveVjFrame(released, frameAt(2, 2000), 300)).toBe(released);
  });

  it("a newer frame never waits on a held ack's fallback time", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const held = receiveVjAckState(withApplied, stateAt(2), 100);
    const next = receiveVjFrame(held, frameAt(3, 180), 110);
    expect(revisionsOf(next.waiting)).toEqual([2, 3]);
    expect(next.waiting[0]?.applyAt).toBe(180);
    expect(next.waiting[1]?.applyAt).toBe(180);

    const released = releaseDueVjFrames(next, 180);
    expect(released.applied?.state.revision).toBe(3);
    expect(released.waiting).toEqual([]);
  });

  it("a new epoch drops a held ack", () => {
    const withApplied = receiveVjFrame(
      EMPTY_VJ_FRAME_QUEUE,
      frameAt(1, null),
      0,
    );
    const held = receiveVjAckState(withApplied, stateAt(2), 100);
    const fromNewEpoch = frameAt(0, 3000, "epoch-b");
    const next = receiveVjFrame(held, fromNewEpoch, 110);
    expect(next.waiting).toEqual([fromNewEpoch]);
  });

  it("the frame of an ack held behind queued frames lands at its own later applyAt", () => {
    const queue = queueWithTwoWaiting();
    const held = receiveVjAckState(queue, stateAt(4), 200);
    const beatFrame = frameAt(4, 2000);
    const next = receiveVjFrame(held, beatFrame, 210);
    expect(revisionsOf(next.waiting)).toEqual([2, 3, 4]);
    expect(next.waiting[2]).toEqual(beatFrame);
  });
});
