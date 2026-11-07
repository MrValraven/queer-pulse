import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjClipMediaListDTO } from "../../../shared/contracts/vj";
import { getVjClipsMedia } from "./vj.api";

export type VjClipsMediaFetcher = (
  clipIds: string[],
  signal?: AbortSignal,
) => Promise<VjClipMediaListDTO>;

/** The one source of clip media outside a pack (contract 6.2 "Clips media"):
 *  the screen's extra clips and the preview backfill. The answer carries
 *  presigned URLs that expire, so it never goes through the query cache: every
 *  call asks again. */
export function useVjClipsMediaFetcher(): VjClipsMediaFetcher {
  const { demoMode } = useDemoMode();
  return useCallback<VjClipsMediaFetcher>(
    async (clipIds, signal) => {
      if (demoMode) {
        const { demoGetVjClipsMedia } = await import("../demo/vjDemoStore");
        return demoGetVjClipsMedia(clipIds);
      }
      return getVjClipsMedia(clipIds, signal);
    },
    [demoMode],
  );
}
