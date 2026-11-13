/**
 * The demo VJ library's clip writes and clip media (contract 6.2, 6.3, 6.4,
 * 9.5), re-exported from `vjDemoStore.ts`. Each answers like the backend's
 * `VjLibraryService`: the same check order and codes, the library change
 * kind of contract 7.10, and a body equal to the stored clip leaves the
 * library untouched and silent.
 */
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjClipDeletedDTO,
  type VjClipMediaListDTO,
  type VjLibraryChangeKind,
} from "../../../shared/contracts/vj";
import {
  checkVjClipLoopPoints,
  readVjClipDefaultsPatch,
  type VjClipDefaultsPatch,
} from "./vjDemoClipRules";
import * as rules from "./vjDemoRules";
import {
  normalizeStoredVjSceneLook,
  rewriteVjSceneLookForDeletedClip,
} from "./vjDemoSceneLook";
import {
  forgetVjDemoPreviewUrl,
  setVjDemoPreviewUrl,
  toVjDemoClipDto as toClipDto,
  vjDemoPreviewUrlOf as previewUrlOf,
} from "./vjDemoStoreDto";
import {
  commitVjDemoLibrary as commit,
  findVjDemoClip as findClip,
  isoAt,
  loadVjDemoLibrary as loadLibrary,
  packIdsOfVjDemoClip as packIdsOfClip,
  vjDemoNow as readNow,
  type StoredVjDemoClip as StoredClip,
  type StoredVjDemoLibrary as StoredLibrary,
} from "./vjDemoStorePersistence";

/** A clip update after contract 6.3 steps 2 to 7. */
interface VjClipUpdate extends VjClipDefaultsPatch {
  title?: string;
  fitMode?: StoredClip["fitMode"];
}

type VjClipUpdateField = keyof VjClipUpdate;

/** The update fields in the contract's field order. */
const CLIP_UPDATE_FIELDS: readonly VjClipUpdateField[] = [
  "title",
  "fitMode",
  "isFavorite",
  "defaultSpeed",
  "loopInMs",
  "loopOutMs",
  "loopMode",
];

/** The playback defaults whose change posts `clip_defaults_changed`. */
const CLIP_DEFAULT_FIELDS: readonly VjClipUpdateField[] = [
  "defaultSpeed",
  "loopInMs",
  "loopOutMs",
  "loopMode",
];

type VjClipUpdateBody = {
  title?: unknown;
  fitMode?: unknown;
  isFavorite?: unknown;
  defaultSpeed?: unknown;
  loopInMs?: unknown;
  loopOutMs?: unknown;
  loopMode?: unknown;
};

/** Contract 6.3 steps 2 to 7 in order: title, fit mode, then the defaults. */
function readClipUpdate(body: VjClipUpdateBody): VjClipUpdate {
  const update: VjClipUpdate = {};
  if (body.title !== undefined) {
    update.title = rules.normalizeVjClipTitle(body.title);
  }
  if (body.fitMode !== undefined) {
    update.fitMode = rules.normalizeVjFitMode(body.fitMode);
  }
  return { ...update, ...readVjClipDefaultsPatch(body) };
}

/** The fields whose value differs from the stored clip, in field order. */
function changedClipFields(
  clip: StoredClip,
  update: VjClipUpdate,
): VjClipUpdateField[] {
  return CLIP_UPDATE_FIELDS.filter(
    (field) => update[field] !== undefined && update[field] !== clip[field],
  );
}

/** Contract 7.10: a title or fit mode change is `clip_updated`, else a loop
 *  or speed change is `clip_defaults_changed`, else the favorite changed. */
function clipUpdateKindOf(
  fields: readonly VjClipUpdateField[],
): VjLibraryChangeKind {
  if (fields.includes("title") || fields.includes("fitMode")) {
    return "clip_updated";
  }
  if (fields.some((field) => CLIP_DEFAULT_FIELDS.includes(field))) {
    return "clip_defaults_changed";
  }
  return "clip_favorite_changed";
}

/** Copies the changed fields onto the stored clip. */
function applyClipUpdate(
  clip: StoredClip,
  update: VjClipUpdate,
  fields: readonly VjClipUpdateField[],
): void {
  const target = clip as unknown as Record<VjClipUpdateField, unknown>;
  for (const field of fields) {
    target[field] = update[field];
  }
}

/**
 * Changes a clip's title, fit mode, favorite flag or playback defaults
 * (contract 6.3). Steps 1 to 7 run before the read; the merged loop points
 * are then checked against the clip. An empty body answers the current clip,
 * and a body equal to the stored values writes nothing and posts nothing.
 */
export function demoUpdateVjClip(
  clipId: string,
  body: VjClipUpdateBody,
): VjClipDTO {
  if (!rules.isVjUuid(clipId)) throw rules.vjRefusal("VJ_CLIP_NOT_FOUND");
  const update = readClipUpdate(body);
  const library = loadLibrary();
  const clip = findClip(library, clipId.toLowerCase());
  const hasFields = CLIP_UPDATE_FIELDS.some(
    (field) => update[field] !== undefined,
  );
  if (!hasFields) return toClipDto(library, clip);
  checkVjClipLoopPoints(
    clip,
    update.loopInMs === undefined ? clip.loopInMs : update.loopInMs,
    update.loopOutMs === undefined ? clip.loopOutMs : update.loopOutMs,
  );
  const changedFields = changedClipFields(clip, update);
  if (changedFields.length === 0) return toClipDto(library, clip);
  applyClipUpdate(clip, update, changedFields);
  clip.updatedAt = isoAt(readNow());
  commit(library, {
    kind: clipUpdateKindOf(changedFields),
    clipId: clip.id,
    packIds: packIdsOfClip(library, clip.id),
  });
  return toClipDto(library, clip);
}

