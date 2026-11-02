import { useMemo } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EventBatchTemplateDTO } from "../api/eventBatch.api";
import { ADD_MONTH_SECTION_IDS } from "./addMonth.data";
import styles from "./AddEventMonthPage.module.css";
import { AddMonthCalendar } from "./AddMonthCalendar";
import { AddMonthSharedCover } from "./AddMonthSharedCover";
import { AddMonthSharedTimes } from "./AddMonthSharedTimes";
import type { AddEventMonthPageModel } from "./useAddEventMonthPage";
import { ADD_MONTH_DATES_HEADING_ID } from "./useAddMonthPublish";

/**
 * Section 2 of the month page: the times every date shares, the calendar
 * that picks the dates and the cover every date shares. The cover upload
 * stays mounted while this section is, since the cards paint its preview.
 */
export function AddMonthDatesSection({
  page,
  template,
}: {
  page: AddEventMonthPageModel;
  template: EventBatchTemplateDTO;
}) {
  const { t } = useTranslation();
  const { state, dispatch, bounds } = page;
  const selectedDates = useMemo(
    () => state.rows.map((row) => row.date),
    [state.rows],
  );
  return (
    <section
      id={ADD_MONTH_SECTION_IDS.dates}
      className={styles.section}
      aria-labelledby={ADD_MONTH_DATES_HEADING_ID}
    >
      <h2
        id={ADD_MONTH_DATES_HEADING_ID}
        className={styles.sectionHeading}
        tabIndex={-1}
      >
        {t("gatherings:addMonth.dates.heading")}
      </h2>
      <p className={styles.sectionLede}>
        {t("gatherings:addMonth.dates.lede")}
      </p>
      <AddMonthSharedTimes
        times={state.times}
        timezone={template.timezone}
        onChange={(times) => dispatch({ type: "setSharedTimes", times })}
      />
      <AddMonthCalendar
        selectedDates={selectedDates}
        today={bounds.today}
        lastDate={bounds.lastDate}
        visibleMonth={page.visibleMonth}
        onVisibleMonthChange={page.setVisibleMonth}
        onToggle={(date) => dispatch({ type: "toggleDate", date })}
        labelledBy={ADD_MONTH_DATES_HEADING_ID}
      />
      <AddMonthSharedCover
        templateCoverUrl={template.coverImageUrl}
        templateTitle={template.title}
        cover={state.sharedCover}
        onKeyChange={(key) => dispatch({ type: "setSharedCoverKey", key })}
        onPreviewChange={(key, previewUrl) =>
          dispatch({ type: "setSharedCoverPreview", key, previewUrl })
        }
      />
    </section>
  );
}
