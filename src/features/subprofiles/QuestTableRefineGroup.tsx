import { useId } from "react";
import { ChipSelect } from "../../shared/components/ui";
import { filterPageClassNames } from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TableChipFormat } from "./api/subprofiles.api";
import {
  TABLE_FORMAT_LABEL_KEY,
  TABLE_VIBE_LABEL_KEY,
  TABLE_VIBES,
} from "./questTable.data";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/** Only the two concrete formats are chips; a stored "both" matches either. */
const FORMAT_CHIPS: readonly TableChipFormat[] = ["online", "in_person"];

/**
 * The body of the sidebar's "At the table" section: format and table vibe,
 * drawn from Quest personas' own "At the table" blocks. The sidebar keeps
 * the section folded away until a loaded persona has one, the way profession
 * chips appear only for professions present.
 *
 * The two rows stack under visible sub-headings styled like the Profession
 * section's family headings, since the 280px column holds one chip row
 * across. Formats OR, vibes AND (`matchesTable`); each chip's count is the
 * server's live facet, a chip that reaches 0 dims (`ChipSelect`), and an
 * uncounted chip draws no number and stays pickable.
 */
export function QuestTableRefineGroup({
  directory,
  isCountKnown,
}: {
  directory: SubprofileDirectoryFilters;
  /** False while the fetch is in flight or failed: counts are left off. */
  isCountKnown: boolean;
}) {
  const { t } = useTranslation();
  const formatLabelId = useId();
  const vibeLabelId = useId();
  const {
    tableFormats,
    tableVibes,
    tableFormatCounts,
    tableVibeCounts,
    onToggleTableFormat,
    onToggleTableVibe,
    isShowingPreviousResults,
  } = directory;
  const chipsClassName = isShowingPreviousResults
    ? filterPageClassNames.chipsStale
    : undefined;

  // The badge is aria-hidden, so each chip carries the whole phrase.
  const optionFor = (
    value: string,
    label: string,
    facetCount: number | undefined,
  ) => {
    const count = isCountKnown ? facetCount : undefined;
    return {
      value,
      label,
      count,
      ariaLabel:
        count === undefined
          ? label
          : t("subprofiles:directory.refine.optionWithCount", {
              label,
              count,
            }),
    };
  };

  return (
    <div className={styles.professionGroups}>
      <div className={styles.professionGroup}>
        <p id={formatLabelId} className={styles.professionGroupLabel}>
          {t("subprofiles:directory.refine.tableFormatLabel")}
        </p>
        <ChipSelect
          labelledBy={formatLabelId}
          className={chipsClassName}
          options={FORMAT_CHIPS.map((format) =>
            optionFor(
              format,
              t(TABLE_FORMAT_LABEL_KEY[format]),
              tableFormatCounts?.[format],
            ),
          )}
          selected={new Set<string>(tableFormats)}
          onToggle={onToggleTableFormat}
        />
      </div>
      <div className={styles.professionGroup}>
        <p id={vibeLabelId} className={styles.professionGroupLabel}>
          {t("subprofiles:directory.refine.tableVibeLabel")}
        </p>
        <ChipSelect
          labelledBy={vibeLabelId}
          className={chipsClassName}
          options={TABLE_VIBES.map((vibe) =>
            optionFor(
              vibe,
              t(TABLE_VIBE_LABEL_KEY[vibe]),
              tableVibeCounts?.[vibe],
            ),
          )}
          selected={new Set<string>(tableVibes)}
          onToggle={onToggleTableVibe}
        />
      </div>
    </div>
  );
}
