import { VJ_LIMITS } from "../../../shared/contracts/vj";
import { VJ_UPLOAD_CONCURRENCY } from "../vj.constants";

export type VjUploadStage =
  | "queued"
  | "checking"
  | "uploading"
  | "waiting"
  | "saving"
  | "done"
  | "failed"
  | "cancelled"
  /** The clip is saved; its animated preview is being made (contract 9.4). */
  | "previewing";

export interface VjUploadRow {
  rowId: string;
  fileName: string;
  byteSize: number;
  packId: string | null;
  stage: VjUploadStage;
  percent: number;
  /** The cause behind a failed row, read by `vjReasonOf` and `vjErrorKeyOf`. */
  failure: unknown;
  clipId: string | null;
  /** Presign waits so far in this run (contract 3.3). */
  retryCount: number;
  /** Why the preview step failed on a saved clip; null when the preview was
   *  made or skipped. The row still ends done. */
  previewFailure: unknown;
}

export type VjUploadAction =
  | { kind: "add"; rows: VjUploadRow[] }
  | {
      kind: "stage";
      rowId: string;
      stage: VjUploadStage;
      percent?: number;
      /** Set with `previewing`, so a skipped preview still ends on its clip. */
      clipId?: string;
    }
  | { kind: "done"; rowId: string; clipId: string }
  | { kind: "fail"; rowId: string; failure: unknown }
  | { kind: "previewFailed"; rowId: string; failure: unknown }
  | { kind: "retry"; rowId: string }
  | { kind: "cancel"; rowId: string }
  | { kind: "dismiss"; rowId: string }
  | { kind: "clearFinished" };

const ACTIVE_STAGES: ReadonlySet<VjUploadStage> = new Set([
  "checking",
  "uploading",
  "waiting",
  "saving",
  // A preview holds its slot, so two recordings never run beside two uploads.
  "previewing",
]);
const SETTLED_STAGES: ReadonlySet<VjUploadStage> = new Set([
  "done",
  "failed",
  "cancelled",
]);

/** Whether a row is checking, uploading, waiting out a presign limit, saving
 *  or making its preview. */
export function isVjUploadActive(row: VjUploadRow): boolean {
  return ACTIVE_STAGES.has(row.stage);
}

function updateRow(
  rows: VjUploadRow[],
  rowId: string,
  update: (row: VjUploadRow) => VjUploadRow,
): VjUploadRow[] {
  let hasChanged = false;
  const nextRows = rows.map((row) => {
    if (row.rowId !== rowId) return row;
    const nextRow = update(row);
    if (nextRow !== row) hasChanged = true;
    return nextRow;
  });
  return hasChanged ? nextRows : rows;
}

/** Progress from a run that settles after its row was cancelled or settled leaves the row alone. */
function updateUnsettledRow(
  rows: VjUploadRow[],
  rowId: string,
  update: (row: VjUploadRow) => VjUploadRow,
): VjUploadRow[] {
  return updateRow(rows, rowId, (row) =>
    SETTLED_STAGES.has(row.stage) ? row : update(row),
  );
}

/** The upload rows, one per picked file. Pure. */
export function reduceVjUploadQueue(
  rows: VjUploadRow[],
  action: VjUploadAction,
): VjUploadRow[] {
  switch (action.kind) {
    case "add":
      return [
        ...rows,
        ...action.rows.map((row) => ({ ...row, previewFailure: null })),
      ];
    case "stage":
      return updateUnsettledRow(rows, action.rowId, (row) => ({
        ...row,
        stage: action.stage,
        percent: action.percent ?? row.percent,
        clipId: action.clipId ?? row.clipId,
        retryCount:
          action.stage === "waiting" ? row.retryCount + 1 : row.retryCount,
      }));
    case "done":
      return updateUnsettledRow(rows, action.rowId, (row) => ({
        ...row,
        stage: "done",
        percent: 100,
        clipId: action.clipId,
        failure: null,
      }));
    case "fail":
      return updateUnsettledRow(rows, action.rowId, (row) => ({
        ...row,
        stage: "failed",
        failure: action.failure,
      }));
    case "previewFailed":
      return updateUnsettledRow(rows, action.rowId, (row) => ({
        ...row,
        previewFailure: action.failure,
      }));
    case "retry":
      return updateRow(rows, action.rowId, (row) =>
        row.stage === "failed" || row.stage === "cancelled"
          ? {
              ...row,
              stage: "queued",
              percent: 0,
              failure: null,
              clipId: null,
              retryCount: 0,
              previewFailure: null,
            }
          : row,
      );
    case "cancel":
      // The clip of a previewing row is saved already: Skip preview ends it done.
      return updateUnsettledRow(rows, action.rowId, (row) =>
        row.stage === "previewing"
          ? { ...row, stage: "done", percent: 100 }
          : { ...row, stage: "cancelled" },
      );
    case "dismiss":
      return rows.filter((row) => row.rowId !== action.rowId);
    case "clearFinished":
      return rows.filter(
        (row) => row.stage !== "done" && row.stage !== "cancelled",
      );
  }
}

/**
 * The queued rows to start now, in order, while fewer than `concurrency` rows
 * are checking, uploading, waiting, saving or making a preview.
 */
export function nextVjUploadStarts(
  rows: readonly VjUploadRow[],
  concurrency: number = VJ_UPLOAD_CONCURRENCY,
): string[] {
  const activeCount = rows.filter(isVjUploadActive).length;
  const openSlots = Math.max(0, concurrency - activeCount);
  return rows
    .filter((row) => row.stage === "queued")
    .slice(0, openSlots)
    .map((row) => row.rowId);
}

/** A row that will still add a clip: queued or on its way. A previewing row's
 *  clip is saved already, so the cached counts include it once refreshed. */
function isVjUploadPending(row: VjUploadRow): boolean {
  if (row.stage === "previewing") return false;
  return row.stage === "queued" || isVjUploadActive(row);
}

export interface VjUploadCapacityInput {
  fileCount: number;
  packId: string | null;
  /** The target pack's cached clip count; null when it is unknown. */
  packClipCount: number | null;
  /** The library's cached clip count; null when it is unknown. */
  libraryClipCount: number | null;
  /** The rows already in the queue. */
  rows: readonly VjUploadRow[];
}

/**
 * For each new file, in order, the cap it would pass, or null when it fits:
 * the cached count plus the pending rows ahead of it reaching the library cap
 * gives `VJ_LIBRARY_FULL`, and the pack cap gives `VJ_PACK_FULL`. An unknown
 * count lets the file through, and the server still checks. Pure.
 */
export function vjUploadCapacityCodesOf(
  input: VjUploadCapacityInput,
): Array<"VJ_PACK_FULL" | "VJ_LIBRARY_FULL" | null> {
  const pendingRows = input.rows.filter(isVjUploadPending);
  let libraryTally =
    input.libraryClipCount === null
      ? null
      : input.libraryClipCount + pendingRows.length;
  let packTally =
    input.packId === null || input.packClipCount === null
      ? null
      : input.packClipCount +
        pendingRows.filter((row) => row.packId === input.packId).length;
  return Array.from({ length: input.fileCount }, () => {
    if (libraryTally !== null && libraryTally >= VJ_LIMITS.libraryClipsMax) {
      return "VJ_LIBRARY_FULL";
    }
    if (packTally !== null && packTally >= VJ_LIMITS.packClipsMax) {
      return "VJ_PACK_FULL";
    }
    if (libraryTally !== null) libraryTally += 1;
    if (packTally !== null) packTally += 1;
    return null;
  });
}
