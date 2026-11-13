import { describe, expect, it } from "vitest";
import type {
  VjSetlistItemDTO,
  VjStepDuration,
  VjTempo,
} from "../../../../shared/contracts/vj";
import {
  isVjNewSlotKey,
  newVjClipSlot,
  newVjSceneSlot,
  vjAdoptedSlotKeys,
  vjRebasedSlots,
  vjSetlistContentKeyOf,
  vjSetlistItemsBodyOf,
  vjSetlistRunTimeOf,
  vjSetlistSlotsOf,
} from "./vjSetlistSlots";

const EIGHT_SECONDS: VjStepDuration = { kind: "seconds", value: 8 };
const SIXTEEN_BEATS: VjStepDuration = { kind: "beats", value: 16 };
const TEMPO_120: VjTempo = {
  bpm: 120,
  downbeatAt: 0,
  quantize: "off",
  source: "manual",
};

function sceneItem(
  id: string,
  sceneId: string,
  position: number,
  duration: VjStepDuration | null = null,
): VjSetlistItemDTO {
  return { id, position, kind: "scene", sceneId, clipId: null, duration };
}

function clipItem(
  id: string,
  clipId: string,
  position: number,
  duration: VjStepDuration | null = null,
): VjSetlistItemDTO {
  return { id, position, kind: "clip", sceneId: null, clipId, duration };
}

describe("vjSetlistSlotsOf", () => {
  it("keys loaded steps by item id and keeps what each plays", () => {
    const slots = vjSetlistSlotsOf([
      sceneItem("item-1", "scene-a", 0),
      clipItem("item-2", "clip-a", 1, SIXTEEN_BEATS),
    ]);
    expect(slots).toEqual([
      {
        key: "item-1",
        itemId: "item-1",
        kind: "scene",
        sceneId: "scene-a",
        clipId: null,
        duration: null,
      },
      {
        key: "item-2",
        itemId: "item-2",
        kind: "clip",
        sceneId: null,
        clipId: "clip-a",
        duration: SIXTEEN_BEATS,
      },
    ]);
  });

  it("gives a repeated scene one slot per step, each with its own key", () => {
    const slots = vjSetlistSlotsOf([
      sceneItem("item-1", "scene-a", 0),
      sceneItem("item-2", "scene-b", 1),
      sceneItem("item-3", "scene-a", 2),
    ]);
    expect(slots.map((slot) => slot.key)).toEqual([
      "item-1",
      "item-2",
      "item-3",
    ]);
    expect(slots.map((slot) => slot.sceneId)).toEqual([
      "scene-a",
      "scene-b",
      "scene-a",
    ]);
  });

  it("uses a carried key for an item made from a new step", () => {
    const slots = vjSetlistSlotsOf(
      [sceneItem("item-1", "scene-a", 0)],
      new Map([["item-1", "new:abc"]]),
    );
    expect(slots[0]?.key).toBe("new:abc");
    expect(slots[0]?.itemId).toBe("item-1");
  });

  it("gives an empty list no slots", () => {
    expect(vjSetlistSlotsOf([])).toEqual([]);
  });
});

describe("new slots", () => {
  it("make new: keys with no item id on the default length", () => {
    const sceneSlot = newVjSceneSlot("scene-a");
    const clipSlot = newVjClipSlot("clip-a");
    expect(isVjNewSlotKey(sceneSlot.key)).toBe(true);
    expect(isVjNewSlotKey(clipSlot.key)).toBe(true);
    expect(sceneSlot.key).not.toBe(clipSlot.key);
    expect(sceneSlot).toMatchObject({
      itemId: null,
      kind: "scene",
      sceneId: "scene-a",
      clipId: null,
      duration: null,
    });
    expect(clipSlot).toMatchObject({
      itemId: null,
      kind: "clip",
      sceneId: null,
      clipId: "clip-a",
      duration: null,
    });
  });
});

