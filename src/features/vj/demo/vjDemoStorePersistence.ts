/**
 * Where the demo VJ library lives: one JSON copy in localStorage so every
 * demo tab reads the same packs, clips, scenes and set lists, read fresh on
 * every call. A blocked storage falls back to an in-memory copy, a damaged one
 * reseeds, a v1 library is upgraded once (C 9.5), and every committed write
 * posts `library:changed` on the demo channel. Also the lookups the store
 * routes share; the DTO projection lives in `vjDemoStoreDto.ts`.
 */
import type {
  VjClipDTO,
  VjCreatorDTO,
  VjLibraryChange,
  VjSceneLook,
} from "../../../shared/contracts/vj";
import { currentUser } from "../../members/data/demoCurrentUser";
import {
  VJ_DEMO_LIBRARY_STORAGE_KEY,
  VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
} from "../vj.constants";
import { VJ_DEMO_CREATORS, VJ_DEMO_SEED } from "./vjDemo.data";
import {
  VJ_DEMO_TAB_ID,
  openVjDemoChannel,
  type VjDemoChannel,
} from "./vjDemoChannel";
import {
  isVjDemoLibraryV2,
  seedVjDemoScenesAndSetlists,
  upgradeVjDemoLibraryV1,
} from "./vjDemoLibraryUpgrade";
import { VJ_DEMO_MEDIA } from "./vjDemoMedia.data";
import { isVjUuid, vjRefusal } from "./vjDemoRules";

/** A clip as stored; `previewUrl` lives in the page-life preview map (C 9.5). */
export type StoredVjDemoClip = Omit<
  VjClipDTO,
  "packIds" | "packCount" | "previewUrl"
>;

