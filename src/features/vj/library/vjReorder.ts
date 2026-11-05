/**
 * Moves `items[from]` to index `to`; every other item keeps its relative
 * order. Always a new array: an index outside the list gives an unchanged
 * copy, so a caller can treat the answer as the next state either way.
 */
export function moveVjItem<Item>(
  items: readonly Item[],
  from: number,
  to: number,
): Item[] {
  const next = [...items];
  const isInRange = (index: number) =>
    Number.isInteger(index) && index >= 0 && index < items.length;
  if (!isInRange(from) || !isInRange(to) || from === to) return next;
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return [...items];
  next.splice(to, 0, moved);
  return next;
}
