import { Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { dayHoursValid, type DayDef, type DayHours } from "./listBusiness.data";
import { ListingHoursIntervalRows } from "./ListingHoursIntervalRows";
import type { ListingForm } from "./useListingForm";
import styles from "./ListingHoursEditor.module.css";

/**
 * One weekday of the opening-hours card: a two-column row with the open switch
 * and the day name on the left (one <label>, so the name toggles the switch
 * too), and the day's time windows (or a quiet "Closed") on the right.
 *
 * The day cell is as tall as one time picker, so the switch and the name centre
 * on the FIRST window line and stay put when a second window is added below
 * it. The "Closed" label takes that same height, so switching a day off never
 * makes the row jump. Rows are subgrids of the card's one grid, so times and
 * actions line up down the whole week. On a narrow card (a container query in
 * the stylesheet, since the card's width follows the editor layout around it)
 * the row becomes a header line with the switch, the name and a one-window
 * day's add button, the window lines run full width beneath it, and a
 * two-window day gets a labelled "Remove second window" under its lines.
 */
export function ListingHoursDayRow({
  day,
  dayHours,
  form,
}: {
  day: DayDef;
  dayHours: DayHours;
  form: ListingForm;
}) {
  const { t } = useTranslation();
  const { setDayOpen, setInterval, addInterval, removeInterval } = form;
  const dayLabel = t(day.labelKey);
  const isOpen = dayHours.open;

  return (
    <div
      className={[styles.dayRow, !isOpen && styles.dayRowClosed]
        .filter(Boolean)
        .join(" ")}
    >
      {/* A label, so a click on the day name flips the switch too. The
          switch keeps its own "Open on {day}" name. */}
      <label className={styles.dayCell}>
        <Toggle
          checked={isOpen}
          onChange={(isChecked) => setDayOpen(day.id, isChecked)}
          label={t("marketing:listBusiness.step3.dayOpenAria", {
            day: dayLabel,
          })}
        />
        <span className={styles.dayName}>{dayLabel}</span>
      </label>

      {isOpen ? (
        <ListingHoursIntervalRows
          intervals={dayHours.intervals}
          rowLabel={dayLabel}
          isInvalid={!dayHoursValid(dayHours)}
          onChangeInterval={(index, patch) => setInterval(day.id, index, patch)}
          onAddInterval={() => addInterval(day.id)}
          onRemoveInterval={(index) => removeInterval(day.id, index)}
        />
      ) : (
        <span className={styles.closedLabel}>
          {t("marketing:listBusiness.step3.closed")}
        </span>
      )}
    </div>
  );
}
