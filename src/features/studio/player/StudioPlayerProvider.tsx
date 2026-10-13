import { useRef, type ReactNode } from "react";
import {
  createDefaultAudioEngine,
  type StudioAudioEngineFactory,
} from "./studioAudioEngine";
import {
  StudioPlayerClockContext,
  StudioPlayerContext,
} from "./studioPlayerContext";
import { useStudioMediaSession } from "./useStudioMediaSession";
import { useStudioPlayback } from "./useStudioPlayback";

/**
 * One player for the whole app (Studio v1): one <audio> element, the queue,
 * the current index and the play state. Mounted in App's DataProviders so a
 * track keeps playing on every page of QueerPulse.
 */
export function StudioPlayerProvider({
  children,
  engineFactory = createDefaultAudioEngine,
}: {
  children: ReactNode;
  engineFactory?: StudioAudioEngineFactory;
}) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const { value, clock } = useStudioPlayback(engineFactory, audioElementRef);
  useStudioMediaSession(value, clock);
  return (
    <StudioPlayerContext.Provider value={value}>
      <StudioPlayerClockContext.Provider value={clock}>
        {children}
        {/* No crossOrigin: byte-range requests then work without bucket CORS. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- music with no spoken track to caption; the track page shows the lyrics as text. */}
        <audio ref={audioElementRef} preload="none" hidden />
      </StudioPlayerClockContext.Provider>
    </StudioPlayerContext.Provider>
  );
}
