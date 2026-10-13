import { createContext, useContext } from "react";
import type { ImageSlotTint } from "../../../shared/components/ui";

export interface StudioQueueItem {
  trackId: string;
  title: string;
  durationSeconds: number | null;
  trackHref: string;
  releaseId: string;
  releaseTitle: string;
  coverUrl: string | null;
  tint: ImageSlotTint;
  artistId: string;
  artistName: string;
  artistHref: string;
}

export type StudioPlaybackStatus =
  "idle" | "loading" | "playing" | "paused" | "error";

export interface StudioPlayerState {
  queue: StudioQueueItem[];
  currentIndex: number;
  status: StudioPlaybackStatus;
}

export interface StudioPlayerActions {
  playRelease: (releaseId: string, startTrackId?: string) => Promise<void>;
  /** Several releases as one queue, in the order given (the artist page's Play all). */
  playReleases: (releaseIds: string[]) => Promise<void>;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  retry: () => void;
  stop: () => void;
}

export interface StudioPlayerValue
  extends StudioPlayerState, StudioPlayerActions {
  currentItem: StudioQueueItem | null;
  hasPrevious: boolean;
  hasNext: boolean;
  isCurrentRelease: (releaseId: string) => boolean;
  isCurrentTrack: (trackId: string) => boolean;
}

export interface StudioPlayerClock {
  currentTime: number;
  duration: number | null;
}

export const StudioPlayerContext = createContext<StudioPlayerValue | null>(
  null,
);
export const StudioPlayerClockContext = createContext<StudioPlayerClock>({
  currentTime: 0,
  duration: null,
});

export function useStudioPlayer(): StudioPlayerValue {
  const value = useContext(StudioPlayerContext);
  if (!value)
    throw new Error("useStudioPlayer must be used within StudioPlayerProvider");
  return value;
}

/** The playhead, in its own context so it re-renders only the bar. */
export function useStudioPlayerClock(): StudioPlayerClock {
  return useContext(StudioPlayerClockContext);
}
