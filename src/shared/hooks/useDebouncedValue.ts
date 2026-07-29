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