describe("vjSetlistItemsBodyOf", () => {
  it("round trips loaded steps with their ids", () => {
    const items = [
      sceneItem("item-1", "scene-a", 0),
      clipItem("item-2", "clip-a", 1, EIGHT_SECONDS),
      sceneItem("item-3", "scene-a", 2, SIXTEEN_BEATS),
    ];
    expect(vjSetlistItemsBodyOf(vjSetlistSlotsOf(items))).toEqual([
      { id: "item-1", kind: "scene", sceneId: "scene-a", duration: null },
      { id: "item-2", kind: "clip", clipId: "clip-a", duration: EIGHT_SECONDS },
      {
        id: "item-3",
        kind: "scene",
        sceneId: "scene-a",
        duration: SIXTEEN_BEATS,
      },
    ]);
  });

  it("leaves id out entirely for a new step", () => {
    const body = vjSetlistItemsBodyOf([
      ...vjSetlistSlotsOf([sceneItem("item-1", "scene-a", 0)]),
      newVjClipSlot("clip-a"),
      newVjSceneSlot("scene-a"),
    ]);
    expect(body).toHaveLength(3);
    expect(body[0]).toHaveProperty("id", "item-1");
    expect(Object.keys(body[1] ?? {})).not.toContain("id");
    expect(Object.keys(body[2] ?? {})).not.toContain("id");
    expect(body[1]).toEqual({ kind: "clip", clipId: "clip-a", duration: null });
    expect(body[2]).toEqual({
      kind: "scene",
      sceneId: "scene-a",
      duration: null,
    });
  });

  it("keeps the order and ids of a reorder", () => {
    const slots = vjSetlistSlotsOf([
      sceneItem("item-1", "scene-a", 0),
      clipItem("item-2", "clip-a", 1),
    ]);
    const reordered = [slots[1], slots[0]].flatMap((slot) =>
      slot === undefined ? [] : [slot],
    );
    expect(vjSetlistItemsBodyOf(reordered).map((entry) => entry.id)).toEqual([
      "item-2",
      "item-1",
    ]);
  });
});

describe("vjAdoptedSlotKeys", () => {
  it("hands a new step's key to the item the server made for it", () => {
    const loaded = vjSetlistSlotsOf([sceneItem("item-1", "scene-a", 0)]);
    const newSlot = newVjClipSlot("clip-a");
    const answer = [
      sceneItem("item-1", "scene-a", 0),
      clipItem("item-9", "clip-a", 1),
    ];
    const adoptedKeys = vjAdoptedSlotKeys(
      answer,
      [...loaded, newSlot],
      new Map(),
    );
    expect(adoptedKeys.get("item-9")).toBe(newSlot.key);
    expect(adoptedKeys.has("item-1")).toBe(false);
    expect(
      vjSetlistSlotsOf(answer, adoptedKeys).map((slot) => slot.key),
    ).toEqual(["item-1", newSlot.key]);
  });

  it("matches by what a step plays when the lists differ", () => {
    const firstNew = newVjSceneSlot("scene-a");
    const secondNew = newVjSceneSlot("scene-a");
    // Another tab put a clip in front before this answer was read.
    const answer = [
      clipItem("item-7", "clip-x", 0),
      sceneItem("item-8", "scene-a", 1),
      sceneItem("item-9", "scene-a", 2),
    ];
    const adoptedKeys = vjAdoptedSlotKeys(
      answer,
      [firstNew, secondNew],
      new Map(),
    );
    expect(adoptedKeys.get("item-8")).toBe(firstNew.key);
    expect(adoptedKeys.get("item-9")).toBe(secondNew.key);
    expect(adoptedKeys.has("item-7")).toBe(false);
  });

  it("matches the same target and length before the same target", () => {
    const plainNew = newVjSceneSlot("scene-a");
    const longNew = { ...newVjSceneSlot("scene-a"), duration: SIXTEEN_BEATS };
    // Another tab put a clip in front, so the lists differ.
    const answer = [
      clipItem("item-7", "clip-x", 0),
      sceneItem("item-8", "scene-a", 1, SIXTEEN_BEATS),
      sceneItem("item-9", "scene-a", 2),
    ];
    const adoptedKeys = vjAdoptedSlotKeys(
      answer,
      [plainNew, longNew],
      new Map(),
    );
    expect(adoptedKeys.get("item-8")).toBe(longNew.key);
    expect(adoptedKeys.get("item-9")).toBe(plainNew.key);
  });

  it("hands on the key of a shown step that already has its item", () => {
    const newSlot = newVjClipSlot("clip-a");
    const rebasedSlot = { ...newSlot, itemId: "item-5" };
    const adoptedKeys = vjAdoptedSlotKeys(
      [clipItem("item-5", "clip-a", 0, EIGHT_SECONDS)],
      [rebasedSlot],
      new Map(),
    );
    expect(adoptedKeys.get("item-5")).toBe(newSlot.key);
  });

  it("keeps keys carried from an earlier save", () => {
    const adoptedKeys = vjAdoptedSlotKeys(
      [sceneItem("item-1", "scene-a", 0)],
      vjSetlistSlotsOf(
        [sceneItem("item-1", "scene-a", 0)],
        new Map([["item-1", "new:first"]]),
      ),
      new Map([
        ["item-1", "new:first"],
        ["item-gone", "new:old"],
      ]),
    );
    expect(adoptedKeys).toEqual(new Map([["item-1", "new:first"]]));
  });
});

