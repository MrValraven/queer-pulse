import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { requestUpload } from "../../members/api/uploads.api";
import { ImageProcessingError } from "../../members/api/uploadProcessing";
import { useUploadImage } from "../../members/api/useUploadImage";
import { putWithRetry } from "../../messages/useUploadDocument";
import { MENU_FILE_NAME_MAX, type ListingMenuFile } from "./listingMenu.data";

/** Mirrors the backend's `listing-menu` cap (`upload-kinds.ts`). */
export const MENU_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const MENU_FILE_MAX_LABEL = "10 MB";

const PDF_TYPE = "application/pdf";
const MENU_IMAGE_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** The file picker's `accept` attribute. */
export const MENU_FILE_ACCEPT = [PDF_TYPE, ...MENU_IMAGE_TYPES].join(",");

export type MenuFileUploadErrorCode = "type" | "size" | "upload";

/** Carries a code the field maps to its own catalog key. */
export class MenuFileUploadError extends Error {
  readonly code: MenuFileUploadErrorCode;
  constructor(code: MenuFileUploadErrorCode) {
    super(`menu-file-${code}`);
    this.name = "MenuFileUploadError";
    this.code = code;
  }
}

/** Throws a `MenuFileUploadError` for a file the backend would refuse. */
export function validateMenuFile(file: File): void {
  const isAcceptedType =
    file.type === PDF_TYPE || MENU_IMAGE_TYPES.has(file.type);
  if (!isAcceptedType) throw new MenuFileUploadError("type");
  if (file.size > MENU_FILE_MAX_BYTES) throw new MenuFileUploadError("size");
}

/**
 * Upload a menu PDF or a photo of the board, resolving to the
 * `ListingMenuFile` the draft stores.
 *
 * A photo goes through `useUploadImage("listing-menu")`, so it gets the same
 * metadata strip and re-encode as every other photo. A PDF has no pixels to
 * re-encode and is sent as-is with the message-document PUT. In demo mode
 * nothing touches the network and `url` is a local object URL.
 */
export function useUploadListingMenuFile() {
  const { demoMode } = useDemoMode();
  const uploadImage = useUploadImage("listing-menu");

  return useCallback(
    async (file: File): Promise<ListingMenuFile> => {
      validateMenuFile(file);
      const fileName = file.name.slice(0, MENU_FILE_NAME_MAX);
      const isPdf = file.type === PDF_TYPE;
      try {
        if (!isPdf) {
          const result = await uploadImage(file);
          // Only `result.key` is kept (the draft stores it, never the
          // preview). In LIVE mode that leaves `result.previewUrl`'s blob
          // unused and unreleased, so revoke it here. In DEMO mode
          // `key === previewUrl` (there is no real storage key): that same
          // blob URL is exactly what gets stored and rendered as `url`, so it
          // must never be revoked.
          if (!demoMode) URL.revokeObjectURL(result.previewUrl);
          return { url: result.key, contentType: file.type, fileName };
        }
        if (demoMode) {
          return {
            url: URL.createObjectURL(file),
            contentType: PDF_TYPE,
            fileName,
          };
        }
        const presigned = await requestUpload(
          "listing-menu",
          PDF_TYPE,
          file.size,
        );
        await putWithRetry(presigned.uploadUrl, file, PDF_TYPE);
        return { url: presigned.key, contentType: PDF_TYPE, fileName };
      } catch (error) {
        if (error instanceof ImageProcessingError) throw error;
        throw new MenuFileUploadError("upload");
      }
    },
    [demoMode, uploadImage],
  );
}
