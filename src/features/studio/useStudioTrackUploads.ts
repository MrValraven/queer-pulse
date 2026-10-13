import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { StudioTrackRowView } from "./api/studio.adapters";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioAudioContentType } from "./api/studio.types";
import {
  uploadStudioAudio,
  type StudioAudioUploadHandle,
} from "./api/studioAudioUpload";
import { useReorderStudioTracks } from "./api/useStudioReleaseMutations";
import {
  useConfirmStudioTrackAudio,
  useCreateStudioTrack,
  useDeleteStudioTrack,
} from "./api/useStudioTrackMutations";
import {
  UPLOAD_SLOT_COUNT,
  createLatestSender,
  createProgressReporter,
  createSerialChain,
  createSlotQueue,
  type LatestSender,
} from "./studioUploadQueue";
import {
  isRetryableUploadError,
  removeErrorKeyOf,
  studioWriteErrorKeyOf,
  titleFromFileName,
  uploadErrorKeyOf,
  validateAudioFiles,
  type FileRejectionReason,
} from "./studioUploadValidation";

export type UploadRowStage =
  | "queued"
  | "creating"
  | "uploading"
  | "confirming"
  | "ready"
  | "failed"
  | "noAudio";

export interface UploadRow {
  localId: string;
  trackId: string | null;
  title: string;
  fileName: string | null;
  stage: UploadRowStage;
  progress: number;
  errorKey: string | null;
  durationLabel: string | null;
  /** False when Retry cannot fix the failure; the row then offers Remove. */
  isRetryable: boolean;
}

/** What a row needs to resume where it failed. Kept out of render state. */
interface RowWork {
  file: File;
  contentType: StudioAudioContentType;
  uploadedKey: string | null;
  handle: StudioAudioUploadHandle | null;
  isRunning: boolean;
}

export interface StudioTrackUploads {
  rows: UploadRow[];
  rejections: { fileName: string; reason: FileRejectionReason }[];
  addFiles: (files: File[]) => void;
  retry: (localId: string) => void;
  remove: (localId: string) => void;
  move: (localId: string, offset: -1 | 1) => void;
  moveTo: (localId: string, targetIndex: number) => void;
  /** Shows a saved track title on its row (and to the publish step). */
  rename: (localId: string, title: string) => void;
  canReorder: boolean;
  hasPendingUploads: boolean;
  orderErrorKey: string | null;
}

let localSequence = 0;
const nextLocalId = () => `upload-${(localSequence += 1)}`;

const rowFromTrack = (track: StudioTrackRowView): UploadRow => ({
  localId: nextLocalId(),
  trackId: track.id,
  title: track.title,
  fileName: null,
  stage: track.hasAudio ? "ready" : "noAudio",
  progress: track.hasAudio ? 100 : 0,
  errorKey: null,
  durationLabel: track.durationLabel,
  isRetryable: false,
});

const rowFromFile = (localId: string, file: File): UploadRow => ({
  localId,
  trackId: null,
  title: titleFromFileName(file.name),
  fileName: file.name,
  stage: "queued",
  progress: 0,
  errorKey: null,
  durationLabel: null,
  isRetryable: true,
});

const trackIdsOf = (rows: UploadRow[]) =>
  rows.flatMap((row) => (row.trackId === null ? [] : [row.trackId]));

/** Rows sorted into the server's order; rows it does not hold yet go last. */
function rowsInOrder(rows: UploadRow[], order: string[]): UploadRow[] {
  const rank = new Map(order.map((trackId, index) => [trackId, index]));
  const rankOf = (row: UploadRow) =>
    (row.trackId === null ? undefined : rank.get(row.trackId)) ?? order.length;
  return [...rows].sort((first, second) => rankOf(first) - rankOf(second));
}

