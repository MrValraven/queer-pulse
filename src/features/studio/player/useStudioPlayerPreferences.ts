import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { useStudioPlaybackPreferences } from "../api/useStudioPlaybackPreferences";
import type { StudioAudioEngine } from "./studioAudioEngine";
import type {
  StudioPlaybackSettings,
  StudioPlayerPreferences,
} from "./studioPlayerContext";
import {
  clampCrossfadeSeconds,
  clampVolume,
  normalizePlayerPreferences,
  readListeningPreferences,
  readPlayerPreferences,
  setActiveCrossfadeSeconds,
  subscribeListeningPreferences,
  writeListeningPreferences,
  writePlayerPreferences,
  type StudioListeningPreferences,
  type StudioLocalPlayerPreferences,
} from "./studioPlayerPreferences";

export interface StudioPlayerPreferenceControls {
  preferences: StudioPlayerPreferences;
  playbackSettings: StudioPlaybackSettings;
  readPreferences: () => StudioPlayerPreferences;
  readPlaybackSettings: () => StudioPlaybackSettings;
  applyTo: (engine: StudioAudioEngine) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCrossfadeSeconds: (seconds: number) => void;
  setLoudnessEven: (isEven: boolean) => void;
}

/** Trailing debounce for crossfade saves (contract F.5). */
export const CROSSFADE_SAVE_DELAY_MS = 400;

export function applyPreferences(
  engine: StudioAudioEngine,
  preferences: Pick<
    StudioPlayerPreferences,
    "volume" | "isMuted" | "isLoudnessEven"
  >,
): void {
  engine.setVolume(preferences.volume);
  engine.setMuted(preferences.isMuted);
  engine.setLoudnessEven(preferences.isLoudnessEven);
}

/** The player's settings: volume, mute and even loudness on this device
 *  (localStorage); crossfade length, autoplay next, hide explicit and ask
 *  before warned tracks from the member's server setting (Open pages'
 *  useStudioPlaybackPreferences, contract F.2). Changes reach the engine as
 *  they happen. */
export function useStudioPlayerPreferences(
  engineRef: RefObject<StudioAudioEngine | null>,
): StudioPlayerPreferenceControls {
  const server = useStudioPlaybackPreferences();
  const [local, setLocal] = useState<StudioLocalPlayerPreferences>(
    readPlayerPreferences,
  );
  const localRef = useRef(local);
  // The crossfade value the member just picked, shown at once while its
  // debounced save is on the way (contract F.5).
  const [pendingCrossfade, setPendingCrossfade] = useState<number | null>(null);
  const [isSaveSent, setIsSaveSent] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<number | null>(null);
  const serverCrossfadeSeconds = server.preferences.crossfadeSeconds;
  // The mirror drops once the server shows the saved value.
  if (isSaveSent && pendingCrossfade === serverCrossfadeSeconds) {
    setPendingCrossfade(null);
    setIsSaveSent(false);
  }
  const { autoplayNext, hideExplicit } = server.preferences;
  // Studio safety: on unless the member switched it off.
  const askBeforeWarnings = server.preferences.askBeforeWarnings !== false;
  const crossfadeSeconds =
    pendingCrossfade ?? server.preferences.crossfadeSeconds;
  const preferences = useMemo<StudioPlayerPreferences>(
    () => ({ ...local, crossfadeSeconds }),
    [local, crossfadeSeconds],
  );
  const playbackSettings = useMemo<StudioPlaybackSettings>(
    () => ({ autoplayNext, hideExplicit, askBeforeWarnings }),
    [autoplayNext, hideExplicit, askBeforeWarnings],
  );
  const latestRef = useRef({ preferences, playbackSettings, server });
  useEffect(() => {
    latestRef.current = { preferences, playbackSettings, server };
    setActiveCrossfadeSeconds(preferences.crossfadeSeconds);
  });
  // A pending save is sent when the player unmounts.
  useEffect(
    () => () => {
      if (saveTimerRef.current === null || pendingSaveRef.current === null)
        return;
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      latestRef.current.server.savePreferences({
        crossfadeSeconds: pendingSaveRef.current,
      });
    },
    [],
  );
  const controls = useMemo(() => {
    const update = (patch: Partial<StudioLocalPlayerPreferences>) => {
      const next = normalizePlayerPreferences({
        ...localRef.current,
        ...patch,
      });
      localRef.current = next;
      setLocal(next);
      writePlayerPreferences(next);
      const engine = engineRef.current;
      if (engine) applyPreferences(engine, next);
    };
    return {
      readPreferences: () => latestRef.current.preferences,
      readPlaybackSettings: () => latestRef.current.playbackSettings,
      applyTo: (engine: StudioAudioEngine) =>
        applyPreferences(engine, localRef.current),
      // Moving the volume up unmutes, as every player does.
      setVolume: (volume: number) => {
        const clamped = clampVolume(volume);
        update(
          clamped > 0
            ? { volume: clamped, isMuted: false }
            : { volume: clamped },
        );
      },
      toggleMute: () => update({ isMuted: !localRef.current.isMuted }),
      // Mirrors the value at once and saves it 400 ms after the last change
      // (a slider drag sends one PUT).
      setCrossfadeSeconds: (seconds: number) => {
        const clamped = clampCrossfadeSeconds(seconds);
        setPendingCrossfade(clamped);
        setIsSaveSent(false);
        pendingSaveRef.current = clamped;
        if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          pendingSaveRef.current = null;
          // The mirror stays until the server value reaches the same number
          // (Open pages' save writes its cache), so no render shows the old one.
          latestRef.current.server.savePreferences({
            crossfadeSeconds: clamped,
          });
          setIsSaveSent(true);
        }, CROSSFADE_SAVE_DELAY_MS);
      },
      setLoudnessEven: (isEven: boolean) => update({ isLoudnessEven: isEven }),
    };
  }, [engineRef]);
  return { preferences, playbackSettings, ...controls };
}

export interface StudioListeningPreferenceControls {
  preferences: StudioListeningPreferences;
  /** Off also removes the resume copy from this device. */
  setShouldResumeAcrossSessions: (shouldResume: boolean) => void;
  setSingleKeyShortcutsOn: (isOn: boolean) => void;
}

const listeningSetters = {
  setShouldResumeAcrossSessions: (shouldResume: boolean) => {
    writeListeningPreferences({ shouldResumeAcrossSessions: shouldResume });
  },
  setSingleKeyShortcutsOn: (isOn: boolean) => {
    writeListeningPreferences({ areSingleKeyShortcutsOn: isOn });
  },
};

/** This device's listening switches (resume and single-key shortcuts).
 *  Works outside the player provider, so Studio Settings and the shortcut
 *  listener read it anywhere; every reader re-renders on a change, here or
 *  in another tab. Nothing here reaches the server. */
export function useStudioListeningPreferences(): StudioListeningPreferenceControls {
  const preferences = useSyncExternalStore(
    subscribeListeningPreferences,
    readListeningPreferences,
  );
  return useMemo(() => ({ preferences, ...listeningSetters }), [preferences]);
}
