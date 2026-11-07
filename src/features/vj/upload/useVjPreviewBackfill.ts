import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { useInvalidateVjLibrary } from "../api/useInvalidateVjLibrary";
import {
  useVjClipsMediaFetcher,
  type VjClipsMediaFetcher,
} from "../api/useVjClipsMediaFetcher";
import { vjLibraryChangeOf } from "../api/vjLibraryInvalidation";
import type { VjPreviewInput } from "./vjPreview";
import {
  INITIAL_VJ_BACKFILL,
  nextVjBackfillClipId,
  reduceVjPreviewBackfill,
  type VjBackfillAction,
  type VjBackfillState,
} from "./vjPreviewBackfillQueue";
import {
  isVjPreviewSupported,
  pickVjPreviewRecorderType,
} from "./vjPreviewFormat";
import { waitVjPageVisible } from "./vjPreviewRecorder";
import { makeAndAttachVjPreview } from "./vjPreviewUpload";
import { VjUploadFailure } from "./vjUploadFailure";

export interface VjPreviewBackfill {
  state: VjBackfillState;
  /** Clips with no preview, newest first, from the cached clip list. */
  missingClipIds: string[];
  /** A recorder type works in this browser (videos); GIFs also need ImageDecoder, checked per clip. */
  isSupported: boolean;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  retryFailed: () => void;
  clear: () => void;
}

interface VjBackfillRunContext {
  dispatch: (action: VjBackfillAction) => void;
  /** Reads the latest cached clip list, so a clip deleted mid-run is noticed. */
  clipOf: (clipId: string) => VjClipDTO | undefined;
  fetchClipsMedia: VjClipsMediaFetcher;
  isDemoMode: boolean;
  invalidate: ReturnType<typeof useInvalidateVjLibrary>;
}

/** The clip being made and the run it belongs to. */
interface VjBackfillActiveRun {
  clipId: string;
  controller: AbortController;
}

/** The v1 refusal shape for a clip that left the library. */
function clipGoneFailure(): ApiError {
  return new ApiError(404, "VJ_CLIP_NOT_FOUND", {
    statusCode: 404,
    code: "VJ_CLIP_NOT_FOUND",
  });
}

/** A GIF's bytes from its presigned URL; a failed or refused answer names VJ_PREVIEW_FAILED. */
async function fetchGifBytes(url: string, signal: AbortSignal): Promise<Blob> {
  try {
    const response = await fetch(url, { credentials: "omit", signal });
    if (!response.ok) {
      throw new VjUploadFailure("VJ_PREVIEW_FAILED", {
        cause: new ApiError(response.status, "vj-preview-media-failed"),
      });
    }
    return await response.blob();
  } catch (error) {
    if (signal.aborted || error instanceof VjUploadFailure) throw error;
    throw new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: error });
  }
}

/** Asks for this one clip's presigned URL right before it is used, since the URLs expire. */
async function readPreviewInput(
  clip: VjClipDTO,
  signal: AbortSignal,
  context: VjBackfillRunContext,
): Promise<VjPreviewInput> {
  const media = await context.fetchClipsMedia([clip.id], signal);
  const mediaItem = media.items.find((item) => item.clipId === clip.id);
  if (mediaItem === undefined) throw clipGoneFailure();
  if (clip.mediaKind === "gif") {
    return { kind: "gif", bytes: await fetchGifBytes(mediaItem.url, signal) };
  }
  return { kind: "videoUrl", url: mediaItem.url, durationMs: clip.durationMs };
}

/**
 * Makes one clip's preview. A hidden tab pauses here until it is visible again,
 * so the media URL is fresh when the recording starts. Answers the action that
 * settles the row, or null when the run was stopped.
 */
async function runVjBackfillClip(
  clipId: string,
  signal: AbortSignal,
  context: VjBackfillRunContext,
): Promise<VjBackfillAction | null> {
  try {
    await waitVjPageVisible(signal);
    const clip = context.clipOf(clipId);
    if (clip === undefined) {
      return { kind: "fail", clipId, failure: clipGoneFailure() };
    }
    if (!isVjPreviewSupported(clip.mediaKind)) {
      throw new VjUploadFailure("VJ_PREVIEW_UNSUPPORTED");
    }
    context.dispatch({ kind: "stage", clipId, stage: "reading" });
    const input = await readPreviewInput(clip, signal, context);
    signal.throwIfAborted();
    const savedClip = await makeAndAttachVjPreview({
      clipId,
      input,
      isDemoMode: context.isDemoMode,
      signal,
      onStage: (stage) => {
        if (!signal.aborted) context.dispatch({ kind: "stage", clipId, stage });
      },
    });
    // A preview saved just as the run stopped is still on the clip, so the
    // library reads it either way; the reducer ignores `done` on a stopped row.
    context.invalidate(
      vjLibraryChangeOf({
        kind: "clip_preview_changed",
        clipId,
        packIds: savedClip.packIds,
      }),
    );
    return { kind: "done", clipId };
  } catch (error) {
    if (signal.aborted) return null;
    return { kind: "fail", clipId, failure: error };
  }
}

