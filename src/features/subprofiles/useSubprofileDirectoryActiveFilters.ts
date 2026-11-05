import { useMemo } from "react";
import type { ActiveFilter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  TABLE_FORMAT_LABEL_KEY,
  TABLE_VIBE_LABEL_KEY,
} from "./questTable.data";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { DIRECTORY_AVAILABILITY_LABEL_KEY } from "./subprofileDirectoryAvailability.data";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";

/**
 * Everything currently narrowing the persona grid, as removable chips.
 *
 * Every refinement is here, the search term included (key `q`, labelled
 * "Search: {term}"), so a folded sidebar hides the controls while their state
 * stays on screen. The Filters badge does not read this list's length: it
 * reads `sidebarActiveCount` on the filters hook, which leaves the search
 * term out. The sort is an order, so this list is narrowings only.
 */
export function useSubprofileDirectoryActiveFilters(
  directory: SubprofileDirectoryFilters,
): ActiveFilter[] {
  const { t } = useTranslation();
  const {
    kinds,
    setKinds,
    activeTags,
    setActiveTags,
    availability,
    setAvailability,
    tableFormats,
    setTableFormats,
    tableVibes,
    setTableVibes,
    query,
    setQuery,
  } = directory;

  return useMemo(() => {
    const list: ActiveFilter[] = [];

    kinds.forEach((kind) => {
      list.push({
        key: `kind:${kind}`,
        label: t(KIND_LABEL_KEYS[kind]),
        onRemove: () =>
          setKinds((current) => current.filter((entry) => entry !== kind)),
      });
    });
    if (availability !== null) {
      list.push({
        key: `availability:${availability}`,
        label: t(DIRECTORY_AVAILABILITY_LABEL_KEY[availability]),
        onRemove: () => setAvailability(null),
      });
    }
    tableFormats.forEach((format) => {
      list.push({
        key: `table-format:${format}`,
        label: t(TABLE_FORMAT_LABEL_KEY[format]),
        onRemove: () =>
          setTableFormats((current) =>
            current.filter((entry) => entry !== format),
          ),
      });
    });
    tableVibes.forEach((vibe) => {
      list.push({
        key: `table-vibe:${vibe}`,
        label: t(TABLE_VIBE_LABEL_KEY[vibe]),
        onRemove: () =>
          setTableVibes((current) => current.filter((entry) => entry !== vibe)),
      });
    });
    activeTags.forEach((tag) => {
      list.push({
        key: `tag:${tag}`,
        label: tag,
        onRemove: () =>
          setActiveTags((current) => current.filter((entry) => entry !== tag)),
      });
    });
    if (query.trim()) {
      list.push({
        key: "q",
        label: t("subprofiles:directory.searchChip", { term: query.trim() }),
        onRemove: () => setQuery(""),
      });
    }

    return list;
  }, [
    kinds,
    activeTags,
    availability,
    tableFormats,
    tableVibes,
    query,
    t,
    setKinds,
    setActiveTags,
    setAvailability,
    setTableFormats,
    setTableVibes,
    setQuery,
  ]);
}
