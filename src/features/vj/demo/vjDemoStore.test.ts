import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  VjLibraryChange,
  VjSetlistItemInput,
} from "../../../shared/contracts/vj";
import { VJ_DEMO_LIBRARY_STORAGE_KEY } from "../vj.constants";
import {
  createVjDemoChannelHub,
  type VjDemoChannel,
  type VjDemoMessage,
} from "./vjDemoChannel";
import {
  configureVjDemoStore,
  demoAddVjPackClip,
  demoCreateVjClip,
  demoCreateVjPack,
  demoCreateVjSetlist,
  demoDeleteVjClip,
  demoDeleteVjPack,
  demoGetVjClips,
  demoGetVjPackClips,
  demoGetVjPackMedia,
  demoGetVjPacks,
  demoGetVjSetlists,
  demoRemoveVjPackClip,
  demoReorderVjPacks,
  demoSetVjSetlistItems,
  demoUpdateVjSetlist,
  resetVjDemoLibrary,
  vjDemoLibraryLookup,
  type VjDemoClipUpload,
} from "./vjDemoStore";
import { loadVjDemoLibrary } from "./vjDemoStorePersistence";

const WARM_UP_ID = "00000000-0000-4000-8000-0000000000a1";
const PEAK_HOUR_ID = "00000000-0000-4000-8000-0000000000a2";
const CLOSING_ID = "00000000-0000-4000-8000-0000000000a3";
const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const DISCO_DOTS_ID = "00000000-0000-4000-8000-0000000000c3";
const PINK_TUNNEL_ID = "00000000-0000-4000-8000-0000000000c4";
const STATIC_BLOOM_ID = "00000000-0000-4000-8000-0000000000c8";
const WARM_UP_SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const PEAK_SCENE_ID = "00000000-0000-4000-8000-0000000000d2";
const FRIDAY_SET_ID = "00000000-0000-4000-8000-0000000000b1";
/** The seed steps of "Friday set": warm up, pink tunnel, peak, disco dots. */
const FRIDAY_STEP_IDS = [
  "00000000-0000-4000-8000-000000000100",
  "00000000-0000-4000-8000-000000000101",
  "00000000-0000-4000-8000-000000000102",
  "00000000-0000-4000-8000-000000000103",
] as const;
const UNKNOWN_ID = "00000000-0000-4000-8000-00000000ffff";
const OTHER_UNKNOWN_ID = "00000000-0000-4000-8000-00000000fffe";
const SUPPER_CLUB_EVENT_ID = "00000000-0000-4000-8000-00000000ee01";
const FIXED_NOW = Date.parse("2026-11-05T20:00:00.000Z");

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function createThrowingStorage(): Storage {
  const fail = (): never => {
    throw new Error("SecurityError");
  };
  return {
    length: 0,
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}

function refusalOf(action: () => unknown): ApiError {
  try {
    action();
  } catch (error) {
    if (error instanceof ApiError) {
      return error;
    }
    throw error;
  }
  throw new Error("expected a refusal");
}

function bodyOf(error: ApiError): Record<string, unknown> {
  return error.data as Record<string, unknown>;
}

function gifUpload(
  packId: string | null,
  title = "Fresh loop",
): VjDemoClipUpload {
  return {
    title,
    mediaUrl: "blob:demo-media",
    thumbnailUrl: "blob:demo-thumbnail",
    mimeType: "image/gif",
    byteSize: 2048,
    width: 320,
    height: 180,
    durationMs: null,
    fitMode: "fill",
    packId,
  };
}

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

let hub: ReturnType<typeof createVjDemoChannelHub>;
let storage: Storage;
let storeChannel: VjDemoChannel;

beforeEach(() => {
  hub = createVjDemoChannelHub();
  storage = createMemoryStorage();
  storeChannel = hub.open();
  configureVjDemoStore({
    storage,
    channel: storeChannel,
    now: () => FIXED_NOW,
  });
  resetVjDemoLibrary();
});

describe("vjDemoStore reads and pack writes", () => {
  it("seeds three packs in order with counts, sizes and covers", () => {
    const packs = demoGetVjPacks().items;
    expect(packs.map((pack) => pack.name)).toEqual([
      "Warm-up",
      "Peak hour",
      "Closing",
    ]);
    expect(packs.map((pack) => pack.clipCount)).toEqual([3, 4, 2]);
    expect(packs.map((pack) => pack.position)).toEqual([0, 1, 2]);
    expect(packs[0]?.coverThumbnailUrl).toBe("/vj-demo/neon-grid.webp");
    const warmUpClips = demoGetVjPackClips(WARM_UP_ID).items;
    const warmUpBytes = warmUpClips.reduce(
      (total, clip) => total + clip.byteSize,
      0,
    );
    expect(packs[0]?.totalByteSize).toBe(warmUpBytes);
    expect(
      warmUpClips.find((clip) => clip.title === "Tall ribbon")?.fitMode,
    ).toBe("fit");
  });

  it("lists the library newest first with each clip's packs", () => {
    const clips = demoGetVjClips().items;
    expect(clips).toHaveLength(8);
    expect(clips[0]?.title).toBe("Static bloom");
    expect(clips[0]?.packCount).toBe(0);
    expect(clips[0]?.mediaKind).toBe("gif");
    expect(clips[0]?.durationMs).toBeNull();
    const neonGrid = clips.find((clip) => clip.id === NEON_GRID_ID);
    expect(neonGrid?.packIds).toEqual([WARM_UP_ID, PEAK_HOUR_ID]);
    expect(neonGrid?.packCount).toBe(2);
    expect(clips.at(-1)?.title).toBe("Neon grid");
  });

  it.each([
    [{ name: " " }, "VJ_PACK_NAME_REQUIRED", 400],
    [{ name: "x".repeat(61) }, "VJ_PACK_NAME_TOO_LONG", 400],
    [{ name: " warm-UP " }, "VJ_PACK_NAME_TAKEN", 409],
  ])("refuses pack %o with %s", (body, code, status) => {
    const refusal = refusalOf(() => demoCreateVjPack(body));
    expect(refusal.status).toBe(status);
    expect(bodyOf(refusal).code).toBe(code);
    expect(bodyOf(refusal).statusCode).toBe(status);
    if (code === "VJ_PACK_NAME_TAKEN") {
      expect(bodyOf(refusal).packId).toBe(WARM_UP_ID);
    }
    expect(demoGetVjPacks().items).toHaveLength(3);
  });

  it("stops at fifty packs", () => {
    for (let packIndex = 0; packIndex < 47; packIndex += 1) {
      demoCreateVjPack({ name: `Pack ${packIndex}` });
    }
    expect(demoGetVjPacks().items).toHaveLength(50);
    const refusal = refusalOf(() => demoCreateVjPack({ name: "One too many" }));
    expect(refusal.status).toBe(409);
    expect(bodyOf(refusal).code).toBe("VJ_PACK_LIMIT_REACHED");
  });

  it("refuses a reorder that misses a pack and changes nothing", () => {
    const refusal = refusalOf(() =>
      demoReorderVjPacks({ packIds: [CLOSING_ID, WARM_UP_ID] }),
    );
    expect(refusal.status).toBe(400);
    expect(bodyOf(refusal).code).toBe("VJ_PACK_REORDER_MISMATCH");
    expect(demoGetVjPacks().items.map((pack) => pack.id)).toEqual([
      WARM_UP_ID,
      PEAK_HOUR_ID,
      CLOSING_ID,
    ]);
    const reordered = demoReorderVjPacks({
      packIds: [CLOSING_ID, WARM_UP_ID, PEAK_HOUR_ID],
    });
    expect(reordered.items.map((pack) => [pack.id, pack.position])).toEqual([
      [CLOSING_ID, 0],
      [WARM_UP_ID, 1],
      [PEAK_HOUR_ID, 2],
    ]);
  });

  it("adds a clip at the pack's end and refuses it twice", () => {
    const added = demoAddVjPackClip(CLOSING_ID, { clipId: STATIC_BLOOM_ID });
    expect(added.items.at(-1)?.id).toBe(STATIC_BLOOM_ID);
    expect(added.pack.clipCount).toBe(3);
    const refusal = refusalOf(() =>
      demoAddVjPackClip(CLOSING_ID, { clipId: STATIC_BLOOM_ID }),
    );
    expect(refusal.status).toBe(409);
    expect(bodyOf(refusal).code).toBe("VJ_CLIP_ALREADY_IN_PACK");
    expect(bodyOf(refusal).packId).toBe(CLOSING_ID);
  });

  it("removes a clip from a pack and keeps it in the library", () => {
    const result = demoRemoveVjPackClip(PEAK_HOUR_ID, NEON_GRID_ID);
    expect(result.items.map((clip) => clip.id)).not.toContain(NEON_GRID_ID);
    expect(result.items).toHaveLength(3);
    expect(result.pack.clipCount).toBe(3);
    const neonGrid = demoGetVjClips().items.find(
      (clip) => clip.id === NEON_GRID_ID,
    );
    expect(neonGrid?.packCount).toBe(1);
    expect(neonGrid?.packIds).toEqual([WARM_UP_ID]);
    const refusal = refusalOf(() =>
      demoRemoveVjPackClip(PEAK_HOUR_ID, NEON_GRID_ID),
    );
    expect(refusal.status).toBe(404);
    expect(bodyOf(refusal).code).toBe("VJ_CLIP_NOT_IN_PACK");
  });
});

describe("vjDemoStore deletes, uploads and sync", () => {
  it("deletes a clip from every pack and counts them", () => {
    expect(demoDeleteVjClip(NEON_GRID_ID)).toEqual({
      deletedClipId: NEON_GRID_ID,
      removedFromPackCount: 2,
      removedFromSetlistCount: 0,
    });
    expect(
      demoGetVjPackClips(WARM_UP_ID).items.map((clip) => clip.id),
    ).not.toContain(NEON_GRID_ID);
    expect(
      demoGetVjPackClips(PEAK_HOUR_ID).items.map((clip) => clip.id),
    ).not.toContain(NEON_GRID_ID);
    expect(demoGetVjClips().items).toHaveLength(7);
    expect(vjDemoLibraryLookup.hasClip(NEON_GRID_ID)).toBe(false);
    expect(demoGetVjPacks().items[0]?.coverThumbnailUrl).toBe(
      "/vj-demo/warm-haze.webp",
    );
  });

  it("deletes a pack and keeps its clips", () => {
    expect(demoDeleteVjPack(CLOSING_ID)).toEqual({
      deletedPackId: CLOSING_ID,
      clipsKeptCount: 2,
    });
    expect(demoGetVjClips().items).toHaveLength(8);
    expect(demoGetVjPacks().items.map((pack) => pack.position)).toEqual([0, 1]);
    expect(vjDemoLibraryLookup.hasPack(CLOSING_ID)).toBe(false);
    const refusal = refusalOf(() => demoGetVjPackClips(CLOSING_ID));
    expect(refusal.status).toBe(404);
    expect(bodyOf(refusal).code).toBe("VJ_PACK_NOT_FOUND");
  });

  it("creates an uploaded clip into a pack and refuses a full one", () => {
    const created = demoCreateVjClip(gifUpload(CLOSING_ID, "  Fresh loop  "));
    expect(created.title).toBe("Fresh loop");
    expect(created.packIds).toEqual([CLOSING_ID]);
    expect(created.createdBy).toEqual({
      userId: "21",
      displayName: "Tiago Costa",
    });
    expect(demoGetVjPackClips(CLOSING_ID).items.at(-1)?.id).toBe(created.id);
    expect(demoGetVjClips().items[0]?.id).toBe(created.id);

    const fullPack = demoCreateVjPack({ name: "Full" });
    for (let clipIndex = 0; clipIndex < 200; clipIndex += 1) {
      demoCreateVjClip(gifUpload(fullPack.id, `Loop ${clipIndex}`));
    }
    expect(demoGetVjPackClips(fullPack.id).pack.clipCount).toBe(200);
    const refusal = refusalOf(() =>
      demoCreateVjClip(gifUpload(fullPack.id, "One too many")),
    );
    expect(refusal.status).toBe(409);
    expect(bodyOf(refusal).code).toBe("VJ_PACK_FULL");
    expect(bodyOf(refusal).packId).toBe(fullPack.id);
  });

  it("refuses a video upload without a duration", () => {
    const refusal = refusalOf(() =>
      demoCreateVjClip({ ...gifUpload(null), mimeType: "video/mp4" }),
    );
    expect(refusal.status).toBe(400);
    expect(bodyOf(refusal).code).toBe("VJ_CLIP_DURATION_INVALID");
  });

  it("answers media in pack order and leaves out clips outside the pack", () => {
    const media = demoGetVjPackMedia(PEAK_HOUR_ID, [
      STATIC_BLOOM_ID,
      DISCO_DOTS_ID,
    ]);
    expect(media.packId).toBe(PEAK_HOUR_ID);
    expect(media.items).toHaveLength(1);
    expect(media.items[0]?.clipId).toBe(DISCO_DOTS_ID);
    expect(media.items[0]?.url).toBe("/vj-demo/disco-dots.gif");
    expect(media.items[0]?.expiresAt).toBe(
      new Date(FIXED_NOW + 900_000).toISOString(),
    );
    expect(demoGetVjPackMedia(PEAK_HOUR_ID, null).items).toHaveLength(4);
    const refusal = refusalOf(() => demoGetVjPackMedia(PEAK_HOUR_ID, []));
    expect(bodyOf(refusal).code).toBe("VJ_CLIP_IDS_INVALID");
  });

  it("keeps one library across tabs through storage", () => {
    const created = demoCreateVjPack({ name: "After party" });
    configureVjDemoStore({
      storage,
      channel: hub.open(),
      now: () => FIXED_NOW,
    });
    expect(demoGetVjPacks().items.map((pack) => pack.id)).toContain(created.id);
    expect(storage.getItem(VJ_DEMO_LIBRARY_STORAGE_KEY)).not.toBeNull();
  });

  it("reseeds when the stored library cannot be read", () => {
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, "{broken");
    expect(demoGetVjPacks().items).toHaveLength(3);
  });

  it("keeps working in memory when storage throws", () => {
    configureVjDemoStore({
      storage: createThrowingStorage(),
      channel: storeChannel,
      now: () => FIXED_NOW,
    });
    const created = demoCreateVjPack({ name: "Offline pack" });
    expect(demoGetVjPacks().items.map((pack) => pack.id)).toContain(created.id);
  });

  it("posts a library change after every write", async () => {
    const received: VjDemoMessage[] = [];
    hub.open().subscribe((message) => received.push(message));

    const created = demoCreateVjPack({ name: "After party" });
    demoAddVjPackClip(created.id, { clipId: STATIC_BLOOM_ID });
    demoDeleteVjClip(NEON_GRID_ID);
    await flushMicrotasks();

    expect(received.map((message) => message.name)).toEqual([
      "library:changed",
      "library:changed",
      "library:changed",
    ]);
    expect(received.every((message) => message.direction === "toServer")).toBe(
      true,
    );
    const changes = received.map(
      (message) => message.payload as VjLibraryChange,
    );
    expect(changes.map((change) => change.kind)).toEqual([
      "pack_created",
      "pack_clips_changed",
      "clip_deleted",
    ]);
    expect(changes[0]?.packId).toBe(created.id);
    expect(changes[1]).toEqual({
      kind: "pack_clips_changed",
      packId: created.id,
      clipId: STATIC_BLOOM_ID,
      packIds: [created.id],
      sceneId: null,
      setlistId: null,
      setlistIds: [],
      eventId: null,
    });
    expect(changes[2]).toEqual({
      kind: "clip_deleted",
      packId: null,
      clipId: NEON_GRID_ID,
      packIds: [WARM_UP_ID, PEAK_HOUR_ID],
      sceneId: null,
      setlistId: null,
      setlistIds: [],
      eventId: null,
    });
  });
});

