import { useId } from "react";
import {
  ChipSelect,
  RefineGroup,
  RefineSplit,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TableFormat } from "./api/subprofiles.api";
import {
  TABLE_FORMAT_LABEL_KEY,
  TABLE_VIBE_LABEL_KEY,
  TABLE_VIBES,
} from "./questTable.data";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/** Only the two concrete formats are chips; a stored "both" matches either. */
const FORMAT_CHIPS: readonly TableFormat[] = ["online", "in_person"];

/**
 * The Refine drawer's "At the table" band: format and table vibe, drawn from
 * Quest personas' own "At the table" blocks. Hidden until a loaded persona
 * has one, the way profession chips appear only for professions present.
 *
 * The two rows sit under visible sub-headings styled like the Profession
 * band's family headings, and share one `RefineSplit`: the two-chip format row
 * takes the capped first column and the longer vibe row the rest, stacking on
 * narrow screens. Formats OR, vibes AND (`matchesTable`); each chip's count is
 * a live facet, and a chip that reaches 0 dims (`ChipSelect`).
 */
export function QuestTableRefineGroup({
  directory,
}: {
  directory: SubprofileDirectoryFilters;
}) {
  const { t } = useTranslation();
  const formatLabelId = useId();
  const vibeLabelId = useId();
  const {
    hasTableData,
    tableFormats,
    tableVibes,
    tableFormatCounts,
    tableVibeCounts,
    onToggleTableFormat,
    onToggleTableVibe,
  } = directory;
  if (!hasTableData) return null;

  // The badge is aria-hidden, so each chip carries the whole phrase.
  const optionFor = (value: string, label: string, count: number) => ({
    value,
    label,
    count,
    ariaLabel: t("subprofiles:directory.refine.optionWithCount", {
      label,
      count,
    }),
  });

  return (
    <RefineGroup label={t("subprofiles:directory.refine.tableLabel")}>
      <RefineSplit>
        <div className={styles.professionGroup}>
          <p id={formatLabelId} className={styles.professionGroupLabel}>
            {t("subprofiles:directory.refine.tableFormatLabel")}
          </p>
          <ChipSelect
            labelledBy={formatLabelId}
            options={FORMAT_CHIPS.map((format) =>
              optionFor(
                format,
                t(TABLE_FORMAT_LABEL_KEY[format]),
                tableFormatCounts[format],
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
            options={TABLE_VIBES.map((vibe) =>
              optionFor(
                vibe,
                t(TABLE_VIBE_LABEL_KEY[vibe]),
                tableVibeCounts[vibe],
              ),
            )}
            selected={new Set<string>(tableVibes)}
            onToggle={onToggleTableVibe}
          />
        </div>
      </RefineSplit>
    </RefineGroup>
  );
}
