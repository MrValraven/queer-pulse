import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjClipDTO, VjPackDTO } from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useInvalidateVjLibrary } from "../api/useInvalidateVjLibrary";
import { vjKeys } from "../api/vjKeys";
import { vjLibraryChangeOf } from "../api/vjLibraryInvalidation";
import { createVjUuid } from "../live/vjUuid";
import {
  VJ_PRESIGN_RETRY_MAX,
  VJ_PRESIGN_RETRY_WAIT_MS,
  VJ_UPLOAD_CONCURRENCY,
} from "../vj.constants";
import {
  isVjPresignRateLimited,
  prepareVjClipFile,
  uploadVjClip,
  type VjPreparedClip,
} from "./vjUpload";
import type { VjPreviewInput } from "./vjPreview";
import { makeAndAttachVjPreview } from "./vjPreviewUpload";
import {
  isVjUploadActive,
  nextVjUploadStarts,
  reduceVjUploadQueue,
  vjUploadCapacityCodesOf,
  type VjUploadAction,
  type VjUploadRow,
} from "./vjUploadQueue";
import { VjUploadFailure } from "./vjUploadFailure";

export interface VjClipUploads {
  rows: VjUploadRow[];
  isBusy: boolean;
  addFiles: (files: readonly File[], packId: string | null) => void;
  cancel: (rowId: string) => void;
  retry: (rowId: string) => void;
  dismiss: (rowId: string) => void;
  clearFinished: () => void;
}

interface VjUploadRunContext {
  dispatch: (action: VjUploadAction) => void;
  untitledTitle: string;
  isDemoMode: boolean;
  invalidate: ReturnType<typeof useInvalidateVjLibrary>;
}