describe("vjDemoStore v2 fields", () => {
  it("shows the seed pack's event summary and no event on the others", () => {
    const packs = demoGetVjPacks().items;
    expect(packs[0]?.event).toEqual({
      id: SUPPER_CLUB_EVENT_ID,
      title: "Queer Supper Club №12",
      startAt: new Date(FIXED_NOW + 2 * 3_600_000).toISOString(),
      isAvailable: true,
    });
    expect(packs[1]?.event).toBeNull();
    expect(demoCreateVjPack({ name: "After party" }).event).toBeNull();
  });

  it("deleting a pack keeps its scenes unfiled", () => {
    demoDeleteVjPack(WARM_UP_ID);
    const scenes = loadVjDemoLibrary().scenes;
    expect(scenes.map((scene) => [scene.id, scene.packId])).toEqual([
      [WARM_UP_SCENE_ID, null],
      [PEAK_SCENE_ID, PEAK_HOUR_ID],
    ]);
  });

  it("new clips carry the default speed and loop", () => {
    const created = demoCreateVjClip(gifUpload(null));
    expect(created).toMatchObject({
      isFavorite: false,
      defaultSpeed: 1,
      loopInMs: null,
      loopOutMs: null,
      loopMode: "loop",
      previewUrl: null,
    });
  });

  it("marks the first clip of the first pack as the seed favorite", () => {
    const favorites = demoGetVjClips()
      .items.filter((clip) => clip.isFavorite)
      .map((clip) => clip.id);
    expect(favorites).toEqual([NEON_GRID_ID]);
  });
});

