import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  EMPTY_EPISODE_MEMORY,
  markEpisodePlayed,
  markEpisodeUnplayed,
  readEpisodeMemory,
  readEpisodeSpeed,
  subscribeEpisodeMemory,
  writeEpisodeSpeed,
  type StudioEpisodeMemory,
  type StudioEpisodeMemoryEntry,
} from "./studioEpisodeMemory";
import type { StudioEpisodeSpeed } from "./studioEpisodeRules";

/** Demo uses the same store under one fixed id (spec 5.7), the scope the
 *  sign-out already uses for demo drafts. */
export const DEMO_EPISODE_MEMBER_ID = "demo";

export function useStudioEpisodeMemberId(): string | null {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  return demoMode ? DEMO_EPISODE_MEMBER_ID : (user?.id ?? null);
}

export interface StudioEpisodeMemoryControls {
  memberId: string | null;
  memory: StudioEpisodeMemory;
  entryOf: (trackId: string) => StudioEpisodeMemoryEntry | undefined;
  isPlayed: (trackId: string) => boolean;
  markPlayed: (trackId: string) => void;
  markUnplayed: (trackId: string) => void;
}

/** The member's episode memory; rows re-render on every change, here or in
 *  another tab. Signed out, it is empty and the marks do nothing. */
export function useStudioEpisodeMemory(): StudioEpisodeMemoryControls {
  const memberId = useStudioEpisodeMemberId();
  const memory = useSyncExternalStore(subscribeEpisodeMemory, () =>
    memberId ? readEpisodeMemory(memberId) : EMPTY_EPISODE_MEMORY,
  );
  return useMemo(
    () => ({
      memberId,
      memory,
      entryOf: (trackId) => memory[trackId],
      isPlayed: (trackId) => memory[trackId]?.playedAt !== undefined,
      markPlayed: (trackId) => {
        if (memberId) markEpisodePlayed(memberId, trackId);
      },
      markUnplayed: (trackId) => {
        if (memberId) markEpisodeUnplayed(memberId, trackId);
      },
    }),
    [memberId, memory],
  );
}

/** The episode speed alone: a number snapshot, so position saves never
 *  re-render its readers. */
export function useStudioEpisodeSpeed(): {
  speed: StudioEpisodeSpeed;
  setSpeed: (speed: StudioEpisodeSpeed) => void;
} {
  const memberId = useStudioEpisodeMemberId();
  const speed = useSyncExternalStore(subscribeEpisodeMemory, () =>
    readEpisodeSpeed(memberId),
  );
  const setSpeed = useCallback(
    (next: StudioEpisodeSpeed) => {
      if (memberId) writeEpisodeSpeed(memberId, next);
    },
    [memberId],
  );
  return { speed, setSpeed };
}
