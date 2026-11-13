import { beforeEach, describe, expect, it } from "vitest";
import {
  VJ_DEMO_LIBRARY_STORAGE_KEY,
  VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
} from "../vj.constants";
import { VJ_DEMO_EVENT_IDS } from "./vjDemoEvents.data";
import {
  fillVjDemoSequenceFields,
  isVjDemoLibraryV2,
  upgradeVjDemoLibraryV1,
} from "./vjDemoLibraryUpgrade";
import {
  buildVjDemoSeedLibrary,
  commitVjDemoLibrary,
  configureVjDemoStore,
  loadVjDemoLibrary,
  type StoredVjDemoLibrary,
} from "./vjDemoStorePersistence";

const WARM_UP_ID = "00000000-0000-4000-8000-0000000000a1";
const PEAK_HOUR_ID = "00000000-0000-4000-8000-0000000000a2";
const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const WARM_HAZE_ID = "00000000-0000-4000-8000-0000000000c2";
const DISCO_DOTS_ID = "00000000-0000-4000-8000-0000000000c3";
const PINK_TUNNEL_ID = "00000000-0000-4000-8000-0000000000c4";
const WARM_UP_SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const PEAK_SCENE_ID = "00000000-0000-4000-8000-0000000000d2";
const FRIDAY_SET_ID = "00000000-0000-4000-8000-0000000000b1";
const USER_PACK_ID = "00000000-0000-4000-8000-0000000000f1";
const USER_CLIP_ID = "00000000-0000-4000-8000-0000000000f2";
const FIXED_NOW = Date.parse("2026-11-06T20:00:00.000Z");

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

/** The seed library in the v1 shape: clip defaults, event links, scenes and
 *  set lists removed. */
function buildV1Library(): Record<string, unknown> {
  const seed = buildVjDemoSeedLibrary();
  return {
    version: 1,
    packs: seed.packs.map(({ eventId, ...pack }) => {
      void eventId;
      return pack;
    }),
    clips: seed.clips.map(
      ({
        isFavorite,
        defaultSpeed,
        loopInMs,
        loopOutMs,
        loopMode,
        ...clip
      }) => {
        void [isFavorite, defaultSpeed, loopInMs, loopOutMs, loopMode];
        return clip;
      },
    ),
  };
}

function storedLibraryOf(storage: Storage): StoredVjDemoLibrary {
  const text = storage.getItem(VJ_DEMO_LIBRARY_STORAGE_KEY);
  if (text === null) throw new Error("expected a stored v2 library");
  return JSON.parse(text) as StoredVjDemoLibrary;
}

let storage: Storage;

beforeEach(() => {
  storage = createMemoryStorage();
  configureVjDemoStore({ storage, channel: null, now: () => FIXED_NOW });
});

describe("demo library v2 seed", () => {
  it("seeds a v2 library with a favorite, an event link, two scenes and one set list", () => {
    const library = loadVjDemoLibrary();

    expect(library.version).toBe(2);
    const favoriteIds = library.clips
      .filter((clip) => clip.isFavorite)
      .map((clip) => clip.id);
    expect(favoriteIds).toEqual([NEON_GRID_ID]);
    expect(library.packs.find((pack) => pack.id === WARM_UP_ID)?.eventId).toBe(
      VJ_DEMO_EVENT_IDS.supperClub,
    );
    expect(library.scenes.map((scene) => scene.id)).toEqual([
      WARM_UP_SCENE_ID,
      PEAK_SCENE_ID,
    ]);
    expect(library.scenes[0]?.look.source).toEqual({
      kind: "clip",
      clipId: WARM_HAZE_ID,
    });
    expect(library.setlists).toHaveLength(1);
    expect(library.setlists[0]?.id).toBe(FRIDAY_SET_ID);
    expect(library.setlists[0]).toMatchObject({
      isLooping: true,
      stepDuration: { kind: "seconds", value: 8 },
    });
    expect(
      library.setlists[0]?.items.map((item) => [
        item.kind,
        item.sceneId,
        item.clipId,
        item.duration,
      ]),
    ).toEqual([
      ["scene", WARM_UP_SCENE_ID, null, null],
      ["clip", null, PINK_TUNNEL_ID, null],
      ["scene", PEAK_SCENE_ID, null, { kind: "beats", value: 16 }],
      ["clip", null, DISCO_DOTS_ID, null],
    ]);
    expect(isVjDemoLibraryV2(storedLibraryOf(storage))).toBe(true);
  });

  it("gives every seed clip the default speed and loop with no loop points", () => {
    const library = loadVjDemoLibrary();

    for (const clip of library.clips) {
      expect(clip).toMatchObject({
        defaultSpeed: 1,
        loopMode: "loop",
        loopInMs: null,
        loopOutMs: null,
      });
      expect(clip).not.toHaveProperty("previewUrl");
    }
  });
});