function codeOf(action: () => unknown): unknown {
  return bodyOf(refusalOf(action)).code;
}

function fridaySet() {
  const setlist = demoGetVjSetlists().items.find(
    (candidate) => candidate.id === FRIDAY_SET_ID,
  );
  if (setlist === undefined) throw new Error("expected the seed set list");
  return setlist;
}

function setlistItemCountOf(clipId: string): number | undefined {
  return demoGetVjClips().items.find((clip) => clip.id === clipId)
    ?.setlistItemCount;
}

/** The stored steps of "Friday set" as a PUT body would send them. */
function fridayInputs(): VjSetlistItemInput[] {
  return fridaySet().items.map((item): VjSetlistItemInput =>
    item.kind === "scene"
      ? {
          id: item.id,
          kind: "scene",
          sceneId: item.sceneId ?? "",
          duration: item.duration,
        }
      : {
          id: item.id,
          kind: "clip",
          clipId: item.clipId ?? "",
          duration: item.duration,
        },
  );
}

async function changesDuring(action: () => void): Promise<VjLibraryChange[]> {
  const received: VjDemoMessage[] = [];
  const listener = hub.open();
  listener.subscribe((message) => received.push(message));
  action();
  await flushMicrotasks();
  return received.map((message) => message.payload as VjLibraryChange);
}

