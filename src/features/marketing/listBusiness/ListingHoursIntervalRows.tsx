import { FiPlus, FiX } from "react-icons/fi";
import { DatePicker, Tooltip } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isOvernight, type HoursInterval } from "./listBusiness.data";
import styles from "./ListingHoursEditor.module.css";

/**
 * The opening-window controls for one open day, one line per window (at most
 * two, stacked 8px apart): the `from` picker, an en dash, the `to` picker, the
 * "next day" chip when the window runs past midnight, and one trailing
 * 32px action slot. With one window that slot holds a round add button (a
 * second window models a lunch break); with two, each line holds its own
 * remove button in the very same box, so the add and remove icons swap in
 * place. The inline validity nudge sits under the lines.
 *
 * On a narrow card (container queries in the stylesheet) a two-window day
 * hides the round removes and shows a labelled "Remove second window" button
 * under its last line, which is rendered here always and hidden in the wide
 * layout. A one-window weekly-grid row lifts its add button to the day's
 * header line; a one-window exception row keeps it on the window line, or
 * under the times when the line is full.
 *
 * Extracted from `ListingHoursEditor` so the weekly grid and the per-date
 * exceptions editor drive the SAME time controls. Two copies of a time picker
 * would drift on the details that matter here (the overnight hint, the
 * two-window cap, the accessible names), and an owner would meet a different
 * interaction on two rows of the same panel.
 *
 * `rowLabel` is the thing the times belong to (a weekday name in the grid, a
 * date in the exceptions list) and is woven into every control's accessible
 * name, so a screen reader hears "Tuesday opens" and can tell every time
 * field on the page apart.
 */
export function ListingHoursIntervalRows({
  intervals,
  rowLabel,
  isInvalid,
  onChangeInterval,
  onAddInterval,
  onRemoveInterval,
}: {
  intervals: HoursInterval[];
  rowLabel: string;
  /** True when this row's windows break a rule (overlap, zero length, a
   *  missing time). Renders the shared inline nudge under the controls. */
  isInvalid: boolean;
  onChangeInterval: (index: number, patch: Partial<HoursInterval>) => void;
  onAddInterval: () => void;
  onRemoveInterval: (index: number) => void;
}) {
  const { t } = useTranslation();
  const hasTwoWindows = intervals.length === 2;

  return (
    <div
      className={[styles.stack, hasTwoWindows && styles.stackPaired]
        .filter(Boolean)
        .join(" ")}
    >
      {intervals.map((interval, index) => (
        <div key={index} className={styles.window}>
          <div className={styles.windowTimes}>
            <DatePicker
              mode="time"
              size="sm"
              label={t("marketing:listBusiness.step3.opensAria", {
                day: rowLabel,
              })}
              value={interval.from || null}
              onChange={(value) =>
                onChangeInterval(index, { from: value ?? "" })
              }
            />
            <span className={styles.dash} aria-hidden>
              –
            </span>
            <DatePicker
              mode="time"
              size="sm"
              label={t("marketing:listBusiness.step3.closesAria", {
                day: rowLabel,
              })}
              value={interval.to || null}
              onChange={(value) => onChangeInterval(index, { to: value ?? "" })}
            />
            {isOvernight(interval) && interval.from && interval.to && (
              <span className={styles.nextDay}>
                {t("marketing:listBusiness.step3.nextDay")}
              </span>
            )}
          </div>

          <span className={styles.windowActionSlot}>
            {hasTwoWindows ? (
              <button
                type="button"
                className={styles.windowAction}
                aria-label={t(
                  index === 0
                    ? "marketing:listBusiness.step3.removeFirstHoursAria"
                    : "marketing:listBusiness.step3.removeHoursAria",
                  { day: rowLabel },
                )}
                onClick={() => onRemoveInterval(index)}
              >
                <FiX aria-hidden />
              </button>
            ) : (
              <Tooltip
                label={t("marketing:listBusiness.step3.addHoursTip")}
                placement="top"
              >
                <button
                  type="button"
                  className={styles.windowAction}
                  aria-label={t("marketing:listBusiness.step3.addHoursAria", {
                    day: rowLabel,
                  })}
                  onClick={onAddInterval}
                >
                  <FiPlus aria-hidden />
                </button>
              </Tooltip>
            )}
          </span>
        </div>
      ))}

      {hasTwoWindows && (
        <button
          type="button"
          className={styles.removeSecondWindow}
          aria-label={t("marketing:listBusiness.step3.removeHoursAria", {
            day: rowLabel,
          })}
          onClick={() => onRemoveInterval(1)}
        >
          <FiX aria-hidden />
          {t("marketing:listBusiness.step3.removeSecondWindow")}
        </button>
      )}

      {isInvalid && (
        <p role="status" className={styles.warn}>
          {t("marketing:listBusiness.step3.hoursWarning")}
        </p>
      )}
    </div>
  );
}
