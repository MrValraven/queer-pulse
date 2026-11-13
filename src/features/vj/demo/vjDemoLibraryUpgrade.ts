/**
 * The demo VJ library's shape check and its v1 to v2 upgrade (C 9.5). A v1
 * library gains the clip defaults (C 2.1 column defaults) and the pack event
 * link, then the v2 seeds apply where their targets still exist (plan call 7):
 * the seed favorite, the seed pack's event link, the two scenes and the set
 * list. A v2 library saved before sequences gains their fields through
 * `fillVjDemoSequenceFields` (sequences contract 10.2). Pure: storage and the
 * store clock stay in `vjDemoStorePersistence.ts`.
 */
import {
  DEFAULT_VJ_STEP_DURATION,
  VJ_LOOP_MODES,
  VJ_SETLIST_ITEM_KINDS,
  VJ_SPEEDS,
  isVjStepDuration,
  type VjSceneLook,
} from "../../../shared/contracts/vj";
import {
  VJ_DEMO_CREATORS,
  VJ_DEMO_SCENE_SEEDS,
  VJ_DEMO_SEED,
  VJ_DEMO_SETLIST_SEEDS,
  type VjDemoSetlistItemSeed,
} from "./vjDemo.data";
import type {
  StoredVjDemoClip,
  StoredVjDemoLibrary,
  StoredVjDemoPack,
  StoredVjDemoScene,
  StoredVjDemoSetlist,
  StoredVjDemoSetlistItem,
} from "./vjDemoStorePersistence";

/** Seed set list item ids: this prefix, the set list's index, the item's index. */
const SEED_SETLIST_ITEM_ID_PREFIX = "00000000-0000-4000-8000-0000000001";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    (value as unknown[]).every((entry) => typeof entry === "string")
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return (
    value === null || (typeof value === "number" && Number.isFinite(value))
  );
}

function isOneOf<Option>(options: readonly Option[], value: unknown): boolean {
  return (options as readonly unknown[]).includes(value);
}

function hasStoredCreator(record: Record<string, unknown>): boolean {
  const creator = record.createdBy;
  if (creator === null) return true;
  return (
    isRecord(creator) &&
    typeof creator.userId === "string" &&
    typeof creator.displayName === "string"
  );
}

function hasStoredIdentity(record: Record<string, unknown>): boolean {
  return (
    typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    hasStoredCreator(record)
  );
}

function isStoredClipV1(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    hasStoredIdentity(value) &&
    typeof value.title === "string" &&
    typeof value.mediaUrl === "string" &&
    typeof value.thumbnailUrl === "string" &&
    typeof value.byteSize === "number"
  );
}

function isStoredClipV2(value: unknown): value is StoredVjDemoClip {
  return (
    isStoredClipV1(value) &&
    typeof value.isFavorite === "boolean" &&
    isOneOf(VJ_SPEEDS, value.defaultSpeed) &&
    isOneOf(VJ_LOOP_MODES, value.loopMode) &&
    isNullableNumber(value.loopInMs) &&
    isNullableNumber(value.loopOutMs)
  );
}

function isStoredPackV1(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    hasStoredIdentity(value) &&
    typeof value.name === "string" &&
    isStringList(value.clipIds)
  );
}

function isStoredPackV2(value: unknown): value is StoredVjDemoPack {
  return isStoredPackV1(value) && isNullableString(value.eventId);
}

function isStoredScene(value: unknown): value is StoredVjDemoScene {
  return (
    isRecord(value) &&
    hasStoredIdentity(value) &&
    typeof value.name === "string" &&
    isNullableString(value.packId) &&
    isRecord(value.look)
  );
}

/** A step: a listed kind, exactly the matching target a string and the
 *  other null, and a duration that is null or in range. */
function isStoredSetlistItem(value: unknown): boolean {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  if (!isOneOf(VJ_SETLIST_ITEM_KINDS, value.kind)) return false;
  const hasMatchingTarget =
    value.kind === "scene"
      ? typeof value.sceneId === "string" && value.clipId === null
      : typeof value.clipId === "string" && value.sceneId === null;
  return (
    hasMatchingTarget &&
    (value.duration === null || isVjStepDuration(value.duration))
  );
}