describe("demo library v1 upgrade", () => {
  it("upgrades a v1 library under the v1 key, adds clip defaults and the seeds, removes the v1 key", () => {
    storage.setItem(
      VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
      JSON.stringify(buildV1Library()),
    );

    const library = loadVjDemoLibrary();

    expect(library.version).toBe(2);
    expect(
      library.clips.find((clip) => clip.id === NEON_GRID_ID),
    ).toMatchObject({
      isFavorite: true,
      defaultSpeed: 1,
      loopMode: "loop",
      loopInMs: null,
    });
    expect(library.packs.find((pack) => pack.id === WARM_UP_ID)?.eventId).toBe(
      VJ_DEMO_EVENT_IDS.supperClub,
    );
    expect(
      library.packs.find((pack) => pack.id === PEAK_HOUR_ID)?.eventId,
    ).toBe(null);
    expect(library.scenes).toHaveLength(2);
    expect(library.setlists).toHaveLength(1);
    expect(storage.getItem(VJ_DEMO_LIBRARY_V1_STORAGE_KEY)).toBeNull();
    expect(storedLibraryOf(storage)).toEqual(library);
  });

  it("keeps user packs and clips through the upgrade", () => {
    const v1Library = buildV1Library();
    const userClip = {
      ...(v1Library.clips as Record<string, unknown>[])[0],
      id: USER_CLIP_ID,
      title: "Rooftop loop",
    };
    const userPack = {
      ...(v1Library.packs as Record<string, unknown>[])[0],
      id: USER_PACK_ID,
      name: "Late set",
      clipIds: [USER_CLIP_ID],
    };
    storage.setItem(
      VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
      JSON.stringify({
        ...v1Library,
        packs: [...(v1Library.packs as unknown[]), userPack],
        clips: [...(v1Library.clips as unknown[]), userClip],
      }),
    );

    const library = loadVjDemoLibrary();

    expect(
      library.packs.find((pack) => pack.id === USER_PACK_ID),
    ).toMatchObject({
      name: "Late set",
      clipIds: [USER_CLIP_ID],
      eventId: null,
    });
    expect(
      library.clips.find((clip) => clip.id === USER_CLIP_ID),
    ).toMatchObject({
      title: "Rooftop loop",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
      loopInMs: null,
      loopOutMs: null,
    });
  });

  it("clears a seed scene source whose clip the user deleted", () => {
    const v1Library = buildV1Library();
    const clips = (v1Library.clips as Record<string, unknown>[]).filter(
      (clip) => clip.id !== WARM_HAZE_ID,
    );
    const packs = (v1Library.packs as Record<string, unknown>[]).map(
      (pack) => ({
        ...pack,
        clipIds: (pack.clipIds as string[]).filter(
          (clipId) => clipId !== WARM_HAZE_ID,
        ),
      }),
    );
    storage.setItem(
      VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
      JSON.stringify({ ...v1Library, packs, clips }),
    );

    const library = loadVjDemoLibrary();
    const warmUpScene = library.scenes.find(
      (scene) => scene.id === WARM_UP_SCENE_ID,
    );

    expect(warmUpScene?.look.source).toBeNull();
    expect(warmUpScene?.look.effects.settings).toEqual({
      tint: { isOn: true, amount: 0.5, variant: "coral" },
    });
  });

  it("files a seed scene under no pack when the user deleted its pack", () => {
    const v1Library = buildV1Library();
    const packs = (v1Library.packs as Record<string, unknown>[]).filter(
      (pack) => pack.id !== WARM_UP_ID,
    );
    storage.setItem(
      VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
      JSON.stringify({ ...v1Library, packs }),
    );

    const library = loadVjDemoLibrary();

    expect(
      library.scenes.find((scene) => scene.id === WARM_UP_SCENE_ID)?.packId,
    ).toBeNull();
    expect(
      library.scenes.find((scene) => scene.id === PEAK_SCENE_ID)?.packId,
    ).toBe(PEAK_HOUR_ID);
  });

  it("drops a seed clip step whose clip the user deleted and keeps the other step ids", () => {
    const v1Library = buildV1Library();
    const clips = (v1Library.clips as Record<string, unknown>[]).filter(
      (clip) => clip.id !== PINK_TUNNEL_ID,
    );
    storage.setItem(
      VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
      JSON.stringify({ ...v1Library, clips }),
    );

    const items = loadVjDemoLibrary().setlists[0]?.items ?? [];

    expect(items.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000100",
      "00000000-0000-4000-8000-000000000102",
      "00000000-0000-4000-8000-000000000103",
    ]);
    expect(items.map((item) => item.clipId)).not.toContain(PINK_TUNNEL_ID);
  });

  it("answers null for a record that is no v1 library", () => {
    expect(upgradeVjDemoLibraryV1({ version: 2 }, FIXED_NOW)).toBeNull();
    expect(
      upgradeVjDemoLibraryV1({ version: 1, packs: "x", clips: [] }, FIXED_NOW),
    ).toBeNull();
    expect(upgradeVjDemoLibraryV1(null, FIXED_NOW)).toBeNull();
  });
});

