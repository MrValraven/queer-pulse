import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logError } from "../../../shared/observability/logger";
import { deleteMyMedia } from "../../settings/api/myMedia.api";
import { MY_MEDIA_KEY } from "../../settings/api/useMyMedia";

/**
 * Undo the *storage* side of a picked-but-never-saved image.
 *
 * Uploads are presigned: `PhotoPickerModal` PUTs the bytes to the bucket the
 * moment a photo is confirmed and hands back only a storage key, so by the time
 * an editor's Cancel runs, the object already exists and already shows up in the
 * member's "Your photos" library. Nothing references it — the editor never
 * saved — but nothing removes it either, and the member who backed out of a
 * change is left with the photo they backed out of.
 *
 * So an editor `track`s every key uploaded while it is open, and calls `discard`
 * on the way out with the keys it actually committed. Everything tracked and not
 * kept is deleted. That covers both the reported case (Cancel keeps nothing) and
 * the quieter one beside it: picking a second photo before saving orphans the
 * first exactly the same way.
 *
 * Only track keys from a FRESH upload (`ImageUploadField`'s `onUploaded`, which
 * fires only on the device-upload path). A photo chosen out of the library grid
 * was already there before this editor opened and is not this editor's to
 * delete.
 *
 * Deleting is best-effort and deliberately silent: it runs as the editor closes,
 * it is a tidy-up the member never asked for, and a failure costs them nothing
 * but a stray file. It is also safe by construction — `DELETE /me/media` refuses
 * a key that is not the caller's (403), one that anything still references
 * (409), and one whose references could not be verified (503), so a cleanup that
 * races a save can never take a live image down with it.
 *
 * It calls the API directly rather than through `useDeleteMyMedia` on purpose.
 * `discard` runs in the same tick as the editor's `onClose`, so the component
 * holding any mutation observer unmounts immediately after — the request would
 * still go out, but the observer's `onSuccess` (which is what prunes the cached
 * library list) is not guaranteed to run, leaving the picker showing a photo
 * that no longer exists. Invalidating through the query client here is not tied
 * to a mounted component.
 */
export function useDiscardableUploads() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const uploadedKeys = useRef<Set<string>>(new Set());

  const track = useCallback((key: string) => {
    if (key) uploadedKeys.current.add(key);
  }, []);

  const discard = useCallback(
    async (keptKeys: readonly string[] = []) => {
      const kept = new Set(keptKeys.filter(Boolean));
      const doomed = [...uploadedKeys.current].filter((key) => !kept.has(key));
      // Kept keys stay tracked: an editor that stays open after saving should
      // still be able to orphan one of them with a later re-pick.
      uploadedKeys.current = new Set(
        [...uploadedKeys.current].filter((key) => kept.has(key)),
      );
      // Demo mode never uploaded anything — its "key" is a local object URL and
      // no request was ever made, so there is nothing in a bucket to take back.
      if (demoMode || doomed.length === 0) return;

      // allSettled, not all: one key failing to delete must not strand the rest.
      const results = await Promise.allSettled(doomed.map(deleteMyMedia));
      for (const result of results) {
        if (result.status === "rejected") {
          logError(result.reason, { scope: "useDiscardableUploads.discard" });
        }
      }
      if (results.some((result) => result.status === "fulfilled")) {
        await queryClient.invalidateQueries({ queryKey: [MY_MEDIA_KEY] });
      }
    },
    [demoMode, queryClient],
  );

  return { track, discard };
}
