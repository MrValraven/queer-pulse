import { useState } from "react";

/* Hooks split out of CultureModalKit.tsx so that file only exports components
 * (react-refresh/only-export-components). */

// Consolidated into the shared hooks layer — re-exported here so existing
// consumers keep their imports unchanged. (All call sites invoke `submit()`
// with no args, so the shared `submit(onComplete?, ms)` signature is a drop-in.)
export { useSubmitFlow } from "../../shared/hooks";

/** Small hook for the chip-select Set state. */
export function useChipSet() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (value: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  return { selected, toggle };
}