/** The rows, a synchronous copy for async steps, and the server's order. */
function useUploadRows(
  releaseId: string | null,
  initialTracks: StudioTrackRowView[],
) {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const rowsRef = useRef<UploadRow[]>([]);
  const isMountedRef = useRef(false);
  const seededReleaseRef = useRef<string | null>(null);
  /** Track ids in the order the server last confirmed. */
  const serverOrderRef = useRef<string[]>([]);

  function commitRows(next: UploadRow[]) {
    if (!isMountedRef.current) return;
    rowsRef.current = next;
    setRows(next);
  }
  function patchRow(localId: string, patch: Partial<UploadRow>) {
    commitRows(
      rowsRef.current.map((row) =>
        row.localId === localId ? { ...row, ...patch } : row,
      ),
    );
  }

  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // A layout effect, so the seeded rows paint in the first frame.
  useLayoutEffect(() => {
    if (!releaseId || seededReleaseRef.current === releaseId) return;
    seededReleaseRef.current = releaseId;
    serverOrderRef.current = initialTracks.map((track) => track.id);
    commitRows(initialTracks.map(rowFromTrack));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeds once per release
  }, [releaseId]);

  return {
    rows,
    rowsRef,
    isMountedRef,
    serverOrderRef,
    commitRows,
    patchRow,
    rowOf: (localId: string) =>
      rowsRef.current.find((candidate) => candidate.localId === localId),
  };
}

type UploadRowsState = ReturnType<typeof useUploadRows>;

interface ReorderRequest {
  releaseId: string;
  trackIds: string[];
}

/** Reorders go out one at a time with the newest order; a refusal puts the
 *  rows back in the server's last confirmed order. */
function useTrackOrder(releaseId: string | null, rowState: UploadRowsState) {
  const reorder = useReorderStudioTracks();
  const [orderErrorKey, setOrderErrorKey] = useState<string | null>(null);
  const { rowsRef, serverOrderRef, isMountedRef, commitRows } = rowState;
  const senderRef = useRef<LatestSender<ReorderRequest> | null>(null);
  /** Removed rows whose track may still be on the server. The server refuses
   *  an order that leaves out a track it holds, so the sync waits for them. */
  const heldRemovalsRef = useRef(new Set<string>());

  async function sendOrder(request: ReorderRequest) {
    try {
      await reorder.mutateAsync(request);
      serverOrderRef.current = request.trackIds;
      return true;
    } catch (error) {
      if (!isMountedRef.current) return false;
      commitRows(rowsInOrder(rowsRef.current, serverOrderRef.current));
      setOrderErrorKey(studioWriteErrorKeyOf(error));
      return false;
    }
  }

  /** Called from events and async steps only, so the sender is made there. */
  function submitOrder(rows: UploadRow[]) {
    if (!releaseId || rows.some((row) => row.trackId === null)) return;
    setOrderErrorKey(null);
    senderRef.current ??= createLatestSender(sendOrder);
    senderRef.current.submit({ releaseId, trackIds: trackIdsOf(rows) });
  }

  function moveTo(localId: string, targetIndex: number) {
    const current = rowsRef.current;
    const fromIndex = current.findIndex((row) => row.localId === localId);
    if (
      fromIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= current.length ||
      fromIndex === targetIndex
    )
      return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(targetIndex, 0, moved);
    commitRows(next);
    // The last held removal to settle sends the shown order.
    if (heldRemovalsRef.current.size > 0) return;
    submitOrder(next);
  }

  /** After a create or a removal: once every row has a track, the server gets
   *  the shown order when it differs (a retried create lands last on the
   *  server, and removing the last trackless row can leave that order behind). */
  function syncOrderIfNeeded() {
    if (heldRemovalsRef.current.size > 0 || !isMountedRef.current) return;
    const shownIds = trackIdsOf(rowsRef.current);
    // The server takes an order of one track or more.
    if (shownIds.length === 0) return;
    if (shownIds.join(",") !== serverOrderRef.current.join(","))
      submitOrder(rowsRef.current);
  }

  /** Ends the hold a removed row placed, if it placed one, then sends the
   *  shown order when `shouldSync` is set. */
  function releaseOrderSync(localId: string, shouldSync: boolean) {
    const wasHeld = heldRemovalsRef.current.delete(localId);
    if (wasHeld && shouldSync) syncOrderIfNeeded();
  }

  return {
    orderErrorKey,
    moveTo,
    syncOrderIfNeeded,
    holdOrderSync: (localId: string) => {
      heldRemovalsRef.current.add(localId);
    },
    releaseOrderSync,
  };
}

