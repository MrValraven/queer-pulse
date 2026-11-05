/**
 * The demo VJ library (contract 8.6, plan gap 2): contract 5 routes answered
 * from the library in `vjDemoStorePersistence.ts`, read fresh per call; each
 * write saves it and posts `library:changed` on the demo channel.
 */
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjClipDeletedDTO,
  type VjClipListDTO,
  type VjClipMimeType,
  type VjFitMode,
  type VjPackClipsDTO,
  type VjPackDTO,
  type VjPackDeletedDTO,
  type VjPackListDTO,
  type VjPackMediaDTO,
} from "../../../shared/contracts/vj";
import { createVjDemoUuid } from "./vjDemoChannel";
import * as rules from "./vjDemoRules";
import {
  buildVjDemoSeedLibrary as buildSeedLibrary,
  clipsOfVjDemoPack as clipsOfPack,
  commitVjDemoLibrary as commit,
  findVjDemoClip as findClip,
  findVjDemoPack as findPack,
  isoAt,
  loadVjDemoLibrary as loadLibrary,
  packIdsOfVjDemoClip as packIdsOfClip,
  refuseTakenVjDemoPackName as refuseTakenName,
  toVjDemoClipDto as toClipDto,
  toVjDemoPackClipsDto as toPackClipsDto,
  toVjDemoPackDto as toPackDto,
  toVjDemoPackListDto as packListOf,
  vjDemoPackClipsChange as packClipsChanged,
  vjDemoNow as readNow,
  vjDemoWriter as writerCreator,
  type StoredVjDemoClip as StoredClip,
  type StoredVjDemoPack as StoredPack,
} from "./vjDemoStorePersistence";

export { configureVjDemoStore } from "./vjDemoStorePersistence";

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

export interface VjDemoLibraryLookup {
  hasPack(packId: string): boolean;
  hasClip(clipId: string): boolean;
  isClipInPack(packId: string, clipId: string): boolean;
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

export function demoDeleteVjPack(packId: string): VjPackDeletedDTO {
  const library = loadLibrary();
  const pack = findPack(library, packId);
  library.packs = library.packs.filter((candidate) => candidate !== pack);
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

export function demoUpdateVjClip(
  clipId: string,
  body: { title?: unknown; fitMode?: unknown },
): VjClipDTO {
  const library = loadLibrary();
  if (!rules.isVjUuid(clipId)) throw rules.vjRefusal("VJ_CLIP_NOT_FOUND");
  const title =
    body.title === undefined
      ? undefined
      : rules.normalizeVjClipTitle(body.title);
  const fitMode =
    body.fitMode === undefined
      ? undefined
      : rules.normalizeVjFitMode(body.fitMode);
  const clip = findClip(library, clipId);
  const isChanged =
    (title !== undefined && title !== clip.title) ||
    (fitMode !== undefined && fitMode !== clip.fitMode);
  if (!isChanged) return toClipDto(library, clip);
  clip.title = title ?? clip.title;
  clip.fitMode = fitMode ?? clip.fitMode;
  clip.updatedAt = isoAt(readNow());
  commit(library, {
    kind: "clip_updated",
    clipId: clip.id,
    packIds: packIdsOfClip(library, clip.id),
  });
  return toClipDto(library, clip);
}

export function demoDeleteVjClip(clipId: string): VjClipDeletedDTO {
  const library = loadLibrary();
  const clip = findClip(library, clipId);
  const packIds = packIdsOfClip(library, clip.id);
  for (const pack of library.packs) {
    pack.clipIds = pack.clipIds.filter((candidate) => candidate !== clip.id);
  }
  library.clips = library.clips.filter((candidate) => candidate !== clip);
  commit(library, { kind: "clip_deleted", clipId: clip.id, packIds });
  return { deletedClipId: clip.id, removedFromPackCount: packIds.length };
}

/** Reads the library fresh on every question, for the demo stage rules. */
export const vjDemoLibraryLookup: VjDemoLibraryLookup = {
  hasPack: (packId) => loadLibrary().packs.some((pack) => pack.id === packId),
  hasClip: (clipId) => loadLibrary().clips.some((clip) => clip.id === clipId),
  isClipInPack: (packId, clipId) =>
    loadLibrary().packs.some(
      (pack) => pack.id === packId && pack.clipIds.includes(clipId),
    ),
};

/** Puts the seed back, saves it, and tells every tab the packs changed. */
export function resetVjDemoLibrary(): void {
  const seed = buildSeedLibrary();
  commit(seed, {
    kind: "packs_reordered",
    packIds: seed.packs.map((pack) => pack.id),
  });
}
