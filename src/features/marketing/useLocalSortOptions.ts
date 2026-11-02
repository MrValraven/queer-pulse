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

/** The sort options with their labels, and the note the current sort
 *  carries, shared by the drawer's sort band and the desktop sort control
 *  above the results.
 *
 *  The sort and "use my location" both stay in force together (see
 *  `useDirectoryFilterResults`); the control's job is to say so. With a
 *  position known, the curated default IS the distance order, so it renames
 *  itself "Nearest first" to match the order the list now has, and the two
 *  sorts that survive alongside distance carry a line explaining what the
 *  position is doing for them. */
export function useLocalSortOptions(sort: LocalSort, isLocationOn: boolean) {
  const { t } = useTranslation();
  const noteKey = isLocationOn ? LOCATION_NOTE_KEYS[sort] : undefined;
  const options = SORT_OPTIONS.map((option) => ({
    value: option,
    label:
      option === "default" && isLocationOn
        ? t("marketing:directory.sort.nearest")
        : t(`marketing:directory.sort.${option}`),
  }));
  return { options, note: noteKey ? t(noteKey) : undefined };
}