describe("demo library v2 load", () => {
  it("a damaged v2 record reseeds", () => {
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, "{ not json");

    const library = loadVjDemoLibrary();

    expect(library).toEqual(buildVjDemoSeedLibrary());
    expect(storedLibraryOf(storage)).toEqual(library);
  });

  it("a v2 record with a broken entry reseeds", () => {
    const broken = {
      ...buildVjDemoSeedLibrary(),
      setlists: [{ id: FRIDAY_SET_ID, name: "Friday set", items: "none" }],
    };
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, JSON.stringify(broken));

    expect(loadVjDemoLibrary()).toEqual(buildVjDemoSeedLibrary());
  });

  it("a v2 record loads as stored", () => {
    const seed = buildVjDemoSeedLibrary();
    const stored: StoredVjDemoLibrary = {
      ...seed,
      packs: seed.packs.map((pack) =>
        pack.id === WARM_UP_ID ? { ...pack, name: "Doors open" } : pack,
      ),
      setlists: [],
    };
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, JSON.stringify(stored));
    storage.setItem(
      VJ_DEMO_LIBRARY_V1_STORAGE_KEY,
      JSON.stringify(buildV1Library()),
    );

    expect(loadVjDemoLibrary()).toEqual(stored);
    expect(storage.getItem(VJ_DEMO_LIBRARY_V1_STORAGE_KEY)).not.toBeNull();
  });

  it("keeps working in memory when storage throws", () => {
    configureVjDemoStore({
      storage: createThrowingStorage(),
      channel: null,
      now: () => FIXED_NOW,
    });

    const first = loadVjDemoLibrary();
    const second = loadVjDemoLibrary();

    expect(first.version).toBe(2);
    expect(second).toEqual(first);
  });
});

/** The seed library as saved before sequences: set lists without Loop or a
 *  default length, items as `{ id, sceneId }`. */
function buildPreSequenceLibrary(): Record<string, unknown> {
  const seed = buildVjDemoSeedLibrary();
  return {
    ...seed,
    setlists: [
      {
        id: FRIDAY_SET_ID,
        name: "Friday set",
        items: [
          {
            id: "00000000-0000-4000-8000-000000000100",
            sceneId: WARM_UP_SCENE_ID,
          },
          {
            id: "00000000-0000-4000-8000-000000000101",
            sceneId: PEAK_SCENE_ID,
          },
        ],
        createdBy: null,
        createdAt: "2026-11-01T20:00:00.000Z",
        updatedAt: "2026-11-01T20:00:00.000Z",
      },
    ],
  };
}

