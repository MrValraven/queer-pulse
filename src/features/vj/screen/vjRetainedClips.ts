// Which clips the projector's cache keeps (contract 9.1, extending v1 8.5):
// the active pack, the previous pack, every clip the state names for this
// screen (live, mix, this screen's override) and every clip the active set
// list names (sequences contract 6.1). The clips outside both packs are the
// extra clips: the screen fetches their media through GET
// /admin/vj/clips/media so a step, a scene recall or a mix fade starts from
// a cached clip.

import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistItemDTO,
  type VjStageState,
} from "../../../shared/contracts/vj";

export interface VjRetainedClipsInput {
  activePackClipIds: readonly string[];
  previousPackClipIds: readonly string[];
  state: VjStageState | null;
  screenId: string;
  /** Every clip the active set list names, the next step's first (vjSetlistClipIds). */
  setlistClipIds: readonly string[];
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
    ...input.setlistClipIds,
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

/**
 * The extra clips' run key: the id and byte size of each clip, sorted by id.
 * The retained order turns every step (the next step first, the live clip
 * first), so keying on it would abort and restart the download run each
 * step; this key changes only when a clip joins, leaves or is replaced. A
 * run still downloads in the order of the list it started from.
 */
export function vjClipSetSignatureOf(clips: readonly VjClipDTO[]): string {
  return clips
    .map((clip) => `${clip.id}:${clip.byteSize}`)
    .sort()
    .join("|");
}

/** Steps in play order: position, then id (the REST order). */
function stepsInOrder(items: readonly VjSetlistItemDTO[]): VjSetlistItemDTO[] {
  return [...items].sort(
    (first, second) =>
      first.position - second.position || first.id.localeCompare(second.id),
  );
}

/** startIndex folded into 0..stepCount-1, so any integer reads a step. */
function wrappedStepIndex(startIndex: number, stepCount: number): number {
  const wholeIndex = Number.isInteger(startIndex) ? startIndex : 0;
  return ((wholeIndex % stepCount) + stepCount) % stepCount;
}

/**
 * Every clip a sequence names (sequences contract 6.1), each once: a clip
 * step's clip, a scene step's source clip and then its mix clip. The walk
 * starts at `startIndex` and wraps round past the last step, so the step the
 * caller names first is fetched first. A scene the list does not hold names
 * nothing.
 */
export function vjSetlistClipIds(
  items: readonly VjSetlistItemDTO[],
  scenes: readonly VjSceneDTO[],
  startIndex: number,
): string[] {
  if (items.length === 0) return [];
  const steps = stepsInOrder(items);
  const firstStepIndex = wrappedStepIndex(startIndex, steps.length);
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const clipIds: string[] = [];
  const seenClipIds = new Set<string>();
  const addClipId = (clipId: string | null | undefined): void => {
    if (clipId === null || clipId === undefined) return;
    if (seenClipIds.has(clipId)) return;
    seenClipIds.add(clipId);
    clipIds.push(clipId);
  };
  for (let offset = 0; offset < steps.length; offset += 1) {
    const step = steps[(firstStepIndex + offset) % steps.length];
    if (step === undefined) continue;
    if (step.kind === "clip") {
      addClipId(step.clipId);
      continue;
    }
    const look =
      step.sceneId === null ? undefined : sceneById.get(step.sceneId)?.look;
    if (look === undefined) continue;
    addClipId(look.source?.kind === "clip" ? look.source.clipId : null);
    addClipId(look.mix.clipId);
  }
  return clipIds;
}
