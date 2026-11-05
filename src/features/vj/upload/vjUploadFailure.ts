import type { VjClientUploadCode } from "../../../shared/contracts/vj";

/** Why an upload stopped before or during the pipeline. The client codes are
 *  raised in the browser; the rest repeat server codes the frontend can also
 *  raise itself before any request (a MOV, a huge file, a bad duration). */
export type VjUploadFailureCode =
  | VjClientUploadCode
  | "VJ_UPLOAD_TOO_LARGE"
  | "VJ_UPLOAD_FORMAT_MOV"
  | "VJ_UPLOAD_TYPE_UNSUPPORTED"
  | "VJ_CLIP_DURATION_INVALID"
  | "VJ_CLIP_DIMENSIONS_INVALID"
  /** The pack or the whole library would pass its clip cap with this file,
   *  counted in the browser from the cached counts plus the rows ahead of it. */
  | "VJ_PACK_FULL"
  | "VJ_LIBRARY_FULL"
  /** The storage PUT of the clip or its thumbnail failed (a refused answer or
   *  no answer), so the file never reached the server. Reads as VJ_UPLOAD_MISSING. */
  | "VJ_UPLOAD_PUT_FAILED";

export class VjUploadFailure extends Error {
  readonly code: VjUploadFailureCode;
  /** The file's size when the failure is about size, so the row can name it. */
  readonly byteSize: number | null;

  /** The message is the code only: a file name or title never reaches a log. */
  constructor(
    code: VjUploadFailureCode,
    options?: { byteSize?: number; cause?: unknown },
  ) {
    super(
      code,
      options?.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = "VjUploadFailure";
    this.code = code;
    this.byteSize = options?.byteSize ?? null;
  }
}
