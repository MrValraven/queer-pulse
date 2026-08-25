import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, DAYS, anyDayOpen, dayHoursValid } from "./listBusiness.data";
import { ListingHoursIntervalRows } from "./ListingHoursIntervalRows";
import type { ListingForm } from "./useListingForm";
import pageStyles from "./ListBusinessPage.module.css";

/**
 * Opening-hours editor (item #6). Each day is closed, or open across one or two
 * intervals — a second interval models a lunch-break closure, and a window whose
 * `to <= from` runs overnight (a late bar). Pure UI on top of the form's
 * `setDayOpen` / `setInterval` / `addInterval` / `removeInterval` setters, so it
 * is dual-mode safe (no data fetch). Rendered as a fragment so the surrounding
 * `.stepBody` keeps the same direct children (and staggered entrance) it had
 * when this block was inline in the practical step.
 */
export function ListingHoursEditor({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, setDayOpen, setInterval, addInterval, removeInterval } = form;
  const { copyMonToAll, clearHours, set } = form;
  const hasOpenDay = anyDayOpen(draft.hours);

  return (
    <>
      <h3 className={pageStyles.groupH}>
        {t("marketing:listBusiness.step3.hoursHeading")}
      </h3>
      <div className={pageStyles.hoursSection}>
        <div className={pageStyles.hoursTools}>
          <span
            className={[
              pageStyles.openNow,
              hasOpenDay ? pageStyles.openNowOpen : pageStyles.openNowClosed,
            ].join(" ")}
          >
            {hasOpenDay
              ? t("marketing:listBusiness.step3.hasOpenHours")
              : t("marketing:listBusiness.step3.allClosed")}
          </span>
          <button
            type="button"
            className={pageStyles.hoursToolBtn}
            onClick={copyMonToAll}
          >
            {t("marketing:listBusiness.step3.copyMonday")}
          </button>
          <button
            type="button"
            className={pageStyles.hoursToolBtn}
            onClick={clearHours}
          >
            {t("marketing:listBusiness.step3.markAllClosed")}
          </button>
        </div>

        <div id={ANCHOR.hours} className={pageStyles.hoursGrid}>
          {DAYS.map((day) => {
            const dayHours = draft.hours[day.id]!;
            const dayLabel = t(day.labelKey);
            const invalid = dayHours.open && !dayHoursValid(dayHours);
            return (
              <div key={day.id} className={pageStyles.hrow}>
                <span className={pageStyles.hday}>{dayLabel}</span>
                <button
                  type="button"
                  aria-pressed={dayHours.open}
                  className={[
                    pageStyles.htg,
                    dayHours.open && pageStyles.htgOpen,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setDayOpen(day.id, !dayHours.open)}
                >
                  {dayHours.open
                    ? t("marketing:listBusiness.step3.open")
                    : t("marketing:listBusiness.step3.closed")}
                </button>

                {dayHours.open ? (
                  <ListingHoursIntervalRows
                    intervals={dayHours.intervals}
                    rowLabel={dayLabel}
                    isInvalid={invalid}
                    onChangeInterval={(index, patch) =>
                      setInterval(day.id, index, patch)
                    }
                    onAddInterval={() => addInterval(day.id)}
                    onRemoveInterval={(index) => removeInterval(day.id, index)}
                  />
                ) : (
                  <span className={pageStyles.closedLbl}>
                    {t("marketing:listBusiness.step3.closed")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <FormField
        className={pageStyles.lbField}
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
