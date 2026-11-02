import { useId } from "react";
import { Collapse, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LocalSort } from "./localPlaces";
import { useLocalSortOptions } from "./useLocalSortOptions";
import styles from "./DirectoryLayout.module.css";

/**
 * The desktop sort, on the row above the results beside the Filters toggle,
 * in the members directory's shape: an uppercase label and a small select.
 * With "use my location" on, the default option reads "Nearest first" and the
 * other two sorts carry a line under the controls saying what the position
 * does for them (see `useLocalSortOptions`). The control has no box of its
 * own: the label and select join the row as one item, and the note takes a
 * full line of the row under the count and the controls, end-aligned and in
 * the near-me note's type, so the two notes read as a pair.
 */
export function DirectorySortControl({
  sort,
  onSortChange,
  isLocationOn,
}: {
  sort: LocalSort;
  onSortChange: (next: string) => void;
  isLocationOn: boolean;
}) {
  const { t } = useTranslation();
  const sortLabelId = useId();
  const { options, note } = useLocalSortOptions(sort, isLocationOn);
  return (
    <>
      <div className={styles.sortRow}>
        <span id={sortLabelId} className={styles.sortLabel}>
          {t("marketing:directory.sort.label")}
        </span>
        <Select
          size="sm"
          labelledBy={sortLabelId}
          options={options}
          value={sort}
          onChange={(value) => onSortChange(value ?? "default")}
        />
      </div>
      <Collapse isOpen={note !== undefined} className={styles.sortNoteSlot}>
        <p className={styles.sortNote}>
          <span>{note}</span>
        </p>
      </Collapse>
    </>
  );
}
