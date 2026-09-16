import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs` — the standard
 * debounce for search-as-you-type, so a query only fans out to the network once
 * the member pauses instead of on every keystroke. The timer resets on each
 * change and is cleared on unmount; an empty/whitespace-only value can be passed
 * straight through by the caller if it wants to short-circuit before debouncing.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * True whenever `liveValue` (the freshest, un-debounced value) differs from
 * `debouncedValue` (what `useDebouncedValue` currently returns for the same
 * value): the gap right after a change, before the next debounce round has
 * settled. A caller with a "no results" empty state driven off the debounced
 * value can use this to treat that gap as still-pending instead of flashing
 * the empty copy against fresh input the debounce hasn't even started
 * evaluating yet (DES-185).
 *
 * This is a plain comparison rather than a hook itself, and
 * `useDebouncedValue`'s own return shape above stays exactly as it was:
 * every existing call site keeps working unchanged, and a caller only
 * reaches for this when it wants the extra signal.
 */
export function isDebounceSettling<T>(
  liveValue: T,
  debouncedValue: T,
): boolean {
  return liveValue !== debouncedValue;
}