/**
 * Each file runs create track, upload, confirm. Creates run one at a time in
 * list order, so the server's positions match the list; uploads share a few
 * slots, so each presigns just before its PUT. A failure stops the row at
 * that stage; Retry resumes there, reusing the created track and, after a
 * failed confirm, the uploaded key, so no retry ever makes a second track.
 * An unreadable file (the server deletes the object) uploads again on Retry.
 * Unmounting aborts every upload and stops every later step.
 */
export function useStudioTrackUploads(
  releaseId: string | null,
  subprofileId: string,
  initialTracks: StudioTrackRowView[],
): StudioTrackUploads {
  const { demoMode } = useDemoMode();
  const createTrack = useCreateStudioTrack();
  const confirmAudio = useConfirmStudioTrackAudio();
  const deleteTrack = useDeleteStudioTrack();
  const rowState = useUploadRows(releaseId, initialTracks);
  const { rows, rowsRef, isMountedRef, serverOrderRef } = rowState;
  const { commitRows, patchRow, rowOf } = rowState;
  const order = useTrackOrder(releaseId, rowState);
  const [rejections, setRejections] = useState<
    { fileName: string; reason: FileRejectionReason }[]
  >([]);
  const workRef = useRef(new Map<string, RowWork>());
  const [createChain] = useState(createSerialChain);
  const [uploadSlots] = useState(() => createSlotQueue(UPLOAD_SLOT_COUNT));

  useEffect(() => {
    const workByRow = workRef.current;
    return () => workByRow.forEach((work) => work.handle?.abort());
  }, []);

  const isGone = (localId: string) => !isMountedRef.current || !rowOf(localId);

  async function deleteTrackOf(trackId: string, forReleaseId: string) {
    await deleteTrack.mutateAsync({ trackId, releaseId: forReleaseId });
    serverOrderRef.current = serverOrderRef.current.filter(
      (candidate) => candidate !== trackId,
    );
  }

  /** Waits its turn in the create chain; null when the row went meanwhile. */
  function createFor(localId: string, title: string, forReleaseId: string) {
    return createChain.run(async () => {
      if (isGone(localId)) return null;
      patchRow(localId, { stage: "creating" });
      const created = await createTrack
        .mutateAsync({ releaseId: forReleaseId, title })
        .catch((error: unknown) => {
          // Removed while being made and the create failed: the order goes now.
          order.releaseOrderSync(localId, true);
          throw error;
        });
      serverOrderRef.current = [...serverOrderRef.current, created.id];
      if (!isMountedRef.current) return null;
      if (!rowOf(localId)) {
        // Removed while being made: its track goes too, then the shown order.
        // A late track that stays on the server would refuse every order.
        const isDeleted = await deleteTrackOf(created.id, forReleaseId).then(
          () => true,
          () => false,
        );
        order.releaseOrderSync(localId, isDeleted);
        return null;
      }
      patchRow(localId, { trackId: created.id, stage: "queued" });
      order.syncOrderIfNeeded();
      return created.id;
    });
  }

  /** Holds an upload slot from presign to the end of the PUT. */
  async function uploadFor(localId: string, work: RowWork) {
    const releaseSlot = await uploadSlots.acquire();
    try {
      if (isGone(localId)) return null;
      patchRow(localId, { stage: "uploading", progress: 0 });
      const handle = uploadStudioAudio({
        demoMode,
        subprofileId,
        file: work.file,
        contentType: work.contentType,
        onProgress: createProgressReporter((progress) =>
          patchRow(localId, { progress }),
        ),
      });
      work.handle = handle;
      return await handle.promise;
    } finally {
      work.handle = null;
      releaseSlot();
    }
  }

  async function process(localId: string) {
    const work = workRef.current.get(localId);
    const startRow = rowOf(localId);
    if (!work || work.isRunning || !releaseId || !startRow) return;
    const forReleaseId = releaseId;
    work.isRunning = true;
    patchRow(localId, { stage: "queued", errorKey: null });
    try {
      const trackId =
        startRow.trackId ??
        (await createFor(localId, startRow.title, forReleaseId));
      if (trackId === null) return;
      if (!work.uploadedKey) work.uploadedKey = await uploadFor(localId, work);
      // Removed or unmounted after the PUT: nothing left to confirm.
      if (!work.uploadedKey || isGone(localId)) return;
      patchRow(localId, { stage: "confirming" });
      const confirmed = await confirmAudio.mutateAsync({
        trackId,
        releaseId: forReleaseId,
        key: work.uploadedKey,
      });
      patchRow(localId, {
        stage: "ready",
        progress: 100,
        durationLabel: confirmed.durationLabel,
      });
      workRef.current.delete(localId);
    } catch (error) {
      if (isGone(localId)) return;
      // The server deleted an unreadable object, so its key cannot be confirmed again.
      if (studioErrorCodeOf(error) === "studio_audio_unreadable")
        work.uploadedKey = null;
      patchRow(localId, {
        stage: "failed",
        errorKey: uploadErrorKeyOf(error),
        isRetryable: isRetryableUploadError(error),
      });
    } finally {
      work.isRunning = false;
    }
  }

  /** Deletes the removed row's track, then sends the shown order once every
   *  remaining row has a track. A failed delete restores the row and still
   *  runs the sync, which then sends only what other removals left waiting.
   *  A row whose create is still in flight is left to createFor, which syncs
   *  once that create fails or its late track is deleted. */
  async function deleteRemovedRow(row: UploadRow, index: number) {
    if (row.stage === "creating") {
      order.holdOrderSync(row.localId);
      return;
    }
    if (!releaseId) return;
    if (!row.trackId) {
      order.syncOrderIfNeeded();
      return;
    }
    order.holdOrderSync(row.localId);
    try {
      await deleteTrackOf(row.trackId, releaseId);
    } catch (error) {
      // The track is still on the release, so its row returns to its place.
      const restored = [...rowsRef.current];
      restored.splice(Math.min(index, restored.length), 0, {
        ...row,
        stage: "failed",
        errorKey: removeErrorKeyOf(error),
        isRetryable: false,
      });
      commitRows(restored);
    } finally {
      // After a failed delete the restored row matches the server again, so
      // the sync sends only what other removals left waiting.
      order.releaseOrderSync(row.localId, true);
    }
  }

  return {
    rows,
    rejections,
    addFiles: (files) => {
      if (files.length === 0) return;
      const { accepted, rejected } = validateAudioFiles(
        files,
        rowsRef.current.length,
      );
      setRejections(rejected);
      const added = accepted.map(({ file, contentType }) => {
        const localId = nextLocalId();
        workRef.current.set(localId, {
          file,
          contentType,
          uploadedKey: null,
          handle: null,
          isRunning: false,
        });
        return rowFromFile(localId, file);
      });
      commitRows([...rowsRef.current, ...added]);
      added.forEach((row) => void process(row.localId));
    },
    retry: (localId) => void process(localId),
    remove: (localId) => {
      const index = rowsRef.current.findIndex(
        (candidate) => candidate.localId === localId,
      );
      const row = rowsRef.current[index];
      if (!row) return;
      workRef.current.get(localId)?.handle?.abort();
      workRef.current.delete(localId);
      commitRows(
        rowsRef.current.filter((candidate) => candidate.localId !== localId),
      );
      void deleteRemovedRow(row, index);
    },
    move: (localId, offset) => {
      const index = rowsRef.current.findIndex((row) => row.localId === localId);
      order.moveTo(localId, index + offset);
    },
    moveTo: order.moveTo,
    rename: (localId, title) => patchRow(localId, { title }),
    canReorder: rows.length > 1 && rows.every((row) => row.trackId !== null),
    hasPendingUploads: rows.some(
      (row) => row.stage !== "ready" && row.stage !== "noAudio",
    ),
    orderErrorKey: order.orderErrorKey,
  };
}
