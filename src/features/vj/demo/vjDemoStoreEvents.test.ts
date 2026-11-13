import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { VjLibraryChange } from "../../../shared/contracts/vj";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { VJ_DEMO_LIBRARY_STORAGE_KEY } from "../vj.constants";
import { createVjDemoChannelHub, type VjDemoMessage } from "./vjDemoChannel";
import {
  configureVjDemoStore,
  demoCreateVjClip,
  demoDeleteVjClip,
  demoGetVjClips,
  demoGetVjClipsMedia,
  demoGetVjPackEvent,
  demoGetVjPacks,
  demoGetVjUpcomingEvents,
  demoSetVjClipPreview,
  demoSetVjPackEvent,
  demoUpdateVjClip,
  resetVjDemoLibrary,
  vjDemoLibraryLookup,
} from "./vjDemoStore";
import { loadVjDemoLibrary } from "./vjDemoStorePersistence";

const WARM_UP_ID = "00000000-0000-4000-8000-0000000000a1";
const PEAK_HOUR_ID = "00000000-0000-4000-8000-0000000000a2";
const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const WARM_HAZE_ID = "00000000-0000-4000-8000-0000000000c2";
const DISCO_DOTS_ID = "00000000-0000-4000-8000-0000000000c3";
const PINK_TUNNEL_ID = "00000000-0000-4000-8000-0000000000c4";
const WARM_UP_SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const PEAK_SCENE_ID = "00000000-0000-4000-8000-0000000000d2";
const FRIDAY_SET_ID = "00000000-0000-4000-8000-0000000000b1";
const SUPPER_CLUB_ID = "00000000-0000-4000-8000-00000000ee01";
const PORTFOLIO_NIGHT_ID = "00000000-0000-4000-8000-00000000ee02";
const HISTORY_WALK_ID = "00000000-0000-4000-8000-00000000ee03";
const UNKNOWN_ID = "00000000-0000-4000-8000-0000000000ff";
const FIXED_NOW = Date.parse("2026-11-06T20:00:00.000Z");
const HOUR_MS = 3_600_000;

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

function codeOf(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    if (error instanceof ApiError) {
      return (error.data as Record<string, unknown>).code;
    }
    throw error;
  }
  throw new Error("expected a refusal");
}

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

let storage: Storage;
let received: VjDemoMessage[];

/** The library changes posted since the last call. */
async function takeChanges(): Promise<VjLibraryChange[]> {
  await flushMicrotasks();
  const changes = received.map((message) => message.payload as VjLibraryChange);
  received = [];
  return changes;
}

/** A video clip of ten seconds, outside every pack. */
function createVideoClip(): string {
  return demoCreateVjClip({
    title: "Night drive",
    mediaUrl: "blob:demo-video",
    thumbnailUrl: "blob:demo-thumbnail",
    mimeType: "video/mp4",
    byteSize: 4096,
    width: 640,
    height: 360,
    durationMs: 10_000,
    fitMode: "fill",
    packId: null,
  }).id;
}

beforeEach(async () => {
  const hub = createVjDemoChannelHub();
  storage = createMemoryStorage();
  configureVjDemoStore({
    storage,
    channel: hub.open(),
    now: () => FIXED_NOW,
  });
  resetVjDemoLibrary();
  received = [];
  hub.open().subscribe((message) => received.push(message));
  await takeChanges();
});

