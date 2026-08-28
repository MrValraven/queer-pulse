import { useId } from "react";
import { RefineGroup, RefineNote, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LocalSort } from "./localPlaces";

const SORT_OPTIONS: LocalSort[] = ["default", "name", "hood"];

/** What each sort does differently once a position is known, said in one line
 *  under the control. "default" needs none: its own label becomes "Nearest
 *  first", which is already the whole story. */
const LOCATION_NOTE_KEYS: Partial<Record<LocalSort, string>> = {
  name: "marketing:local.filter.sortNoteName",
  hood: "marketing:local.filter.sortNoteHood",
};

/**
 * How the results are ordered.
 *
 * Sorting is a refinement, so the control lives inside the "Refine" drawer with
 * the filters rather than out on the results header — that header is then free
 * to do one thing, which is say what was found.
 *
 * The sort and "use my location" both stay in force together (see
 * `useDirectoryFilterResults`); this control's job is to say so. With a
 * position known, the curated default IS the distance order, so it renames
 * itself "Nearest first" instead of claiming an order the list no longer has,
 * and the two sorts that survive alongside distance carry a line explaining
 * what the position is doing for them.
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
  const noteKey = isLocationOn ? LOCATION_NOTE_KEYS[sort] : undefined;

  const optionLabel = (option: LocalSort) =>
    option === "default" && isLocationOn
      ? t("marketing:directory.sort.nearest")
      : t(`marketing:directory.sort.${option}`);

  return (
    <RefineGroup
      label={t("marketing:directory.sort.label")}
      labelId={sortLabelId}
    >
      <Select
        size="sm"
        labelledBy={sortLabelId}
        options={SORT_OPTIONS.map((option) => ({
          value: option,
          label: optionLabel(option),
        }))}
        value={sort}
        onChange={(value) => onSortChange(value ?? "default")}
      />
      {noteKey && <RefineNote>{t(noteKey)}</RefineNote>}
    </RefineGroup>
  );
}
