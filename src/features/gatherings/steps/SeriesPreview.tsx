import type { ReactNode } from "react";
import { FiArrowRight, FiRepeat } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gatheringOccurrences } from "../gatheringOccurrences";
import type { GatheringForm } from "../useGatheringForm";
import {
  holidayNameKeyFor,
  SERIES_DAY_FORMAT,
  SERIES_WEEKDAY_COUNT_KEYS,
} from "./dateNotes.data";
import styles from "./WhenWhereChapter.module.css";

/** The range arrow in "4 Sep → 23 Oct": an icon for the eye, the word from
 *  the catalog for a screen reader. */
function RangeArrow({ children }: { children?: ReactNode }) {
  return (
    <>
      {" "}
      <FiArrowRight className={styles.seriesArrow} aria-hidden />
      <span className="visuallyHidden">{children}</span>{" "}
    </>
  );
}

/**
 * The series a repeat rule produces, read back before publishing: one summary
 * line ("8 Thursdays · 4 Sep → 23 Oct") and the dates themselves, each with the
 * public holiday it lands on.
 *
 * READ-ONLY on purpose (ruling R2): `RecurrenceDto` cannot express a skipped
 * date, so a per-date skip would publish anyway. A host cancels one date after
 * publishing instead. The dates come from `gatheringOccurrences`, which mirrors
 * the backend's own series builder.
 */
export function SeriesPreview({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const occurrences = gatheringOccurrences(form);
  const firstOccurrence = occurrences[0];
  const lastOccurrence = occurrences[occurrences.length - 1];

  if (!firstOccurrence || !lastOccurrence) {
    return (
      <p className={styles.seriesSummary}>
        <FiRepeat className={styles.seriesSummaryIcon} aria-hidden />
        {t("gatherings:create.v2.when.series.empty")}
      </p>
    );
  }
  // A rule that is not complete yet reads back as its first date alone. The
  // end field's own error says what to fix, so no series is drawn for it.
  if (occurrences.length < 2) return null;

  const datesText =
    form.cadence === "monthly"
      ? t("gatherings:create.v2.when.series.dates", {
          count: occurrences.length,
        })
      : t(SERIES_WEEKDAY_COUNT_KEYS[firstOccurrence.getDay()] ?? "", {
          count: occurrences.length,
        });

  return (
    <>
      <p className={styles.seriesSummary}>
        <FiRepeat className={styles.seriesSummaryIcon} aria-hidden />
        <span>
          <Translation
            i18nKey="gatherings:create.v2.when.series.summary"
            values={{
              dates: datesText,
              first: fmt.date(firstOccurrence, SERIES_DAY_FORMAT),
              last: fmt.date(lastOccurrence, SERIES_DAY_FORMAT),
            }}
            components={{ strong: <strong />, arrow: <RangeArrow /> }}
          />
        </span>
      </p>
      <ol
        className={styles.seriesList}
        aria-label={t("gatherings:create.v2.when.series.listLabel")}
      >
        {occurrences.map((occurrence, index) => {
          const holidayKey = holidayNameKeyFor(occurrence);
          return (
            <li key={occurrence.getTime()} className={styles.seriesRow}>
              <span className={styles.seriesIndex} aria-hidden>
                {index + 1}
              </span>
              <span className={styles.seriesDate}>
                {fmt.date(occurrence, SERIES_DAY_FORMAT)}
              </span>
              {holidayKey && (
                <span className={styles.seriesHoliday}>{t(holidayKey)}</span>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
