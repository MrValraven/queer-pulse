import { describe, expect, it } from "vitest";
import {
  isVjUploadActive,
  nextVjUploadStarts,
  reduceVjUploadQueue,
  vjUploadCapacityCodesOf,
  type VjUploadRow,
  type VjUploadStage,
} from "./vjUploadQueue";

function uploadRow(
  rowId: string,
  stage: VjUploadStage = "queued",
): VjUploadRow {
  return {
    rowId,
    fileName: `${rowId}.mp4`,
    byteSize: 1024,
    packId: null,
    stage,
    percent: 0,
    failure: null,
    clipId: null,
    retryCount: 0,
    previewFailure: null,
  };
}

function stagesOf(rows: readonly VjUploadRow[]): VjUploadStage[] {
  return rows.map((row) => row.stage);
}

function fourQueuedRows(): VjUploadRow[] {
  return reduceVjUploadQueue([], {
    kind: "add",
    rows: ["row-1", "row-2", "row-3", "row-4"].map((rowId) => uploadRow(rowId)),
  });
}

function startRows(
  rows: VjUploadRow[],
  rowIds: readonly string[],
): VjUploadRow[] {
  return rowIds.reduce(
    (current, rowId) =>
      reduceVjUploadQueue(current, { kind: "stage", rowId, stage: "checking" }),
    rows,
  );
}

describe("vjUploadQueue", () => {
  it("starts two files at a time", () => {
    let rows = fourQueuedRows();
    expect(nextVjUploadStarts(rows)).toEqual(["row-1", "row-2"]);
    rows = startRows(rows, ["row-1", "row-2"]);
    expect(nextVjUploadStarts(rows)).toEqual([]);
    rows = reduceVjUploadQueue(rows, {
      kind: "done",
      rowId: "row-1",
      clipId: "clip-1",
    });
    expect(nextVjUploadStarts(rows)).toEqual(["row-3"]);
    expect(rows[0]).toMatchObject({
      stage: "done",
      percent: 100,
      clipId: "clip-1",
    });
  });

  it("keeps the other files going when one fails", () => {
    let rows = startRows(fourQueuedRows(), ["row-1", "row-2"]);
    const failure = new Error("VJ_UPLOAD_FORMAT_MOV");
    rows = reduceVjUploadQueue(rows, {
      kind: "fail",
      rowId: "row-1",
      failure,
    });
    expect(stagesOf(rows)).toEqual(["failed", "checking", "queued", "queued"]);
    expect(rows[0]?.failure).toBe(failure);
    expect(rows[1]?.failure).toBeNull();
    expect(nextVjUploadStarts(rows)).toEqual(["row-3"]);
  });

  it("counts a row waiting out a presign limit as running", () => {
    let rows = startRows(fourQueuedRows(), ["row-1", "row-2"]);
    rows = reduceVjUploadQueue(rows, {
      kind: "stage",
      rowId: "row-1",
      stage: "waiting",
    });
    expect(rows[0]?.retryCount).toBe(1);
    expect(nextVjUploadStarts(rows)).toEqual([]);
  });

  it("retries a failed row from the start", () => {
    let rows = startRows(fourQueuedRows(), ["row-1"]);
    rows = reduceVjUploadQueue(rows, {
      kind: "stage",
      rowId: "row-1",
      stage: "uploading",
      percent: 60,
    });
    rows = reduceVjUploadQueue(rows, {
      kind: "fail",
      rowId: "row-1",
      failure: new Error("network"),
    });
    rows = reduceVjUploadQueue(rows, { kind: "retry", rowId: "row-1" });
    expect(rows[0]).toMatchObject({
      stage: "queued",
      failure: null,
      percent: 0,
      retryCount: 0,
    });
  });

  it("cancels a running row and clears finished ones", () => {
    let rows = startRows(fourQueuedRows(), ["row-1", "row-2"]);
    rows = reduceVjUploadQueue(rows, { kind: "cancel", rowId: "row-1" });
    expect(rows[0]?.stage).toBe("cancelled");
    // Progress from the cancelled run arriving late leaves the row cancelled.
    rows = reduceVjUploadQueue(rows, {
      kind: "stage",
      rowId: "row-1",
      stage: "uploading",
      percent: 40,
    });
    expect(rows[0]?.stage).toBe("cancelled");
    rows = reduceVjUploadQueue(rows, {
      kind: "done",
      rowId: "row-2",
      clipId: "clip-2",
    });
    rows = startRows(rows, ["row-3"]);
    rows = reduceVjUploadQueue(rows, {
      kind: "fail",
      rowId: "row-3",
      failure: new Error("network"),
    });
    rows = startRows(rows, ["row-4"]);
    rows = reduceVjUploadQueue(rows, { kind: "clearFinished" });
    expect(rows.map((row) => row.rowId)).toEqual(["row-3", "row-4"]);
    expect(stagesOf(rows)).toEqual(["failed", "checking"]);
  });

  it("dismisses one row and leaves the rest", () => {
    const rows = reduceVjUploadQueue(fourQueuedRows(), {
      kind: "dismiss",
      rowId: "row-2",
    });
    expect(rows.map((row) => row.rowId)).toEqual(["row-1", "row-3", "row-4"]);
  });
});

