/**
 * The render mode the remote chose for this screen. It starts on effects and
 * lives only in this hook's state: a page reload starts on effects again and
 * a socket reconnect, which leaves the hook mounted, keeps the current mode.
 * Nothing is written to storage or to the offline record.
 */
import { useEffect, useState } from "react";
import {
  isVjRenderMode,
  type VjRenderMode,
} from "../../../shared/contracts/vj";
import type { VjStageController } from "../live/useVjStage";

export function useVjScreenRenderMode(
  subscribeRenderMode: VjStageController["subscribeRenderMode"],
): VjRenderMode {
  const [renderMode, setRenderMode] = useState<VjRenderMode>("effects");
  useEffect(
    () =>
      subscribeRenderMode((frame) => {
        if (isVjRenderMode(frame.mode)) setRenderMode(frame.mode);
      }),
    [subscribeRenderMode],
  );
  return renderMode;
}
