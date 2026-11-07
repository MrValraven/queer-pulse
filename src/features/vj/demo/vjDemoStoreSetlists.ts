/**
 * The demo VJ library, set lists (contract 6.2, 9.5), re-exported from
 * `vjDemoStore.ts`. Mirrors the backend `vj-setlist.service.ts`: the same
 * check order and refusal codes, a malformed id answering its not-found code
 * before any read, names unique compared with toLocaleLowerCase() after trim,
 * dense positions (array indexes), a scene allowed twice in one set list, and
 * one `library:changed` per committed write (C 7.10). A rename to the stored
 * name, an unchanged reorder and PUT items naming the stored scenes in the
 * same order save nothing and post nothing.
 */
import {
  VJ_LIMITS,
  type VjSetlistDTO,
  type VjSetlistDeletedDTO,
  type VjSetlistListDTO,
} from "../../../shared/contracts/vj";
import { createVjDemoUuid } from "./vjDemoChannel";
import {
  isVjFullPermutation,
  isVjUuid,
  normalizeVjSetlistName,
  normalizeVjSetlistSceneIds,
  vjRefusal,
} from "./vjDemoRules";
import { toVjDemoSetlistDto, toVjDemoSetlistListDto } from "./vjDemoStoreDto";
import {
  commitVjDemoLibrary,
  findVjDemoSetlist,
  isoAt,
  loadVjDemoLibrary,
  refuseTakenVjDemoSetlistName,
  vjDemoNow,
  vjDemoWriter,
  type StoredVjDemoLibrary,
  type StoredVjDemoSetlist,
  type StoredVjDemoSetlistItem,
} from "./vjDemoStorePersistence";

/** A route set list id, lowercased. A malformed id answers VJ_SETLIST_NOT_FOUND. */
function lowercaseSetlistIdOrRefuse(setlistId: unknown): string {
  if (!isVjUuid(setlistId)) throw vjRefusal("VJ_SETLIST_NOT_FOUND");
  return setlistId.toLowerCase();
}

/** The first id of `sceneIds`, in list order, that no scene holds answers
 *  VJ_SCENE_NOT_FOUND with that `sceneId`. */
function refuseMissingScenes(
  library: StoredVjDemoLibrary,
  sceneIds: readonly string[],
): void {
  const knownSceneIds = new Set(library.scenes.map((scene) => scene.id));
  const missingSceneId = sceneIds.find(
    (sceneId) => !knownSceneIds.has(sceneId),
  );
  if (missingSceneId !== undefined) {
    throw vjRefusal("VJ_SCENE_NOT_FOUND", { sceneId: missingSceneId });
  }
}

/** One fresh item per entry, repeats kept, in list order. */
function itemsOf(sceneIds: readonly string[]): StoredVjDemoSetlistItem[] {
  return sceneIds.map((sceneId) => ({ id: createVjDemoUuid(), sceneId }));
}

/** A reorder list lowercased, which must name every set list exactly once.
 *  Answers VJ_SETLIST_REORDER_MISMATCH. */
function readFullSetlistOrder(
  value: unknown,
  expectedIds: readonly string[],
): string[] {
  const lowered: unknown = Array.isArray(value)
    ? (value as unknown[]).map((entry) =>
        typeof entry === "string" ? entry.toLowerCase() : entry,
      )
    : value;
  if (!isVjFullPermutation(lowered, expectedIds)) {
    throw vjRefusal("VJ_SETLIST_REORDER_MISMATCH");
  }
  return lowered;
}

export function demoGetVjSetlists(): VjSetlistListDTO {
  return toVjDemoSetlistListDto(loadVjDemoLibrary());
}

/** Appends a set list with its items. Name and items are checked before the
 *  library read; the 50 cap, the name clash and the scene ids after it. */
export function demoCreateVjSetlist(body: {
  name: unknown;
  sceneIds?: unknown;
}): VjSetlistDTO {
  const name = normalizeVjSetlistName(body.name);
  const sceneIds = normalizeVjSetlistSceneIds(
    body.sceneIds === undefined ? [] : body.sceneIds,
    null,
  );
  const library = loadVjDemoLibrary();
  if (library.setlists.length >= VJ_LIMITS.setlistsMax) {
    throw vjRefusal("VJ_SETLIST_LIMIT_REACHED");
  }
  refuseTakenVjDemoSetlistName(library, name, null);
  refuseMissingScenes(library, sceneIds);
  const createdAt = isoAt(vjDemoNow());
  const setlist: StoredVjDemoSetlist = {
    id: createVjDemoUuid(),
    name,
    items: itemsOf(sceneIds),
    createdBy: vjDemoWriter(),
    createdAt,
    updatedAt: createdAt,
  };
  library.setlists.push(setlist);
  commitVjDemoLibrary(library, {
    kind: "setlist_created",
    setlistId: setlist.id,
  });
  return toVjDemoSetlistDto(library, setlist);
}