function isStoredSetlist(value: unknown): value is StoredVjDemoSetlist {
  return (
    isRecord(value) &&
    hasStoredIdentity(value) &&
    typeof value.name === "string" &&
    typeof value.isLooping === "boolean" &&
    isVjStepDuration(value.stepDuration) &&
    Array.isArray(value.items) &&
    (value.items as unknown[]).every(isStoredSetlistItem)
  );
}

/** A stored item with the sequence fields: an item saved before sequences
 *  (a string `sceneId` and no `kind`) becomes a scene step on the default
 *  length; a missing other target becomes null; a duration missing or out
 *  of range becomes null. Anything else passes through for the step check. */
function fillSetlistItem(item: unknown): unknown {
  if (!isRecord(item)) return item;
  if (typeof item.sceneId === "string" && !("kind" in item)) {
    return {
      id: item.id,
      kind: "scene",
      sceneId: item.sceneId,
      clipId: null,
      duration: null,
    };
  }
  const filled: Record<string, unknown> = { ...item };
  if (item.kind === "scene" && item.clipId === undefined) filled.clipId = null;
  if (item.kind === "clip" && item.sceneId === undefined) filled.sceneId = null;
  if (item.duration !== null && !isVjStepDuration(item.duration)) {
    filled.duration = null;
  }
  return filled;
}

/** The filled steps of a stored list; a step that still fails the step
 *  check is dropped, so one bad step never reseeds the whole library. */
function fillSetlistItems(items: unknown[]): unknown[] {
  return items.map(fillSetlistItem).filter(isStoredSetlistItem);
}

/** A stored set list with Loop (off when missing or not a boolean), a
 *  default length (DEFAULT_VJ_STEP_DURATION when missing or out of range)
 *  and filled items. */
function fillSetlist(setlist: unknown): unknown {
  if (!isRecord(setlist)) return setlist;
  return {
    ...setlist,
    isLooping:
      typeof setlist.isLooping === "boolean" ? setlist.isLooping : false,
    stepDuration: isVjStepDuration(setlist.stepDuration)
      ? setlist.stepDuration
      : { ...DEFAULT_VJ_STEP_DURATION },
    items: Array.isArray(setlist.items)
      ? fillSetlistItems(setlist.items as unknown[])
      : setlist.items,
  };
}

/** The sequence fields filled on every set list of a parsed library
 *  (sequences contract 10.2), run before `isVjDemoLibraryV2`. Steps are
 *  repaired where they can be and dropped where they cannot; a value with no
 *  set list array, or a set list whose own shape is broken, is left for the
 *  guard, which reseeds. */
export function fillVjDemoSequenceFields(value: unknown): unknown {
  if (!isRecord(value) || !Array.isArray(value.setlists)) return value;
  return {
    ...value,
    setlists: (value.setlists as unknown[]).map(fillSetlist),
  };
}

function isListOf<Entry>(
  value: unknown,
  isEntry: (entry: unknown) => entry is Entry,
): value is Entry[] {
  return Array.isArray(value) && (value as unknown[]).every(isEntry);
}

/** The stored v2 shape, entry by entry; a scene look is checked as an object
 *  only, since every read passes it through the look normaliser. */
export function isVjDemoLibraryV2(
  value: unknown,
): value is StoredVjDemoLibrary {
  return (
    isRecord(value) &&
    value.version === 2 &&
    isListOf(value.packs, isStoredPackV2) &&
    isListOf(value.clips, isStoredClipV2) &&
    isListOf(value.scenes, isStoredScene) &&
    isListOf(value.setlists, isStoredSetlist)
  );
}

/** A seed look with each clip it names checked against the library: a missing
 *  source clip clears the source, a missing mix clip empties the mix and keeps
 *  its blend mode (the C 6.2 clip delete rewrite). */
function seedLookWithKnownClips(
  look: VjSceneLook,
  clipIds: ReadonlySet<string>,
): VjSceneLook {
  const copy = structuredClone(look);
  const isSourceMissing =
    copy.source?.kind === "clip" && !clipIds.has(copy.source.clipId);
  const isMixClipMissing =
    copy.mix.clipId !== null && !clipIds.has(copy.mix.clipId);
  return {
    ...copy,
    source: isSourceMissing ? null : copy.source,
    mix: isMixClipMissing ? { ...copy.mix, clipId: null, amount: 0 } : copy.mix,
  };
}

