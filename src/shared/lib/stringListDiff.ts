/* ===========================================================
   What changed between two lists of strings.

   Community settings hold several string arrays (`rules`, `tags`,
   `features`, `languages`), and both surfaces that report on them
   currently show the whole list twice: the before, then the after.
   For a community holding a dozen shared values that buries the one
   thing a reader wants, which is what was added. This answers that
   question once, so the edit modal and the governance log cannot
   disagree about it.
   =========================================================== */

/**
 * The difference between a `from` list and a `to` list.
 *
 * `added` and `removed` are always disjoint, and both are empty when the two
 * lists hold the same values the same number of times. In that case
 * `isReordered` says whether they nonetheless differ in order, which a caller
 * needs: the backend's settings diff compares arrays by index, so a pure
 * reorder is a real logged change with nothing added and nothing removed, and
 * a reader who is shown neither would be looking at a blank explanation.
 */
export interface StringListDiff {
  /** Values present in `to` and not in `from`, in the order `to` holds them. */
  added: string[];
  /** Values present in `from` and not in `to`, in the order `from` held them. */
  removed: string[];
  /** Same values throughout, in a different order. Never true alongside a
   *  non-empty `added` or `removed`. */
  isReordered: boolean;
}

/**
 * Count how many times each value occurs, which is what makes the diff
 * count-aware rather than set-based. Dropping one of two identical entries is
 * a removal, and set semantics would call it no change at all. The lists this
 * runs on are deduped upstream, so the two agree in practice, but the
 * governance log reads a jsonb column whose contents are a convention rather
 * than a guarantee.
 */
function countByValue(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/**
 * The values in `values` whose occurrences outnumber their occurrences in
 * `counts`, listed in their original order and repeated by the surplus.
 */
function surplusOver(
  values: readonly string[],
  counts: Map<string, number>,
): string[] {
  const remaining = new Map(counts);
  const surplus: string[] = [];
  for (const value of values) {
    const available = remaining.get(value) ?? 0;
    if (available > 0) {
      remaining.set(value, available - 1);
    } else {
      surplus.push(value);
    }
  }
  return surplus;
}

/** Whether two lists hold the same values in the same positions. */
export function isSameStringList(
  from: readonly string[],
  to: readonly string[],
): boolean {
  return (
    from.length === to.length &&
    from.every((value, index) => value === to[index])
  );
}

/**
 * What moved between two lists of strings.
 *
 * Pure and allocation-light: the lists these run on are capped at 50 entries
 * server-side (`@ArrayMaxSize(50)` on the community DTOs), so this is called
 * freely during render rather than memoized at every call site.
 */
export function diffStringLists(
  from: readonly string[],
  to: readonly string[],
): StringListDiff {
  const added = surplusOver(to, countByValue(from));
  const removed = surplusOver(from, countByValue(to));
  return {
    added,
    removed,
    isReordered:
      added.length === 0 && removed.length === 0 && !isSameStringList(from, to),
  };
}

/**
 * Whether an unknown value is a list of strings.
 *
 * The governance log's `from` and `to` arrive as `unknown` off a jsonb column,
 * so a caller has to narrow before it can diff. Kept beside the diff so the
 * two always agree on what counts as a list.
 */
export function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