/** Renames a set list. The stored name (same case) answers the current DTO
 *  and posts nothing; a case-only change is a rename. */
export function demoRenameVjSetlist(
  setlistId: string,
  body: { name: unknown },
): VjSetlistDTO {
  const lowercasedSetlistId = lowercaseSetlistIdOrRefuse(setlistId);
  const name = normalizeVjSetlistName(body.name);
  const library = loadVjDemoLibrary();
  const setlist = findVjDemoSetlist(library, lowercasedSetlistId);
  if (setlist.name === name) return toVjDemoSetlistDto(library, setlist);
  refuseTakenVjDemoSetlistName(library, name, setlist.id);
  setlist.name = name;
  setlist.updatedAt = isoAt(vjDemoNow());
  commitVjDemoLibrary(library, {
    kind: "setlist_renamed",
    setlistId: setlist.id,
  });
  return toVjDemoSetlistDto(library, setlist);
}

/** Rewrites the set list order to `setlistIds`, which must name every set
 *  list exactly once. A moved set list's `updatedAt` bumps, as the backend's
 *  position update does; an unchanged order saves and posts nothing. */
export function demoReorderVjSetlists(body: {
  setlistIds: unknown;
}): VjSetlistListDTO {
  const library = loadVjDemoLibrary();
  const orderedIds = readFullSetlistOrder(
    body.setlistIds,
    library.setlists.map((setlist) => setlist.id),
  );
  const hasChange = orderedIds.some(
    (setlistId, position) => library.setlists[position]?.id !== setlistId,
  );
  if (!hasChange) return toVjDemoSetlistListDto(library);
  const updatedAt = isoAt(vjDemoNow());
  library.setlists = orderedIds.flatMap((setlistId, position) =>
    library.setlists
      .filter((setlist) => setlist.id === setlistId)
      .map((setlist) =>
        library.setlists[position] === setlist
          ? setlist
          : { ...setlist, updatedAt },
      ),
  );
  commitVjDemoLibrary(library, { kind: "setlists_reordered" });
  return toVjDemoSetlistListDto(library);
}

/** Replaces every item of a set list with `sceneIds` at `0..n-1`, each entry
 *  a fresh item id, repeats kept, and bumps `updatedAt`. The stored scene
 *  ids in the same order save nothing and post nothing. */
export function demoSetVjSetlistItems(
  setlistId: string,
  body: { sceneIds: unknown },
): VjSetlistDTO {
  const lowercasedSetlistId = lowercaseSetlistIdOrRefuse(setlistId);
  const sceneIds = normalizeVjSetlistSceneIds(
    body.sceneIds,
    lowercasedSetlistId,
  );
  const library = loadVjDemoLibrary();
  const setlist = findVjDemoSetlist(library, lowercasedSetlistId);
  refuseMissingScenes(library, sceneIds);
  const isStoredOrder =
    setlist.items.length === sceneIds.length &&
    setlist.items.every(
      (item, position) => item.sceneId === sceneIds[position],
    );
  if (isStoredOrder) return toVjDemoSetlistDto(library, setlist);
  setlist.items = itemsOf(sceneIds);
  setlist.updatedAt = isoAt(vjDemoNow());
  commitVjDemoLibrary(library, {
    kind: "setlist_items_changed",
    setlistId: setlist.id,
    setlistIds: [setlist.id],
  });
  return toVjDemoSetlistDto(library, setlist);
}

/** Deletes a set list and its items; positions close up and the scenes it
 *  named stay. */
export function demoDeleteVjSetlist(setlistId: string): VjSetlistDeletedDTO {
  const lowercasedSetlistId = lowercaseSetlistIdOrRefuse(setlistId);
  const library = loadVjDemoLibrary();
  const setlist = findVjDemoSetlist(library, lowercasedSetlistId);
  library.setlists = library.setlists.filter(
    (candidate) => candidate !== setlist,
  );
  commitVjDemoLibrary(library, {
    kind: "setlist_deleted",
    setlistId: setlist.id,
    setlistIds: [setlist.id],
  });
  return { deletedSetlistId: setlist.id };
}
