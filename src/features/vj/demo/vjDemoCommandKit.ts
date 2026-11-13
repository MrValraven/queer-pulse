// The shapes every demo command rule shares: the library lookup the stage
// reads synchronously (contract 7.7), the context a rule runs in, the
// outcome it answers, and the live source helpers. Mirrors
// queerpulse-backend/src/vj/stage/vj-rule-kit.ts.

import {
  VJ_LIMITS,
  type VjGeneratorId,
  type VjMix,
  type VjSceneLook,
  type VjSetlistFollowRead,
  type VjSetlistRead,
  type VjSetlistReadPosition,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";

/** What the demo stage asks the library (C 7.7 reads, answered synchronously). */
export interface VjDemoLibraryLookup {
  hasPack(packId: string): boolean;
  hasClip(clipId: string): boolean;
  isClipInPack(packId: string, clipId: string): boolean;
  readPackForStage(packId: string): { eventId: string | null } | null;
  existingClipIds(clipIds: string[]): Set<string>;
  clipIdsInPack(packId: string, clipIds: string[]): Set<string>;
  readPackClipForAdvance(
    packId: string,
    clipId: string,
  ): { isFavorite: boolean } | null;
  readSceneLook(sceneId: string): VjSceneLook | null;
  /** One read per step (sequences contract 5.8, call 6): item ids, Loop, the
   *  default length and the step at `position`; null when no set list has
   *  the id or the id is malformed. */
  readSetlist(
    setlistId: string,
    position: VjSetlistReadPosition,
  ): VjSetlistRead | null;
  /** The item ids and Loop after a library change (sequences contract 7);
   *  null when no set list has the id. */
  readSetlistFollow(setlistId: string): VjSetlistFollowRead | null;
}

export interface VjDemoCommandContext {
  now: number;
  library: VjDemoLibraryLookup;
  /** screenIds of screens with a tab attached now. */
  connectedScreenIds: ReadonlySet<string>;
  /** The lead screen's last status has a mic report (C 7.6 setTempo step 5). */
  isLeadMicOn: boolean;
}

/** Time stamps the quantize step fills from applyAt ?? now (C 7.4 step 5). */
export interface VjDemoStamps {
  /** The command set the live source (goClip, goGenerator, swapMix, advance, recall). */
  isLiveSourceSet: boolean;
  /** The command turned the strobe on. */
  isStrobeStarted: boolean;
  /** undefined keeps overlay.hideAt; null clears it; a number stamps applyAt ?? now plus it. */
  overlayHideAfterMs: number | null | undefined;
}

export const NO_VJ_DEMO_STAMPS: VjDemoStamps = Object.freeze({
  isLiveSourceSet: false,
  isStrobeStarted: false,
  overlayHideAfterMs: undefined,
});

export type VjDemoCommandOutcome =
  | { next: VjStageState; isAlwaysChange: boolean; stamps: VjDemoStamps }
  | { error: VjSocketErrorCode };

/** An accepted change; isAlwaysChange false and no stamps unless given. */
export function vjDemoChange(
  next: VjStageState,
  options: { isAlwaysChange?: boolean; stamps?: Partial<VjDemoStamps> } = {},
): VjDemoCommandOutcome {
  return {
    next,
    isAlwaysChange: options.isAlwaysChange ?? false,
    stamps: { ...NO_VJ_DEMO_STAMPS, ...options.stamps },
  };
}

/** The history with the clip first, each id once, at most 8. */
function withVjRecentClip(
  recentClipIds: readonly string[],
  clipId: string,
): string[] {
  return [
    clipId,
    ...recentClipIds.filter(
      (recentClipId) => recentClipId.toLowerCase() !== clipId,
    ),
  ].slice(0, VJ_LIMITS.recentClipsMax);
}

/** Clears the generator, sets the clip, clipSequence + 1, moves a non-null clip to the front of recentClipIds (deduplicated, at most 8). */
export function withVjLiveClip(
  state: VjStageState,
  clipId: string | null,
): VjStageState {
  const liveClipId = clipId === null ? null : clipId.toLowerCase();
  return {
    ...state,
    liveClipId,
    liveGeneratorId: null,
    liveGeneratorVariant: null,
    clipSequence: state.clipSequence + 1,
    recentClipIds:
      liveClipId === null
        ? state.recentClipIds
        : withVjRecentClip(state.recentClipIds, liveClipId),
  };
}

/** Clears the clip, sets generator and variant, clipSequence + 1; null goes to black. */
export function withVjLiveGenerator(
  state: VjStageState,
  generatorId: VjGeneratorId | null,
  variant: string | null,
): VjStageState {
  return {
    ...state,
    liveClipId: null,
    liveGeneratorId: generatorId,
    liveGeneratorVariant: generatorId === null ? null : variant,
    clipSequence: state.clipSequence + 1,
  };
}

/** The mix emptied: no clip, amount 0, the blend mode kept. */
export function withVjMixCleared(mix: VjMix): VjMix {
  return { clipId: null, amount: 0, blendMode: mix.blendMode };
}
