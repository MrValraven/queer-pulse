import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjPackMediaDTO } from "../../../shared/contracts/vj";
import { getVjPackMedia } from "./vj.api";

export type VjPackMediaFetcher = (
  packId: string,
  clipIds: string[] | null,
  signal?: AbortSignal,
) => Promise<VjPackMediaDTO>;

/** Imperative preload-URL source for the screen. The answer carries presigned
 *  URLs that expire, so it never goes through the query cache: every call asks
 *  again (contract 5.2). */
export function useVjPackMediaFetcher(): VjPackMediaFetcher {
  const { demoMode } = useDemoMode();
  return useCallback<VjPackMediaFetcher>(
    async (packId, clipIds, signal) => {
      if (demoMode) {
        const { demoGetVjPackMedia } = await import("../demo/vjDemoStore");
        return demoGetVjPackMedia(packId, clipIds);
      }
      return getVjPackMedia(packId, clipIds, signal);
    },
    [demoMode],
  );
}
