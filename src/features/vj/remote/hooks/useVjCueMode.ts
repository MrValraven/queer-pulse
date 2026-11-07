/**
 * Cue mode: a tile tap arms the clip and Go sends it. Whether cue mode is on
 * is kept on this device (contract 9.2, `VJ_REMOTE_CUE_MODE_STORAGE_KEY`;
 * a bad value reads as off). The armed clip lives in memory only and clears
 * when cue mode turns off.
 */
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "../../../../shared/hooks/useLocalStorage";
import { VJ_REMOTE_CUE_MODE_STORAGE_KEY } from "../../vj.constants";

export interface VjCueMode {
  isCueMode: boolean;
  setCueMode: (isOn: boolean) => void;
  /** The clip Go would send; always null while cue mode is off. */
  armedClipId: string | null;
  arm: (clipId: string) => void;
  clearArmed: () => void;
}

function isStoredCueMode(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function useVjCueMode(): VjCueMode {
  const [isCueMode, setStoredCueMode] = useLocalStorage<boolean>(
    VJ_REMOTE_CUE_MODE_STORAGE_KEY,
    false,
    isStoredCueMode,
  );
  const [armedClipId, setArmedClipId] = useState<string | null>(null);

  const setCueMode = useCallback(
    (isOn: boolean) => {
      setStoredCueMode(isOn);
      if (!isOn) setArmedClipId(null);
    },
    [setStoredCueMode],
  );
  const arm = useCallback((clipId: string) => setArmedClipId(clipId), []);
  const clearArmed = useCallback(() => setArmedClipId(null), []);

  return useMemo(
    () => ({
      isCueMode,
      setCueMode,
      armedClipId: isCueMode ? armedClipId : null,
      arm,
      clearArmed,
    }),
    [isCueMode, setCueMode, armedClipId, arm, clearArmed],
  );
}
