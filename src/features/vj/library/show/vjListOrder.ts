/**
 * Items in the local id order. An item the local order does not know yet
 * (created in another tab mid-drag) goes last; an id whose item left is
 * dropped. Each item is the fresh server object, so a rename shows at once.
 * A null local order is the server order as given.
 */
export function orderVjItemsByIds<Item>(
  items: readonly Item[],
  localIds: readonly string[] | null,
  idOf: (item: Item) => string,
): Item[] {
  if (localIds === null) return [...items];
  const itemById = new Map(items.map((item) => [idOf(item), item]));
  const placedIds = new Set(localIds);
  const placed = localIds.flatMap((itemId) => {
    const item = itemById.get(itemId);
    return item === undefined ? [] : [item];
  });
  return [...placed, ...items.filter((item) => !placedIds.has(idOf(item)))];
}

/** One string per order, so two orders compare with `===`. Ids are uuids, so
 *  the separator never appears inside one. */
export function vjOrderKeyOf(ids: readonly string[]): string {
  return ids.join("|");
}
