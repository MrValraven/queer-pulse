/** Moves `items[from]` to index `to`, leaving every other row's relative
 *  order unchanged. Shared by every overview section editor. */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}
