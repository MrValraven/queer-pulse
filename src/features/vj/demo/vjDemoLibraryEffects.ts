// Library changes on the demo stage (contract 7.10 "Stage effects"): what a
// deleted pack, clip or set list, an unlinked pack event, or a shrunk set list
// leaves a stage in. Pure; the demo stage lands the result with cause
// `library` through the settle step (no grid time). Mirrors
// vjLibraryChangeState of queerpulse-backend/src/vj/stage/vj-library-effects.ts.
// The demo reads the set list count synchronously, so a count of null (the
// set list is gone) clears the set list as its delete would. Override
// entries of pruned screens are the settle step's, and excluded ids that left
// the pack stay on purpose.

import type {
  VjLibraryChange,
  VjScreenOverride,
  VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { withVjMixCleared } from "./vjDemoCommandKit";

/** An id lowercased, or null. */
function lowercaseOrNull(id: string | null): string | null {
  return id === null ? null : id.toLowerCase();
}

/** `pack_deleted` of the active pack: v1 (no active pack, shuffle off,
 *  clipSequence + 1, the live clip kept), plus no exclusions and the event
 *  card hidden. */
function packDeletedState(
  state: VjStageState,
  change: VjLibraryChange,
): VjStageState | null {
  if (
    state.activePackId === null ||
    lowercaseOrNull(change.packId) !== state.activePackId
  ) {
    return null;
  }
  return {
    ...state,
    activePackId: null,
    shuffle: { ...state.shuffle, isOn: false, excludedClipIds: [] },
    eventCard: { ...state.eventCard, isVisible: false },
    clipSequence: state.clipSequence + 1,
  };
}

/** The overrides without any entry naming the clip; null when none does. */
function overridesWithoutClip(
  screenOverrides: Record<string, VjScreenOverride>,
  clipId: string,
): Record<string, VjScreenOverride> | null {
  const entries = Object.entries(screenOverrides);
  const keptEntries = entries.filter(
    ([, override]) => override.clipId?.toLowerCase() !== clipId,
  );
  return keptEntries.length === entries.length
    ? null
    : Object.fromEntries(keptEntries);
}

/** `clip_deleted`: the live clip goes (liveSince null when nothing stays
 *  live, clipSequence + 1), the mix clears to amount 0 with its blend mode
 *  kept, override entries naming it go, and the id leaves the history and
 *  the exclusions. */
function clipDeletedState(
  state: VjStageState,
  change: VjLibraryChange,
): VjStageState | null {
  const clipId = lowercaseOrNull(change.clipId);
  if (clipId === null) return null;
  let next = state;
  if (state.liveClipId === clipId) {
    next = {
      ...next,
      liveClipId: null,
      liveSince: next.liveGeneratorId === null ? null : next.liveSince,
      clipSequence: next.clipSequence + 1,
    };
  }
  if (state.mix.clipId === clipId) {
    next = { ...next, mix: withVjMixCleared(state.mix) };
  }
  const screenOverrides = overridesWithoutClip(state.screenOverrides, clipId);
  if (screenOverrides !== null) {
    next = { ...next, screenOverrides };
  }
  if (state.recentClipIds.includes(clipId)) {
    next = {
      ...next,
      recentClipIds: state.recentClipIds.filter(
        (recentClipId) => recentClipId !== clipId,
      ),
    };
  }
  if (state.shuffle.excludedClipIds.includes(clipId)) {
    next = {
      ...next,
      shuffle: {
        ...next.shuffle,
        excludedClipIds: state.shuffle.excludedClipIds.filter(
          (excludedClipId) => excludedClipId !== clipId,
        ),
      },
    };
  }
  return next === state ? null : next;
}

/** `pack_event_changed` of the active pack to no event hides a shown card. */
function packEventChangedState(
  state: VjStageState,
  change: VjLibraryChange,
): VjStageState | null {
  if (
    change.eventId !== null ||
    !state.eventCard.isVisible ||
    state.activePackId === null ||
    lowercaseOrNull(change.packId) !== state.activePackId
  ) {
    return null;
  }
  return { ...state, eventCard: { ...state.eventCard, isVisible: false } };
}

/** Whether the change names the stage's active set list. */
function namesActiveSetlist(
  state: VjStageState,
  setlistIds: readonly (string | null)[],
): boolean {
  return (
    state.activeSetlistId !== null &&
    setlistIds.some(
      (setlistId) => lowercaseOrNull(setlistId) === state.activeSetlistId,
    )
  );
}

/** The state with no active set list. */
function withoutActiveSetlist(state: VjStageState): VjStageState {
  return { ...state, activeSetlistId: null, setlistIndex: null };
}

/** `setlist_items_changed` or `scene_deleted` naming the active set list: an
 *  index at or past the read count becomes null. A null count (the set list
 *  went in between) clears the set list as its delete would. */
function setlistShrunkState(
  state: VjStageState,
  change: VjLibraryChange,
  library: VjDemoLibraryLookup,
): VjStageState | null {
  if (
    state.activeSetlistId === null ||
    !namesActiveSetlist(state, change.setlistIds)
  ) {
    return null;
  }
  const itemCount = library.setlistItemCount(state.activeSetlistId);
  if (itemCount === null) return withoutActiveSetlist(state);
  if (state.setlistIndex === null || state.setlistIndex < itemCount) {
    return null;
  }
  return { ...state, setlistIndex: null };
}

/** The 7.10 effect of one change; null when the change does not touch the state. */
function libraryChangeStateOf(
  state: VjStageState,
  change: VjLibraryChange,
  library: VjDemoLibraryLookup,
): VjStageState | null {
  switch (change.kind) {
    case "pack_deleted":
      return packDeletedState(state, change);
    case "clip_deleted":
      return clipDeletedState(state, change);
    case "pack_event_changed":
      return packEventChangedState(state, change);
    case "setlist_deleted":
      return namesActiveSetlist(state, [change.setlistId, ...change.setlistIds])
        ? withoutActiveSetlist(state)
        : null;
    case "setlist_items_changed":
    case "scene_deleted":
      return setlistShrunkState(state, change, library);
    default:
      return null;
  }
}

/** C 7.10 "Stage effects" (v1 plus v2); the same object when nothing changes. */
export function applyVjDemoLibraryChange(
  state: VjStageState,
  change: VjLibraryChange,
  library: VjDemoLibraryLookup,
): VjStageState {
  return libraryChangeStateOf(state, change, library) ?? state;
}