describe("vjDemoStore sequences seed and DTOs", () => {
  it("seeds Friday set as a looping sequence of scene and clip steps", () => {
    const setlist = fridaySet();
    expect(setlist).toMatchObject({
      isLooping: true,
      stepDuration: { kind: "seconds", value: 8 },
    });
    expect(setlist.items).toEqual([
      {
        id: FRIDAY_STEP_IDS[0],
        position: 0,
        kind: "scene",
        sceneId: WARM_UP_SCENE_ID,
        clipId: null,
        duration: null,
      },
      {
        id: FRIDAY_STEP_IDS[1],
        position: 1,
        kind: "clip",
        sceneId: null,
        clipId: PINK_TUNNEL_ID,
        duration: null,
      },
      {
        id: FRIDAY_STEP_IDS[2],
        position: 2,
        kind: "scene",
        sceneId: PEAK_SCENE_ID,
        clipId: null,
        duration: { kind: "beats", value: 16 },
      },
      {
        id: FRIDAY_STEP_IDS[3],
        position: 3,
        kind: "clip",
        sceneId: null,
        clipId: DISCO_DOTS_ID,
        duration: null,
      },
    ]);
  });

  it("counts the set list steps that play each clip", () => {
    expect(setlistItemCountOf(PINK_TUNNEL_ID)).toBe(1);
    expect(setlistItemCountOf(DISCO_DOTS_ID)).toBe(1);
    expect(setlistItemCountOf(NEON_GRID_ID)).toBe(0);
  });
});

