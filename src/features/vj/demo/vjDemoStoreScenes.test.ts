import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  VjLibraryChange,
  VjSceneLook,
} from "../../../shared/contracts/vj";
import type { VjDemoChannel, VjDemoMessage } from "./vjDemoChannel";
import { EMPTY_VJ_SCENE_LOOK } from "./vjDemoSceneLook";
import {
  configureVjDemoStore,
  demoCreateVjScene,
  demoCreateVjSetlist,
  demoDeleteVjScene,
  demoDeleteVjSetlist,
  demoGetVjScenes,
  demoGetVjSetlists,
  demoRenameVjSetlist,
  demoReorderVjScenes,
  demoReorderVjSetlists,
  demoSetVjSetlistItems,
  demoUpdateVjScene,
} from "./vjDemoStore";

const WARM_UP_PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const PEAK_HOUR_PACK_ID = "00000000-0000-4000-8000-0000000000a2";
const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const WARM_HAZE_ID = "00000000-0000-4000-8000-0000000000c2";
const WARM_UP_SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const PEAK_SCENE_ID = "00000000-0000-4000-8000-0000000000d2";
const FRIDAY_SET_ID = "00000000-0000-4000-8000-0000000000b1";
const UNKNOWN_ID = "00000000-0000-4000-8000-0000000000ff";
const FIXED_NOW = Date.parse("2026-11-06T20:00:00.000Z");
const LATER_NOW = FIXED_NOW + 60_000;

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

let posted: VjDemoMessage[] = [];
let currentNow = FIXED_NOW;

const recordingChannel: VjDemoChannel = {
  post: (message) => {
    posted.push(message);
  },
  subscribe: () => () => undefined,
  close: () => undefined,
};

function postedChanges(): VjLibraryChange[] {
  return posted.map((message) => message.payload as VjLibraryChange);
}