describe("vjDemoStoreEvents", () => {
  it("upcoming lists three events in start order", () => {
    const items = demoGetVjUpcomingEvents().items;
    expect(items.map((item) => item.id)).toEqual([
      SUPPER_CLUB_ID,
      PORTFOLIO_NIGHT_ID,
      HISTORY_WALK_ID,
    ]);
    expect(items[0]).toEqual({
      id: SUPPER_CLUB_ID,
      title: "Queer Supper Club №12",
      startAt: new Date(FIXED_NOW + 2 * HOUR_MS).toISOString(),
      endAt: new Date(FIXED_NOW + 5 * HOUR_MS).toISOString(),
      area: "Mouraria",
      isOnline: false,
    });
  });

  it("linking a pack sets its event summary and posts pack_event_changed", async () => {
    const linked = demoSetVjPackEvent(PEAK_HOUR_ID, {
      eventId: PORTFOLIO_NIGHT_ID.toUpperCase(),
    });
    expect(linked.event).toEqual({
      id: PORTFOLIO_NIGHT_ID,
      title: "Portfolio Night: Designers & Photographers",
      startAt: new Date(FIXED_NOW + 24 * HOUR_MS).toISOString(),
      isAvailable: true,
    });
    expect(linked.updatedAt).toBe(new Date(FIXED_NOW).toISOString());
    expect(await takeChanges()).toEqual([
      {
        kind: "pack_event_changed",
        packId: PEAK_HOUR_ID,
        clipId: null,
        packIds: [],
        sceneId: null,
        setlistId: null,
        setlistIds: [],
        eventId: PORTFOLIO_NIGHT_ID,
      },
    ]);
    expect(vjDemoLibraryLookup.readPackForStage(PEAK_HOUR_ID)).toEqual({
      eventId: PORTFOLIO_NIGHT_ID,
    });
  });

  it("the same link again and an unlinked pack set to null post nothing", async () => {
    demoSetVjPackEvent(WARM_UP_ID, { eventId: SUPPER_CLUB_ID });
    demoSetVjPackEvent(PEAK_HOUR_ID, { eventId: null });
    expect(await takeChanges()).toEqual([]);
    const unlinked = demoSetVjPackEvent(WARM_UP_ID, { eventId: null });
    expect(unlinked.event).toBeNull();
    const changes = await takeChanges();
    expect(changes.map((change) => [change.kind, change.eventId])).toEqual([
      ["pack_event_changed", null],
    ]);
  });

  it("an unknown event id answers VJ_EVENT_NOT_FOUND and a malformed pack id VJ_PACK_NOT_FOUND first", () => {
    expect(
      codeOf(() => demoSetVjPackEvent(WARM_UP_ID, { eventId: UNKNOWN_ID })),
    ).toBe("VJ_EVENT_NOT_FOUND");
    expect(
      codeOf(() => demoSetVjPackEvent(WARM_UP_ID, { eventId: undefined })),
    ).toBe("VJ_EVENT_NOT_FOUND");
    expect(
      codeOf(() => demoSetVjPackEvent("pack-1", { eventId: "event-1" })),
    ).toBe("VJ_PACK_NOT_FOUND");
    expect(
      codeOf(() => demoSetVjPackEvent(UNKNOWN_ID, { eventId: "event-1" })),
    ).toBe("VJ_EVENT_NOT_FOUND");
    expect(
      codeOf(() => demoSetVjPackEvent(UNKNOWN_ID, { eventId: UNKNOWN_ID })),
    ).toBe("VJ_PACK_NOT_FOUND");
    expect(codeOf(() => demoGetVjPackEvent("pack-1"))).toBe(
      "VJ_PACK_NOT_FOUND",
    );
  });

  it("the card carries the public URL built from the slug", () => {
    expect(demoGetVjPackEvent(WARM_UP_ID)).toEqual({
      packId: WARM_UP_ID,
      card: {
        eventId: SUPPER_CLUB_ID,
        title: "Queer Supper Club №12",
        startAt: new Date(FIXED_NOW + 2 * HOUR_MS).toISOString(),
        endAt: new Date(FIXED_NOW + 5 * HOUR_MS).toISOString(),
        timezone: "Europe/Lisbon",
        area: "Mouraria",
        isOnline: false,
        publicUrl: `${window.location.origin}${gatheringPath("supper-club-12")}`,
      },
      unavailableReason: null,
    });
    expect(demoGetVjPackEvent(PEAK_HOUR_ID)).toEqual({
      packId: PEAK_HOUR_ID,
      card: null,
      unavailableReason: null,
    });
  });
});

