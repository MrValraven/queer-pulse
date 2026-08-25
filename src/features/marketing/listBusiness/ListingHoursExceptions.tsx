import { useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  MAX_HOURS_EXCEPTIONS,
  hoursExceptionProblem,
  todayDateString,
} from "./listBusiness.data";
import { ListingHoursExceptionRow } from "./ListingHoursExceptionRow";
import type { ListingForm } from "./useListingForm";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingHoursExceptions.module.css";

/**
 * Dated overrides of the weekly grid: closed on Christmas Eve, open late for
 * Pride, shut for two weeks in August.
 *
 * The rules the backend enforces are mirrored here per row (a real calendar
 * date, no two rows on one date, an open date needing at least one sound
 * window) so an owner reads the problem beside the field instead of collecting
 * a 400 when they press save. Nothing is ever removed automatically: a date
 * that has passed is marked as past and left alone until the owner clears it,
 * one row at a time or all at once.
 */
export function ListingHoursExceptions({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft } = form;
  const entries = useMemo(
    () => draft.hoursExceptions ?? [],
    [draft.hoursExceptions],
  );
  const today = todayDateString();
  const pastCount = entries.filter(
    (entry) => entry.date && entry.date < today,
  ).length;
  const isAtCap = entries.length >= MAX_HOURS_EXCEPTIONS;

  return (
    <div id={ANCHOR.hoursExceptions} className={styles.block}>
      <h3 className={pageStyles.groupH}>
        {t("marketing:listBusiness.hoursExceptions.heading")}
      </h3>
      <p className={styles.hint}>
        {t("marketing:listBusiness.hoursExceptions.hint")}
      </p>

      {entries.length === 0 ? (
        <p className={styles.empty}>
          {t("marketing:listBusiness.hoursExceptions.empty")}
        </p>
      ) : (
        <ul className={styles.list}>
          {entries.map((entry, index) => (
            <ListingHoursExceptionRow
              key={index}
              entry={entry}
              problem={hoursExceptionProblem(entry, index, entries)}
              isPast={Boolean(entry.date) && entry.date < today}
              handlers={{
                onChangeDate: (date) => form.setHoursExceptionDate(index, date),
                onChangeOpen: (open) => form.setHoursExceptionOpen(index, open),
                onChangeNote: (note) => form.setHoursExceptionNote(index, note),
                onChangeInterval: (intervalIndex, patch) =>
                  form.setHoursExceptionInterval(index, intervalIndex, patch),
                onAddInterval: () => form.addHoursExceptionInterval(index),
                onRemoveInterval: (intervalIndex) =>
                  form.removeHoursExceptionInterval(index, intervalIndex),
                onRemove: () => form.removeHoursException(index),
              }}
            />
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.add}
          disabled={isAtCap}
          onClick={form.addHoursException}
        >
          <FiPlus aria-hidden />{" "}
          {t("marketing:listBusiness.hoursExceptions.addCta")}
        </button>
        {pastCount > 0 && (
          <button
            type="button"
            className={styles.clearPast}
            onClick={() => form.removePastHoursExceptions(today)}
          >
            {t("marketing:listBusiness.hoursExceptions.clearPastCta", {
              count: pastCount,
            })}
          </button>
        )}
        <span className={styles.count} aria-live="polite">
          {t("marketing:listBusiness.hoursExceptions.count", {
            used: entries.length,
            max: MAX_HOURS_EXCEPTIONS,
          })}
        </span>
      </div>
      {isAtCap && (
        <p role="status" className={styles.problem}>
          {t("marketing:listBusiness.hoursExceptions.capReached", {
            max: MAX_HOURS_EXCEPTIONS,
          })}
        </p>
      )}
    </div>
  );
}
