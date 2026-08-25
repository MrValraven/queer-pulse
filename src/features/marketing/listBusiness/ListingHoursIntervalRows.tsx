import { FiX } from "react-icons/fi";
import { DatePicker } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isOvernight, type HoursInterval } from "./listBusiness.data";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingHoursEditor.module.css";

/**
 * The opening-window controls for one open day: its one or two `from`–`to`
 * pickers, the "closes next day" hint, remove, and the add-a-second-window
 * button.
 *
 * Extracted from `ListingHoursEditor` so the weekly grid and the per-date
 * exceptions editor drive the SAME time controls. Two copies of a time picker
 * would drift on the details that matter here (the overnight hint, the
 * two-window cap, the accessible names), and an owner would meet a different
 * interaction on two rows of the same panel.
 *
 * `rowLabel` is the thing the times belong to (a weekday name in the grid, a
 * date in the exceptions list) and is woven into every control's accessible
 * name, so a screen reader hears "Opens, Tuesday" rather than a page full of
 * identically named time fields.
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

  return (
    <div className={styles.stack}>
      {intervals.map((interval, index) => (
        <div key={index} className={pageStyles.htimes}>
          <DatePicker
            mode="time"
            size="sm"
            label={t("marketing:listBusiness.step3.opensAria", {
              day: rowLabel,
            })}
            value={interval.from || null}
            onChange={(value) => onChangeInterval(index, { from: value ?? "" })}
          />
          <span className={pageStyles.dash}>–</span>
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
          {intervals.length === 2 && (
            <button
              type="button"
              className={styles.remove}
              aria-label={t("marketing:listBusiness.step3.removeHoursAria", {
                day: rowLabel,
              })}
              onClick={() => onRemoveInterval(index)}
            >
              <FiX aria-hidden />
            </button>
          )}
        </div>
      ))}

      {intervals.length < 2 && (
        <button type="button" className={styles.add} onClick={onAddInterval}>
          {t("marketing:listBusiness.step3.addHours")}
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