describe("vjDemoStoreClips updates", () => {
  it("favorite alone posts clip_favorite_changed; loop and speed post clip_defaults_changed; a title posts clip_updated; an equal body posts nothing", async () => {
    const videoClipId = createVideoClip();
    await takeChanges();

    expect(
      demoUpdateVjClip(WARM_HAZE_ID, { isFavorite: true }).isFavorite,
    ).toBe(true);
    const updated = demoUpdateVjClip(videoClipId, {
      isFavorite: true,
      defaultSpeed: 2,
      loopInMs: 1000,
      loopOutMs: 4000,
      loopMode: "pingPong",
    });
    expect(updated).toMatchObject({
      defaultSpeed: 2,
      loopInMs: 1000,
      loopOutMs: 4000,
      loopMode: "pingPong",
    });
    demoUpdateVjClip(WARM_HAZE_ID, { title: "Warmer haze", isFavorite: false });
    demoUpdateVjClip(NEON_GRID_ID, { title: "Neon grid", isFavorite: true });
    demoUpdateVjClip(videoClipId, { loopInMs: 1000, defaultSpeed: 2 });
    demoUpdateVjClip(NEON_GRID_ID, {});

    const changes = await takeChanges();
    expect(changes.map((change) => change.kind)).toEqual([
      "clip_favorite_changed",
      "clip_defaults_changed",
      "clip_updated",
    ]);
    expect(changes[0]).toMatchObject({
      clipId: WARM_HAZE_ID,
      packIds: [WARM_UP_ID, "00000000-0000-4000-8000-0000000000a3"],
    });
    expect(changes[1]).toMatchObject({ clipId: videoClipId, packIds: [] });
  });

  it("a GIF loop point answers VJ_CLIP_LOOP_INVALID", async () => {
    expect(
      codeOf(() => demoUpdateVjClip(NEON_GRID_ID, { loopInMs: 100 })),
    ).toBe("VJ_CLIP_LOOP_INVALID");
    expect(
      codeOf(() => demoUpdateVjClip(NEON_GRID_ID, { loopOutMs: -1 })),
    ).toBe("VJ_CLIP_LOOP_INVALID");
    const videoClipId = createVideoClip();
    expect(
      codeOf(() =>
        demoUpdateVjClip(videoClipId, { loopInMs: 1000, loopOutMs: 1100 }),
      ),
    ).toBe("VJ_CLIP_LOOP_INVALID");
    demoUpdateVjClip(videoClipId, { loopInMs: 1000, loopOutMs: 4000 });
    expect(
      codeOf(() => demoUpdateVjClip(videoClipId, { loopOutMs: 1100 })),
    ).toBe("VJ_CLIP_LOOP_INVALID");
    await takeChanges();
    expect(
      demoUpdateVjClip(NEON_GRID_ID, { loopInMs: null, loopOutMs: null }),
    ).toMatchObject({ loopInMs: null, loopOutMs: null });
    expect(await takeChanges()).toEqual([]);
  });

  it("checks the body in contract order before reading the clip", () => {
    expect(
      codeOf(() => demoUpdateVjClip("clip-1", { title: " ", isFavorite: 1 })),
    ).toBe("VJ_CLIP_NOT_FOUND");
    expect(
      codeOf(() => demoUpdateVjClip(UNKNOWN_ID, { title: " ", isFavorite: 1 })),
    ).toBe("VJ_CLIP_TITLE_REQUIRED");
    expect(
      codeOf(() =>
        demoUpdateVjClip(UNKNOWN_ID, { fitMode: "stretch", isFavorite: 1 }),
      ),
    ).toBe("VJ_CLIP_FIT_MODE_INVALID");
    expect(
      codeOf(() =>
        demoUpdateVjClip(UNKNOWN_ID, { isFavorite: 1, defaultSpeed: 3 }),
      ),
    ).toBe("VJ_CLIP_FAVORITE_INVALID");
    expect(
      codeOf(() =>
        demoUpdateVjClip(UNKNOWN_ID, { defaultSpeed: 3, loopMode: "bounce" }),
      ),
    ).toBe("VJ_CLIP_SPEED_INVALID");
    expect(
      codeOf(() =>
        demoUpdateVjClip(UNKNOWN_ID, { loopMode: "bounce", loopInMs: 1.5 }),
      ),
    ).toBe("VJ_CLIP_LOOP_MODE_INVALID");
    expect(codeOf(() => demoUpdateVjClip(UNKNOWN_ID, { loopInMs: 1.5 }))).toBe(
      "VJ_CLIP_LOOP_INVALID",
    );
    expect(codeOf(() => demoUpdateVjClip(UNKNOWN_ID, { loopInMs: 5 }))).toBe(
      "VJ_CLIP_NOT_FOUND",
    );
  });
});

