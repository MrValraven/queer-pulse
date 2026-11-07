import type { VjSetlistItemDTO } from "../../../../shared/contracts/vj";

/** One spot in a set list: the scene it plays and a key that outlives saves. */
export interface VjSetlistSlot {
  key: string;
  sceneId: string;
}

/**
 * One slot per item in order, keyed `sceneId#n` where n counts earlier slots
 * of the same scene. The server makes new item ids on every save of the items
 * (contract 6.2), so keying rows by item id would fold every row out and back
 * in; these keys stay put across a save.
 */
export function vjSetlistSlotsOf(
  items: readonly VjSetlistItemDTO[],
): VjSetlistSlot[] {
  const seenCountBySceneId = new Map<string, number>();
  return items.map((item) => {
    const occurrence = seenCountBySceneId.get(item.sceneId) ?? 0;
    seenCountBySceneId.set(item.sceneId, occurrence + 1);
    return { key: `${item.sceneId}#${occurrence}`, sceneId: item.sceneId };
  });
}

/** The scene ids of the slots in order: the body a save of the items sends. */
export function vjSceneIdsOfSlots(slots: readonly VjSetlistSlot[]): string[] {
  return slots.map((slot) => slot.sceneId);
}
