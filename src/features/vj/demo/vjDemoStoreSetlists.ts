/**
 * The demo VJ library, set lists (contract 6.2, 9.5, sequences contract 4),
 * re-exported from `vjDemoStore.ts`. Mirrors the backend
 * `vj-setlist.service.ts`: the same check order and refusal codes, a
 * malformed id answering its not-found code before any read, names unique
 * compared with toLocaleLowerCase() after trim, dense positions (array
 * indexes), a scene or clip allowed twice in one set list, and one
 * `library:changed` per committed write (C 7.10). A PATCH equal to the stored
 * fields, an unchanged reorder and PUT items equal to the stored steps save
 * nothing and post nothing.
 */
import {
  DEFAULT_VJ_STEP_DURATION,
  VJ_LIMITS,
  type VjSetlistDTO,
  type VjSetlistDeletedDTO,
  type VjSetlistListDTO,
  type VjStepDuration,
} from "../../../shared/contracts/vj";
import { createVjDemoUuid } from "./vjDemoChannel";
import {
  isVjFullPermutation,
  isVjUuid,
  normalizeVjSetlistItems,
  normalizeVjSetlistLooping,
  normalizeVjSetlistName,
  normalizeVjSetlistSceneIds,
  normalizeVjStepDuration,
  vjRefusal,
  type VjSetlistItemEntry,
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

/** The scene ids of the scene steps, in list order, repeats kept. */
function entrySceneIds(entries: readonly VjSetlistItemEntry[]): string[] {
  return entries.flatMap((entry) =>
    entry.sceneId === null ? [] : [entry.sceneId],
  );
}

/** The clip ids of the clip steps, in list order, repeats kept. */
function entryClipIds(entries: readonly VjSetlistItemEntry[]): string[] {
  return entries.flatMap((entry) =>
    entry.clipId === null ? [] : [entry.clipId],
  );
}

/** The first scene step, in list order, whose scene is gone answers
 *  VJ_SCENE_NOT_FOUND with that `sceneId`; then the first clip step whose
 *  clip is gone answers VJ_CLIP_NOT_FOUND with that `clipId`. */
function refuseMissingTargets(
  library: StoredVjDemoLibrary,
  entries: readonly VjSetlistItemEntry[],
): void {
  const knownSceneIds = new Set(library.scenes.map((scene) => scene.id));
  const missingSceneId = entrySceneIds(entries).find(
    (sceneId) => !knownSceneIds.has(sceneId),
  );
  if (missingSceneId !== undefined) {
    throw vjRefusal("VJ_SCENE_NOT_FOUND", { sceneId: missingSceneId });
  }
  const knownClipIds = new Set(library.clips.map((clip) => clip.id));
  const missingClipId = entryClipIds(entries).find(
    (clipId) => !knownClipIds.has(clipId),
  );
  if (missingClipId !== undefined) {
    throw vjRefusal("VJ_CLIP_NOT_FOUND", { clipId: missingClipId });
  }
}

/** A create's `sceneIds` as scene steps on the sequence default length. */
function sceneStepEntries(sceneIds: readonly string[]): VjSetlistItemEntry[] {
  return sceneIds.map((sceneId) => ({
    id: null,
    kind: "scene",
    sceneId,
    clipId: null,
    duration: null,
  }));
}

/** One stored item per entry, in list order: a kept id stays, an id-less
 *  entry gets a fresh one. */
function itemsOf(
  entries: readonly VjSetlistItemEntry[],
): StoredVjDemoSetlistItem[] {
  return entries.map((entry) => ({
    id: entry.id ?? createVjDemoUuid(),
    kind: entry.kind,
    sceneId: entry.sceneId,
    clipId: entry.clipId,
    duration: entry.duration === null ? null : { ...entry.duration },
  }));
}

function isSameStepDuration(
  stored: VjStepDuration | null,
  given: VjStepDuration | null,
): boolean {
  if (stored === null || given === null) return stored === given;
  return stored.kind === given.kind && stored.value === given.value;
}

/** The backend's no-op test: the same ids in the same order, no id-less
 *  entry, and every kind, target and length equal. */
function isStoredStepList(
  storedItems: readonly StoredVjDemoSetlistItem[],
  entries: readonly VjSetlistItemEntry[],
): boolean {
  return (
    storedItems.length === entries.length &&
    entries.every((entry, index) => {
      const stored = storedItems[index];
      return (
        stored !== undefined &&
        entry.id === stored.id &&
        entry.kind === stored.kind &&
        entry.sceneId === stored.sceneId &&
        entry.clipId === stored.clipId &&
        isSameStepDuration(stored.duration, entry.duration)
      );
    })
  );
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

type VjDemoCreateSetlistBody = {
  name: unknown;
  sceneIds?: unknown;
  items?: unknown;
  isLooping?: unknown;
  stepDuration?: unknown;
};

/** The create's steps: `sceneIds` and `items` both sent answers
 *  VJ_SETLIST_ITEMS_INVALID; then the list rules of the one that was sent. */
function createEntriesOf(body: VjDemoCreateSetlistBody): VjSetlistItemEntry[] {
  if (body.sceneIds !== undefined && body.items !== undefined) {
    throw vjRefusal("VJ_SETLIST_ITEMS_INVALID");
  }
  if (body.items !== undefined)
    return normalizeVjSetlistItems(body.items, null);
  return sceneStepEntries(
    normalizeVjSetlistSceneIds(
      body.sceneIds === undefined ? [] : body.sceneIds,
      null,
    ),
  );
}

/** Appends a set list with its steps at `0..n-1`. The field rules run before
 *  the library read in the backend order: name, both lists sent, `sceneIds`
 *  or `items`, `isLooping`, `stepDuration`, then any step `id` (a new set
 *  list holds no item to keep: VJ_SETLIST_ITEM_NOT_FOUND). The 50 cap, the
 *  name clash and the scene then clip ids come after the read. Absent
 *  `isLooping` and `stepDuration` take false and DEFAULT_VJ_STEP_DURATION. */
export function demoCreateVjSetlist(
  body: VjDemoCreateSetlistBody,
): VjSetlistDTO {
  const name = normalizeVjSetlistName(body.name);
  const entries = createEntriesOf(body);
  const isLooping =
    body.isLooping === undefined
      ? false
      : normalizeVjSetlistLooping(body.isLooping);
  const stepDuration =
    body.stepDuration === undefined
      ? { ...DEFAULT_VJ_STEP_DURATION }
      : normalizeVjStepDuration(body.stepDuration);
  if (entries.some((entry) => entry.id !== null)) {
    throw vjRefusal("VJ_SETLIST_ITEM_NOT_FOUND");
  }
  const library = loadVjDemoLibrary();
  if (library.setlists.length >= VJ_LIMITS.setlistsMax) {
    throw vjRefusal("VJ_SETLIST_LIMIT_REACHED");
  }
  refuseTakenVjDemoSetlistName(library, name, null);
  refuseMissingTargets(library, entries);
  const createdAt = isoAt(vjDemoNow());
  const setlist: StoredVjDemoSetlist = {
    id: createVjDemoUuid(),
    name,
    isLooping,
    stepDuration,
    items: itemsOf(entries),
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

type VjDemoUpdateSetlistBody = {
  name?: unknown;
  isLooping?: unknown;
  stepDuration?: unknown;
};

interface VjDemoSetlistUpdateFields {
  name?: string;
  isLooping?: boolean;
  stepDuration?: VjStepDuration;
}

/** The PATCH field rules in the backend order: no field defined
 *  (VJ_SETLIST_PATCH_EMPTY), `name`, `isLooping`, `stepDuration`. */
function readUpdateFields(
  body: VjDemoUpdateSetlistBody,
): VjDemoSetlistUpdateFields {
  if (
    body.name === undefined &&
    body.isLooping === undefined &&
    body.stepDuration === undefined
  ) {
    throw vjRefusal("VJ_SETLIST_PATCH_EMPTY");
  }
  const fields: VjDemoSetlistUpdateFields = {};
  if (body.name !== undefined) {
    fields.name = normalizeVjSetlistName(body.name);
  }
  if (body.isLooping !== undefined) {
    fields.isLooping = normalizeVjSetlistLooping(body.isLooping);
  }
  if (body.stepDuration !== undefined) {
    fields.stepDuration = normalizeVjStepDuration(body.stepDuration);
  }
  return fields;
}

/** The fields whose value differs from the stored set list; empty when every
 *  field equals the stored one. A case-only name change is a change. */
function changedSetlistFields(
  setlist: StoredVjDemoSetlist,
  fields: VjDemoSetlistUpdateFields,
): VjDemoSetlistUpdateFields {
  const changed: VjDemoSetlistUpdateFields = {};
  if (fields.name !== undefined && fields.name !== setlist.name) {
    changed.name = fields.name;
  }
  if (
    fields.isLooping !== undefined &&
    fields.isLooping !== setlist.isLooping
  ) {
    changed.isLooping = fields.isLooping;
  }
  if (
    fields.stepDuration !== undefined &&
    !isSameStepDuration(setlist.stepDuration, fields.stepDuration)
  ) {
    changed.stepDuration = fields.stepDuration;
  }
  return changed;
}

/** `PATCH setlists/:id` (backend updateSetlist): name, Loop and default
 *  length. Route id, then the field rules, then the read
 *  (VJ_SETLIST_NOT_FOUND) and VJ_SETLIST_NAME_TAKEN when the name changes.
 *  Every field equal to the stored one answers the current DTO and posts
 *  nothing; a change bumps `updatedAt` and posts `setlist_updated`. */
export function demoUpdateVjSetlist(
  setlistId: string,
  body: VjDemoUpdateSetlistBody,
): VjSetlistDTO {
  const lowercasedSetlistId = lowercaseSetlistIdOrRefuse(setlistId);
  const fields = readUpdateFields(body);
  const library = loadVjDemoLibrary();
  const setlist = findVjDemoSetlist(library, lowercasedSetlistId);
  const changed = changedSetlistFields(setlist, fields);
  if (Object.keys(changed).length === 0) {
    return toVjDemoSetlistDto(library, setlist);
  }
  if (changed.name !== undefined) {
    refuseTakenVjDemoSetlistName(library, changed.name, setlist.id);
    setlist.name = changed.name;
  }
  if (changed.isLooping !== undefined) setlist.isLooping = changed.isLooping;
  if (changed.stepDuration !== undefined) {
    setlist.stepDuration = changed.stepDuration;
  }
  setlist.updatedAt = isoAt(vjDemoNow());
  commitVjDemoLibrary(library, {
    kind: "setlist_updated",
    setlistId: setlist.id,
    setlistIds: [setlist.id],
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

/** Writes the whole step list (`PUT setlists/:id/items`, backend
 *  setSetlistItems). Route id, then any defined `sceneIds` (the old body)
 *  answers VJ_SETLIST_ITEMS_INVALID, then the `items` rules; after the read
 *  the set list (VJ_SETLIST_NOT_FOUND), an entry `id` naming no item of this
 *  set list (VJ_SETLIST_ITEM_NOT_FOUND), the first missing scene, then the
 *  first missing clip. An entry with an `id` keeps that item, one without
 *  gets a fresh id, a stored item the body leaves out is gone, and every
 *  position is the body index. A body equal to the stored steps saves
 *  nothing and posts nothing; a change bumps `updatedAt`. */
export function demoSetVjSetlistItems(
  setlistId: string,
  body: { items?: unknown; sceneIds?: unknown },
): VjSetlistDTO {
  const lowercasedSetlistId = lowercaseSetlistIdOrRefuse(setlistId);
  if (body.sceneIds !== undefined) {
    throw vjRefusal("VJ_SETLIST_ITEMS_INVALID");
  }
  const entries = normalizeVjSetlistItems(body.items, lowercasedSetlistId);
  const library = loadVjDemoLibrary();
  const setlist = findVjDemoSetlist(library, lowercasedSetlistId);
  const storedItemIds = new Set(setlist.items.map((item) => item.id));
  if (
    entries.some((entry) => entry.id !== null && !storedItemIds.has(entry.id))
  ) {
    throw vjRefusal("VJ_SETLIST_ITEM_NOT_FOUND");
  }
  refuseMissingTargets(library, entries);
  if (isStoredStepList(setlist.items, entries)) {
    return toVjDemoSetlistDto(library, setlist);
  }
  setlist.items = itemsOf(entries);
  setlist.updatedAt = isoAt(vjDemoNow());
  commitVjDemoLibrary(library, {
    kind: "setlist_items_changed",
    setlistId: setlist.id,
    setlistIds: [setlist.id],
  });
  return toVjDemoSetlistDto(library, setlist);
}

/** Deletes a set list and its steps; positions close up and the scenes and
 *  clips it named stay. */
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
