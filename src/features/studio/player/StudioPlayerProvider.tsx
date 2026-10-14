import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import type {
  StudioAudioEngineFactory,
  StudioDeckRefs,
} from "./studioAudioEngine";
import {
  StudioPlayerClockContext,
  StudioPlayerContext,
} from "./studioPlayerContext";
import { StudioPlayerShortcutsMount } from "./StudioPlayerShortcutsMount";
import { StudioPlayerSurfaceProvider } from "./StudioPlayerSurfaceProvider";
import { createDefaultAudioEngine } from "./studioWebAudioEngine";
import { useStudioMediaSession } from "./useStudioMediaSession";
import { useStudioPlayback } from "./useStudioPlayback";

/** The two hidden decks. The engine sets crossOrigin itself, only where Web
 *  Audio runs, so plain playback keeps byte-range requests working. */
function StudioPlayerDecks({
  firstDeckRef,
  secondDeckRef,
}: {
  firstDeckRef: RefObject<HTMLAudioElement | null>;
  secondDeckRef: RefObject<HTMLAudioElement | null>;
}) {
  return (
    <div hidden>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- music with no spoken track to caption; the track page shows the lyrics as text. */}
      <audio ref={firstDeckRef} preload="auto" x-webkit-airplay="allow" />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the second deck of the same player. */}
      <audio ref={secondDeckRef} preload="auto" x-webkit-airplay="allow" />
    </div>
  );
}

/**
 * One player for the whole app: two <audio> decks, the queue, the play state.
 * Mounted in App's DataProviders so a track keeps playing on every page.
 */
export function StudioPlayerProvider({
  children,
  engineFactory = createDefaultAudioEngine,
}: {
  children: ReactNode;
  engineFactory?: StudioAudioEngineFactory;
}) {
  const firstDeckRef = useRef<HTMLAudioElement | null>(null);
  const secondDeckRef = useRef<HTMLAudioElement | null>(null);
  const deckRefs = useMemo<StudioDeckRefs>(
    () => [firstDeckRef, secondDeckRef],
    [],
  );
  const { value, clock } = useStudioPlayback(engineFactory, deckRefs);
  useStudioMediaSession(value, clock);
  return (
    <StudioPlayerContext.Provider value={value}>
      <StudioPlayerClockContext.Provider value={clock}>
        <StudioPlayerSurfaceProvider hasQueue={value.hasQueue}>
          {children}
          <StudioPlayerShortcutsMount />
          <StudioPlayerDecks
            firstDeckRef={firstDeckRef}
            secondDeckRef={secondDeckRef}
          />
        </StudioPlayerSurfaceProvider>
      </StudioPlayerClockContext.Provider>
    </StudioPlayerContext.Provider>
  );
}
