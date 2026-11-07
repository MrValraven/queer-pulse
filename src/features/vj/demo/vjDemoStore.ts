/**
 * The demo VJ library (contract 6.2, 9.5): the pack and clip routes answered
 * from the library in `vjDemoStorePersistence.ts`, read fresh per call; each
 * write saves it and posts `library:changed` on the demo channel. Clip
 * writes, events, scenes and set lists live in the colocated
 * `vjDemoStore*.ts` files re-exported below, so the library plan imports
 * every demo route from this one module. Also the library lookup the demo
 * stage reads (contract 7.7).
 */
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjClipListDTO,
  type VjClipMimeType,
  type VjFitMode,
  type VjPackClipsDTO,
  type VjPackDTO,
  type VjPackDeletedDTO,
  type VjPackListDTO,
  type VjPackMediaDTO,
  type VjSceneLook,
} from "../../../shared/contracts/vj";
import { createVjDemoUuid } from "./vjDemoChannel";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import * as rules from "./vjDemoRules";
import { normalizeStoredVjSceneLook } from "./vjDemoSceneLook";
import {
  forgetVjDemoPreviewUrl,
  toVjDemoClipDto as toClipDto,
  toVjDemoPackClipsDto as toPackClipsDto,
  toVjDemoPackDto as toPackDto,
  toVjDemoPackListDto as packListOf,
  vjDemoEventFixtureOf,
} from "./vjDemoStoreDto";
import {
  buildVjDemoSeedLibrary as buildSeedLibrary,
  clipsOfVjDemoPack as clipsOfPack,
  commitVjDemoLibrary as commit,
  findVjDemoClip as findClip,
  findVjDemoPack as findPack,
  isoAt,
  loadVjDemoLibrary as loadLibrary,
  refuseTakenVjDemoPackName as refuseTakenName,
  vjDemoPackClipsChange as packClipsChanged,
  vjDemoNow as readNow,
  vjDemoWriter as writerCreator,
  type StoredVjDemoClip as StoredClip,
  type StoredVjDemoLibrary as StoredLibrary,
  type StoredVjDemoPack as StoredPack,
} from "./vjDemoStorePersistence";

export { configureVjDemoStore } from "./vjDemoStorePersistence";
export type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
export * from "./vjDemoStoreClips";
export * from "./vjDemoStoreEvents";
export * from "./vjDemoStoreScenes";
export * from "./vjDemoStoreSetlists";

export interface VjDemoClipUpload {
  title: string;
  mediaUrl: string;
  thumbnailUrl: string;
  mimeType: VjClipMimeType;
  byteSize: number;
  width: number;
  height: number;
  durationMs: number | null;
  fitMode: VjFitMode;
  packId: string | null;
}

export function demoGetVjPacks(): VjPackListDTO {
  return packListOf(loadLibrary());
}

export function demoCreateVjPack(body: { name: unknown }): VjPackDTO {
  const library = loadLibrary();
  const name = rules.normalizeVjPackName(body.name);
  if (library.packs.length >= VJ_LIMITS.packsMax)
    throw rules.vjRefusal("VJ_PACK_LIMIT_REACHED");
  refuseTakenName(library, name, null);
  const createdAt = isoAt(readNow());
  const pack: StoredPack = {
    id: createVjDemoUuid(),
    name,
    clipIds: [],
    eventId: null,
    createdBy: writerCreator(),
    createdAt,
    updatedAt: createdAt,
  };
  library.packs.push(pack);
  commit(library, { kind: "pack_created", packId: pack.id });
  return toPackDto(library, pack);
}

export function demoRenameVjPack(
  packId: string,
  body: { name: unknown },
): VjPackDTO {
  const library = loadLibrary();
  if (!rules.isVjUuid(packId)) throw rules.vjRefusal("VJ_PACK_NOT_FOUND");
  const name = rules.normalizeVjPackName(body.name);
  const pack = findPack(library, packId);
  if (pack.name === name) return toPackDto(library, pack);
  refuseTakenName(library, name, pack.id);
  pack.name = name;
  pack.updatedAt = isoAt(readNow());
  commit(library, { kind: "pack_renamed", packId: pack.id });
  return toPackDto(library, pack);
}

export function demoReorderVjPacks(body: { packIds: unknown }): VjPackListDTO {
  const library = loadLibrary();
  const { packIds } = body;
  const currentIds = library.packs.map((pack) => pack.id);
  if (!rules.isVjFullPermutation(packIds, currentIds)) {
    throw rules.vjRefusal("VJ_PACK_REORDER_MISMATCH");
  }
  library.packs = packIds.map((packId) => findPack(library, packId));
  commit(library, { kind: "packs_reordered" });
  return packListOf(library);
}

/** Deletes a pack and keeps every clip it held; its scenes stay in the
 *  library unfiled (`packId` null, contract 2.2), as the foreign key sets. */
