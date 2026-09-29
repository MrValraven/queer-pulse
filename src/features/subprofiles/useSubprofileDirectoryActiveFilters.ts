import { useMemo } from "react";
import type { ActiveFilter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  TABLE_FORMAT_LABEL_KEY,
  TABLE_VIBE_LABEL_KEY,
} from "./questTable.data";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";

/**
 * Everything currently narrowing the persona grid, as removable chips.
 *
 * Every refinement is here, the search term included, because the point of
 * moving the controls into a "Refine" drawer is that a shut drawer hides the
 * controls without hiding their state. The directory has no sort, so unlike
 * `/communities` this list is narrowings only.
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
    openToCollabs,
    setOpenToCollabs,
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
    if (openToCollabs) {
      list.push({
        key: "collabs",
        label: t("subprofiles:directory.openToCollabsChip"),
        onRemove: () => setOpenToCollabs(false),
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
        label: `"${query.trim()}"`,
        onRemove: () => setQuery(""),
      });
    }

    return list;
  }, [
    kinds,
    activeTags,
    openToCollabs,
    tableFormats,
    tableVibes,
    query,
    t,
    setKinds,
    setActiveTags,
    setOpenToCollabs,
    setTableFormats,
    setTableVibes,
    setQuery,
  ]);
}
