import { useState } from "react";

/** Set-backed selection state for `<ChipSelect>`. Split out of ChipSelect.tsx
 * so that file only exports components (react-refresh/only-export-components). */
export function useChipSet(initial: readonly string[] = []) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initial));
  const toggle = (value: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  return { selected, toggle, setSelected };
}