export function demoDeleteVjPack(packId: string): VjPackDeletedDTO {
  const library = loadLibrary();
  const pack = findPack(library, packId);
  library.packs = library.packs.filter((candidate) => candidate !== pack);
  for (const scene of library.scenes) {
    if (scene.packId === pack.id) scene.packId = null;
  }
  commit(library, {
    kind: "pack_deleted",
    packId: pack.id,
    packIds: [pack.id],
  });
  return { deletedPackId: pack.id, clipsKeptCount: pack.clipIds.length };
}

export function demoGetVjPackClips(packId: string): VjPackClipsDTO {
  const library = loadLibrary();
  return toPackClipsDto(library, findPack(library, packId));
}

export function demoGetVjPackMedia(
  packId: string,
  clipIds: string[] | null,
): VjPackMediaDTO {
  const library = loadLibrary();
  const pack = findPack(library, packId);
  rules.checkVjClipIdsQuery(clipIds);
  const wanted = clipIds === null ? null : new Set(clipIds);
  const expiresAt = isoAt(readNow() + VJ_LIMITS.mediaUrlTtlSeconds * 1000);
  const items = clipsOfPack(library, pack)
    .filter((clip) => wanted === null || wanted.has(clip.id))
    .map((clip) => ({
      clipId: clip.id,
      url: clip.mediaUrl,
      expiresAt,
      mimeType: clip.mimeType,
      byteSize: clip.byteSize,
    }));
  return { packId: pack.id, items };
}

export function demoAddVjPackClip(
  packId: string,
  body: { clipId: unknown },
): VjPackClipsDTO {
  const library = loadLibrary();
  const pack = findPack(library, packId);
  const clip = findClip(library, body.clipId);
  if (pack.clipIds.includes(clip.id))
    throw rules.vjRefusal("VJ_CLIP_ALREADY_IN_PACK", { packId: pack.id });
  if (pack.clipIds.length >= VJ_LIMITS.packClipsMax)
    throw rules.vjRefusal("VJ_PACK_FULL", { packId: pack.id });
  pack.clipIds.push(clip.id);
  commit(library, packClipsChanged(pack, clip.id));
  return toPackClipsDto(library, pack);
}

export function demoReorderVjPackClips(
  packId: string,
  body: { clipIds: unknown },
): VjPackClipsDTO {
  const library = loadLibrary();
  const pack = findPack(library, packId);
  const { clipIds } = body;
  if (!rules.isVjFullPermutation(clipIds, pack.clipIds))
    throw rules.vjRefusal("VJ_PACK_CLIPS_REORDER_MISMATCH");
  pack.clipIds = [...clipIds];
  commit(library, packClipsChanged(pack, null));
  return toPackClipsDto(library, pack);
}

export function demoRemoveVjPackClip(
  packId: string,
  clipId: string,
): VjPackClipsDTO {
  const library = loadLibrary();
  const pack = findPack(library, packId);
  const clip = findClip(library, clipId);
  if (!pack.clipIds.includes(clip.id))
    throw rules.vjRefusal("VJ_CLIP_NOT_IN_PACK", { packId: pack.id });
  pack.clipIds = pack.clipIds.filter((candidate) => candidate !== clip.id);
  commit(library, packClipsChanged(pack, clip.id));
  return toPackClipsDto(library, pack);
}

export function demoGetVjClips(): VjClipListDTO {
  const library = loadLibrary();
  const sorted = [...library.clips].sort(
    (first, second) =>
      Date.parse(second.createdAt) - Date.parse(first.createdAt) ||
      (second.id > first.id ? 1 : second.id < first.id ? -1 : 0),
  );
  return { items: sorted.map((clip) => toClipDto(library, clip)) };
}

export function demoCreateVjClip(upload: VjDemoClipUpload): VjClipDTO {
  const library = loadLibrary();
  const checked = rules.checkVjClipUpload(upload);
  if (library.clips.length >= VJ_LIMITS.libraryClipsMax) {
    throw rules.vjRefusal("VJ_LIBRARY_FULL");
  }
  const pack = upload.packId === null ? null : findPack(library, upload.packId);
  if (pack !== null && pack.clipIds.length >= VJ_LIMITS.packClipsMax) {
    throw rules.vjRefusal("VJ_PACK_FULL", { packId: pack.id });
  }
  const createdAt = isoAt(readNow());
  const clip: StoredClip = {
    id: createVjDemoUuid(),
    ...checked,
    byteSize: upload.byteSize,
    width: upload.width,
    height: upload.height,
    thumbnailUrl: upload.thumbnailUrl,
    mediaUrl: upload.mediaUrl,
    createdBy: writerCreator(),
    createdAt,
    updatedAt: createdAt,
    // The contract 2.1 column defaults.
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
  };
  library.clips.push(clip);
  pack?.clipIds.push(clip.id);
  commit(
    library,
    pack === null
      ? { kind: "clip_created", clipId: clip.id }
      : packClipsChanged(pack, clip.id),
  );
  return toClipDto(library, clip);
}

