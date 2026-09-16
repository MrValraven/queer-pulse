// src/features/messages/useAttachmentUploadQueue.ts
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useUploadImage } from "../members/api/useUploadImage";
import { useUploadDocument } from "./useUploadDocument";
import type { UploadableAttachmentKind } from "./AttachmentStagingTypes";

interface UploadQueueCallbacks {
  onProgress: (id: string, percent: number) => void;
  onSuccess: (
    id: string,
    kind: UploadableAttachmentKind,
    key: string,
    previewUrl: string,
  ) => void;
  onError: (id: string, kind: UploadableAttachmentKind, err: unknown) => void;
}

/**
 * Runs the actual background upload for one staged image or document
 * (DES-198/DES-199): starts the moment the item is staged, entirely
 * independent of whether the caller currently shows that item in the
 * caption screen or has already handed it off to the post-send pending-
 * uploads strip. This queue only knows opaque ids; the caller (the
 * page-level `AttachmentQueueProvider`'s own `useAttachmentSendQueue` store,
 * so it outlives a thread switch, see that file) decides what an id's
 * `onProgress`/`onSuccess`/`onError` should do.
 *
 * `abandon(id)` is how a caller cancels: for a document, whose presigned PUT
 * this repo fully controls, it aborts the in-flight request; for an image,
 * which goes through `useUploadImage` (shared with every other upload
 * surface in the app and has no abort hook of its own), the request keeps
 * running to completion but its result is silently discarded here rather
 * than reported back. Either way the caller's contract is the same: an
 * abandoned item's upload never fires `onSuccess`/`onError` again, so it can
 * never be sent.
 */
export function useAttachmentUploadQueue(callbacks: UploadQueueCallbacks) {
  const uploadImage = useUploadImage("message-image");
  const uploadDocument = useUploadDocument();
  // Latest-callbacks ref so `startImageUpload`/`startDocumentUpload` (called
  // imperatively from event handlers, never as an effect dependency) always
  // report through the caller's CURRENT closures without needing to be
  // re-created, and therefore re-subscribed to anything, every render.
  // Assigned inside an effect (not during render, which `react-hooks/refs`
  // flags), mirrors `useDismiss`'s own `onCloseRef`.
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });
  const abandonedIds = useRef<Set<string>>(new Set());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const abandon = useCallback((id: string) => {
    abandonedIds.current.add(id);
    abortControllers.current.get(id)?.abort();
    abortControllers.current.delete(id);
  }, []);

  const startImageUpload = useCallback(
    (id: string, file: File) => {
      uploadImage(file, {
        onProgress: (percent) => {
          if (!abandonedIds.current.has(id)) {
            callbacksRef.current.onProgress(id, percent);
          }
        },
      })
        .then(({ key, previewUrl }) => {
          const wasAbandoned = abandonedIds.current.has(id);
          abandonedIds.current.delete(id);
          if (wasAbandoned) {
            // Ownership of `previewUrl` passed from `useUploadImage` to THIS
            // queue the moment it resolved; an abandoned item's caller never
            // sees it, so this is the one place left that can revoke it.
            URL.revokeObjectURL(previewUrl);
            return;
          }
          callbacksRef.current.onSuccess(id, "image", key, previewUrl);
        })
        .catch((err: unknown) => {
          const wasAbandoned = abandonedIds.current.has(id);
          abandonedIds.current.delete(id);
          if (!wasAbandoned) callbacksRef.current.onError(id, "image", err);
        });
    },
    [uploadImage],
  );

  const startDocumentUpload = useCallback(
    (id: string, file: File) => {
      const controller = new AbortController();
      abortControllers.current.set(id, controller);
      uploadDocument(file, {
        onProgress: (percent) => {
          if (!abandonedIds.current.has(id)) {
            callbacksRef.current.onProgress(id, percent);
          }
        },
        signal: controller.signal,
      })
        .then(({ key, previewUrl }) => {
          abortControllers.current.delete(id);
          const wasAbandoned = abandonedIds.current.has(id);
          abandonedIds.current.delete(id);
          if (wasAbandoned) {
            // Same ownership hand-off as the image branch above.
            URL.revokeObjectURL(previewUrl);
            return;
          }
          callbacksRef.current.onSuccess(id, "document", key, previewUrl);
        })
        .catch((err: unknown) => {
          abortControllers.current.delete(id);
          const wasAbandoned = abandonedIds.current.has(id);
          abandonedIds.current.delete(id);
          if (!wasAbandoned) callbacksRef.current.onError(id, "document", err);
        });
    },
    [uploadDocument],
  );

  return useMemo(
    () => ({ startImageUpload, startDocumentUpload, abandon }),
    [startImageUpload, startDocumentUpload, abandon],
  );
}
