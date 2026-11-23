import { apiErrorCode } from "../../../shared/api/causeErrorKey";
import { confirmUpload, requestUpload } from "../../members/api/uploads.api";
import type { StudioAudioContentType } from "./studio.types";

/** Where an upload stopped: the presign, the storage PUT, or the server's
 *  check of the stored bytes (`POST /uploads/confirm`). */
export type StudioAudioUploadStage = "presign" | "put" | "confirm";

export class StudioAudioUploadError extends Error {
  readonly stage: StudioAudioUploadStage;
  readonly status: number | null;
  readonly isAborted: boolean;
  /** The key whose bytes already landed in storage, set on a `confirm`
   *  stage failure: Retry checks this key again with
   *  `confirmStudioAudioUpload` and skips the presign and the PUT. */
  readonly uploadedKey: string | null;
  constructor(
    stage: StudioAudioUploadStage,
    status: number | null,
    isAborted = false,
    /** The refusal behind a failed presign or confirm, so its code and
     *  status survive for `causeErrorKey`. */
    cause?: unknown,
    uploadedKey: string | null = null,
  ) {
    super(
      isAborted ? "Upload cancelled" : `Audio upload failed at ${stage}`,
      cause === undefined ? undefined : { cause },
    );
    this.name = "StudioAudioUploadError";
    this.stage = stage;
    this.status = status;
    this.isAborted = isAborted;
    this.uploadedKey = uploadedKey;
  }
}

/** The stored key a failed upload can resume from (a refused or unanswered
 *  confirm of bytes already in storage), or null when Retry must upload
 *  again. A confirm answered `UPLOAD_NOT_FOUND` found no object under the
 *  key (the PUT never landed, or the orphan sweep reclaimed it), so that key
 *  is dropped and Retry uploads the file again. */
export function uploadedKeyOf(error: unknown): string | null {
  if (!(error instanceof StudioAudioUploadError) || error.stage !== "confirm")
    return null;
  if (apiErrorCode(error.cause) === UPLOAD_NOT_FOUND_CODE) return null;
  return error.uploadedKey;
}

/** The confirm refusal for a key with no stored object
 *  (queerpulse-backend `storage/upload-error-codes.ts`). */
const UPLOAD_NOT_FOUND_CODE = "UPLOAD_NOT_FOUND";

export interface StudioAudioUploadHandle {
  /** Resolves with the storage key to confirm on the track. */
  promise: Promise<string>;
  abort: () => void;
}

interface UploadOptions {
  demoMode: boolean;
  subprofileId: string;
  file: File;
  contentType: StudioAudioContentType;
  onProgress: (percent: number) => void;
}

const DEMO_STEP_MS = 120;

function statusOf(error: unknown): number | null {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : null;
  }
  return null;
}

function demoUpload(options: UploadOptions): StudioAudioUploadHandle {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let rejectUpload: ((reason: unknown) => void) | null = null;
  const promise = new Promise<string>((resolve, reject) => {
    rejectUpload = reject;
    let percent = 0;
    const step = () => {
      percent = Math.min(100, percent + 20);
      options.onProgress(percent);
      if (percent === 100) {
        resolve(`demo-audio:${options.file.size}:${options.file.name}`);
        return;
      }
      timer = setTimeout(step, DEMO_STEP_MS);
    };
    timer = setTimeout(step, DEMO_STEP_MS);
  });
  return {
    promise,
    abort: () => {
      if (timer) clearTimeout(timer);
      rejectUpload?.(new StudioAudioUploadError("put", null, true));
    },
  };
}

/**
 * Asks the server to check the bytes stored under `key`
 * (`POST /uploads/confirm`) and resolves with the key. A refusal is a
 * `confirm` stage error carrying the server's refusal on `cause` and the key
 * on `uploadedKey`, so Retry can run this step alone. Live mode only.
 */
export async function confirmStudioAudioUpload(key: string): Promise<string> {
  try {
    await confirmUpload(key);
  } catch (error) {
    throw new StudioAudioUploadError(
      "confirm",
      statusOf(error),
      false,
      error,
      key,
    );
  }
  return key;
}

/**
 * Presign (`kind: "studio_audio"`, scoped to the persona so no key carries
 * the uploader's user id), then PUT the bytes straight to storage with
 * progress. XMLHttpRequest, because fetch cannot report upload progress.
 * Once the PUT lands, the server checks the stored bytes (`confirmUpload`)
 * before the key is handed on; a refusal there is a `confirm` stage error
 * whose `cause` carries the server's code (`confirmStudioAudioUpload`). An
 * abort during the confirm wins over its answer: the handle rejects as
 * cancelled.
 */
export function uploadStudioAudio(
  options: UploadOptions,
): StudioAudioUploadHandle {
  if (options.demoMode) return demoUpload(options);
  let request: XMLHttpRequest | null = null;
  let isAborted = false;
  const promise = (async () => {
    let presigned: { uploadUrl: string; key: string };
    try {
      presigned = await requestUpload(
        "studio_audio",
        options.contentType,
        options.file.size,
        options.subprofileId,
      );
    } catch (error) {
      throw new StudioAudioUploadError(
        "presign",
        statusOf(error),
        false,
        error,
      );
    }
    if (isAborted) throw new StudioAudioUploadError("put", null, true);
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      request = xhr;
      xhr.open("PUT", presigned.uploadUrl);
      xhr.withCredentials = false;
      xhr.setRequestHeader("Content-Type", options.contentType);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable)
          options.onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          options.onProgress(100);
          resolve();
        } else {
          reject(new StudioAudioUploadError("put", xhr.status));
        }
      };
      xhr.onerror = () => reject(new StudioAudioUploadError("put", null));
      xhr.onabort = () => reject(new StudioAudioUploadError("put", null, true));
      xhr.send(options.file);
    });
    if (isAborted) throw new StudioAudioUploadError("put", null, true);
    try {
      await confirmStudioAudioUpload(presigned.key);
    } catch (error) {
      if (isAborted) throw new StudioAudioUploadError("confirm", null, true);
      throw error;
    }
    if (isAborted) throw new StudioAudioUploadError("confirm", null, true);
    return presigned.key;
  })();
  return {
    promise,
    abort: () => {
      isAborted = true;
      request?.abort();
    },
  };
}