/** The scene and set list seeds with timestamps, sources pointing at missing clips cleared (plan call 7). */
export function seedVjDemoScenesAndSetlists(
  library: Pick<StoredVjDemoLibrary, "packs" | "clips">,
  now: number,
): Pick<StoredVjDemoLibrary, "scenes" | "setlists"> {
  const createdAt = new Date(now).toISOString();
  const packIds = new Set(library.packs.map((pack) => pack.id));
  const clipIds = new Set(library.clips.map((clip) => clip.id));
  const scenes = VJ_DEMO_SCENE_SEEDS.map((seed): StoredVjDemoScene => ({
    id: seed.id,
    name: seed.name,
    packId:
      seed.packId !== null && packIds.has(seed.packId) ? seed.packId : null,
    look: seedLookWithKnownClips(seed.look, clipIds),
    createdBy: VJ_DEMO_CREATORS[seed.creator],
    createdAt,
    updatedAt: createdAt,
  }));
  const setlists = VJ_DEMO_SETLIST_SEEDS.map(
    (seed, setlistIndex): StoredVjDemoSetlist => ({
      id: seed.id,
      name: seed.name,
      isLooping: seed.isLooping,
      stepDuration: { ...seed.stepDuration },
      items: seed.items.flatMap((itemSeed, itemIndex) =>
        seedSetlistItemsOf(
          itemSeed,
          `${SEED_SETLIST_ITEM_ID_PREFIX}${setlistIndex}${itemIndex}`,
          clipIds,
        ),
      ),
      createdBy: VJ_DEMO_CREATORS[seed.creator],
      createdAt,
      updatedAt: createdAt,
    }),
  );
  return { scenes, setlists };
}

/** One seed step as stored, keeping its seed id; a clip step whose clip the
 *  library lacks is dropped (sequences contract 10.5). */
function seedSetlistItemsOf(
  itemSeed: VjDemoSetlistItemSeed,
  itemId: string,
  clipIds: ReadonlySet<string>,
): StoredVjDemoSetlistItem[] {
  const duration = itemSeed.duration === null ? null : { ...itemSeed.duration };
  if (itemSeed.kind === "scene") {
    return [
      {
        id: itemId,
        kind: "scene",
        sceneId: itemSeed.sceneId,
        clipId: null,
        duration,
      },
    ];
  }
  if (!clipIds.has(itemSeed.clipId)) return [];
  return [
    {
      id: itemId,
      kind: "clip",
      sceneId: null,
      clipId: itemSeed.clipId,
      duration,
    },
  ];
}

/** A v1 clip with the C 2.1 column defaults; the seed favorite applies when
 *  the clip is that seed clip. */
function upgradeClipV1(clip: Record<string, unknown>): Record<string, unknown> {
  const seed = VJ_DEMO_SEED.clips.find((candidate) => candidate.id === clip.id);
  return {
    ...clip,
    isFavorite: seed?.isFavorite ?? false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
  };
}

/** A v1 pack with no event link; the seed pack's link applies when the pack
 *  is that seed pack. */
function upgradePackV1(pack: Record<string, unknown>): Record<string, unknown> {
  const seed = VJ_DEMO_SEED.packs.find((candidate) => candidate.id === pack.id);
  return { ...pack, eventId: seed?.eventId ?? null };
}

/** v1 library: clips gain the C 9.5 defaults, packs gain eventId null, then the v2 seeds apply where their targets exist. */
export function upgradeVjDemoLibraryV1(
  value: unknown,
  now: number,
): StoredVjDemoLibrary | null {
  const isLibraryV1 =
    isRecord(value) &&
    value.version === 1 &&
    isListOf(value.packs, isStoredPackV1) &&
    isListOf(value.clips, isStoredClipV1);
  if (!isLibraryV1) return null;
  const packs = (value.packs as Record<string, unknown>[]).map(upgradePackV1);
  const clips = (value.clips as Record<string, unknown>[]).map(upgradeClipV1);
  if (!isListOf(packs, isStoredPackV2) || !isListOf(clips, isStoredClipV2)) {
    return null;
  }
  const upgraded = fillVjDemoSequenceFields({
    version: 2,
    packs,
    clips,
    ...seedVjDemoScenesAndSetlists({ packs, clips }, now),
  });
  return isVjDemoLibraryV2(upgraded) ? upgraded : null;
}
