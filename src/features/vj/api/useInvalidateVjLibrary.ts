import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjLibraryChange } from "../../../shared/contracts/vj";
import {
  vjInvalidationTargetsOf,
  type VjInvalidationTarget,
} from "./vjLibraryInvalidation";
import { vjKeys } from "./vjKeys";

/** The query key a target marks stale. The two roots match every pack in both
 *  modes; the rest carry the current mode flag. */
function queryKeyOf(
  target: VjInvalidationTarget,
  isDemoMode: boolean,
): readonly unknown[] {
  switch (target.kind) {
    case "root":
      return vjKeys.root;
    case "packs":
      return vjKeys.packs(isDemoMode);
    case "clips":
      return vjKeys.clips(isDemoMode);
    case "packClipsRoot":
      return vjKeys.packClipsRoot;
    case "packClips":
      return vjKeys.packClips(target.packId, isDemoMode);
    case "packEventRoot":
      return vjKeys.packEventRoot;
    case "scenes":
      return vjKeys.scenes(isDemoMode);
    case "setlists":
      return vjKeys.setlists(isDemoMode);
  }
}

/**
 * Marks the library queries stale after a change someone else made (a socket
 * `library:changed` frame, or another demo tab's message). Which queries go
 * stale follows `vjInvalidationTargetsOf`: a null change and every v1 pack or
 * clip kind refresh the whole library, a pack's clip list change refreshes the
 * packs it names plus the pack and clip lists, and each v2 kind refreshes the
 * clips, packs, pack event cards, scenes or set lists it touches.
 */
export function useInvalidateVjLibrary(): (
  change: VjLibraryChange | null,
) => void {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  return useCallback(
    (change) => {
      for (const target of vjInvalidationTargetsOf(change)) {
        void queryClient.invalidateQueries({
          queryKey: queryKeyOf(target, demoMode),
        });
      }
    },
    [queryClient, demoMode],
  );
}