describe("vjUploadQueue preview step", () => {
  it("Skip preview ends a previewing row as done", () => {
    let rows = startRows(fourQueuedRows(), ["row-1"]);
    rows = reduceVjUploadQueue(rows, {
      kind: "stage",
      rowId: "row-1",
      stage: "previewing",
      percent: 100,
      clipId: "clip-1",
    });
    rows = reduceVjUploadQueue(rows, { kind: "cancel", rowId: "row-1" });
    expect(rows[0]).toMatchObject({
      stage: "done",
      percent: 100,
      clipId: "clip-1",
      previewFailure: null,
    });
    // The aborted preview run settling late leaves the row done and clean.
    rows = reduceVjUploadQueue(rows, {
      kind: "previewFailed",
      rowId: "row-1",
      failure: new Error("VJ_PREVIEW_FAILED"),
    });
    expect(rows[0]?.previewFailure).toBeNull();
  });

  it("a previewing row holds an upload slot", () => {
    let rows = startRows(fourQueuedRows(), ["row-1", "row-2"]);
    rows = reduceVjUploadQueue(rows, {
      kind: "stage",
      rowId: "row-1",
      stage: "previewing",
      clipId: "clip-1",
    });
    expect(isVjUploadActive(rows[0] as VjUploadRow)).toBe(true);
    expect(nextVjUploadStarts(rows)).toEqual([]);
    rows = reduceVjUploadQueue(rows, {
      kind: "done",
      rowId: "row-1",
      clipId: "clip-1",
    });
    expect(nextVjUploadStarts(rows)).toEqual(["row-3"]);
  });

  it("a preview failure stays on a done row", () => {
    let rows = startRows(fourQueuedRows(), ["row-1"]);
    rows = reduceVjUploadQueue(rows, {
      kind: "stage",
      rowId: "row-1",
      stage: "previewing",
      clipId: "clip-1",
    });
    const previewFailure = new Error("VJ_PREVIEW_UNSUPPORTED");
    rows = reduceVjUploadQueue(rows, {
      kind: "previewFailed",
      rowId: "row-1",
      failure: previewFailure,
    });
    rows = reduceVjUploadQueue(rows, {
      kind: "done",
      rowId: "row-1",
      clipId: "clip-1",
    });
    expect(rows[0]).toMatchObject({
      stage: "done",
      percent: 100,
      clipId: "clip-1",
      failure: null,
    });
    expect(rows[0]?.previewFailure).toBe(previewFailure);
  });

  it("retry clears a preview failure", () => {
    const failedRow: VjUploadRow = {
      ...uploadRow("row-1", "failed"),
      failure: new Error("network"),
      previewFailure: new Error("VJ_PREVIEW_FAILED"),
    };
    const rows = reduceVjUploadQueue([failedRow], {
      kind: "retry",
      rowId: "row-1",
    });
    expect(rows[0]).toMatchObject({
      stage: "queued",
      failure: null,
      previewFailure: null,
    });
    const addedRows = reduceVjUploadQueue([], {
      kind: "add",
      rows: [{ ...uploadRow("row-2"), previewFailure: new Error("stale") }],
    });
    expect(addedRows[0]?.previewFailure).toBeNull();
  });

  it("does not count a previewing row's saved clip against the caps again", () => {
    const previewingRow = {
      ...uploadRow("row-1", "previewing"),
      packId: "pack-1",
      clipId: "clip-1",
    };
    expect(
      vjUploadCapacityCodesOf({
        fileCount: 1,
        packId: "pack-1",
        packClipCount: 199,
        libraryClipCount: 10,
        rows: [previewingRow],
      }),
    ).toEqual([null]);
  });
});

describe("vjUploadCapacityCodesOf", () => {
  it("fails the files past the pack cap, counting the pending rows ahead", () => {
    const pendingInPack = {
      ...uploadRow("row-1", "uploading"),
      packId: "pack-1",
    };
    const finished = { ...uploadRow("row-2", "failed"), packId: "pack-1" };
    expect(
      vjUploadCapacityCodesOf({
        fileCount: 3,
        packId: "pack-1",
        packClipCount: 197,
        libraryClipCount: 10,
        rows: [pendingInPack, finished],
      }),
    ).toEqual([null, null, "VJ_PACK_FULL"]);
  });

  it("fails the files past the library cap before the pack cap", () => {
    expect(
      vjUploadCapacityCodesOf({
        fileCount: 2,
        packId: "pack-1",
        packClipCount: 0,
        libraryClipCount: 998,
        rows: [uploadRow("row-1")],
      }),
    ).toEqual([null, "VJ_LIBRARY_FULL"]);
  });

  it("lets every file through while the counts are unknown", () => {
    expect(
      vjUploadCapacityCodesOf({
        fileCount: 2,
        packId: "pack-1",
        packClipCount: null,
        libraryClipCount: null,
        rows: [],
      }),
    ).toEqual([null, null]);
  });
});
