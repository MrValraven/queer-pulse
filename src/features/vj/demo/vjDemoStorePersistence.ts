/**
 * Where the demo VJ library lives: one JSON copy in localStorage so every
 * demo tab reads the same packs and clips, read fresh on every call. A
 * blocked storage falls back to an in-memory copy, a damaged one reseeds, and
 * every committed write posts `library:changed` on the demo channel. Also the
 * lookups and DTO projection the store routes share.
 */
import type {
  VjClipDTO,
  VjCreatorDTO,
  VjLibraryChange,
  VjPackClipsDTO,
  VjPackDTO,
  VjPackListDTO,
} from "../../../shared/contracts/vj";
import { currentUser } from "../../members/data/demoCurrentUser";
import { VJ_DEMO_LIBRARY_STORAGE_KEY } from "../vj.constants";
import { VJ_DEMO_CREATORS, VJ_DEMO_SEED } from "./vjDemo.data";
import {
  VJ_DEMO_TAB_ID,
  openVjDemoChannel,
  type VjDemoChannel,
} from "./vjDemoChannel";
import { VJ_DEMO_MEDIA } from "./vjDemoMedia.data";
import { isVjUuid, vjRefusal } from "./vjDemoRules";

export type StoredVjDemoClip = Omit<VjClipDTO, "packIds" | "packCount">;

export interface StoredVjDemoPack {
  id: string;
  name: string;
  /** Pack order; the index is the position, so positions stay dense. */
  clipIds: string[];
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVjDemoLibrary {
  version: 1;
  /** Position order. */
  packs: StoredVjDemoPack[];
  clips: StoredVjDemoClip[];
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

/** The seed library, timestamped from the store's clock. */
export function buildVjDemoSeedLibrary(): StoredVjDemoLibrary {
  const now = readNow();
  const clips = VJ_DEMO_SEED.clips.flatMap((seed): StoredVjDemoClip[] => {
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
      },
    ];
  });
  const packsCreatedAt = isoAt(now - SEED_PACKS_CREATED_DAYS_AGO * DAY_MS);
  const packs = VJ_DEMO_SEED.packs.map((seed) => ({
    id: seed.id,
    name: seed.name,
    clipIds: [...seed.clipIds],
    createdBy: VJ_DEMO_CREATORS[seed.creator],
    createdAt: packsCreatedAt,
    updatedAt: packsCreatedAt,
  }));
  return { version: 1, packs, clips };
}

function parseLibrary(text: string | null): StoredVjDemoLibrary | null {
  if (text === null) return null;
  try {
    const parsed = JSON.parse(text) as Partial<StoredVjDemoLibrary> | null;
    const isLibrary =
      parsed?.version === 1 &&
      Array.isArray(parsed.packs) &&
      Array.isArray(parsed.clips);
    return isLibrary ? (parsed as StoredVjDemoLibrary) : null;
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

/** A fresh copy of the library; seeds and saves it when none is readable. */
export function loadVjDemoLibrary(): StoredVjDemoLibrary {
  const storage = resolveStorage();
  let text = memoryLibraryText;
  if (storage !== null) {
    try {
      text = storage.getItem(VJ_DEMO_LIBRARY_STORAGE_KEY);
    } catch {
      isStorageBroken = true;
    }
  }
  const library = parseLibrary(text);
  if (library !== null) return library;
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
  };
}

export function toVjDemoPackDto(
  library: StoredVjDemoLibrary,
  pack: StoredVjDemoPack,
): VjPackDTO {
  const packClips = clipsOfVjDemoPack(library, pack);
  return {
    id: pack.id,
    name: pack.name,
    position: library.packs.indexOf(pack),
    clipCount: packClips.length,
    totalByteSize: packClips.reduce((total, clip) => total + clip.byteSize, 0),
    coverThumbnailUrl: packClips[0]?.thumbnailUrl ?? null,
    createdBy: pack.createdBy,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
  };
}

export function toVjDemoClipDto(
  library: StoredVjDemoLibrary,
  clip: StoredVjDemoClip,
): VjClipDTO {
  const packIds = packIdsOfVjDemoClip(library, clip.id);
  return { ...clip, packIds, packCount: packIds.length };
}

export function toVjDemoPackClipsDto(
  library: StoredVjDemoLibrary,
  pack: StoredVjDemoPack,
): VjPackClipsDTO {
  return {
    pack: toVjDemoPackDto(library, pack),
    items: clipsOfVjDemoPack(library, pack).map((clip) =>
      toVjDemoClipDto(library, clip),
    ),
  };
}

export function toVjDemoPackListDto(
  library: StoredVjDemoLibrary,
): VjPackListDTO {
  return {
    items: library.packs.map((pack) => toVjDemoPackDto(library, pack)),
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
