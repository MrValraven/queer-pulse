/**
 * The demo VJ library, scenes (contract 6.2, 9.5), re-exported from
 * `vjDemoStore.ts`. Mirrors the backend `vj-scene.service.ts`: the same check
 * order and refusal codes, a malformed id answering its not-found code before
 * any read, dense positions (array indexes), looks stored canonical, and one
 * `library:changed` per committed write (C 7.10). An update equal to the
 * stored row and an unchanged reorder save nothing and post nothing.
 */
import {
  VJ_LIMITS,
  type VjSceneDTO,
  type VjSceneDeletedDTO,
  type VjSceneListDTO,
  type VjSceneLook,
} from "../../../shared/contracts/vj";
import { createVjDemoUuid } from "./vjDemoChannel";
import {
  isVjFullPermutation,
  isVjUuid,
  normalizeVjSceneName,
  vjRefusal,
} from "./vjDemoRules";
import {
  checkVjSceneLook,
  normalizeStoredVjSceneLook,
  vjSceneLookClipRefs,
} from "./vjDemoSceneLook";
import { toVjDemoSceneDto, toVjDemoSceneListDto } from "./vjDemoStoreDto";
import {
  commitVjDemoLibrary,
  findVjDemoScene,
  isoAt,
  loadVjDemoLibrary,
  vjDemoNow,
  vjDemoWriter,
  type StoredVjDemoLibrary,
  type StoredVjDemoScene,
} from "./vjDemoStorePersistence";

/** A scene write's fields after the checks that need no read; undefined
 *  means the body left the field out. */
interface VjSceneUpdateFields {
  name: string | undefined;
  packId: string | null | undefined;
  look: VjSceneLook | undefined;
}

/** A route scene id, lowercased. A malformed id answers VJ_SCENE_NOT_FOUND. */
function lowercaseSceneIdOrRefuse(sceneId: unknown): string {
  if (!isVjUuid(sceneId)) throw vjRefusal("VJ_SCENE_NOT_FOUND");
  return sceneId.toLowerCase();
}

/** An optional `packId` body field (backend readOptionalPackId): absent stays
 *  undefined, null stays null, a uuid comes back lowercased. Anything else
 *  answers VJ_PACK_NOT_FOUND. */
function readOptionalPackId(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (!isVjUuid(value)) throw vjRefusal("VJ_PACK_NOT_FOUND");
  return value.toLowerCase();
}

/** The canonical look, or VJ_SCENE_LOOK_INVALID with its `lookField`. */
function checkLookOrRefuse(value: unknown): VjSceneLook {
  const result = checkVjSceneLook(value);
  if ("code" in result) {
    throw vjRefusal(result.code, { lookField: result.lookField });
  }
  return result.look;
}

/** The update body's checks that need no read, in the contract's order:
 *  name, pack id, look. */
function readUpdateFields(body: {
  name?: unknown;
  packId?: unknown;
  look?: unknown;
}): VjSceneUpdateFields {
  const name =
    body.name === undefined ? undefined : normalizeVjSceneName(body.name);
  const packId = readOptionalPackId(body.packId);
  const look =
    body.look === undefined ? undefined : checkLookOrRefuse(body.look);
  return { name, packId, look };
}

/** Answers VJ_PACK_NOT_FOUND when the write names a pack the library lacks. */
function refuseUnknownPack(
  library: StoredVjDemoLibrary,
  packId: string | null,
): void {
  if (packId === null) return;
  if (!library.packs.some((pack) => pack.id === packId)) {
    throw vjRefusal("VJ_PACK_NOT_FOUND");
  }
}

/** Answers VJ_SCENE_CLIP_NOT_FOUND naming the source before the mix when a
 *  clip the look names is missing. */
function refuseMissingLookClips(
  library: StoredVjDemoLibrary,
  look: VjSceneLook | undefined,
): void {
  if (look === undefined) return;
  for (const { lookField, clipId } of vjSceneLookClipRefs(look)) {
    if (!library.clips.some((clip) => clip.id === clipId)) {
      throw vjRefusal("VJ_SCENE_CLIP_NOT_FOUND", { lookField });
    }
  }
}

/** JSON with object keys sorted, so two looks compare by content whatever
 *  order their fields were built in. */