function createdAtMsOf(clip: VjClipDTO): number {
  const createdAtMs = Date.parse(clip.createdAt);
  return Number.isFinite(createdAtMs) ? createdAtMs : 0;
}

/** Clips with no preview, newest first (ties by id, newest first, as the
 *  server sorts). A clip its upload row is still previewing is left out. */
function missingPreviewClipIdsOf(
  clips: readonly VjClipDTO[] | undefined,
  previewingClipIds: ReadonlySet<string>,
): string[] {
  if (clips === undefined) return [];
  return clips
    .filter(
      (clip) => clip.previewUrl === null && !previewingClipIds.has(clip.id),
    )
    .sort(
      (first, second) =>
        createdAtMsOf(second) - createdAtMsOf(first) ||
        second.id.localeCompare(first.id),
    )
    .map((clip) => clip.id);
}

/**
 * "Make previews": makes the missing animated previews one clip at a time, so
 * the machine stays responsive, each row with its stage and named failure.
 * Clips in `previewingClipIds` (an upload row is making theirs) are left out.
 * Stop aborts the clip under way; unmount aborts the run. Logs nothing.
 */
export function useVjPreviewBackfill(
  clips: readonly VjClipDTO[] | undefined,
  previewingClipIds: readonly string[] = [],
): VjPreviewBackfill {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateVjLibrary();
  const fetchClipsMedia = useVjClipsMediaFetcher();
  const [state, dispatch] = useReducer(
    reduceVjPreviewBackfill,
    INITIAL_VJ_BACKFILL,
  );
  const [isSupported] = useState(() => pickVjPreviewRecorderType() !== null);
  const previewingKey = previewingClipIds.join("|");
  const missingClipIds = useMemo(
    () =>
      missingPreviewClipIdsOf(
        clips,
        new Set(previewingKey === "" ? [] : previewingKey.split("|")),
      ),
    [clips, previewingKey],
  );
  const controllerRef = useRef<AbortController | null>(null);
  const activeRunRef = useRef<VjBackfillActiveRun | null>(null);
  const clipsRef = useRef(clips);
  const stateRef = useRef(state);
  const missingClipIdsRef = useRef(missingClipIds);
  const clipOf = useCallback(
    (clipId: string) => clipsRef.current?.find((clip) => clip.id === clipId),
    [],
  );
  const contextRef = useRef<VjBackfillRunContext>({
    dispatch,
    clipOf,
    fetchClipsMedia,
    isDemoMode: demoMode,
    invalidate,
  });

  // Declared before the run effect, so a clip started in this commit reads the latest values.
  useEffect(() => {
    clipsRef.current = clips;
    stateRef.current = state;
    missingClipIdsRef.current = missingClipIds;
    contextRef.current = {
      dispatch,
      clipOf,
      fetchClipsMedia,
      isDemoMode: demoMode,
      invalidate,
    };
  });

  useEffect(() => {
    const clipId = nextVjBackfillClipId(state);
    const controller = controllerRef.current;
    if (clipId === null || controller === null || controller.signal.aborted) {
      return;
    }
    if (activeRunRef.current !== null) return;
    const activeRun: VjBackfillActiveRun = { clipId, controller };
    activeRunRef.current = activeRun;
    void runVjBackfillClip(clipId, controller.signal, contextRef.current).then(
      (settleAction) => {
        // Let go of the run before settling the row, so the next clip can start.
        if (activeRunRef.current === activeRun) activeRunRef.current = null;
        if (settleAction !== null) dispatch(settleAction);
      },
    );
  }, [state]);

  const abortRun = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    activeRunRef.current = null;
  }, []);

  useEffect(() => abortRun, [abortRun]);

  const start = useCallback(() => {
    if (stateRef.current.isRunning) return;
    abortRun();
    controllerRef.current = new AbortController();
    dispatch({ kind: "start", clipIds: missingClipIdsRef.current });
  }, [abortRun]);

  const stop = useCallback(() => {
    abortRun();
    dispatch({ kind: "stop" });
  }, [abortRun]);

  const retryFailed = useCallback(() => {
    if (controllerRef.current === null) {
      controllerRef.current = new AbortController();
    }
    dispatch({ kind: "retryFailed" });
  }, []);

  const clear = useCallback(() => {
    abortRun();
    dispatch({ kind: "clear" });
  }, [abortRun]);

  return {
    state,
    missingClipIds,
    isSupported,
    isRunning: state.isRunning,
    start,
    stop,
    retryFailed,
    clear,
  };
}
