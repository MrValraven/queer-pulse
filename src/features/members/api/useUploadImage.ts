import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  requestAvatarUpload,
  requestWorkImageUpload,
  type PresignedUpload,
  type UploadContentType,
} from "./uploads.api";

/** Which upload endpoint to hit. */
export type UploadKind = "avatar" | "work-image";

const REQUESTERS: Record<
  UploadKind,
  (ct: UploadContentType) => Promise<PresignedUpload>
> = {
  avatar: requestAvatarUpload,
  "work-image": requestWorkImageUpload,
};

/** Content types the backend accepts; anything else is rejected client-side. */
const ALLOWED = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * Upload an image file and resolve to the URL it should be stored under.
 *
 * - **Demo mode:** never touches the network — returns a local `object URL`
 *   preview (same behaviour the editors have always had offline). The caller is
 *   responsible for revoking it when replaced/unmounted.
 * - **Live mode:** POSTs to request a presigned URL, then `PUT`s the raw file
 *   straight to storage (plain `fetch`, `credentials: "omit"` — the presign
 *   authorizes it, and cookies/CSRF must NOT be sent cross-origin), and returns
 *   the stable `publicUrl` to persist.
 *
 * The returned callback throws on an unsupported content type or a failed PUT so
 * callers can surface an error and fall back gracefully.
 */
export function useUploadImage(kind: UploadKind) {
  const { demoMode } = useDemoMode();

  return useCallback(
    async (file: File): Promise<string> => {
      if (demoMode) return URL.createObjectURL(file);

      if (!ALLOWED.has(file.type)) {
        throw new Error(
          "That image type isn't supported. Use a JPEG, PNG, WebP or GIF.",
        );
      }
      const contentType = file.type as UploadContentType;
      const { uploadUrl, publicUrl } = await REQUESTERS[kind](contentType);

      const res = await fetch(uploadUrl, {
        method: "PUT",
        credentials: "omit",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error("We couldn't upload that image. Please try again.");
      }
      return publicUrl;
    },
    [demoMode, kind],
  );
}
