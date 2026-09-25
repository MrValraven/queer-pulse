import { FiCopy, FiSlash } from "react-icons/fi";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, DAYS } from "./listBusiness.data";
import { ListingHoursDayRow } from "./ListingHoursDayRow";
import type { ListingForm } from "./useListingForm";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingHoursEditor.module.css";

/**
 * Opening-hours editor (item #6). A short hint and two quiet bulk actions
 * ("Copy Monday to all days", "Mark all closed") sit above one card that lists
 * the week, a `ListingHoursDayRow` per day separated by hairlines. Each day is
 * switched on or off, and an open day runs across one or two windows: a second
 * window models a lunch break, and a window whose `to <= from` runs overnight
 * (a late bar).
 *
 * Pure UI on top of the form's hours setters, so it is dual-mode safe (no data
 * fetch). Rendered as a fragment so the surrounding `.stepBody` keeps the same
 * direct children (and staggered entrance) it had when this block was inline
 * in the practical step.
 */
export function ListingHoursEditor({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, copyMonToAll, clearHours, set } = form;

  return (
    <>
      <h3 className={pageStyles.groupH}>
        {t("marketing:listBusiness.step3.hoursHeading")}
      </h3>
      <div className={pageStyles.hoursSection}>
        {/* Its own anchor for the live preview: `ANCHOR.hours` stays on the
            day card, so a "still needed" chip keeps landing on the days. */}
        <div id={ANCHOR.hoursTools} className={styles.tools}>
          <p className={styles.hint}>
            {t("marketing:listBusiness.step3.hoursHint")}
          </p>
          <div className={styles.toolActions}>
            <button
              type="button"
              className={styles.toolButton}
              onClick={copyMonToAll}
            >
              <FiCopy aria-hidden />
              {t("marketing:listBusiness.step3.copyMonday")}
            </button>
            <button
              type="button"
              className={styles.toolButton}
              onClick={clearHours}
            >
              <FiSlash aria-hidden />
              {t("marketing:listBusiness.step3.markAllClosed")}
            </button>
          </div>
        </div>

        {/* The card is the size container; the grid inside it is what the
            container queries restyle (a container cannot query itself). */}
        <div id={ANCHOR.hours} className={styles.dayList}>
          <div className={styles.dayGrid}>
            {DAYS.map((day) => (
              <ListingHoursDayRow
                key={day.id}
                day={day}
                dayHours={draft.hours[day.id]!}
                form={form}
              />
            ))}
          </div>
        </div>
      </div>

      <FormField
        className={pageStyles.lbField}
        id={ANCHOR.hoursNote}
        label={t("marketing:listBusiness.step3.hoursNoteLabel")}
      >
        <input
          type="text"
          maxLength={80}
          placeholder={t("marketing:listBusiness.step3.hoursNotePlaceholder")}
          value={draft.hoursNote}
          onChange={(event) => set({ hoursNote: event.target.value })}
        />
      </FormField>
    </>
  );
}