describe("vjDemoStore sequence steps PUT", () => {
  it("keeps the ids a PUT names, gives id-less steps fresh ids and leaves out the rest", async () => {
    const changes = await changesDuring(() => {
      demoSetVjSetlistItems(FRIDAY_SET_ID, {
        items: [
          {
            id: FRIDAY_STEP_IDS[2],
            kind: "scene",
            sceneId: PEAK_SCENE_ID,
            duration: { kind: "beats", value: 32 },
          },
          {
            id: FRIDAY_STEP_IDS[0].toUpperCase(),
            kind: "scene",
            sceneId: WARM_UP_SCENE_ID,
          },
          { kind: "clip", clipId: NEON_GRID_ID.toUpperCase(), duration: null },
        ],
      });
    });

    const items = fridaySet().items;
    expect(items.map((item) => item.position)).toEqual([0, 1, 2]);
    expect(items[0]).toMatchObject({
      id: FRIDAY_STEP_IDS[2],
      duration: { kind: "beats", value: 32 },
    });
    expect(items[1]).toMatchObject({
      id: FRIDAY_STEP_IDS[0],
      duration: null,
    });
    expect(items[2]).toMatchObject({ kind: "clip", clipId: NEON_GRID_ID });
    expect(FRIDAY_STEP_IDS as readonly string[]).not.toContain(items[2]?.id);
    expect(setlistItemCountOf(PINK_TUNNEL_ID)).toBe(0);
    expect(setlistItemCountOf(NEON_GRID_ID)).toBe(1);
    expect(changes).toEqual([
      expect.objectContaining({
        kind: "setlist_items_changed",
        setlistId: FRIDAY_SET_ID,
        setlistIds: [FRIDAY_SET_ID],
      }),
    ]);
  });

  it("a PUT equal to the stored steps saves and posts nothing", async () => {
    const before = fridaySet();
    const changes = await changesDuring(() => {
      demoSetVjSetlistItems(FRIDAY_SET_ID, { items: fridayInputs() });
    });

    expect(changes).toEqual([]);
    expect(fridaySet()).toEqual(before);
  });

  it("an id-less copy of a stored step is a change", async () => {
    const inputs = fridayInputs().map(({ id, ...input }) => {
      void id;
      return input;
    });
    const changes = await changesDuring(() => {
      demoSetVjSetlistItems(FRIDAY_SET_ID, { items: inputs });
    });

    expect(changes.map((change) => change.kind)).toEqual([
      "setlist_items_changed",
    ]);
  });
});

