import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type {
  StudioAudioEngine,
  StudioAudioEngineFactory,
  StudioAudioEvent,
  StudioDeckRefs,
} from "./studioAudioEngine";
import {
  createDeckPreloader,
  type StudioDeckControls,
  type StudioDeckSources,
} from "./studioDeckPreload";
import type { StudioRemoteState } from "./studioPlayerContext";
import { REMOTE_IDLE } from "./studioRemotePlayback";

export interface StudioDecksOptions extends StudioDeckSources {
  engineRef: RefObject<StudioAudioEngine | null>;
  engineFactory: StudioAudioEngineFactory;
  deckRefs: StudioDeckRefs;
  /** The entry that plays after the current one on a natural end. */
  nextEntryId: string | null;
  onEvent: (event: StudioAudioEvent) => void;
  onEngineReady: (engine: StudioAudioEngine) => void;
  /** The engine was replaced (a switch between demo and live): the queue goes
   *  with it. */
  onEngineGone: () => void;
}

export interface StudioDecks extends StudioDeckControls {
  isPlainMode: boolean;
  remote: StudioRemoteState;
}

/**
 * The engine's life and the two decks' timing: creates the engine, forwards
 * its events, preloads the next track near the end of this one, starts the
 * crossfade, follows casting and plain mode. Nothing here leaves the browser
 * except the stream read for the next track.
 */
export function useStudioDecks(options: StudioDecksOptions): StudioDecks {
  const queryClient = useQueryClient();
  const sourcesRef = useRef<StudioDecksOptions>(options);
  useEffect(() => {
    sourcesRef.current = options;
  });
  const remoteRef = useRef<StudioRemoteState>(REMOTE_IDLE);
  const { engineRef, engineFactory, deckRefs, demoMode, nextEntryId } = options;
  // The preloader keeps the ref objects and reads `current` only from engine
  // events and the controls it returns, which run outside render.
  // eslint-disable-next-line react-hooks/refs -- the refs are stored and read later from events and controls
  const [preloader] = useState(() =>
    createDeckPreloader({ engineRef, sourcesRef, remoteRef }, queryClient),
  );
  const [isPlainMode, setIsPlainMode] = useState(false);
  const [remote, setRemote] = useState<StudioRemoteState>(REMOTE_IDLE);

  useEffect(() => {
    const latest = sourcesRef;
    const engine = engineFactory({
      decks: [deckRefs[0].current, deckRefs[1].current],
      isSimulated: demoMode,
      durationFor: () => latest.current.durationFor(),
    });
    engineRef.current = engine;
    latest.current.onEngineReady(engine);
    const unsubscribe = engine.subscribe((event) => {
      if (event.type === "remote") {
        remoteRef.current = event.state;
        setRemote(event.state);
        // While a device plays, the deck it reads stays put: no preload.
        if (event.state.isConnected) preloader.cancelPreload();
        return;
      }
      if (event.type === "preloadFailed") {
        preloader.dropFailedPreload();
        return;
      }
      if (event.type === "plainMode") setIsPlainMode(true);
      latest.current.onEvent(event);
      if (event.type === "time") preloader.handleTime(event.seconds);
    });
    return () => {
      unsubscribe();
      preloader.cancelPreload();
      engine.reset();
      engine.dispose?.();
      engineRef.current = null;
      remoteRef.current = REMOTE_IDLE;
      setRemote(REMOTE_IDLE);
      setIsPlainMode(false);
      latest.current.onEngineGone();
    };
  }, [engineFactory, deckRefs, demoMode, engineRef, preloader]);

  // A queue edit, a shuffle or a repeat change that alters the next item
  // drops a preload made for the old one.
  useEffect(() => {
    preloader.followNextEntry(nextEntryId);
  }, [nextEntryId, preloader]);

  return useMemo(
    () => ({
      isPlainMode,
      remote,
      takePreload: preloader.takePreload,
      cancelPreload: preloader.cancelPreload,
      noteSeek: preloader.noteSeek,
      noteTrackStarted: preloader.noteTrackStarted,
    }),
    [isPlainMode, remote, preloader],
  );
}
