import { useRef, useState } from "react";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { useUploadImage } from "../members/api/useUploadImage";
import {
  resolveMyMediaUrl,
  type MyMediaItem,
} from "../settings/api/myMedia.api";

/** One picked-but-not-yet-committed photo. Identity is `key`. */
export interface StagedPhoto {
  key: string;
  previewUrl: string;
}

export interface GalleryUploadQueue {
  /** Photos staged so far, in the order they were added. */
  staged: StagedPhoto[];
  /** Their storage keys, for the past-uploads grid's selected state. */
  stagedKeys: Set<string>;
  /** True once staged + queued fills every free slot. */
  atCapacity: boolean;
  uploading: boolean;
  /** Percentage for the in-flight upload, 0 when idle. */
  progress: number;
  uploadError: string | null;
  /** How many of the last picked batch didn't fit. */
  skippedCount: number;
  /** Files awaiting the one-at-a-time reframe step; `[0]` is on screen. */
  reframeQueue: File[];
  /** Add or remove one of the member's past uploads from the staged set. */
  toggleExisting: (item: MyMediaItem) => void;
  /** Take a freshly picked batch: GIFs upload directly, the rest queue up. */
  handleFiles: (files: File[]) => Promise<void>;
  /** Finish the reframe modal's current file, with or without a crop. */
  resolveQueueHead: (crop?: CropRect) => Promise<void>;
}

/**
 * Staging + upload state for "add several photos to a gallery at once": the
 * staged set, the per-file upload, and the one-at-a-time reframe queue that
 * non-GIF picks pass through. Split out of `AddGalleryPhotosModal` so both it
 * and this stay under the repo's 200-line cap; the modal keeps only markup.
 *
 * `remaining` is how many free gallery slots there are; nothing here ever
 * stages past it, counting queued-but-unresolved files against the cap so a
 * second pick can't over-commit.
 */
export function useGalleryUploadQueue(remaining: number): GalleryUploadQueue {
  const { t } = useTranslation();
  const uploadImage = useUploadImage("work-image");
  // Guards `resolveQueueHead` against re-entrancy: the reframe modal for
  // `reframeQueue[0]` stays mounted (and its Save/Cancel buttons don't
  // disable) for the whole async upload, so a second click while one is in
  // flight must be ignored rather than kicking off a second concurrent
  // upload of the same file.
  const processingRef = useRef(false);

  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  // Non-GIF files picked in this batch, awaiting the one-at-a-time reframe
  // step. The head of the queue is what's currently shown in the reframe
  // modal; it's popped once that file is resolved (confirmed or cancelled).
  const [reframeQueue, setReframeQueue] = useState<File[]>([]);

  const stagedKeys = new Set(staged.map((photo) => photo.key));
  // Reserve capacity for files already queued for reframing, not just the
  // ones already staged, so a second pick can't over-commit past `remaining`.
  const atCapacity = staged.length + reframeQueue.length >= remaining;

  function toggleExisting(item: MyMediaItem) {
    setSkippedCount(0);
    setStaged((current) => {
      if (current.some((photo) => photo.key === item.key)) {
        return current.filter((photo) => photo.key !== item.key);
      }
      if (current.length >= remaining) return current;
      return [
        ...current,
        { key: item.key, previewUrl: resolveMyMediaUrl(item.fileUrl) },
      ];
    });
  }

  /** Shared tail of every upload path in this batch: direct GIF upload,
   * post-reframe confirm, and reframe-cancelled (uncropped) upload. Reports
   * per-file so one bad image doesn't lose the rest of the batch. */
  async function uploadAndStage(file: File, crop?: CropRect) {
    setUploading(true);
    try {
      const result = await uploadImage(file, { onProgress: setProgress, crop });
      // Guard against a race where earlier files already filled the gallery.
      setStaged((current) =>
        current.length >= remaining || current.some((p) => p.key === result.key)
          ? current
          : [...current, result],
      );
    } catch (error) {
      setUploadError(
        error instanceof ImageProcessingError
          ? t(error.i18nKey, error.values)
          : t("members:avatar.error.generic"),
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function handleFiles(files: File[]) {
    setUploadError(null);
    const free = remaining - staged.length - reframeQueue.length;
    if (free <= 0) {
      setSkippedCount(files.length);
      return;
    }
    const toProcess = files.slice(0, free);
    setSkippedCount(files.length > free ? files.length - free : 0);

    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, one at a time, as before.
    const gifFiles = toProcess.filter((file) => file.type === "image/gif");
    const reframeFiles = toProcess.filter((file) => file.type !== "image/gif");

    if (reframeFiles.length > 0) {
      setReframeQueue((current) => [...current, ...reframeFiles]);
    }

    for (const file of gifFiles) {
      await uploadAndStage(file);
    }
  }

  /** Resolves the head of the reframe queue — used on both Save (with a crop)
   * and Cancel (uncropped, so "add everything I picked" still holds and one
   * photo's cancel never blocks the rest). `processingRef` makes this
   * sequential and re-entrancy-safe: a second Confirm/Cancel click while an
   * upload is already in flight is ignored outright (the reframe modal stays
   * mounted with live buttons for the whole await, so nothing else stops a
   * double-click). The file stays at `reframeQueue[0]` — and so still counts
   * against `atCapacity`/`free` — until its upload actually resolves, and
   * only ONE upload ever runs at a time, so the shared `uploading`/`progress`
   * state can't be stomped by an overlapping second upload's `finally`. The
   * queue only advances (in `finally`, so a failed upload still advances)
   * once that upload settles. */
  async function resolveQueueHead(crop?: CropRect) {
    if (processingRef.current) return;
    const file = reframeQueue[0];
    if (!file) return;
    processingRef.current = true;
    try {
      await uploadAndStage(file, crop);
    } finally {
      processingRef.current = false;
      setReframeQueue((current) => current.slice(1));
    }
  }

  return {
    staged,
    stagedKeys,
    atCapacity,
    uploading,
    progress,
    uploadError,
    skippedCount,
    reframeQueue,
    toggleExisting,
    handleFiles,
    resolveQueueHead,
  };
}
