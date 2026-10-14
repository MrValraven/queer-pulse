/**
 * Checks a drag swap against the entries as they are now. The drag engine
 * swaps by index; if the queue moved under the drag (a track ended and the
 * first "Your queue" entry was consumed), the entry at `fromIndex` is no
 * longer the one picked up and the swap is dropped.
 */
export function resolveQueueMove(
  entryIds: readonly string[],
  draggedEntryId: string | null,
  fromIndex: number,
  toIndex: number,
): { fromIndex: number; toIndex: number } | null {
  if (draggedEntryId === null || entryIds[fromIndex] !== draggedEntryId)
    return null;
  if (toIndex < 0 || toIndex >= entryIds.length || toIndex === fromIndex)
    return null;
  return { fromIndex, toIndex };
}

/** The entries' order as one string, to tell when a move or removal landed. */
export function queueOrderKey(
  entries: readonly { queueEntryId: string }[],
): string {
  return entries.map((entry) => entry.queueEntryId).join(" ");
}

/** The player bar's queue button carries this id, so the desktop panel can
 *  hand focus back to it when nothing held focus as it opened (Safari
 *  leaves a clicked button unfocused). */
export const STUDIO_QUEUE_BUTTON_ID = "studio-queue-button";
