/**
 * The remote's one reader of the stage controller's clock fields. Every
 * beat, ring and countdown on the remote reads server time through this
 * object, so they all follow the clock synced with the screens.
 * `toLocalTime` answers in `vjLocalNow` time (performance.timeOrigin plus
 * performance.now()).
 */
import { useMemo } from "react";
import type { VjStageController } from "../../live/useVjStage";

export interface VjRemoteClock {
  /** Synced server epoch ms now. */
  serverNow: () => number;
  /** The vjLocalNow time of a server epoch ms. */
  toLocalTime: (serverMs: number) => number;
  /** True once a live clock sample arrived. */
  isSynced: boolean;
}

export function useVjRemoteClock(stage: VjStageController): VjRemoteClock {
  const { serverNow, toLocalTime, isClockSynced } = stage;
  return useMemo(
    () => ({ serverNow, toLocalTime, isSynced: isClockSynced }),
    [serverNow, toLocalTime, isClockSynced],
  );
}
