import { ApiError } from "../../../shared/api/client";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { setVjClipPreview } from "../api/vj.api";
import {
  makeVjPreview,
  type VjMadePreview,
  type VjPreviewInput,
} from "./vjPreview";
import { presignVj } from "./vjUpload";
import { VjUploadFailure } from "./vjUploadFailure";

/** The step a preview is at, for the row or the backfill list. */
export type VjPreviewStage = "recording" | "uploading" | "saving";

export interface VjAttachPreviewOptions {
  clipId: string;
  preview: VjMadePreview;
  isDemoMode: boolean;
  signal: AbortSignal;
}

type VjAttachStage = Exclude<VjPreviewStage, "recording">;

async function putPreview(
  uploadUrl: string,
  preview: VjMadePreview,
  signal: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      body: preview.blob,
      headers: { "Content-Type": preview.contentType },
      credentials: "omit",
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", { cause: error });
  }
  if (!response.ok) {
    throw new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", {
      cause: new ApiError(response.status, "vj-preview-put-failed"),
    });
  }
}

async function attachLive(
  options: VjAttachPreviewOptions,
  onStage: (stage: VjAttachStage) => void,
): Promise<VjClipDTO> {
  const { preview, signal } = options;
  onStage("uploading");
  const presign = await presignVj(
    "vj_preview",
    preview.contentType,
    preview.blob.size,
  );
  signal.throwIfAborted();
  await putPreview(presign.uploadUrl, preview, signal);
  signal.throwIfAborted();
  onStage("saving");
  return await setVjClipPreview(options.clipId, {
    previewStorageKey: presign.key,
  });
}

async function attachDemo(
  options: VjAttachPreviewOptions,
  onStage: (stage: VjAttachStage) => void,
): Promise<VjClipDTO> {
  onStage("uploading");
  const { demoSetVjClipPreview } = await import("../demo/vjDemoStore");
  options.signal.throwIfAborted();
  onStage("saving");
  const previewUrl = URL.createObjectURL(options.preview.blob);
  try {
    return demoSetVjClipPreview(options.clipId, { previewUrl });
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

function attachWithStages(
  options: VjAttachPreviewOptions,
  onStage: (stage: VjAttachStage) => void,
): Promise<VjClipDTO> {
  return options.isDemoMode
    ? attachDemo(options, onStage)
    : attachLive(options, onStage);
}

/**
 * Stores a made preview on its clip (contract 9.4). Live: presign `vj_preview`,
 * PUT to storage, then `setVjClipPreview` with the key; a failed PUT names
 * `VJ_UPLOAD_PUT_FAILED`. Demo: the demo store keeps a blob URL for the page's
 * life. Server refusals pass through with their codes.
 */
export async function attachVjPreview(
  options: VjAttachPreviewOptions,
): Promise<VjClipDTO> {
  return await attachWithStages(options, () => undefined);
}

/**
 * Makes a clip's preview and stores it, reporting each stage: `recording`
 * before `makeVjPreview`, `uploading` before the presign, `saving` before the
 * clip write. Every failure passes through untouched, so the row or the
 * backfill list names it.
 */
export async function makeAndAttachVjPreview(options: {
  clipId: string;
  input: VjPreviewInput;
  isDemoMode: boolean;
  signal: AbortSignal;
  onStage: (stage: VjPreviewStage) => void;
}): Promise<VjClipDTO> {
  options.onStage("recording");
  const preview = await makeVjPreview(options.input, options.signal);
  return await attachWithStages(
    {
      clipId: options.clipId,
      preview,
      isDemoMode: options.isDemoMode,
      signal: options.signal,
    },
    options.onStage,
  );
}