export interface StoredVjDemoPack {
  id: string;
  name: string;
  /** Pack order; the index is the position, so positions stay dense. */
  clipIds: string[];
  /** The linked demo event fixture; null when the pack links none. */
  eventId: string | null;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVjDemoScene {
  id: string;
  name: string;
  packId: string | null;
  look: VjSceneLook;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVjDemoSetlistItem {
  id: string;
  sceneId: string;
}

export interface StoredVjDemoSetlist {
  id: string;
  name: string;
  /** Item order; the index is the position. */
  items: StoredVjDemoSetlistItem[];
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVjDemoLibrary {
  version: 2;
  /** Position order, as are scenes and set lists. */
  packs: StoredVjDemoPack[];
  clips: StoredVjDemoClip[];
  scenes: StoredVjDemoScene[];
  setlists: StoredVjDemoSetlist[];
}

const DAY_MS = 86_400_000;
const SEED_PACKS_CREATED_DAYS_AGO = 9;

let storageSeam: Storage | null | undefined;
let channelSeam: VjDemoChannel | null | undefined;
let defaultChannel: VjDemoChannel | null = null;
let readNow: () => number = () => Date.now();
let memoryLibraryText: string | null = null;
let isStorageBroken = false;

/** Test seam. An omitted seam goes back to its default. */
export function configureVjDemoStore(seams: {
  storage?: Storage | null;
  channel?: VjDemoChannel | null;
  now?: () => number;
}): void {
  storageSeam = seams.storage;
  channelSeam = seams.channel;
  readNow = seams.now ?? (() => Date.now());
  memoryLibraryText = null;
  isStorageBroken = false;
}

/** The store's clock, epoch ms. */
export function vjDemoNow(): number {
  return readNow();
}

export function isoAt(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

function resolveStorage(): Storage | null {
  if (isStorageBroken) return null;
  if (storageSeam !== undefined) return storageSeam;
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function resolveChannel(): VjDemoChannel | null {
  if (channelSeam !== undefined) return channelSeam;
  defaultChannel ??= openVjDemoChannel();
  return defaultChannel;
}

function buildSeedClips(now: number): StoredVjDemoClip[] {
  return VJ_DEMO_SEED.clips.flatMap((seed): StoredVjDemoClip[] => {
    const media = VJ_DEMO_MEDIA.find((file) => file.slug === seed.slug);
    if (media === undefined) return [];
    const createdAt = isoAt(now - seed.createdDaysAgo * DAY_MS);
    return [
      {
        id: seed.id,
        title: media.title,
        mediaKind: "gif",
        mimeType: "image/gif",
        byteSize: media.byteSize,
        width: media.width,
        height: media.height,
        durationMs: null,
        fitMode: seed.fitMode,
        thumbnailUrl: media.thumbnailPath,
        mediaUrl: media.mediaPath,
        createdBy: VJ_DEMO_CREATORS[seed.creator],
        createdAt,
        updatedAt: createdAt,
        isFavorite: seed.isFavorite,
        defaultSpeed: seed.defaultSpeed,
        loopInMs: null,
        loopOutMs: null,
        loopMode: seed.loopMode,
      },
    ];
  });
}

/** The seed library, timestamped from the store's clock. */
export function buildVjDemoSeedLibrary(): StoredVjDemoLibrary {
  const now = readNow();
  const clips = buildSeedClips(now);
  const packsCreatedAt = isoAt(now - SEED_PACKS_CREATED_DAYS_AGO * DAY_MS);
  const packs = VJ_DEMO_SEED.packs.map((seed): StoredVjDemoPack => ({
    id: seed.id,
    name: seed.name,
    clipIds: [...seed.clipIds],
    eventId: seed.eventId,
    createdBy: VJ_DEMO_CREATORS[seed.creator],
    createdAt: packsCreatedAt,
    updatedAt: packsCreatedAt,
  }));
  return {
    version: 2,
    packs,
    clips,
    ...seedVjDemoScenesAndSetlists({ packs, clips }, now),
  };
}

function parseLibrary(text: string | null): StoredVjDemoLibrary | null {
  if (text === null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return isVjDemoLibraryV2(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveLibrary(library: StoredVjDemoLibrary): void {
  const text = JSON.stringify(library);
  memoryLibraryText = text;
  const storage = resolveStorage();
  if (storage === null) return;
  try {
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, text);
  } catch {
    isStorageBroken = true;
  }
}

/** One storage read; a throwing storage switches the store to memory. */
function readStorageItem(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    isStorageBroken = true;
    return null;
  }
}

/** The v1 library upgraded, saved under the v2 key and its v1 key removed;
 *  null when no readable v1 library is stored. */
function upgradeStoredLibraryV1(storage: Storage): StoredVjDemoLibrary | null {
  const text = readStorageItem(storage, VJ_DEMO_LIBRARY_V1_STORAGE_KEY);
  if (text === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const upgraded = upgradeVjDemoLibraryV1(parsed, readNow());
  if (upgraded === null) return null;
  saveLibrary(upgraded);
  try {
    storage.removeItem(VJ_DEMO_LIBRARY_V1_STORAGE_KEY);
  } catch {
    // The v2 copy is read first on every later load, so a v1 key left behind stays unread.
  }
  return upgraded;
}

/** A fresh copy of the library (C 9.5 order): the v2 key, else an upgraded
 *  v1 library, else the seed, saved when it is not what was read. */
export function loadVjDemoLibrary(): StoredVjDemoLibrary {
  const storage = resolveStorage();
  let text = memoryLibraryText;
  if (storage !== null) {
    const storedText = readStorageItem(storage, VJ_DEMO_LIBRARY_STORAGE_KEY);
    if (!isStorageBroken) text = storedText;
  }
  const library = parseLibrary(text);
  if (library !== null) return library;
  const upgraded =
    storage === null || isStorageBroken
      ? null
      : upgradeStoredLibraryV1(storage);
  if (upgraded !== null) return upgraded;
  const seed = buildVjDemoSeedLibrary();
  saveLibrary(seed);
  return seed;
}

/** Saves the library and tells every demo tab what changed. */
export function commitVjDemoLibrary(
  library: StoredVjDemoLibrary,
  change: Partial<VjLibraryChange> & Pick<VjLibraryChange, "kind">,
): void {
  saveLibrary(library);
  const payload: VjLibraryChange = {
    packId: null,
    clipId: null,
    packIds: [],
    sceneId: null,
    setlistId: null,
    setlistIds: [],
    eventId: null,
    ...change,
  };
  resolveChannel()?.post({
    direction: "toServer",
    name: "library:changed",
    payload,
    tabId: VJ_DEMO_TAB_ID,
  });
}

/** The demo member as the creator of a write. */
export function vjDemoWriter(): VjCreatorDTO {
  return {
    userId: String(currentUser.id),
    displayName: `${currentUser.first} ${currentUser.last}`,
  };
}

/** The pack with this id. Answers VJ_PACK_NOT_FOUND for a non-uuid or a miss. */
export function findVjDemoPack(
  library: StoredVjDemoLibrary,
  packId: unknown,
): StoredVjDemoPack {
  const pack = isVjUuid(packId)
    ? library.packs.find((candidate) => candidate.id === packId)
    : undefined;
  if (pack === undefined) throw vjRefusal("VJ_PACK_NOT_FOUND");
  return pack;
}

/** The clip with this id. Answers VJ_CLIP_NOT_FOUND for a non-uuid or a miss. */
export function findVjDemoClip(
  library: StoredVjDemoLibrary,
  clipId: unknown,
): StoredVjDemoClip {
  const clip = isVjUuid(clipId)
    ? library.clips.find((candidate) => candidate.id === clipId)
    : undefined;
  if (clip === undefined) throw vjRefusal("VJ_CLIP_NOT_FOUND");
  return clip;
}

/** The scene with this id. Answers VJ_SCENE_NOT_FOUND for a non-uuid or a miss. */
export function findVjDemoScene(
  library: StoredVjDemoLibrary,
  sceneId: unknown,
): StoredVjDemoScene {
  const scene = isVjUuid(sceneId)
    ? library.scenes.find((candidate) => candidate.id === sceneId)
    : undefined;
  if (scene === undefined) throw vjRefusal("VJ_SCENE_NOT_FOUND");
  return scene;
}

/** The set list with this id. Answers VJ_SETLIST_NOT_FOUND for a non-uuid or a miss. */
export function findVjDemoSetlist(
  library: StoredVjDemoLibrary,
  setlistId: unknown,
): StoredVjDemoSetlist {
  const setlist = isVjUuid(setlistId)
    ? library.setlists.find((candidate) => candidate.id === setlistId)
    : undefined;
  if (setlist === undefined) throw vjRefusal("VJ_SETLIST_NOT_FOUND");
  return setlist;
}

/** A pack's clips in pack order. */
export function clipsOfVjDemoPack(
  library: StoredVjDemoLibrary,
  pack: StoredVjDemoPack,
): StoredVjDemoClip[] {
  return pack.clipIds.flatMap((clipId) =>
    library.clips.filter((clip) => clip.id === clipId),
  );
}

/** Every pack holding a clip, in pack position order. */
export function packIdsOfVjDemoClip(
  library: StoredVjDemoLibrary,
  clipId: string,
): string[] {
  return library.packs
    .filter((pack) => pack.clipIds.includes(clipId))
    .map((pack) => pack.id);
}

/** The change a membership write posts. */
export function vjDemoPackClipsChange(
  pack: StoredVjDemoPack,
  clipId: string | null,
): VjLibraryChange {
  return {
    kind: "pack_clips_changed",
    packId: pack.id,
    clipId,
    packIds: [pack.id],
    sceneId: null,
    setlistId: null,
    setlistIds: [],
    eventId: null,
  };
}

/** Answers VJ_PACK_NAME_TAKEN, naming the other pack, when another pack has
 *  this name compared with toLocaleLowerCase() after trim. */
export function refuseTakenVjDemoPackName(
  library: StoredVjDemoLibrary,
  name: string,
  ownPackId: string | null,
): void {
  const lowered = name.toLocaleLowerCase();
  const other = library.packs.find(
    (pack) =>
      pack.id !== ownPackId && pack.name.toLocaleLowerCase() === lowered,
  );
  if (other !== undefined) {
    throw vjRefusal("VJ_PACK_NAME_TAKEN", { packId: other.id });
  }
}

/** Answers VJ_SETLIST_NAME_TAKEN, naming the other set list, when another set
 *  list has this name compared with toLocaleLowerCase() after trim. */
export function refuseTakenVjDemoSetlistName(
  library: StoredVjDemoLibrary,
  name: string,
  ownSetlistId: string | null,
): void {
  const lowered = name.toLocaleLowerCase();
  const other = library.setlists.find(
    (setlist) =>
      setlist.id !== ownSetlistId &&
      setlist.name.toLocaleLowerCase() === lowered,
  );
  if (other !== undefined) {
    throw vjRefusal("VJ_SETLIST_NAME_TAKEN", { setlistId: other.id });
  }
}