describe("vjDemoStoreClips deletes, previews and media", () => {
  it("deleting a clip rewrites the scenes that name it", async () => {
    const library = loadVjDemoLibrary();
    const peakScene = library.scenes.find(
      (scene) => scene.id === PEAK_SCENE_ID,
    );
    if (peakScene === undefined) throw new Error("seed scene missing");
    peakScene.look.mix = {
      clipId: WARM_HAZE_ID,
      amount: 0.5,
      blendMode: "screen",
    };
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, JSON.stringify(library));

    expect(demoDeleteVjClip(WARM_HAZE_ID)).toEqual({
      deletedClipId: WARM_HAZE_ID,
      removedFromPackCount: 2,
      removedFromSetlistCount: 0,
    });
    const warmUpLook = vjDemoLibraryLookup.readSceneLook(WARM_UP_SCENE_ID);
    expect(warmUpLook?.source).toBeNull();
    const peakLook = vjDemoLibraryLookup.readSceneLook(PEAK_SCENE_ID);
    expect(peakLook?.mix).toEqual({
      clipId: null,
      amount: 0,
      blendMode: "screen",
    });
    expect(peakLook?.source).toEqual({
      kind: "generator",
      generatorId: "prideFlagWave",
      generatorVariant: "rainbow",
    });
    const changes = await takeChanges();
    expect(changes.map((change) => change.kind)).toEqual(["clip_deleted"]);
  });

  it("deleting a clip a step plays drops the step and names the set list", async () => {
    expect(demoDeleteVjClip(PINK_TUNNEL_ID)).toMatchObject({
      deletedClipId: PINK_TUNNEL_ID,
      removedFromSetlistCount: 1,
    });
    expect(
      vjDemoLibraryLookup.readSetlistFollow(FRIDAY_SET_ID)?.itemIds,
    ).toHaveLength(3);
    const changes = await takeChanges();
    expect(changes).toEqual([
      expect.objectContaining({
        kind: "clip_deleted",
        clipId: PINK_TUNNEL_ID,
        setlistIds: [FRIDAY_SET_ID],
      }),
    ]);
  });

  it("a preview shows its URL and posts clip_preview_changed", async () => {
    const previewed = demoSetVjClipPreview(NEON_GRID_ID, {
      previewUrl: "blob:preview-one",
    });
    expect(previewed.previewUrl).toBe("blob:preview-one");
    expect(
      demoGetVjClips().items.find((clip) => clip.id === NEON_GRID_ID)
        ?.previewUrl,
    ).toBe("blob:preview-one");
    demoSetVjClipPreview(NEON_GRID_ID, { previewUrl: "blob:preview-one" });
    const changes = await takeChanges();
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      kind: "clip_preview_changed",
      clipId: NEON_GRID_ID,
      packIds: [WARM_UP_ID, PEAK_HOUR_ID],
    });
    expect(
      codeOf(() =>
        demoSetVjClipPreview(UNKNOWN_ID, { previewUrl: "blob:preview-two" }),
      ),
    ).toBe("VJ_CLIP_NOT_FOUND");
    demoDeleteVjClip(NEON_GRID_ID);
    resetVjDemoLibrary();
    expect(
      demoGetVjClips().items.find((clip) => clip.id === NEON_GRID_ID)
        ?.previewUrl,
    ).toBeNull();
  });

  it("clips media keeps the query order and leaves unknown ids out", () => {
    const media = demoGetVjClipsMedia([
      DISCO_DOTS_ID,
      UNKNOWN_ID,
      NEON_GRID_ID.toUpperCase(),
      DISCO_DOTS_ID,
    ]);
    expect(media.items.map((item) => item.clipId)).toEqual([
      DISCO_DOTS_ID,
      NEON_GRID_ID,
    ]);
    expect(media.items[0]).toEqual({
      clipId: DISCO_DOTS_ID,
      url: "/vj-demo/disco-dots.gif",
      expiresAt: new Date(FIXED_NOW + 900_000).toISOString(),
      mimeType: "image/gif",
      byteSize: media.items[0]?.byteSize,
    });
    expect(codeOf(() => demoGetVjClipsMedia([]))).toBe("VJ_CLIP_IDS_INVALID");
    expect(codeOf(() => demoGetVjClipsMedia(["clip-1"]))).toBe(
      "VJ_CLIP_IDS_INVALID",
    );
    expect(
      codeOf(() =>
        demoGetVjClipsMedia(new Array<string>(201).fill(NEON_GRID_ID)),
      ),
    ).toBe("VJ_CLIP_IDS_INVALID");
  });
});