/** The pack with this id, compared lowercased; null for a malformed id or a
 *  miss, as the backend's reads answer the empty answer with no query. */
function readPack(library: StoredLibrary, packId: string): StoredPack | null {
  if (!rules.isVjUuid(packId)) return null;
  const wantedId = packId.toLowerCase();
  return library.packs.find((pack) => pack.id === wantedId) ?? null;
}

/** The listed valid ids, lowercased, each once. */
function lowercaseUniqueUuids(ids: readonly string[]): string[] {
  return [...new Set(ids.filter(rules.isVjUuid).map((id) => id.toLowerCase()))];
}

/** Whether a set list index is one the item read can offset by. */
function isItemIndex(index: number | null): index is number {
  return index !== null && Number.isSafeInteger(index) && index >= 0;
}

/** Set list recall and steps (backend `readSetlistItem`): null when no set
 *  list has the id; a null index answers the count alone; an index answers
 *  the item there with its scene's look, both null past the last item. */
function readSetlistItem(
  setlistId: string,
  index: number | null,
): {
  itemCount: number;
  sceneId: string | null;
  look: VjSceneLook | null;
} | null {
  if (!rules.isVjUuid(setlistId)) return null;
  const library = loadLibrary();
  const wantedId = setlistId.toLowerCase();
  const setlist = library.setlists.find(
    (candidate) => candidate.id === wantedId,
  );
  if (setlist === undefined) return null;
  const itemCount = setlist.items.length;
  const item = isItemIndex(index) ? setlist.items[index] : undefined;
  if (item === undefined) return { itemCount, sceneId: null, look: null };
  const scene = library.scenes.find(
    (candidate) => candidate.id === item.sceneId,
  );
  return {
    itemCount,
    sceneId: item.sceneId.toLowerCase(),
    look: normalizeStoredVjSceneLook(scene?.look),
  };
}

/** Reads the library fresh on every question, for the demo stage rules
 *  (contract 7.7, backend `VjStageReadsService`). Ids compare lowercased and
 *  a malformed id answers the empty answer. */
export const vjDemoLibraryLookup: VjDemoLibraryLookup = {
  hasPack: (packId) => readPack(loadLibrary(), packId) !== null,
  hasClip: (clipId) => vjDemoLibraryLookup.existingClipIds([clipId]).size > 0,
  isClipInPack: (packId, clipId) =>
    vjDemoLibraryLookup.clipIdsInPack(packId, [clipId]).size > 0,
  readPackForStage: (packId) => {
    const pack = readPack(loadLibrary(), packId);
    if (pack === null) return null;
    // A link no fixture has reads as none, as the pack DTO shows it.
    const fixture = vjDemoEventFixtureOf(pack.eventId);
    return { eventId: fixture === null ? null : fixture.id };
  },
  existingClipIds: (clipIds) => {
    const wantedIds = new Set(lowercaseUniqueUuids(clipIds));
    return new Set(
      loadLibrary()
        .clips.map((clip) => clip.id)
        .filter((clipId) => wantedIds.has(clipId)),
    );
  },
  clipIdsInPack: (packId, clipIds) => {
    const pack = readPack(loadLibrary(), packId);
    if (pack === null) return new Set<string>();
    const wantedIds = new Set(lowercaseUniqueUuids(clipIds));
    return new Set(pack.clipIds.filter((clipId) => wantedIds.has(clipId)));
  },
  readPackClipForAdvance: (packId, clipId) => {
    const library = loadLibrary();
    const pack = readPack(library, packId);
    if (pack === null || !rules.isVjUuid(clipId)) return null;
    const wantedId = clipId.toLowerCase();
    if (!pack.clipIds.includes(wantedId)) return null;
    const clip = library.clips.find((candidate) => candidate.id === wantedId);
    return clip === undefined ? null : { isFavorite: clip.isFavorite };
  },
  readSceneLook: (sceneId) => {
    if (!rules.isVjUuid(sceneId)) return null;
    const wantedId = sceneId.toLowerCase();
    const scene = loadLibrary().scenes.find(
      (candidate) => candidate.id === wantedId,
    );
    return scene === undefined ? null : normalizeStoredVjSceneLook(scene.look);
  },
  readSetlistItem,
  setlistItemCount: (setlistId) =>
    readSetlistItem(setlistId, null)?.itemCount ?? null,
};

/** Puts the seed back, saves it, and tells every tab the packs changed. The
 *  page-life previews of the replaced clips are forgotten. */
export function resetVjDemoLibrary(): void {
  for (const clip of loadLibrary().clips) {
    forgetVjDemoPreviewUrl(clip.id);
  }
  const seed = buildSeedLibrary();
  commit(seed, {
    kind: "packs_reordered",
    packIds: seed.packs.map((pack) => pack.id),
  });
}
