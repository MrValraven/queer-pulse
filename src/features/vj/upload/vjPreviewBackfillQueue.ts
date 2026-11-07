/** Where one clip of a "Make previews" run is. `reading` asks for the clip's
 *  media URL (and a GIF's bytes); the next three are `VjPreviewStage`. */
export type VjBackfillStage =
  | "waiting"
  | "reading"
  | "recording"
  | "uploading"
  | "saving"
  | "done"
  | "failed"
  | "stopped";

export interface VjBackfillRow {
  clipId: string;
  stage: VjBackfillStage;
  /** The cause behind a failed row, read by `vjReasonOf` and `vjErrorKeyOf`. */
  failure: unknown;
}

export interface VjBackfillState {
  rows: VjBackfillRow[];
  /** True while a waiting or active row is left and nobody stopped the run. */
  isRunning: boolean;
}

export type VjBackfillActiveStage = Exclude<
  VjBackfillStage,
  "done" | "failed" | "stopped"
>;

export type VjBackfillAction =
  | { kind: "start"; clipIds: string[] }
  | { kind: "stage"; clipId: string; stage: VjBackfillActiveStage }
  | { kind: "done"; clipId: string }
  | { kind: "fail"; clipId: string; failure: unknown }
  | { kind: "stop" }
  | { kind: "retryFailed" }
  | { kind: "clear" };

export const INITIAL_VJ_BACKFILL: VjBackfillState = {
  rows: [],
  isRunning: false,
};

const ACTIVE_STAGES: ReadonlySet<VjBackfillStage> = new Set([
  "reading",
  "recording",
  "uploading",
  "saving",
]);
const SETTLED_STAGES: ReadonlySet<VjBackfillStage> = new Set([
  "done",
  "failed",
  "stopped",
]);

function isActiveRow(row: VjBackfillRow): boolean {
  return ACTIVE_STAGES.has(row.stage);
}

function isSettledRow(row: VjBackfillRow): boolean {
  return SETTLED_STAGES.has(row.stage);
}

/** A run keeps going while it was running and a row is still waiting or active. */
function stateOf(rows: VjBackfillRow[], wasRunning: boolean): VjBackfillState {
  return {
    rows,
    isRunning: wasRunning && rows.some((row) => !isSettledRow(row)),
  };
}

/** Applies `update` to the one row of `clipId` while that row is not settled. */
function updateOpenRow(
  state: VjBackfillState,
  clipId: string,
  update: (row: VjBackfillRow) => VjBackfillRow,
): VjBackfillState {
  let hasChanged = false;
  const rows = state.rows.map((row) => {
    if (row.clipId !== clipId || isSettledRow(row)) return row;
    hasChanged = true;
    return update(row);
  });
  return hasChanged ? stateOf(rows, state.isRunning) : state;
}

function startedState(clipIds: readonly string[]): VjBackfillState {
  const rows = [...new Set(clipIds)].map((clipId): VjBackfillRow => ({
    clipId,
    stage: "waiting",
    failure: null,
  }));
  return stateOf(rows, true);
}

function stoppedState(state: VjBackfillState): VjBackfillState {
  const rows = state.rows.map((row) =>
    isSettledRow(row) ? row : { ...row, stage: "stopped" as const },
  );
  return { rows, isRunning: false };
}

function retriedState(state: VjBackfillState): VjBackfillState {
  if (!state.rows.some((row) => row.stage === "failed")) return state;
  const rows = state.rows.map((row) =>
    row.stage === "failed"
      ? { ...row, stage: "waiting" as const, failure: null }
      : row,
  );
  return stateOf(rows, true);
}

/** The "Make previews" run, one row per clip in the order they are made. */
export function reduceVjPreviewBackfill(
  state: VjBackfillState,
  action: VjBackfillAction,
): VjBackfillState {
  switch (action.kind) {
    case "start":
      return startedState(action.clipIds);
    case "stage":
      return updateOpenRow(state, action.clipId, (row) => ({
        ...row,
        stage: action.stage,
      }));
    case "done":
      return updateOpenRow(state, action.clipId, (row) => ({
        ...row,
        stage: "done",
        failure: null,
      }));
    case "fail":
      return updateOpenRow(state, action.clipId, (row) => ({
        ...row,
        stage: "failed",
        failure: action.failure,
      }));
    case "stop":
      return stoppedState(state);
    case "retryFailed":
      return retriedState(state);
    case "clear":
      return INITIAL_VJ_BACKFILL;
  }
}

/** The next waiting clip while running and nothing else is under way; null otherwise. */
export function nextVjBackfillClipId(state: VjBackfillState): string | null {
  if (!state.isRunning || state.rows.some(isActiveRow)) return null;
  return state.rows.find((row) => row.stage === "waiting")?.clipId ?? null;
}

export interface VjBackfillProgress {
  total: number;
  /** Rows made, failed or stopped. */
  settledCount: number;
  doneCount: number;
  failedCount: number;
  /** The 1-based number of the preview being made while running; null otherwise. */
  currentNumber: number | null;
}

/** Counts for the panel's progress line, bar and summary. */
export function vjBackfillProgressOf(
  state: VjBackfillState,
): VjBackfillProgress {
  const total = state.rows.length;
  const settledCount = state.rows.filter(isSettledRow).length;
  const doneCount = state.rows.filter((row) => row.stage === "done").length;
  const failedCount = state.rows.filter((row) => row.stage === "failed").length;
  return {
    total,
    settledCount,
    doneCount,
    failedCount,
    currentNumber:
      state.isRunning && settledCount < total ? settledCount + 1 : null,
  };
}
