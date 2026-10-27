import type { QueryClient } from "@tanstack/react-query";
import type { StudioPlaybackPreferencesDTO } from "../api/studio.types";
import { putStudioPlayback } from "../api/studioPlayback.api";
import {
  applyPlaybackPatch,
  isListeningHistoryOnIn,
} from "../api/studioPlaybackPatch";
import { studioKeys } from "../api/studioQueryKeys";

/**
 * The first-play notice (contract 11): after the first counted play (live)
 * or the first remembered play (demo), the player shows once that Studio
 * keeps a listening history. The notice reads `isShown` here; the server row
 * carries the stamp, so the notice never shows twice for one member.
 */

let isShown = false;
/** Set when the notice shows, so a second play in this session shows nothing
 *  even when the stamp failed to save. */
let hasShownThisSession = false;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

/** For useSyncExternalStore. */
export function subscribeStudioListeningNotice(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readStudioListeningNotice(): boolean {
  return isShown;
}

export function dismissStudioListeningNotice(): void {
  if (!isShown) return;
  isShown = false;
  notifyListeners();
}

/** After a count (live) or a remember (demo): shows the notice once when the
 *  cached row is loaded, says on, and carries no stamp; then stamps it
 *  optimistically. A failed stamp stays on screen for the session; the
 *  server shows the notice again next session. */
export function maybeShowStudioListeningNotice(
  queryClient: QueryClient,
  demoMode: boolean,
): void {
  if (hasShownThisSession) return;
  const queryKey = studioKeys.playback(demoMode);
  const row = queryClient.getQueryData<StudioPlaybackPreferencesDTO>(queryKey);
  // Strictly null: a missing field is an older server, which shows nothing.
  if (
    row === undefined ||
    !isListeningHistoryOnIn(row) ||
    row.listeningNoticeSeenAt !== null
  )
    return;
  hasShownThisSession = true;
  isShown = true;
  notifyListeners();
  queryClient.setQueryData<StudioPlaybackPreferencesDTO>(
    queryKey,
    applyPlaybackPatch(row, { hasSeenListeningNotice: true }, new Date()),
  );
  // The flag is only ever sent as true (backend delta 2).
  const stamp = demoMode
    ? import("../api/studioDemoPlayback").then((demo) =>
        demo.demoPutStudioPlayback({ hasSeenListeningNotice: true }),
      )
    : putStudioPlayback({ hasSeenListeningNotice: true });
  void stamp.catch(() => undefined);
}

/** Test seam: hidden, and free to show again. */
export function resetStudioListeningNoticeForTests(): void {
  isShown = false;
  hasShownThisSession = false;
  listeners.clear();
}
