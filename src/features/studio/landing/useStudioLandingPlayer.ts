import { useCallback, useEffect, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioLandingPreviewView as Preview } from "../api/studioLanding.adapters";
import {
  IDLE_STATE,
  LandingPlayerSession,
  type StudioLandingPlayerState,
} from "./studioLandingPlayerSession";

export type {
  StudioLandingPlayerState,
  StudioLandingPlayerStatus,
} from "./studioLandingPlayerSession";

/**
 * The landing's own small player, one track at a time. It stands apart from
 * Studio's player on purpose: it reads no player context, posts no play and
 * writes no listening history, and each stream request is a plain public
 * fetch with credentials omitted. Unmounting stops the audio and releases it.
 */
export function useStudioLandingPlayer() {
  const { demoMode } = useDemoMode();
  const [state, setState] = useState<StudioLandingPlayerState>(IDLE_STATE);
  const [session] = useState(() => new LandingPlayerSession(setState));
  useEffect(() => () => session.dispose(), [session]);
  const stopIfAbsent = useCallback(
    (previewIds: readonly string[]) => session.stopIfAbsent(previewIds),
    [session],
  );

  return {
    state,
    stopIfAbsent,
    toggle: (preview: Preview) => session.toggle(preview, demoMode),
    retry: (preview: Preview) => session.start(preview, 0, demoMode),
  };
}