/** Resolves after `durationMs`, or at once when `signal` aborts. */
function waitVjMs(durationMs: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, durationMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** Uploads one prepared clip, waiting out a presign 429 up to `VJ_PRESIGN_RETRY_MAX` times. */
async function uploadWithPresignWaits(
  row: VjUploadRow,
  prepared: VjPreparedClip,
  signal: AbortSignal,
  context: VjUploadRunContext,
): Promise<string | null> {
  let waitCount = 0;
  for (;;) {
    context.dispatch({
      kind: "stage",
      rowId: row.rowId,
      stage: "uploading",
      percent: 0,
    });
    try {
      const clip = await uploadVjClip(prepared, {
        packId: row.packId,
        isDemoMode: context.isDemoMode,
        signal,
        onProgress: (stage, percent) => {
          if (signal.aborted) return;
          context.dispatch({ kind: "stage", rowId: row.rowId, stage, percent });
        },
      });
      return clip.id;
    } catch (error) {
      if (signal.aborted) return null;
      if (!isVjPresignRateLimited(error) || waitCount >= VJ_PRESIGN_RETRY_MAX) {
        throw error;
      }
      waitCount += 1;
      context.dispatch({ kind: "stage", rowId: row.rowId, stage: "waiting" });
      await waitVjMs(VJ_PRESIGN_RETRY_WAIT_MS, signal);
      if (signal.aborted) return null;
    }
  }
}

/** What the preview is made from: the local file, so nothing is downloaded. */
function previewInputOf(prepared: VjPreparedClip, file: File): VjPreviewInput {
  return prepared.contentType === "image/gif"
    ? { kind: "gif", bytes: prepared.body }
    : { kind: "videoFile", file, durationMs: prepared.durationMs };
}

/**
 * The step after the clip is saved (contract 9.4). The clip shows in the grid
 * at once, then the row makes the preview. Never throws: a failure stays on
 * the row as `previewFailure` and the row still ends done, so "Make previews"
 * can try the clip again later. An abort here comes from Skip preview or
 * unmount, which the reducer already settled.
 */
async function runVjPreviewStep(
  row: VjUploadRow,
  prepared: VjPreparedClip,
  file: File,
  clipId: string,
  signal: AbortSignal,
  context: VjUploadRunContext,
): Promise<void> {
  const changeIds = {
    packId: row.packId,
    clipId,
    packIds: row.packId ? [row.packId] : [],
  };
  context.invalidate(
    vjLibraryChangeOf({
      kind: row.packId ? "pack_clips_changed" : "clip_created",
      ...changeIds,
    }),
  );
  context.dispatch({
    kind: "stage",
    rowId: row.rowId,
    stage: "previewing",
    percent: 100,
    clipId,
  });
  try {
    await makeAndAttachVjPreview({
      clipId,
      input: previewInputOf(prepared, file),
      isDemoMode: context.isDemoMode,
      signal,
      onStage: () => undefined,
    });
    context.invalidate(
      vjLibraryChangeOf({ kind: "clip_preview_changed", ...changeIds }),
    );
  } catch (error) {
    if (!signal.aborted) {
      context.dispatch({
        kind: "previewFailed",
        rowId: row.rowId,
        failure: error,
      });
    }
  }
  context.dispatch({ kind: "done", rowId: row.rowId, clipId });
}

/** One row from checking to done; a throw before the clip is saved fails this
 *  row only. True when the clip was saved. */
async function runVjUploadRow(
  row: VjUploadRow,
  file: File,
  signal: AbortSignal,
  context: VjUploadRunContext,
): Promise<boolean> {
  context.dispatch({
    kind: "stage",
    rowId: row.rowId,
    stage: "checking",
    percent: 0,
  });
  try {
    const prepared = await prepareVjClipFile(file, context.untitledTitle);
    if (signal.aborted) return false;
    const clipId = await uploadWithPresignWaits(row, prepared, signal, context);
    if (clipId === null || signal.aborted) return false;
    await runVjPreviewStep(row, prepared, file, clipId, signal, context);
    return true;
  } catch (error) {
    if (!signal.aborted) {
      context.dispatch({ kind: "fail", rowId: row.rowId, failure: error });
    }
    return false;
  }
}

/** Clips whose upload row is making their preview right now, so "Make
 *  previews" leaves them to that row. */
export function vjPreviewingClipIdsOf(rows: readonly VjUploadRow[]): string[] {
  return rows.flatMap((row) =>
    row.stage === "previewing" && row.clipId !== null ? [row.clipId] : [],
  );
}

function newUploadRow(file: File, packId: string | null): VjUploadRow {
  return {
    rowId: createVjUuid(),
    fileName: file.name,
    byteSize: file.size,
    packId,
    stage: "queued",
    percent: 0,
    failure: null,
    clipId: null,
    retryCount: 0,
    previewFailure: null,
  };
}

/**
 * The library's upload queue: two files at a time, each row with its own
 * stage, progress and named failure. A saved clip then makes its animated
 * preview from the local file; a preview failure is named on the done row.
 * Cancel aborts that row (Skip preview while previewing); unmount aborts
 * every run. Logs nothing.
 */
export function useVjClipUploads(): VjClipUploads {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const invalidate = useInvalidateVjLibrary();
  const queryClient = useQueryClient();
  const [rows, dispatch] = useReducer(reduceVjUploadQueue, []);
  const filesRef = useRef(new Map<string, File>());
  const controllersRef = useRef(new Map<string, AbortController>());
  const rowsRef = useRef(rows);
  const untitledTitle = t("vj:upload.untitledTitle");
  const contextRef = useRef<VjUploadRunContext>({
    dispatch,
    untitledTitle,
    isDemoMode: demoMode,
    invalidate,
  });

  // Declared before the start effect, so a run started in this commit reads the latest values.
  useEffect(() => {
    rowsRef.current = rows;
    contextRef.current = {
      dispatch,
      untitledTitle,
      isDemoMode: demoMode,
      invalidate,
    };
  });

  useEffect(() => {
    const controllers = controllersRef.current;
    for (const rowId of nextVjUploadStarts(rows, VJ_UPLOAD_CONCURRENCY)) {
      const row = rows.find((candidate) => candidate.rowId === rowId);
      const file = filesRef.current.get(rowId);
      if (!row || controllers.has(rowId)) continue;
      if (!file) {
        dispatch({ kind: "dismiss", rowId });
        continue;
      }
      const controller = new AbortController();
      controllers.set(rowId, controller);
      void runVjUploadRow(
        row,
        file,
        controller.signal,
        contextRef.current,
      ).then((isSaved) => {
        if (controllers.get(rowId) === controller) controllers.delete(rowId);
        // A saved row can never run again, so its File is let go.
        if (isSaved) filesRef.current.delete(rowId);
      });
    }
  }, [rows]);

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      for (const controller of controllers.values()) controller.abort();
      controllers.clear();
    };
  }, []);

  const addFiles = useCallback(
    (files: readonly File[], packId: string | null) => {
      if (files.length === 0) return;
      const isDemoMode = contextRef.current.isDemoMode;
      const packs = queryClient.getQueryData<VjPackDTO[]>(
        vjKeys.packs(isDemoMode),
      );
      const libraryClips = queryClient.getQueryData<VjClipDTO[]>(
        vjKeys.clips(isDemoMode),
      );
      const capacityCodes = vjUploadCapacityCodesOf({
        fileCount: files.length,
        packId,
        packClipCount:
          packs?.find((pack) => pack.id === packId)?.clipCount ?? null,
        libraryClipCount: libraryClips?.length ?? null,
        rows: rowsRef.current,
      });
      const newRows = files.map((file, fileIndex) => {
        const row = newUploadRow(file, packId);
        filesRef.current.set(row.rowId, file);
        const capacityCode = capacityCodes[fileIndex] ?? null;
        // A file past a cap fails before any request; Retry sends it anyway,
        // so a count that changed since reaches the server's own check.
        return capacityCode === null
          ? row
          : {
              ...row,
              stage: "failed" as const,
              failure: new VjUploadFailure(capacityCode),
            };
      });
      rowsRef.current = [...rowsRef.current, ...newRows];
      dispatch({ kind: "add", rows: newRows });
    },
    [queryClient],
  );

  const abortRun = useCallback((rowId: string) => {
    controllersRef.current.get(rowId)?.abort();
    controllersRef.current.delete(rowId);
  }, []);

  const cancel = useCallback(
    (rowId: string) => {
      abortRun(rowId);
      dispatch({ kind: "cancel", rowId });
    },
    [abortRun],
  );

  const retry = useCallback((rowId: string) => {
    dispatch({ kind: "retry", rowId });
  }, []);

  const dismiss = useCallback(
    (rowId: string) => {
      abortRun(rowId);
      filesRef.current.delete(rowId);
      dispatch({ kind: "dismiss", rowId });
    },
    [abortRun],
  );

  const clearFinished = useCallback(() => {
    for (const row of rowsRef.current) {
      if (row.stage === "done" || row.stage === "cancelled") {
        filesRef.current.delete(row.rowId);
      }
    }
    dispatch({ kind: "clearFinished" });
  }, []);

  const isBusy = useMemo(
    () => rows.some((row) => row.stage === "queued" || isVjUploadActive(row)),
    [rows],
  );

  return { rows, isBusy, addFiles, cancel, retry, dismiss, clearFinished };
}
