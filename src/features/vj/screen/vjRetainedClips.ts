// Which clips the projector's cache keeps (contract 9.1, extending v1 8.5):
// the active pack, the previous pack, every clip the state names for this
// screen (live, mix, this screen's override) and the source clips of the
// active set list's scenes. The clips outside both packs are the extra
// clips: the screen fetches their media through GET /admin/vj/clips/media
// so a scene recall or a mix fade starts from a cached clip.

import {
  VJ_LIMITS,
  type VjSceneDTO,
  type VjStageState,
} from "../../../shared/contracts/vj";

export interface VjRetainedClipsInput {
  activePackClipIds: readonly string[];
  previousPackClipIds: readonly string[];
  state: VjStageState | null;
  screenId: string;
  /** Source clips of the active set list's scenes, in set list order. */
  setlistSceneClipIds: readonly string[];
}

export interface VjRetainedClipsResult {
  keptClipIds: ReadonlySet<string>;
  /** Outside both packs, each id once, most urgent first, at most VJ_LIMITS.mediaClipIdsMax. */
  extraClipIds: string[];
}

/** This screen's override clip; another screen's entry never counts. */
function overrideClipIdOf(
  state: VjStageState,
  screenId: string,
): string | null {
  if (!Object.prototype.hasOwnProperty.call(state.screenOverrides, screenId)) {
    return null;
  }
  return state.screenOverrides[screenId]?.clipId ?? null;
}

/** Clips the state names for this screen, live first so it fetches first. */
function stateClipIdsOf(
  state: VjStageState | null,
  screenId: string,
): string[] {
  if (state === null) return [];
  const clipIds = [
    state.liveClipId,
    state.mix.clipId,
    overrideClipIdOf(state, screenId),
  ];
  return clipIds.filter((clipId): clipId is string => clipId !== null);
}

/** Every clip id the cache keeps, and those outside both packs (fetched through getVjClipsMedia). */
export function vjRetainedClips(
  input: VjRetainedClipsInput,
): VjRetainedClipsResult {
  const packClipIds = new Set([
    ...input.activePackClipIds,
    ...input.previousPackClipIds,
  ]);
  const namedClipIds = [
    ...stateClipIdsOf(input.state, input.screenId),
    ...input.setlistSceneClipIds,
  ];
  const keptClipIds = new Set([...packClipIds, ...namedClipIds]);
  const extraClipIds: string[] = [];
  const seenExtraClipIds = new Set<string>();
  for (const clipId of namedClipIds) {
    if (extraClipIds.length >= VJ_LIMITS.mediaClipIdsMax) break;
    if (packClipIds.has(clipId) || seenExtraClipIds.has(clipId)) continue;
    seenExtraClipIds.add(clipId);
    extraClipIds.push(clipId);
  }
  return { keptClipIds, extraClipIds };
}

/** Clip ids a set list's scenes name as `source.clipId` or `mix.clipId`. */
export function vjSceneClipIds(
  scenes: readonly VjSceneDTO[],
  sceneIdsInOrder: readonly string[],
): string[] {
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const clipIds: string[] = [];
  const seenClipIds = new Set<string>();
  const addClipId = (clipId: string | null): void => {
    if (clipId === null || seenClipIds.has(clipId)) return;
    seenClipIds.add(clipId);
    clipIds.push(clipId);
  };
  for (const sceneId of sceneIdsInOrder) {
    const look = sceneById.get(sceneId)?.look;
    if (look === undefined) continue;
    addClipId(look.source?.kind === "clip" ? look.source.clipId : null);
    addClipId(look.mix.clipId);
  }
  return clipIds;
}
