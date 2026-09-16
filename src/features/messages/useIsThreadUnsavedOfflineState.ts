// src/features/messages/useIsThreadUnsavedOfflineState.ts
import { useOnlineStatus } from "../../shared/hooks";
import { useIsOfflineStandInSession } from "../system/offlineStandInContext";
import type { ThreadHistory } from "./useOlderPageAnchor";

/** PRD-375 gap 6: the offline stand-in session opened a thread the device
 *  never saved, so page 0 is stuck pending with nothing loaded and no
 *  network to fetch it with. See `MessageThreadOfflineEmptyState`. Requires
 *  `!isOnline`: the stand-in context stays true until the probe adopts the
 *  real session, so a reconnected tab still reads as "stand-in" for a beat.
 *  Requires `!history.hasLoadedThreadData` too, so a thread that is simply
 *  empty (a brand new group with no messages yet) never shows the pill. */
export function useIsThreadUnsavedOfflineState(
  rowCount: number,
  history: ThreadHistory,
): boolean {
  const isOfflineStandInSession = useIsOfflineStandInSession();
  const isOnline = useOnlineStatus();
  return (
    isOfflineStandInSession &&
    !isOnline &&
    rowCount === 0 &&
    !history.isHistorySettled &&
    !history.isHistoryError &&
    !history.hasLoadedThreadData
  );
}
