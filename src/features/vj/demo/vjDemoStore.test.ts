import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { VjLibraryChange } from "../../../shared/contracts/vj";
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
  demoDeleteVjClip,
  demoDeleteVjPack,
  demoGetVjClips,
  demoGetVjPackClips,
  demoGetVjPackMedia,
  demoGetVjPacks,
  demoRemoveVjPackClip,
  demoReorderVjPacks,
  resetVjDemoLibrary,
  vjDemoLibraryLookup,
  type VjDemoClipUpload,
} from "./vjDemoStore";

const WARM_UP_ID = "00000000-0000-4000-8000-0000000000a1";
const PEAK_HOUR_ID = "00000000-0000-4000-8000-0000000000a2";
const CLOSING_ID = "00000000-0000-4000-8000-0000000000a3";
const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const DISCO_DOTS_ID = "00000000-0000-4000-8000-0000000000c3";
const STATIC_BLOOM_ID = "00000000-0000-4000-8000-0000000000c8";
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
    });
    expect(changes[2]).toEqual({
      kind: "clip_deleted",
      packId: null,
      clipId: NEON_GRID_ID,
      packIds: [WARM_UP_ID, PEAK_HOUR_ID],
    });
  });
});
