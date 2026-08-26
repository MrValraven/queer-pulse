import type { ReactNode } from "react";
import { useHidePushPreviews } from "../settings/api/useHidePushPreviews";
import { canMirrorHidePushPreviews } from "../../pushPrivacy";

/**
 * Carries the member's lock-screen preview setting onto THIS device (ID-13).
 *
 * The setting lives on the server now, which is what makes it work on iPhone
 * and what lets a member set it once rather than once per device. But `sw.ts`
 * still keeps a local copy as its second line of defence, and a service worker
 * cannot make an authenticated API call at push time, so something has to
 * fetch the server value while the app is open and write it to IndexedDB. This
 * is that something, app-wide, so a member who hides previews on their phone
 * has them hidden on the tablet they sign in to next, without visiting
 * Settings first.
 *
 * Holds no state and renders no UI, in the shape of `SessionBootstrapProvider`:
 * the sync needs an owner rather than being a side effect of whichever screen
 * happened to mount the hook.
 *
 * `canMirrorHidePushPreviews()` gates the fetch on the browser having both an
 * IndexedDB to write to and a service worker to read it. Without either there
 * is nothing for the value to do here, so the request is not made. The app
 * carries no boot cost on a browser that cannot receive a push in the first
 * place. React Query merges `enabled` across subscribers to a key, so the
 * settings row still fetches on its own when the member opens it.
 *
 * `useHidePushPreviews` does the mirroring itself, on every settle, so this
 * file is only a mount point and there is one implementation of the write.
 */
export function PushPreviewMirrorProvider({
  children,
}: {
  children: ReactNode;
}) {
  useHidePushPreviews({ isFetchEnabled: canMirrorHidePushPreviews() });
  return <>{children}</>;
}