function stableJsonOf(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJsonOf(entry)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJsonOf(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** Whether an update leaves every stored field as it is. */
function isSameScene(
  scene: StoredVjDemoScene,
  fields: VjSceneUpdateFields,
): boolean {
  const isSameName = fields.name === undefined || fields.name === scene.name;
  const isSamePack =
    fields.packId === undefined || fields.packId === scene.packId;
  const isSameLook =
    fields.look === undefined ||
    stableJsonOf(fields.look) ===
      stableJsonOf(normalizeStoredVjSceneLook(scene.look));
  return isSameName && isSamePack && isSameLook;
}

/** A reorder list lowercased, which must name every scene exactly once.
 *  Answers VJ_SCENE_REORDER_MISMATCH. */
function readFullSceneOrder(
  value: unknown,
  expectedIds: readonly string[],
): string[] {
  const lowered: unknown = Array.isArray(value)
    ? (value as unknown[]).map((entry) =>
        typeof entry === "string" ? entry.toLowerCase() : entry,
      )
    : value;
  if (!isVjFullPermutation(lowered, expectedIds)) {
    throw vjRefusal("VJ_SCENE_REORDER_MISMATCH");
  }
  return lowered;
}

/** Orders set list ids as the backend reads them (`ORDER BY id`). */
function compareIds(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function demoGetVjScenes(): VjSceneListDTO {
  return toVjDemoSceneListDto(loadVjDemoLibrary());
}

/** Appends a scene. Name, pack id and look are checked before the library
 *  read; the pack, the clips and the 200 cap after it. */
export function demoCreateVjScene(body: {
  name: unknown;
  packId?: unknown;
  look: unknown;
}): VjSceneDTO {
  const name = normalizeVjSceneName(body.name);
  const packId = readOptionalPackId(body.packId) ?? null;
  const look = checkLookOrRefuse(body.look);
  const library = loadVjDemoLibrary();
  refuseUnknownPack(library, packId);
  refuseMissingLookClips(library, look);
  if (library.scenes.length >= VJ_LIMITS.scenesMax) {
    throw vjRefusal("VJ_SCENE_LIMIT_REACHED");
  }
  const createdAt = isoAt(vjDemoNow());
  const scene: StoredVjDemoScene = {
    id: createVjDemoUuid(),
    name,
    packId,
    look,
    createdBy: vjDemoWriter(),
    createdAt,
    updatedAt: createdAt,
  };
  library.scenes.push(scene);
  commitVjDemoLibrary(library, { kind: "scene_created", sceneId: scene.id });
  return toVjDemoSceneDto(library, scene);
}

/** Updates a scene's name, pack or look; an absent field stays and a present
 *  look replaces the stored one whole. An empty body, or one equal to the
 *  stored row, answers the current DTO and posts nothing. */
export function demoUpdateVjScene(
  sceneId: string,
  body: { name?: unknown; packId?: unknown; look?: unknown },
): VjSceneDTO {
  const lowercasedSceneId = lowercaseSceneIdOrRefuse(sceneId);
  const fields = readUpdateFields(body);
  const library = loadVjDemoLibrary();
  const scene = findVjDemoScene(library, lowercasedSceneId);
  const isEmptyBody =
    fields.name === undefined &&
    fields.packId === undefined &&
    fields.look === undefined;
  if (isEmptyBody) return toVjDemoSceneDto(library, scene);
  refuseUnknownPack(library, fields.packId ?? null);
  refuseMissingLookClips(library, fields.look);
  if (isSameScene(scene, fields)) return toVjDemoSceneDto(library, scene);
  if (fields.name !== undefined) scene.name = fields.name;
  if (fields.packId !== undefined) scene.packId = fields.packId;
  if (fields.look !== undefined) scene.look = fields.look;
  scene.updatedAt = isoAt(vjDemoNow());
  commitVjDemoLibrary(library, { kind: "scene_updated", sceneId: scene.id });
  return toVjDemoSceneDto(library, scene);
}

/** Rewrites the scene order to `sceneIds`, which must name every scene
 *  exactly once. A moved scene's `updatedAt` bumps, as the backend's
 *  position update does; an unchanged order saves and posts nothing. */
export function demoReorderVjScenes(body: {
  sceneIds: unknown;
}): VjSceneListDTO {
  const library = loadVjDemoLibrary();
  const orderedIds = readFullSceneOrder(
    body.sceneIds,
    library.scenes.map((scene) => scene.id),
  );
  const hasChange = orderedIds.some(
    (sceneId, position) => library.scenes[position]?.id !== sceneId,
  );
  if (!hasChange) return toVjDemoSceneListDto(library);
  const updatedAt = isoAt(vjDemoNow());
  library.scenes = orderedIds.flatMap((sceneId, position) =>
    library.scenes
      .filter((scene) => scene.id === sceneId)
      .map((scene) =>
        library.scenes[position] === scene ? scene : { ...scene, updatedAt },
      ),
  );
  commitVjDemoLibrary(library, { kind: "scenes_reordered" });
  return toVjDemoSceneListDto(library);
}

/** Deletes a scene and every set list item naming it; positions close up.
 *  The change lists each set list that held it, in id order. */
export function demoDeleteVjScene(sceneId: string): VjSceneDeletedDTO {
  const lowercasedSceneId = lowercaseSceneIdOrRefuse(sceneId);
  const library = loadVjDemoLibrary();
  const scene = findVjDemoScene(library, lowercasedSceneId);
  const holdingSetlists = library.setlists.filter((setlist) =>
    setlist.items.some((item) => item.sceneId === scene.id),
  );
  let removedFromSetlistCount = 0;
  for (const setlist of holdingSetlists) {
    const keptItems = setlist.items.filter((item) => item.sceneId !== scene.id);
    removedFromSetlistCount += setlist.items.length - keptItems.length;
    setlist.items = keptItems;
  }
  library.scenes = library.scenes.filter((candidate) => candidate !== scene);
  const setlistIds = holdingSetlists
    .map((setlist) => setlist.id)
    .sort(compareIds);
  commitVjDemoLibrary(library, {
    kind: "scene_deleted",
    sceneId: scene.id,
    setlistIds,
  });
  return { deletedSceneId: scene.id, removedFromSetlistCount };
}