describe("vjDemoLibraryLookup", () => {
  it("the lookup answers readPackForStage, readPackClipForAdvance, readSetlist and readSetlistFollow", () => {
    expect(vjDemoLibraryLookup.readPackForStage(WARM_UP_ID)).toEqual({
      eventId: SUPPER_CLUB_ID,
    });
    expect(vjDemoLibraryLookup.readPackForStage(PEAK_HOUR_ID)).toEqual({
      eventId: null,
    });
    expect(vjDemoLibraryLookup.readPackForStage(UNKNOWN_ID)).toBeNull();
    expect(vjDemoLibraryLookup.readPackForStage("pack-1")).toBeNull();

    expect(
      vjDemoLibraryLookup.readPackClipForAdvance(WARM_UP_ID, NEON_GRID_ID),
    ).toEqual({ isFavorite: true });
    expect(
      vjDemoLibraryLookup.readPackClipForAdvance(WARM_UP_ID, WARM_HAZE_ID),
    ).toEqual({ isFavorite: false });
    expect(
      vjDemoLibraryLookup.readPackClipForAdvance(WARM_UP_ID, DISCO_DOTS_ID),
    ).toBeNull();

    const atIndex = (index: number, wrapsToFirst = false) =>
      vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID, {
        kind: "index",
        index,
        wrapsToFirst,
      });
    const firstStep = atIndex(0);
    expect(firstStep).toMatchObject({
      setlistId: FRIDAY_SET_ID,
      isLooping: true,
      stepDuration: { kind: "seconds", value: 8 },
    });
    expect(firstStep?.itemIds).toHaveLength(4);
    expect(firstStep?.step).toMatchObject({
      kind: "scene",
      index: 0,
      sceneId: WARM_UP_SCENE_ID,
      duration: { kind: "seconds", value: 8 },
    });
    expect(
      firstStep?.step?.kind === "scene" ? firstStep.step.look.source : null,
    ).toEqual({ kind: "clip", clipId: WARM_HAZE_ID });
    expect(atIndex(1)?.step).toMatchObject({
      kind: "clip",
      index: 1,
      clipId: PINK_TUNNEL_ID,
    });
    expect(atIndex(2)?.step).toMatchObject({
      kind: "scene",
      sceneId: PEAK_SCENE_ID,
      duration: { kind: "beats", value: 16 },
    });
    expect(atIndex(4)?.step).toBeNull();
    expect(atIndex(4, true)?.step).toMatchObject({ index: 0 });
    expect(
      vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID, { kind: "count" })?.step,
    ).toBeNull();
    expect(
      vjDemoLibraryLookup.readSetlist(FRIDAY_SET_ID, { kind: "last" })?.step,
    ).toMatchObject({ kind: "clip", index: 3, clipId: DISCO_DOTS_ID });
    expect(
      vjDemoLibraryLookup.readSetlist(UNKNOWN_ID, { kind: "count" }),
    ).toBeNull();
    expect(vjDemoLibraryLookup.readSetlistFollow(FRIDAY_SET_ID)).toEqual({
      itemIds: firstStep?.itemIds,
      isLooping: true,
    });
    expect(vjDemoLibraryLookup.readSetlistFollow(UNKNOWN_ID)).toBeNull();
  });

  it("answers existence reads with lowercased ids", () => {
    expect(
      vjDemoLibraryLookup.existingClipIds([
        NEON_GRID_ID.toUpperCase(),
        UNKNOWN_ID,
        "clip-1",
      ]),
    ).toEqual(new Set([NEON_GRID_ID]));
    expect(
      vjDemoLibraryLookup.clipIdsInPack(PEAK_HOUR_ID, [
        NEON_GRID_ID,
        WARM_HAZE_ID,
      ]),
    ).toEqual(new Set([NEON_GRID_ID]));
    expect(vjDemoLibraryLookup.hasPack(WARM_UP_ID.toUpperCase())).toBe(true);
    expect(vjDemoLibraryLookup.hasClip(UNKNOWN_ID)).toBe(false);
    expect(vjDemoLibraryLookup.isClipInPack(WARM_UP_ID, WARM_HAZE_ID)).toBe(
      true,
    );
    expect(demoGetVjPacks().items).toHaveLength(3);
  });
});