describe("demo library saved before sequences", () => {
  it("loads old items as scene steps on the default length, Loop off and 8 s", () => {
    storage.setItem(
      VJ_DEMO_LIBRARY_STORAGE_KEY,
      JSON.stringify(buildPreSequenceLibrary()),
    );

    const library = loadVjDemoLibrary();

    expect(library.setlists).toHaveLength(1);
    expect(library.setlists[0]).toMatchObject({
      id: FRIDAY_SET_ID,
      name: "Friday set",
      isLooping: false,
      stepDuration: { kind: "seconds", value: 8 },
    });
    expect(library.setlists[0]?.items).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000100",
        kind: "scene",
        sceneId: WARM_UP_SCENE_ID,
        clipId: null,
        duration: null,
      },
      {
        id: "00000000-0000-4000-8000-000000000101",
        kind: "scene",
        sceneId: PEAK_SCENE_ID,
        clipId: null,
        duration: null,
      },
    ]);
    expect(library.packs).toEqual(buildVjDemoSeedLibrary().packs);
  });

  it("writes the filled library back on its next commit", () => {
    storage.setItem(
      VJ_DEMO_LIBRARY_STORAGE_KEY,
      JSON.stringify(buildPreSequenceLibrary()),
    );

    const library = loadVjDemoLibrary();
    commitVjDemoLibrary(library, { kind: "setlists_reordered" });

    const stored = storedLibraryOf(storage);
    expect(stored.setlists[0]?.isLooping).toBe(false);
    expect(stored.setlists[0]?.items[0]?.kind).toBe("scene");
    expect(isVjDemoLibraryV2(stored)).toBe(true);
  });

  it("falls back from a bad Loop, a bad default length and a bad step length", () => {
    const filled = fillVjDemoSequenceFields({
      version: 2,
      setlists: [
        {
          id: FRIDAY_SET_ID,
          isLooping: "yes",
          stepDuration: { kind: "beats", value: 12 },
          items: [
            {
              id: "a",
              kind: "clip",
              sceneId: null,
              clipId: NEON_GRID_ID,
              duration: { kind: "seconds", value: 1 },
            },
            {
              id: "b",
              kind: "scene",
              sceneId: PEAK_SCENE_ID,
              clipId: null,
              duration: { kind: "beats", value: 32 },
            },
          ],
        },
      ],
    }) as { setlists: Record<string, unknown>[] };

    expect(filled.setlists[0]).toMatchObject({
      isLooping: false,
      stepDuration: { kind: "seconds", value: 8 },
      items: [
        { id: "a", kind: "clip", clipId: NEON_GRID_ID, duration: null },
        { id: "b", duration: { kind: "beats", value: 32 } },
      ],
    });
  });

  it("passes a value with no set list array through unchanged", () => {
    expect(fillVjDemoSequenceFields(null)).toBeNull();
    const noSetlists = { version: 2, packs: [] };
    expect(fillVjDemoSequenceFields(noSetlists)).toBe(noSetlists);
  });

  it("drops a step that names both a scene and a clip and keeps the rest of the library", () => {
    const seed = buildVjDemoSeedLibrary();
    const userPack = { ...seed.packs[0], id: USER_PACK_ID, name: "Late set" };
    const stored = {
      ...seed,
      packs: [...seed.packs, userPack],
      setlists: seed.setlists.map((setlist) => ({
        ...setlist,
        items: [
          {
            id: "00000000-0000-4000-8000-000000000100",
            kind: "scene",
            sceneId: WARM_UP_SCENE_ID,
            clipId: NEON_GRID_ID,
            duration: null,
          },
          ...setlist.items.slice(1),
        ],
      })),
    };
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, JSON.stringify(stored));

    const library = loadVjDemoLibrary();

    expect(library.packs.map((pack) => pack.id)).toContain(USER_PACK_ID);
    expect(library.setlists[0]?.items.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000101",
      "00000000-0000-4000-8000-000000000102",
      "00000000-0000-4000-8000-000000000103",
    ]);
  });

  it("drops a step with an unknown kind or no id, and repairs a missing other target and length", () => {
    const filled = fillVjDemoSequenceFields({
      version: 2,
      setlists: [
        {
          id: FRIDAY_SET_ID,
          isLooping: true,
          stepDuration: { kind: "seconds", value: 8 },
          items: [
            { id: "a", kind: "generator", sceneId: null, clipId: null },
            { kind: "clip", sceneId: null, clipId: NEON_GRID_ID },
            "not a step",
            { id: "b", kind: "scene", sceneId: PEAK_SCENE_ID },
            { id: "c", kind: "clip", clipId: NEON_GRID_ID },
          ],
        },
      ],
    }) as { setlists: { items: unknown[] }[] };

    expect(filled.setlists[0]?.items).toEqual([
      {
        id: "b",
        kind: "scene",
        sceneId: PEAK_SCENE_ID,
        clipId: null,
        duration: null,
      },
      {
        id: "c",
        kind: "clip",
        sceneId: null,
        clipId: NEON_GRID_ID,
        duration: null,
      },
    ]);
  });

  it("still reseeds when a set list's own shape is broken", () => {
    const seed = buildVjDemoSeedLibrary();
    const broken = {
      ...seed,
      setlists: seed.setlists.map((setlist) => ({ ...setlist, name: 7 })),
    };
    storage.setItem(VJ_DEMO_LIBRARY_STORAGE_KEY, JSON.stringify(broken));

    expect(loadVjDemoLibrary()).toEqual(buildVjDemoSeedLibrary());
  });
});