/**
 * Stores a clip's preview (contract 6.4, 9.5): the demo keeps the blob URL
 * in the page-life preview map and never persists it. The URL the clip
 * already shows is a no-op that posts nothing.
 */
export function demoSetVjClipPreview(
  clipId: string,
  preview: { previewUrl: string },
): VjClipDTO {
  if (!rules.isVjUuid(clipId)) throw rules.vjRefusal("VJ_CLIP_NOT_FOUND");
  const library = loadLibrary();
  const clip = findClip(library, clipId.toLowerCase());
  if (previewUrlOf(clip.id) === preview.previewUrl) {
    return toClipDto(library, clip);
  }
  setVjDemoPreviewUrl(clip.id, preview.previewUrl);
  commit(library, {
    kind: "clip_preview_changed",
    clipId: clip.id,
    packIds: packIdsOfClip(library, clip.id),
  });
  return toClipDto(library, clip);
}

/** Rewrites every scene look naming the deleted clip (contract 6.2): such a
 *  source becomes null, such a mix loses its clip at amount 0. */
function rewriteScenesNamingClip(library: StoredLibrary, clipId: string): void {
  const updatedAt = isoAt(readNow());
  for (const scene of library.scenes) {
    const look = rewriteVjSceneLookForDeletedClip(
      normalizeStoredVjSceneLook(scene.look),
      clipId,
    );
    if (look !== null) {
      scene.look = look;
      scene.updatedAt = updatedAt;
    }
  }
}

/** Drops every clip step playing the deleted clip (sequences contract 4.5);
 *  the steps after it close up. Answers the set lists that held it, in id
 *  order, and how many steps went. Set list `updatedAt` stays, as the
 *  backend's cascade and densify leave it. */
function dropClipSteps(
  library: StoredLibrary,
  clipId: string,
): { setlistIds: string[]; removedFromSetlistCount: number } {
  const holdingSetlists = library.setlists.filter((setlist) =>
    setlist.items.some((item) => item.clipId === clipId),
  );
  let removedFromSetlistCount = 0;
  for (const setlist of holdingSetlists) {
    const keptItems = setlist.items.filter((item) => item.clipId !== clipId);
    removedFromSetlistCount += setlist.items.length - keptItems.length;
    setlist.items = keptItems;
  }
  const setlistIds = holdingSetlists
    .map((setlist) => setlist.id)
    .sort((left, right) => (left === right ? 0 : left < right ? -1 : 1));
  return { setlistIds, removedFromSetlistCount };
}

/** Deletes a clip from the library, every pack and every set list, rewrites
 *  the scene looks naming it, forgets its preview and posts one
 *  `clip_deleted` naming every pack and set list that held it. */
export function demoDeleteVjClip(clipId: string): VjClipDeletedDTO {
  const library = loadLibrary();
  const clip = findClip(library, clipId.toLowerCase());
  const packIds = packIdsOfClip(library, clip.id);
  rewriteScenesNamingClip(library, clip.id);
  const { setlistIds, removedFromSetlistCount } = dropClipSteps(
    library,
    clip.id,
  );
  for (const pack of library.packs) {
    pack.clipIds = pack.clipIds.filter((candidate) => candidate !== clip.id);
  }
  library.clips = library.clips.filter((candidate) => candidate !== clip);
  forgetVjDemoPreviewUrl(clip.id);
  commit(library, {
    kind: "clip_deleted",
    clipId: clip.id,
    packIds,
    setlistIds,
  });
  return {
    deletedClipId: clip.id,
    removedFromPackCount: packIds.length,
    removedFromSetlistCount,
  };
}

/** The `clipIds` query lowercased, a repeat kept once at its first place. */
function uniqueLowercaseClipIds(clipIds: readonly string[]): string[] {
  return [...new Set(clipIds.map((clipId) => clipId.toLowerCase()))];
}

/**
 * Media URLs for listed clips from any pack (contract 6.2 "Clips media"), in
 * the query's order. An unknown id is left out, which a screen reads as
 * `not_found`. Answers VJ_CLIP_IDS_INVALID for an empty, over-long or
 * malformed list.
 */
export function demoGetVjClipsMedia(clipIds: string[]): VjClipMediaListDTO {
  rules.checkVjClipIdsQuery(clipIds);
  const library = loadLibrary();
  const clipById = new Map(library.clips.map((clip) => [clip.id, clip]));
  const expiresAt = isoAt(readNow() + VJ_LIMITS.mediaUrlTtlSeconds * 1000);
  const items = uniqueLowercaseClipIds(clipIds).flatMap((clipId) => {
    const clip = clipById.get(clipId);
    if (clip === undefined) return [];
    return [
      {
        clipId: clip.id,
        url: clip.mediaUrl,
        expiresAt,
        mimeType: clip.mimeType,
        byteSize: clip.byteSize,
      },
    ];
  });
  return { items };
}
