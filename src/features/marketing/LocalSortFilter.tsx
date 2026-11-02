import { useId } from "react";
import {
  Collapse,
  RefineGroup,
  RefineNote,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LocalSort } from "./localPlaces";
import { useLocalSortOptions } from "./useLocalSortOptions";

/**
 * How the results are ordered, as a band of the mobile Filters sheet and of
 * the full screen map's "Refine" drawer. On the desktop page the same control
 * sits above the results (`DirectorySortControl`).
 */
export function LocalSortFilter({
  sort,
  onSortChange,
  isLocationOn,
}: {
  sort: LocalSort;
  onSortChange: (next: string) => void;
  /** Whether "use my location" is on, which changes what some sorts mean. */
  isLocationOn: boolean;
}) {
  const { t } = useTranslation();
  const sortLabelId = useId();
  const { options, note } = useLocalSortOptions(sort, isLocationOn);

  return (
    <RefineGroup
      label={t("marketing:directory.sort.label")}
      labelId={sortLabelId}
    >
      <Select
        size="sm"
        labelledBy={sortLabelId}
        options={options}
        value={sort}
        onChange={(value) => onSortChange(value ?? "default")}
      />
      <Collapse isOpen={note !== undefined}>
        <RefineNote>{note}</RefineNote>
      </Collapse>
    </RefineGroup>
  );
}
