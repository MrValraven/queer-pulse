// src/features/messages/photoRetry.ts

/** Fired on a failed photo's opener to remount its `<img>` for one more try.
 *  A DOM event rather than a prop because the pointer path that needs it lives
 *  in `MessageBubble`'s gesture hook, which only ever holds the opener node. */
export const PHOTO_RETRY_EVENT = "queerpulse:photo-retry";

/** When `opener` is showing the load-failed fallback (see `PhotoBubbleImage`),
 *  asks it to retry and returns true, so the caller skips opening the viewer on
 *  an image that never arrived. Returns false (and does nothing) otherwise. */
export function retryIfPhotoFailed(
  opener: HTMLElement | null | undefined,
): boolean {
  if (!opener || opener.dataset.photoState !== "failed") return false;
  opener.dispatchEvent(new Event(PHOTO_RETRY_EVENT));
  return true;
}
