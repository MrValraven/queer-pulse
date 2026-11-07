import { describe, expect, it } from "vitest";
import type { VjSetlistItemDTO } from "../../../../shared/contracts/vj";
import { vjSceneIdsOfSlots, vjSetlistSlotsOf } from "./vjSetlistSlots";

const itemsOf = (idPrefix: string, sceneIds: string[]): VjSetlistItemDTO[] =>
  sceneIds.map((sceneId, itemIndex) => ({
    id: `${idPrefix}-${itemIndex}`,
    sceneId,
    position: itemIndex,
  }));

describe("vjSetlistSlotsOf", () => {
  it("numbers repeats of one scene", () => {
    const slots = vjSetlistSlotsOf(itemsOf("item", ["a", "b", "a"]));
    expect(slots).toEqual([
      { key: "a#0", sceneId: "a" },
      { key: "b#0", sceneId: "b" },
      { key: "a#1", sceneId: "a" },
    ]);
  });

  it("keeps slot keys when the server returns new item ids", () => {
    const sceneIds = ["a", "b", "a", "c"];
    const beforeSave = vjSetlistSlotsOf(itemsOf("old", sceneIds));
    const afterSave = vjSetlistSlotsOf(itemsOf("new", sceneIds));
    expect(afterSave.map((slot) => slot.key)).toEqual(
      beforeSave.map((slot) => slot.key),
    );
  });

  it("gives an empty list no slots", () => {
    expect(vjSetlistSlotsOf([])).toEqual([]);
  });
});

describe("vjSceneIdsOfSlots", () => {
  it("maps slots back to scene ids in order", () => {
    const slots = vjSetlistSlotsOf(itemsOf("item", ["c", "a", "c", "b"]));
    expect(vjSceneIdsOfSlots(slots)).toEqual(["c", "a", "c", "b"]);
  });
});