describe("vjDemoStore sequence steps PUT refusals", () => {
  const scene = { kind: "scene", sceneId: WARM_UP_SCENE_ID } as const;
  const tooMany = Array.from({ length: 101 }, () => ({ ...scene }));

  it.each([
    ["a malformed route id first", "set", { items: 1 }, "VJ_SETLIST_NOT_FOUND"],
    [
      "the old sceneIds body, even beside items",
      FRIDAY_SET_ID,
      { sceneIds: [WARM_UP_SCENE_ID], items: [scene] },
      "VJ_SETLIST_ITEMS_INVALID",
    ],
    [
      "items that are no array",
      FRIDAY_SET_ID,
      { items: "steps" },
      "VJ_SETLIST_ITEMS_INVALID",
    ],
    ["items that are missing", FRIDAY_SET_ID, {}, "VJ_SETLIST_ITEMS_INVALID"],
    [
      "an id sent as null",
      FRIDAY_SET_ID,
      { items: [{ ...scene, id: null }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a malformed id",
      FRIDAY_SET_ID,
      { items: [{ ...scene, id: "step-1" }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "an id used twice",
      FRIDAY_SET_ID,
      {
        items: [
          { ...scene, id: FRIDAY_STEP_IDS[0] },
          { ...scene, id: FRIDAY_STEP_IDS[0].toUpperCase() },
        ],
      },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a key outside the five",
      FRIDAY_SET_ID,
      { items: [{ ...scene, position: 0 }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a kind outside the list",
      FRIDAY_SET_ID,
      { items: [{ kind: "generator", sceneId: WARM_UP_SCENE_ID }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a scene step carrying a clip",
      FRIDAY_SET_ID,
      { items: [{ ...scene, clipId: NEON_GRID_ID }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a clip step whose clipId is no uuid",
      FRIDAY_SET_ID,
      { items: [{ kind: "clip", clipId: "neon" }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "an entry that is no object",
      FRIDAY_SET_ID,
      { items: [WARM_UP_SCENE_ID] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a length out of range",
      FRIDAY_SET_ID,
      { items: [{ ...scene, duration: { kind: "seconds", value: 1 } }] },
      "VJ_SETLIST_STEP_DURATION_INVALID",
    ],
    [
      "a bad length before a later bad entry, in list order",
      FRIDAY_SET_ID,
      {
        items: [
          { ...scene, duration: { kind: "beats", value: 3 } },
          { kind: "bogus" },
        ],
      },
      "VJ_SETLIST_STEP_DURATION_INVALID",
    ],
    [
      "a bad entry before a later bad length, in list order",
      FRIDAY_SET_ID,
      {
        items: [
          { kind: "bogus" },
          { ...scene, duration: { kind: "beats", value: 3 } },
        ],
      },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "the body rules before the set list read",
      UNKNOWN_ID,
      { items: [{ kind: "bogus" }] },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "an unknown set list after the body rules",
      UNKNOWN_ID,
      { items: [{ ...scene, id: UNKNOWN_ID }] },
      "VJ_SETLIST_NOT_FOUND",
    ],
    [
      "an id naming no step of this set list before a missing scene",
      FRIDAY_SET_ID,
      { items: [{ id: UNKNOWN_ID, kind: "scene", sceneId: UNKNOWN_ID }] },
      "VJ_SETLIST_ITEM_NOT_FOUND",
    ],
  ] as const)("refuses %s", (_label, setlistId, body, code) => {
    const before = fridaySet();
    expect(codeOf(() => demoSetVjSetlistItems(setlistId, body))).toBe(code);
    expect(fridaySet()).toEqual(before);
  });

  it("answers VJ_SETLIST_FULL with the set list id over 100 steps", () => {
    const body = bodyOf(
      refusalOf(() => demoSetVjSetlistItems(FRIDAY_SET_ID, { items: tooMany })),
    );
    expect(body).toMatchObject({
      code: "VJ_SETLIST_FULL",
      setlistId: FRIDAY_SET_ID,
    });
  });

  it("names the first missing scene before any missing clip, then the missing clip", () => {
    expect(
      bodyOf(
        refusalOf(() =>
          demoSetVjSetlistItems(FRIDAY_SET_ID, {
            items: [
              { kind: "clip", clipId: UNKNOWN_ID },
              { kind: "scene", sceneId: OTHER_UNKNOWN_ID },
            ],
          }),
        ),
      ),
    ).toMatchObject({ code: "VJ_SCENE_NOT_FOUND", sceneId: OTHER_UNKNOWN_ID });
    expect(
      bodyOf(
        refusalOf(() =>
          demoSetVjSetlistItems(FRIDAY_SET_ID, {
            items: [
              { kind: "clip", clipId: NEON_GRID_ID },
              { kind: "clip", clipId: UNKNOWN_ID },
            ],
          }),
        ),
      ),
    ).toMatchObject({ code: "VJ_CLIP_NOT_FOUND", clipId: UNKNOWN_ID });
  });
});

describe("vjDemoStore sequence create and PATCH", () => {
  it("creates from steps with Loop and a length, or from sceneIds on the defaults", async () => {
    const changes = await changesDuring(() => {
      demoCreateVjSetlist({
        name: "Late set",
        items: [
          { kind: "clip", clipId: NEON_GRID_ID, duration: null },
          { kind: "scene", sceneId: PEAK_SCENE_ID },
        ],
        isLooping: true,
        stepDuration: { kind: "beats", value: 8 },
      });
    });
    const late = demoGetVjSetlists().items.find(
      (setlist) => setlist.name === "Late set",
    );
    expect(late).toMatchObject({
      isLooping: true,
      stepDuration: { kind: "beats", value: 8 },
    });
    expect(late?.items.map((item) => [item.kind, item.position])).toEqual([
      ["clip", 0],
      ["scene", 1],
    ]);
    expect(changes.map((change) => change.kind)).toEqual(["setlist_created"]);

    const fromScenes = demoCreateVjSetlist({
      name: "From scenes",
      sceneIds: [WARM_UP_SCENE_ID, WARM_UP_SCENE_ID],
    });
    expect(fromScenes).toMatchObject({
      isLooping: false,
      stepDuration: { kind: "seconds", value: 8 },
    });
    expect(fromScenes.items).toEqual([
      expect.objectContaining({
        kind: "scene",
        sceneId: WARM_UP_SCENE_ID,
        clipId: null,
        duration: null,
      }),
      expect.objectContaining({ kind: "scene", sceneId: WARM_UP_SCENE_ID }),
    ]);
  });

  it.each([
    [
      "a missing name before the list rules",
      { name: "", sceneIds: [], items: [] },
      "VJ_SETLIST_NAME_REQUIRED",
    ],
    [
      "sceneIds and items both sent",
      { name: "Late", sceneIds: [], items: [] },
      "VJ_SETLIST_ITEMS_INVALID",
    ],
    [
      "a bad step before a bad Loop",
      { name: "Late", items: [{ kind: "bogus" }], isLooping: "yes" },
      "VJ_SETLIST_STEP_INVALID",
    ],
    [
      "a bad Loop before a bad length",
      { name: "Late", isLooping: "yes", stepDuration: { kind: "beats" } },
      "VJ_SETLIST_LOOP_INVALID",
    ],
    [
      "a bad default length",
      { name: "Late", stepDuration: { kind: "seconds", value: 601 } },
      "VJ_SETLIST_STEP_DURATION_INVALID",
    ],
    [
      "a step id, which no new set list holds",
      {
        name: "Late",
        items: [
          { id: FRIDAY_STEP_IDS[0], kind: "scene", sceneId: WARM_UP_SCENE_ID },
        ],
      },
      "VJ_SETLIST_ITEM_NOT_FOUND",
    ],
    [
      "a taken name before a missing scene",
      { name: "friday SET", sceneIds: [UNKNOWN_ID] },
      "VJ_SETLIST_NAME_TAKEN",
    ],
    [
      "a missing clip step",
      { name: "Late", items: [{ kind: "clip", clipId: UNKNOWN_ID }] },
      "VJ_CLIP_NOT_FOUND",
    ],
  ] as const)("a create refuses %s", (_label, body, code) => {
    expect(codeOf(() => demoCreateVjSetlist(body))).toBe(code);
    expect(demoGetVjSetlists().items).toHaveLength(1);
  });

  it.each([
    ["a malformed route id first", "set", {}, "VJ_SETLIST_NOT_FOUND"],
    ["a body naming no field", FRIDAY_SET_ID, {}, "VJ_SETLIST_PATCH_EMPTY"],
    [
      "a blank name before a bad Loop",
      FRIDAY_SET_ID,
      { name: " ", isLooping: 1 },
      "VJ_SETLIST_NAME_REQUIRED",
    ],
    [
      "a bad Loop before a bad length",
      FRIDAY_SET_ID,
      { isLooping: "on", stepDuration: null },
      "VJ_SETLIST_LOOP_INVALID",
    ],
    [
      "a bad length",
      FRIDAY_SET_ID,
      { stepDuration: { kind: "beats", value: 12 } },
      "VJ_SETLIST_STEP_DURATION_INVALID",
    ],
    [
      "an unknown set list after the field rules",
      UNKNOWN_ID,
      { isLooping: false },
      "VJ_SETLIST_NOT_FOUND",
    ],
  ] as const)("a PATCH refuses %s", (_label, setlistId, body, code) => {
    expect(codeOf(() => demoUpdateVjSetlist(setlistId, body))).toBe(code);
  });

  it("a PATCH equal to the stored fields saves and posts nothing", async () => {
    const before = fridaySet();
    const changes = await changesDuring(() => {
      demoUpdateVjSetlist(FRIDAY_SET_ID, {
        name: "Friday set",
        isLooping: true,
        stepDuration: { kind: "seconds", value: 8 },
      });
    });
    expect(changes).toEqual([]);
    expect(fridaySet()).toEqual(before);
  });

  it("a PATCH saves Loop and the default length and posts setlist_updated", async () => {
    const changes = await changesDuring(() => {
      demoUpdateVjSetlist(FRIDAY_SET_ID, {
        isLooping: false,
        stepDuration: { kind: "beats", value: 64 },
      });
    });
    expect(fridaySet()).toMatchObject({
      name: "Friday set",
      isLooping: false,
      stepDuration: { kind: "beats", value: 64 },
    });
    expect(changes).toEqual([
      expect.objectContaining({
        kind: "setlist_updated",
        setlistId: FRIDAY_SET_ID,
        setlistIds: [FRIDAY_SET_ID],
      }),
    ]);
  });

  it("checks the name clash only when the name changes", () => {
    const late = demoCreateVjSetlist({ name: "Late set" });
    expect(
      bodyOf(
        refusalOf(() =>
          demoUpdateVjSetlist(FRIDAY_SET_ID, { name: "late SET" }),
        ),
      ),
    ).toMatchObject({ code: "VJ_SETLIST_NAME_TAKEN", setlistId: late.id });
    expect(
      demoUpdateVjSetlist(FRIDAY_SET_ID, {
        name: "Friday set",
        isLooping: false,
      }).isLooping,
    ).toBe(false);
  });
});

describe("vjDemoStore clip delete and the sequence reads", () => {
  it("deleting a clip drops its steps, closes positions and names the set list", async () => {
    let answer: unknown;
    const changes = await changesDuring(() => {
      answer = demoDeleteVjClip(PINK_TUNNEL_ID);
    });

    expect(answer).toEqual({
      deletedClipId: PINK_TUNNEL_ID,
      removedFromPackCount: 1,
      removedFromSetlistCount: 1,
    });
    expect(fridaySet().items.map((item) => [item.id, item.position])).toEqual([
      [FRIDAY_STEP_IDS[0], 0],
      [FRIDAY_STEP_IDS[2], 1],
      [FRIDAY_STEP_IDS[3], 2],
    ]);
    expect(changes).toEqual([
      expect.objectContaining({
        kind: "clip_deleted",
        clipId: PINK_TUNNEL_ID,
        packIds: [PEAK_HOUR_ID],
        setlistIds: [FRIDAY_SET_ID],
      }),
    ]);
  });

  it("the step read answers item ids, Loop, the default length and the step", () => {
    const counted = vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID, {
      kind: "count",
    });
    expect(counted).toEqual({
      setlistId: FRIDAY_SET_ID,
      isLooping: true,
      stepDuration: { kind: "seconds", value: 8 },
      itemIds: [...FRIDAY_STEP_IDS],
      step: null,
    });

    expect(
      vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID.toUpperCase(), {
        kind: "index",
        index: 1,
        wrapsToFirst: false,
      })?.step,
    ).toEqual({
      kind: "clip",
      itemId: FRIDAY_STEP_IDS[1],
      index: 1,
      clipId: PINK_TUNNEL_ID,
      duration: { kind: "seconds", value: 8 },
    });

    const peak = vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID, {
      kind: "index",
      index: 2,
      wrapsToFirst: false,
    })?.step;
    expect(peak).toMatchObject({
      kind: "scene",
      itemId: FRIDAY_STEP_IDS[2],
      index: 2,
      sceneId: PEAK_SCENE_ID,
      duration: { kind: "beats", value: 16 },
    });
    expect(peak?.kind === "scene" ? peak.look.transition.mode : null).toBe(
      "cut",
    );
  });

  it("wraps past the end only when asked, and reads the last step", () => {
    const read = (
      position: Parameters<typeof vjDemoLibraryLookup.readSetlist>[1],
    ) => vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID, position)?.step;

    expect(read({ kind: "index", index: 4, wrapsToFirst: true })).toMatchObject(
      { itemId: FRIDAY_STEP_IDS[0], index: 0 },
    );
    expect(read({ kind: "index", index: 4, wrapsToFirst: false })).toBeNull();
    expect(read({ kind: "index", index: -1, wrapsToFirst: true })).toBeNull();
    expect(read({ kind: "index", index: 1.5, wrapsToFirst: true })).toBeNull();
    expect(
      read({ kind: "index", index: Number.NaN, wrapsToFirst: true }),
    ).toBeNull();
    expect(
      read({
        kind: "index",
        index: Number.POSITIVE_INFINITY,
        wrapsToFirst: true,
      }),
    ).toBeNull();
    expect(
      read({ kind: "index", index: 250, wrapsToFirst: true }),
    ).toMatchObject({ itemId: FRIDAY_STEP_IDS[0], index: 0 });
    expect(read({ kind: "last" })).toMatchObject({
      itemId: FRIDAY_STEP_IDS[3],
      index: 3,
      kind: "clip",
    });
  });

  it("an empty, unknown or malformed set list reads as such", () => {
    const empty = demoCreateVjSetlist({ name: "Empty" });
    expect(
      vjDemoLibraryLookup.readSetlist(empty.id, {
        kind: "index",
        index: 0,
        wrapsToFirst: true,
      }),
    ).toMatchObject({ itemIds: [], step: null });
    expect(
      vjDemoLibraryLookup.readSetlist(empty.id, { kind: "last" })?.step,
    ).toBeNull();
    expect(
      vjDemoLibraryLookup.readSetlist(UNKNOWN_ID, { kind: "count" }),
    ).toBeNull();
    expect(
      vjDemoLibraryLookup.readSetlist("set", { kind: "count" }),
    ).toBeNull();
  });

  it("the follow read answers item ids and Loop", () => {
    expect(vjDemoLibraryLookup.readSetlistFollow(FRIDAY_SET_ID)).toEqual({
      itemIds: [...FRIDAY_STEP_IDS],
      isLooping: true,
    });
    expect(vjDemoLibraryLookup.readSetlistFollow(UNKNOWN_ID)).toBeNull();
    expect(vjDemoLibraryLookup.readSetlistFollow("set")).toBeNull();
  });
});

describe("vjDemoStore sequence review cases", () => {
  const LATER_NOW = FIXED_NOW + 60_000;

  function moveClockTo(now: number): void {
    configureVjDemoStore({ storage, channel: storeChannel, now: () => now });
  }

  it("a clip delete counts every step across set lists and names them in id order", async () => {
    const twice = demoCreateVjSetlist({
      name: "Disco twice",
      items: [
        { kind: "clip", clipId: DISCO_DOTS_ID },
        { kind: "scene", sceneId: PEAK_SCENE_ID },
        { kind: "clip", clipId: DISCO_DOTS_ID, duration: null },
      ],
    });
    let answer: unknown;
    const changes = await changesDuring(() => {
      answer = demoDeleteVjClip(DISCO_DOTS_ID);
    });

    expect(answer).toEqual({
      deletedClipId: DISCO_DOTS_ID,
      removedFromPackCount: 1,
      removedFromSetlistCount: 3,
    });
    expect(changes[0]?.setlistIds).toEqual([FRIDAY_SET_ID, twice.id].sort());
    const remaining = demoGetVjSetlists().items.find(
      (setlist) => setlist.id === twice.id,
    );
    expect(remaining?.items.map((item) => [item.kind, item.position])).toEqual([
      ["scene", 0],
    ]);
    expect(fridaySet().items.map((item) => item.id)).toEqual(
      FRIDAY_STEP_IDS.slice(0, 3),
    );
  });

  it("refuses a step id that belongs to another set list", () => {
    const other = demoCreateVjSetlist({
      name: "Other set",
      sceneIds: [WARM_UP_SCENE_ID],
    });
    const otherStepId = other.items[0]?.id ?? "";
    expect(
      codeOf(() =>
        demoSetVjSetlistItems(FRIDAY_SET_ID, {
          items: [
            { id: otherStepId, kind: "scene", sceneId: WARM_UP_SCENE_ID },
          ],
        }),
      ),
    ).toBe("VJ_SETLIST_ITEM_NOT_FOUND");
  });

  it("a PATCH and a PUT that change something bump updatedAt; a no-op keeps it", () => {
    const seededAt = fridaySet().updatedAt;
    moveClockTo(LATER_NOW);
    demoUpdateVjSetlist(FRIDAY_SET_ID, { isLooping: true });
    expect(fridaySet().updatedAt).toBe(seededAt);

    demoUpdateVjSetlist(FRIDAY_SET_ID, { isLooping: false });
    expect(fridaySet().updatedAt).toBe(new Date(LATER_NOW).toISOString());

    moveClockTo(LATER_NOW + 60_000);
    demoSetVjSetlistItems(FRIDAY_SET_ID, { items: fridayInputs() });
    expect(fridaySet().updatedAt).toBe(new Date(LATER_NOW).toISOString());

    demoSetVjSetlistItems(FRIDAY_SET_ID, {
      items: fridayInputs().slice(1),
    });
    expect(fridaySet().updatedAt).toBe(
      new Date(LATER_NOW + 60_000).toISOString(),
    );
  });

  it("a case-only rename is a change", async () => {
    const changes = await changesDuring(() => {
      demoUpdateVjSetlist(FRIDAY_SET_ID, { name: "Friday Set" });
    });
    expect(fridaySet().name).toBe("Friday Set");
    expect(changes.map((change) => change.kind)).toEqual(["setlist_updated"]);
  });
});
