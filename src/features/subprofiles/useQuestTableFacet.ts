import { useState } from "react";
import type { TableChipFormat, TableVibe } from "./api/subprofiles.api";

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

/** The Refine drawer's "At the table" selection, kept out of
 *  `useSubprofileDirectoryFilters` so that hook only composes it. Format chips
 *  are an OR facet and vibe chips an AND facet (`matchesTable`). */
export function useQuestTableFacet() {
  const [tableFormats, setTableFormats] = useState<TableChipFormat[]>([]);
  const [tableVibes, setTableVibes] = useState<TableVibe[]>([]);
  return {
    tableFormats,
    setTableFormats,
    tableVibes,
    setTableVibes,
    onToggleTableFormat: (format: string) =>
      setTableFormats((current) =>
        toggleIn(current, format as TableChipFormat),
      ),
    onToggleTableVibe: (vibe: string) =>
      setTableVibes((current) => toggleIn(current, vibe as TableVibe)),
    hasTableSelection: tableFormats.length > 0 || tableVibes.length > 0,
    clearTable: () => {
      setTableFormats([]);
      setTableVibes([]);
    },
  };
}
