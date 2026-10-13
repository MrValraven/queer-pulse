import { requestUpload } from "../../members/api/uploads.api";
import type { StudioAudioContentType } from "./studio.types";

export class StudioAudioUploadError extends Error {
  readonly stage: "presign" | "put";
  readonly status: number | null;
  readonly isAborted: boolean;
  constructor(
    stage: "presign" | "put",
    status: number | null,
    isAborted = false,
    /** The refusal behind a failed presign, so its code and status survive. */
    cause?: unknown,
  ) {
    super(
      isAborted ? "Upload cancelled" : `Audio upload failed at ${stage}`,
      cause === undefined ? undefined : { cause },
    );
    this.name = "StudioAudioUploadError";
    this.stage = stage;
    this.status = status;
    this.isAborted = isAborted;
  }
}

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
 * Presign (`kind: "studio_audio"`, scoped to the persona so no key carries
 * the uploader's user id), then PUT the bytes straight to storage with
 * progress. XMLHttpRequest, because fetch cannot report upload progress.
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
