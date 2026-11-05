import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjLibraryChange } from "../../../shared/contracts/vj";
import { vjKeys } from "./vjKeys";

/**
 * Marks the library queries stale after a change someone else made (a socket
 * `library:changed` frame, or another demo tab's message). A null change and
 * every pack-level or clip-level kind refreshes the whole library. A change to
 * a pack's clip list refreshes only the packs it names, then the pack list
 * (counts and covers) and the clip list (pack membership).
 */
export function useInvalidateVjLibrary(): (
  change: VjLibraryChange | null,
) => void {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  return useCallback(
    (change) => {
      if (change === null || change.kind !== "pack_clips_changed") {
        void queryClient.invalidateQueries({ queryKey: vjKeys.root });
        return;
      }
      const touchedPackIds = new Set<string>(change.packIds);
      if (change.packId !== null) touchedPackIds.add(change.packId);
      for (const packId of touchedPackIds) {
        void queryClient.invalidateQueries({
          queryKey: vjKeys.packClips(packId, demoMode),
        });
      }
      void queryClient.invalidateQueries({ queryKey: vjKeys.packs(demoMode) });
      void queryClient.invalidateQueries({ queryKey: vjKeys.clips(demoMode) });
    },
    [queryClient, demoMode],
  );
}
