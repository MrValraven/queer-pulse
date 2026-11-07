import { describe, expect, it } from "vitest";
import {
  INITIAL_VJ_BACKFILL,
  nextVjBackfillClipId,
  reduceVjPreviewBackfill,
  vjBackfillProgressOf,
  type VjBackfillAction,
  type VjBackfillStage,
  type VjBackfillState,
} from "./vjPreviewBackfillQueue";

const CLIP_IDS = ["clip-1", "clip-2", "clip-3"];

function applyActions(
  actions: readonly VjBackfillAction[],
  state: VjBackfillState = INITIAL_VJ_BACKFILL,
): VjBackfillState {
  return actions.reduce(reduceVjPreviewBackfill, state);
}

function stagesOf(state: VjBackfillState): VjBackfillStage[] {
  return state.rows.map((row) => row.stage);
}

function startedThree(): VjBackfillState {
  return applyActions([{ kind: "start", clipIds: CLIP_IDS }]);
}

describe("reduceVjPreviewBackfill", () => {
  it("starts with every clip waiting", () => {
    const state = startedThree();
    expect(state.isRunning).toBe(true);
    expect(state.rows.map((row) => row.clipId)).toEqual(CLIP_IDS);
    expect(stagesOf(state)).toEqual(["waiting", "waiting", "waiting"]);
    expect(state.rows.every((row) => row.failure === null)).toBe(true);
  });

  it("runs one clip at a time", () => {
    const started = startedThree();
    expect(nextVjBackfillClipId(started)).toBe("clip-1");

    const reading = applyActions(
      [{ kind: "stage", clipId: "clip-1", stage: "reading" }],
      started,
    );
    expect(nextVjBackfillClipId(reading)).toBeNull();

    const recording = applyActions(
      [{ kind: "stage", clipId: "clip-1", stage: "recording" }],
      reading,
    );
    expect(nextVjBackfillClipId(recording)).toBeNull();

    const firstDone = applyActions(
      [{ kind: "done", clipId: "clip-1" }],
      recording,
    );
    expect(nextVjBackfillClipId(firstDone)).toBe("clip-2");
  });

  it("stop marks the rest stopped", () => {
    const state = applyActions(
      [
        { kind: "done", clipId: "clip-1" },
        { kind: "stage", clipId: "clip-2", stage: "uploading" },
        { kind: "stop" },
      ],
      startedThree(),
    );
    expect(stagesOf(state)).toEqual(["done", "stopped", "stopped"]);
    expect(state.isRunning).toBe(false);
    expect(nextVjBackfillClipId(state)).toBeNull();
  });

  it("retry runs only the failed clips again", () => {
    const failure = new Error("VJ_PREVIEW_FAILED");
    const finished = applyActions(
      [
        { kind: "fail", clipId: "clip-1", failure },
        { kind: "done", clipId: "clip-2" },
        { kind: "fail", clipId: "clip-3", failure },
      ],
      startedThree(),
    );
    expect(finished.isRunning).toBe(false);

    const retried = applyActions([{ kind: "retryFailed" }], finished);
    expect(stagesOf(retried)).toEqual(["waiting", "done", "waiting"]);
    expect(retried.rows[0]?.failure).toBeNull();
    expect(retried.isRunning).toBe(true);
    expect(nextVjBackfillClipId(retried)).toBe("clip-1");

    const firstRetried = applyActions(
      [{ kind: "done", clipId: "clip-1" }],
      retried,
    );
    expect(nextVjBackfillClipId(firstRetried)).toBe("clip-3");
  });

  it("leaves a run with no failed clips alone on retry", () => {
    const finished = applyActions(
      CLIP_IDS.map((clipId): VjBackfillAction => ({ kind: "done", clipId })),
      startedThree(),
    );
    expect(applyActions([{ kind: "retryFailed" }], finished)).toBe(finished);
  });

  it("ignores a stage for a settled clip", () => {
    const stopped = applyActions(
      [{ kind: "done", clipId: "clip-1" }, { kind: "stop" }],
      startedThree(),
    );
    const lateStage = applyActions(
      [
        { kind: "stage", clipId: "clip-1", stage: "saving" },
        { kind: "stage", clipId: "clip-2", stage: "recording" },
        { kind: "fail", clipId: "clip-3", failure: new Error("late") },
      ],
      stopped,
    );
    expect(lateStage).toBe(stopped);
    expect(stagesOf(lateStage)).toEqual(["done", "stopped", "stopped"]);
  });

  it("counts made and failed previews", () => {
    const started = startedThree();
    expect(vjBackfillProgressOf(started)).toEqual({
      total: 3,
      settledCount: 0,
      doneCount: 0,
      failedCount: 0,
      currentNumber: 1,
    });

    const midway = applyActions(
      [
        { kind: "done", clipId: "clip-1" },
        { kind: "fail", clipId: "clip-2", failure: new Error("failed") },
        { kind: "stage", clipId: "clip-3", stage: "recording" },
      ],
      started,
    );
    expect(vjBackfillProgressOf(midway)).toEqual({
      total: 3,
      settledCount: 2,
      doneCount: 1,
      failedCount: 1,
      currentNumber: 3,
    });

    const finished = applyActions([{ kind: "done", clipId: "clip-3" }], midway);
    expect(vjBackfillProgressOf(finished)).toMatchObject({
      settledCount: 3,
      doneCount: 2,
      failedCount: 1,
      currentNumber: null,
    });
  });

  it("stops running once every clip is settled", () => {
    const state = applyActions(
      [
        { kind: "done", clipId: "clip-1" },
        { kind: "done", clipId: "clip-2" },
      ],
      startedThree(),
    );
    expect(state.isRunning).toBe(true);

    const finished = applyActions(
      [{ kind: "fail", clipId: "clip-3", failure: new Error("failed") }],
      state,
    );
    expect(finished.isRunning).toBe(false);
    expect(nextVjBackfillClipId(finished)).toBeNull();
  });

  it("starts nothing for an empty clip list and clears back to the start", () => {
    const empty = applyActions([{ kind: "start", clipIds: [] }]);
    expect(empty).toEqual({ rows: [], isRunning: false });

    const cleared = applyActions([{ kind: "clear" }], startedThree());
    expect(cleared).toBe(INITIAL_VJ_BACKFILL);
  });
});