function refusalOf(action: () => unknown): ApiError {
  try {
    action();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected a refusal");
}

function bodyOf(action: () => unknown): Record<string, unknown> {
  return refusalOf(action).data as Record<string, unknown>;
}

function codeOf(action: () => unknown): unknown {
  return bodyOf(action).code;
}

function clipLook(clipId: string): VjSceneLook {
  return {
    ...structuredClone(EMPTY_VJ_SCENE_LOOK),
    source: { kind: "clip", clipId },
  };
}

beforeEach(() => {
  posted = [];
  currentNow = FIXED_NOW;
  configureVjDemoStore({
    storage: createMemoryStorage(),
    channel: recordingChannel,
    now: () => currentNow,
  });
  // The first read seeds the empty storage; nothing is posted for it.
  demoGetVjScenes();
  posted = [];
});

describe("demo scene create", () => {
  it("answers each code of the create row in order", () => {
    const look = clipLook(WARM_HAZE_ID);
    expect(codeOf(() => demoCreateVjScene({ name: "  ", look }))).toBe(
      "VJ_SCENE_NAME_REQUIRED",
    );
    expect(
      codeOf(() => demoCreateVjScene({ name: "x".repeat(61), look })),
    ).toBe("VJ_SCENE_NAME_TOO_LONG");
    expect(
      codeOf(() =>
        demoCreateVjScene({ name: "Glow", packId: "pack", look: "bad" }),
      ),
    ).toBe("VJ_PACK_NOT_FOUND");
    const badSpeed = { ...look, effects: { ...look.effects, speed: 3 } };
    expect(
      bodyOf(() =>
        demoCreateVjScene({
          name: "Glow",
          packId: UNKNOWN_ID,
          look: badSpeed,
        }),
      ),
    ).toMatchObject({
      code: "VJ_SCENE_LOOK_INVALID",
      lookField: "effects.speed",
    });
    expect(
      codeOf(() =>
        demoCreateVjScene({
          name: "Glow",
          packId: UNKNOWN_ID,
          look: clipLook(UNKNOWN_ID),
        }),
      ),
    ).toBe("VJ_PACK_NOT_FOUND");
    expect(
      bodyOf(() =>
        demoCreateVjScene({ name: "Glow", look: clipLook(UNKNOWN_ID) }),
      ),
    ).toMatchObject({
      code: "VJ_SCENE_CLIP_NOT_FOUND",
      lookField: "source.clipId",
    });
    const missingMix = {
      ...look,
      mix: { clipId: UNKNOWN_ID, amount: 0.5, blendMode: "screen" },
    };
    expect(
      bodyOf(() => demoCreateVjScene({ name: "Glow", look: missingMix })),
    ).toMatchObject({
      code: "VJ_SCENE_CLIP_NOT_FOUND",
      lookField: "mix.clipId",
    });
    expect(posted).toEqual([]);
  });

  it("answers VJ_SCENE_LIMIT_REACHED at 200 scenes", () => {
    for (let count = demoGetVjScenes().items.length; count < 200; count += 1) {
      demoCreateVjScene({ name: "Take", look: EMPTY_VJ_SCENE_LOOK });
    }
    expect(
      codeOf(() =>
        demoCreateVjScene({ name: "Take", look: EMPTY_VJ_SCENE_LOOK }),
      ),
    ).toBe("VJ_SCENE_LIMIT_REACHED");
  });

  it("appends a scene with a duplicate name, its pack and canonical look", () => {
    const scene = demoCreateVjScene({
      name: " Warm up ",
      packId: WARM_UP_PACK_ID.toUpperCase(),
      look: clipLook(WARM_HAZE_ID.toUpperCase()),
    });
    expect(scene.name).toBe("Warm up");
    expect(scene.packId).toBe(WARM_UP_PACK_ID);
    expect(scene.position).toBe(2);
    expect(scene.setlistItemCount).toBe(0);
    expect(scene.look.source).toEqual({ kind: "clip", clipId: WARM_HAZE_ID });
    expect(postedChanges()).toEqual([
      expect.objectContaining({ kind: "scene_created", sceneId: scene.id }),
    ]);
  });
});

describe("demo scene update", () => {
  it("answers each code of the update row in order", () => {
    expect(codeOf(() => demoUpdateVjScene("scene", { name: "" }))).toBe(
      "VJ_SCENE_NOT_FOUND",
    );
    expect(codeOf(() => demoUpdateVjScene(UNKNOWN_ID, { name: "" }))).toBe(
      "VJ_SCENE_NAME_REQUIRED",
    );
    expect(
      codeOf(() => demoUpdateVjScene(UNKNOWN_ID, { name: "x".repeat(61) })),
    ).toBe("VJ_SCENE_NAME_TOO_LONG");
    expect(
      codeOf(() => demoUpdateVjScene(UNKNOWN_ID, { packId: 7, look: {} })),
    ).toBe("VJ_PACK_NOT_FOUND");
    expect(
      bodyOf(() => demoUpdateVjScene(UNKNOWN_ID, { look: {} })),
    ).toMatchObject({ code: "VJ_SCENE_LOOK_INVALID", lookField: "" });
    expect(
      codeOf(() => demoUpdateVjScene(UNKNOWN_ID, { packId: UNKNOWN_ID })),
    ).toBe("VJ_SCENE_NOT_FOUND");
    expect(
      codeOf(() =>
        demoUpdateVjScene(WARM_UP_SCENE_ID, {
          packId: UNKNOWN_ID,
          look: clipLook(UNKNOWN_ID),
        }),
      ),
    ).toBe("VJ_PACK_NOT_FOUND");
    expect(
      bodyOf(() =>
        demoUpdateVjScene(WARM_UP_SCENE_ID, { look: clipLook(UNKNOWN_ID) }),
      ),
    ).toMatchObject({
      code: "VJ_SCENE_CLIP_NOT_FOUND",
      lookField: "source.clipId",
    });
    expect(posted).toEqual([]);
  });

  it("update replaces the look whole", () => {
    const look = clipLook(NEON_GRID_ID);
    const scene = demoUpdateVjScene(WARM_UP_SCENE_ID, { look });
    expect(scene.look).toEqual(look);
    expect(scene.look.effects.settings).toEqual({});
    expect(scene.name).toBe("Warm up");
    expect(scene.packId).toBe(WARM_UP_PACK_ID);
  });

  it("keeps absent fields, clears the pack with null and bumps updatedAt", () => {
    currentNow = LATER_NOW;
    const scene = demoUpdateVjScene(WARM_UP_SCENE_ID.toUpperCase(), {
      name: "Warm glow",
      packId: null,
    });
    expect(scene.name).toBe("Warm glow");
    expect(scene.packId).toBeNull();
    expect(scene.look.source).toEqual({ kind: "clip", clipId: WARM_HAZE_ID });
    expect(scene.updatedAt).toBe(new Date(LATER_NOW).toISOString());
    expect(postedChanges()).toEqual([
      expect.objectContaining({
        kind: "scene_updated",
        sceneId: WARM_UP_SCENE_ID,
      }),
    ]);
  });

  it("an empty body or one equal to the stored row posts nothing", () => {
    const before = demoGetVjScenes().items[0];
    expect(demoUpdateVjScene(WARM_UP_SCENE_ID, {})).toEqual(before);
    expect(codeOf(() => demoUpdateVjScene(UNKNOWN_ID, {}))).toBe(
      "VJ_SCENE_NOT_FOUND",
    );
    currentNow = LATER_NOW;
    const same = demoUpdateVjScene(WARM_UP_SCENE_ID, {
      name: before?.name,
      packId: before?.packId,
      look: before?.look,
    });
    expect(same.updatedAt).toBe(before?.updatedAt);
    expect(posted).toEqual([]);
  });
});

describe("demo scene reorder and delete", () => {
  it("reorder needs every id once", () => {
    for (const sceneIds of [
      [WARM_UP_SCENE_ID],
      [WARM_UP_SCENE_ID, WARM_UP_SCENE_ID],
      [WARM_UP_SCENE_ID, PEAK_SCENE_ID, UNKNOWN_ID],
      [WARM_UP_SCENE_ID, UNKNOWN_ID],
      "everything",
    ]) {
      expect(codeOf(() => demoReorderVjScenes({ sceneIds }))).toBe(
        "VJ_SCENE_REORDER_MISMATCH",
      );
    }
    expect(posted).toEqual([]);
  });

  it("moves scenes, ignores id case and posts nothing for the same order", () => {
    demoReorderVjScenes({ sceneIds: [WARM_UP_SCENE_ID, PEAK_SCENE_ID] });
    expect(posted).toEqual([]);
    const list = demoReorderVjScenes({
      sceneIds: [PEAK_SCENE_ID.toUpperCase(), WARM_UP_SCENE_ID],
    });
    expect(list.items.map((scene) => [scene.id, scene.position])).toEqual([
      [PEAK_SCENE_ID, 0],
      [WARM_UP_SCENE_ID, 1],
    ]);
    expect(postedChanges()).toEqual([
      expect.objectContaining({ kind: "scenes_reordered", sceneId: null }),
    ]);
  });

  it("deleting a scene removes it from set lists and reports the count", () => {
    const second = demoCreateVjSetlist({
      name: "Saturday set",
      sceneIds: [WARM_UP_SCENE_ID, PEAK_SCENE_ID, WARM_UP_SCENE_ID],
    });
    posted = [];
    expect(demoDeleteVjScene(WARM_UP_SCENE_ID.toUpperCase())).toEqual({
      deletedSceneId: WARM_UP_SCENE_ID,
      removedFromSetlistCount: 3,
    });
    expect(demoGetVjScenes().items.map((scene) => scene.position)).toEqual([0]);
    const setlists = demoGetVjSetlists().items;
    for (const setlist of setlists) {
      expect(
        setlist.items.map((item) => [item.sceneId, item.position]),
      ).toEqual([[PEAK_SCENE_ID, 0]]);
    }
    const expectedSetlistIds = [FRIDAY_SET_ID, second.id].sort();
    expect(postedChanges()).toEqual([
      expect.objectContaining({
        kind: "scene_deleted",
        sceneId: WARM_UP_SCENE_ID,
        setlistIds: expectedSetlistIds,
      }),
    ]);
  });

  it("deleting a scene no set list holds reports zero", () => {
    const scene = demoCreateVjScene({
      name: "Spare",
      look: EMPTY_VJ_SCENE_LOOK,
    });
    posted = [];
    expect(demoDeleteVjScene(scene.id).removedFromSetlistCount).toBe(0);
    expect(postedChanges()[0]?.setlistIds).toEqual([]);
  });

  it("answers VJ_SCENE_NOT_FOUND for a malformed or unknown id", () => {
    expect(bodyOf(() => demoDeleteVjScene("scene"))).toEqual(
      expect.objectContaining({ code: "VJ_SCENE_NOT_FOUND" }),
    );
    expect(bodyOf(() => demoDeleteVjScene(UNKNOWN_ID))).not.toHaveProperty(
      "sceneId",
    );
  });
});

describe("demo set list create and rename", () => {
  it("answers each code of the create row in order", () => {
    expect(codeOf(() => demoCreateVjSetlist({ name: "" }))).toBe(
      "VJ_SETLIST_NAME_REQUIRED",
    );
    expect(codeOf(() => demoCreateVjSetlist({ name: "x".repeat(61) }))).toBe(
      "VJ_SETLIST_NAME_TOO_LONG",
    );
    expect(
      codeOf(() =>
        demoCreateVjSetlist({ name: "Friday set", sceneIds: ["x"] }),
      ),
    ).toBe("VJ_SETLIST_ITEMS_INVALID");
    const tooMany = Array.from({ length: 101 }, () => PEAK_SCENE_ID);
    const fullBody = bodyOf(() =>
      demoCreateVjSetlist({ name: "Friday set", sceneIds: tooMany }),
    );
    expect(fullBody.code).toBe("VJ_SETLIST_FULL");
    expect(fullBody).not.toHaveProperty("setlistId");
    expect(
      bodyOf(() =>
        demoCreateVjSetlist({ name: "Friday set", sceneIds: [UNKNOWN_ID] }),
      ),
    ).toMatchObject({
      code: "VJ_SETLIST_NAME_TAKEN",
      setlistId: FRIDAY_SET_ID,
    });
    expect(
      bodyOf(() =>
        demoCreateVjSetlist({
          name: "Late set",
          sceneIds: [PEAK_SCENE_ID, UNKNOWN_ID],
        }),
      ),
    ).toMatchObject({ code: "VJ_SCENE_NOT_FOUND", sceneId: UNKNOWN_ID });
    expect(posted).toEqual([]);
  });

  it("answers VJ_SETLIST_LIMIT_REACHED at 50 set lists before the name", () => {
    for (let count = 1; count < 50; count += 1) {
      demoCreateVjSetlist({ name: `Set ${count}` });
    }
    expect(codeOf(() => demoCreateVjSetlist({ name: "Friday set" }))).toBe(
      "VJ_SETLIST_LIMIT_REACHED",
    );
  });

  it("set list names clash case-insensitively", () => {
    expect(
      bodyOf(() => demoCreateVjSetlist({ name: " FRIDAY SET " })),
    ).toMatchObject({
      code: "VJ_SETLIST_NAME_TAKEN",
      setlistId: FRIDAY_SET_ID,
    });
    const late = demoCreateVjSetlist({ name: "Late set" });
    expect(late.items).toEqual([]);
    expect(late.position).toBe(1);
    expect(
      bodyOf(() => demoRenameVjSetlist(late.id, { name: "friday Set" })),
    ).toMatchObject({
      code: "VJ_SETLIST_NAME_TAKEN",
      setlistId: FRIDAY_SET_ID,
    });
  });

  it("answers each code of the rename row in order", () => {
    expect(codeOf(() => demoRenameVjSetlist("set", { name: "" }))).toBe(
      "VJ_SETLIST_NOT_FOUND",
    );
    expect(codeOf(() => demoRenameVjSetlist(UNKNOWN_ID, { name: "" }))).toBe(
      "VJ_SETLIST_NAME_REQUIRED",
    );
    expect(
      codeOf(() => demoRenameVjSetlist(UNKNOWN_ID, { name: "x".repeat(61) })),
    ).toBe("VJ_SETLIST_NAME_TOO_LONG");
    expect(
      codeOf(() => demoRenameVjSetlist(UNKNOWN_ID, { name: "Late" })),
    ).toBe("VJ_SETLIST_NOT_FOUND");
  });

  it("the stored name posts nothing and a case-only change renames", () => {
    demoRenameVjSetlist(FRIDAY_SET_ID, { name: " Friday set " });
    expect(posted).toEqual([]);
    currentNow = LATER_NOW;
    const renamed = demoRenameVjSetlist(FRIDAY_SET_ID, { name: "Friday Set" });
    expect(renamed.name).toBe("Friday Set");
    expect(renamed.updatedAt).toBe(new Date(LATER_NOW).toISOString());
    expect(postedChanges()).toEqual([
      expect.objectContaining({
        kind: "setlist_renamed",
        setlistId: FRIDAY_SET_ID,
      }),
    ]);
  });
});

describe("demo set list items, reorder and delete", () => {
  it("a set list holds a scene twice", () => {
    const setlist = demoSetVjSetlistItems(FRIDAY_SET_ID, {
      sceneIds: [PEAK_SCENE_ID, PEAK_SCENE_ID.toUpperCase(), WARM_UP_SCENE_ID],
    });
    expect(setlist.items.map((item) => [item.sceneId, item.position])).toEqual([
      [PEAK_SCENE_ID, 0],
      [PEAK_SCENE_ID, 1],
      [WARM_UP_SCENE_ID, 2],
    ]);
    expect(new Set(setlist.items.map((item) => item.id)).size).toBe(3);
    const counts = demoGetVjScenes().items.map(
      (scene) => scene.setlistItemCount,
    );
    expect(counts).toEqual([1, 2]);
  });

  it("101 items answer VJ_SETLIST_FULL", () => {
    const tooMany = Array.from({ length: 101 }, () => PEAK_SCENE_ID);
    expect(
      bodyOf(() => demoSetVjSetlistItems(FRIDAY_SET_ID, { sceneIds: tooMany })),
    ).toMatchObject({ code: "VJ_SETLIST_FULL", setlistId: FRIDAY_SET_ID });
    const hundred = tooMany.slice(0, 100);
    expect(
      demoSetVjSetlistItems(FRIDAY_SET_ID, { sceneIds: hundred }).items,
    ).toHaveLength(100);
  });

  it("answers each code of the items row in order", () => {
    expect(codeOf(() => demoSetVjSetlistItems("set", { sceneIds: 1 }))).toBe(
      "VJ_SETLIST_NOT_FOUND",
    );
    expect(
      codeOf(() => demoSetVjSetlistItems(UNKNOWN_ID, { sceneIds: 1 })),
    ).toBe("VJ_SETLIST_ITEMS_INVALID");
    expect(
      codeOf(() =>
        demoSetVjSetlistItems(UNKNOWN_ID, { sceneIds: [UNKNOWN_ID] }),
      ),
    ).toBe("VJ_SETLIST_NOT_FOUND");
    expect(
      bodyOf(() =>
        demoSetVjSetlistItems(FRIDAY_SET_ID, {
          sceneIds: [PEAK_SCENE_ID, UNKNOWN_ID],
        }),
      ),
    ).toMatchObject({ code: "VJ_SCENE_NOT_FOUND", sceneId: UNKNOWN_ID });
    expect(posted).toEqual([]);
  });

  it("PUT items writes and posts even when the list is unchanged", () => {
    const before = demoGetVjSetlists().items[0];
    currentNow = LATER_NOW;
    const after = demoSetVjSetlistItems(FRIDAY_SET_ID, {
      sceneIds: [WARM_UP_SCENE_ID, PEAK_SCENE_ID],
    });
    expect(after.items.map((item) => item.id)).not.toEqual(
      before?.items.map((item) => item.id),
    );
    expect(after.updatedAt).toBe(new Date(LATER_NOW).toISOString());
    expect(postedChanges()).toEqual([
      expect.objectContaining({
        kind: "setlist_items_changed",
        setlistId: FRIDAY_SET_ID,
        setlistIds: [FRIDAY_SET_ID],
      }),
    ]);
  });

  it("reorder needs every id once and an unchanged order posts nothing", () => {
    const late = demoCreateVjSetlist({ name: "Late set" });
    posted = [];
    expect(
      codeOf(() => demoReorderVjSetlists({ setlistIds: [late.id, late.id] })),
    ).toBe("VJ_SETLIST_REORDER_MISMATCH");
    demoReorderVjSetlists({ setlistIds: [FRIDAY_SET_ID, late.id] });
    expect(posted).toEqual([]);
    const list = demoReorderVjSetlists({
      setlistIds: [late.id.toUpperCase(), FRIDAY_SET_ID],
    });
    expect(list.items.map((setlist) => setlist.id)).toEqual([
      late.id,
      FRIDAY_SET_ID,
    ]);
    expect(postedChanges()).toEqual([
      expect.objectContaining({ kind: "setlists_reordered", setlistId: null }),
    ]);
  });

  it("delete closes the positions up and keeps the scenes", () => {
    const late = demoCreateVjSetlist({ name: "Late set" });
    posted = [];
    expect(codeOf(() => demoDeleteVjSetlist("set"))).toBe(
      "VJ_SETLIST_NOT_FOUND",
    );
    expect(demoDeleteVjSetlist(FRIDAY_SET_ID.toUpperCase())).toEqual({
      deletedSetlistId: FRIDAY_SET_ID,
    });
    expect(demoGetVjSetlists().items).toEqual([
      expect.objectContaining({ id: late.id, position: 0 }),
    ]);
    expect(demoGetVjScenes().items).toHaveLength(2);
    expect(postedChanges()).toEqual([
      expect.objectContaining({
        kind: "setlist_deleted",
        setlistId: FRIDAY_SET_ID,
        setlistIds: [FRIDAY_SET_ID],
      }),
    ]);
  });
});

describe("demo scene and set list library changes", () => {
  it("each write posts its library change kind", () => {
    const scene = demoCreateVjScene({
      name: "Glow",
      packId: PEAK_HOUR_PACK_ID,
      look: clipLook(WARM_HAZE_ID),
    });
    demoUpdateVjScene(scene.id, { name: "Glow two" });
    demoReorderVjScenes({
      sceneIds: [scene.id, WARM_UP_SCENE_ID, PEAK_SCENE_ID],
    });
    const setlist = demoCreateVjSetlist({
      name: "Late set",
      sceneIds: [scene.id],
    });
    demoRenameVjSetlist(setlist.id, { name: "Later set" });
    demoSetVjSetlistItems(setlist.id, { sceneIds: [scene.id, scene.id] });
    demoReorderVjSetlists({ setlistIds: [setlist.id, FRIDAY_SET_ID] });
    demoDeleteVjScene(scene.id);
    demoDeleteVjSetlist(setlist.id);
    expect(posted.every((message) => message.name === "library:changed")).toBe(
      true,
    );
    expect(
      postedChanges().map((change) => [
        change.kind,
        change.sceneId,
        change.setlistId,
        change.setlistIds,
      ]),
    ).toEqual([
      ["scene_created", scene.id, null, []],
      ["scene_updated", scene.id, null, []],
      ["scenes_reordered", null, null, []],
      ["setlist_created", null, setlist.id, []],
      ["setlist_renamed", null, setlist.id, []],
      ["setlist_items_changed", null, setlist.id, [setlist.id]],
      ["setlists_reordered", null, null, []],
      ["scene_deleted", scene.id, null, [setlist.id]],
      ["setlist_deleted", null, setlist.id, [setlist.id]],
    ]);
    for (const change of postedChanges()) {
      expect(change).toMatchObject({
        packId: null,
        clipId: null,
        packIds: [],
        eventId: null,
      });
    }
  });
});
