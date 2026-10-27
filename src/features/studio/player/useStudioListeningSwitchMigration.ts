import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { putStudioPlayback } from "../api/studioPlayback.api";
import { isListeningHistoryOnIn } from "../api/studioPlaybackPatch";
import { studioKeys } from "../api/studioQueryKeys";
import { useStudioPlaybackRow } from "../api/useStudioPlaybackPreferences";
import {
  dropLegacyRecentlyPlayedField,
  readLegacyRecentlyPlayedOff,
} from "./studioPlayerPreferences";

export interface StudioListeningSwitchMigrationOptions {
  demoMode: boolean;
  /** Signed in with Studio access, the session settled. */
  isEnabled: boolean;
}

/**
 * The one-time read of the retired device switch (contract 11). Live only,
 * once the playback row has loaded: a device that stored Recently played
 * off, against a server that says history is on, pauses history with one
 * PUT and then drops the device field. A server already paused, or a device
 * that had it on, drops the field with no PUT. A failed PUT keeps the field,
 * so the next load tries again. Silent either way.
 */
export function useStudioListeningSwitchMigration(
  options: StudioListeningSwitchMigrationOptions,
): void {
  const { demoMode, isEnabled } = options;
  const queryClient = useQueryClient();
  const row = useStudioPlaybackRow();
  /** Once per mount: the row is read when it first lands, and later
   *  changes are the member's own. */
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current || demoMode || !isEnabled || row === undefined)
      return;
    hasRunRef.current = true;
    if (!readLegacyRecentlyPlayedOff() || !isListeningHistoryOnIn(row)) {
      dropLegacyRecentlyPlayedField();
      return;
    }
    void putStudioPlayback({ isListeningHistoryOn: false }).then(
      (stored) => {
        queryClient.setQueryData(studioKeys.playback(false), stored);
        dropLegacyRecentlyPlayedField();
      },
      // The field stays on this device; the next mount reads it again.
      () => undefined,
    );
  }, [demoMode, isEnabled, row, queryClient]);
}