describe("vjRebasedSlots", () => {
  it("gives a new step the item id an earlier answer made for it", () => {
    const loaded = vjSetlistSlotsOf([sceneItem("item-1", "scene-a", 0)]);
    const answeredNew = newVjClipSlot("clip-a");
    const waitingNew = newVjSceneSlot("scene-b");
    const rebased = vjRebasedSlots(
      [...loaded, answeredNew, waitingNew],
      new Map([[answeredNew.key, "item-2"]]),
    );
    expect(rebased.map((slot) => slot.itemId)).toEqual([
      "item-1",
      "item-2",
      null,
    ]);
    expect(rebased.map((slot) => slot.key)).toEqual([
      "item-1",
      answeredNew.key,
      waitingNew.key,
    ]);
    expect(
      vjSetlistItemsBodyOf(rebased).map((entry) => entry.id ?? null),
    ).toEqual(["item-1", "item-2", null]);
  });
});

describe("vjSetlistContentKeyOf", () => {
  it("ignores ids and sees lengths", () => {
    const stored = [sceneItem("item-1", "scene-a", 0)];
    expect(vjSetlistContentKeyOf(stored)).toBe(
      vjSetlistContentKeyOf([newVjSceneSlot("scene-a")]),
    );
    expect(vjSetlistContentKeyOf(stored)).not.toBe(
      vjSetlistContentKeyOf([sceneItem("item-1", "scene-a", 0, EIGHT_SECONDS)]),
    );
  });
});

describe("vjSetlistRunTimeOf", () => {
  it("adds every step in seconds, the default included", () => {
    const slots = vjSetlistSlotsOf([
      sceneItem("item-1", "scene-a", 0),
      clipItem("item-2", "clip-a", 1, { kind: "seconds", value: 60 }),
    ]);
    expect(vjSetlistRunTimeOf(slots, EIGHT_SECONDS, null)).toEqual({
      kind: "exact",
      totalSeconds: 68,
    });
  });

  it("needs the tempo once a step counts beats", () => {
    const slots = vjSetlistSlotsOf([
      sceneItem("item-1", "scene-a", 0),
      clipItem("item-2", "clip-a", 1, SIXTEEN_BEATS),
    ]);
    expect(vjSetlistRunTimeOf(slots, EIGHT_SECONDS, null)).toBeNull();
    // 16 beats at 120 BPM run 8 s, plus the 8 s default.
    expect(vjSetlistRunTimeOf(slots, EIGHT_SECONDS, TEMPO_120)).toEqual({
      kind: "about",
      totalMs: 16_000,
      bpm: 120,
    });
  });

  it("gives an empty sequence no run time", () => {
    expect(vjSetlistRunTimeOf([], EIGHT_SECONDS, TEMPO_120)).toBeNull();
  });
});
