import { clearStudioRecentlyPlayed } from "../player/studioListeningMemory";
import type { StudioLoadState } from "./studioLoadState";
import { isListeningHistoryOnIn } from "./studioPlaybackPatch";
import { useStudioPlaybackPreferences } from "./useStudioPlaybackPreferences";

export interface StudioListeningHistorySwitch {
  isOn: boolean;
  /** The row is loading or its read failed: the switch shows the default and waits. */
  isAwaitingRow: boolean;
  loadState: StudioLoadState;
  /** Off also empties this device's recently played list at once. */
  setOn: (isOn: boolean) => void;
}

/**
 * The single Listening history switch (the listening page and Studio
 * Settings). It reads and writes the server row through the shared playback
 * hook, so the save is optimistic and a refused save rolls back and toasts
 * there. Pausing deletes nothing on the server; it empties this device's
 * recently played list, which also feeds the queue's Played section.
 */
export function useStudioListeningHistorySwitch(): StudioListeningHistorySwitch {
  const { preferences, isLoading, isError, loadState, savePreferences } =
    useStudioPlaybackPreferences();
  return {
    isOn: isListeningHistoryOnIn(preferences),
    isAwaitingRow: isLoading || isError,
    loadState,
    setOn: (isOn) => {
      // Cleared at once, also when the off save then fails: errs private (contract 11).
      if (!isOn) clearStudioRecentlyPlayed();
      savePreferences({ isListeningHistoryOn: isOn });
    },
  };
}
