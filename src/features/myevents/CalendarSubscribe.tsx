import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useMyEvents } from "./MyEventsContext";
import { parseDate } from "./myEvents.helpers";
import { downloadICS } from "./myEvents.ics";

/** Subscribe-to-feed and export-this-month buttons under the calendar. */
export function CalendarSubscribe() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { toast, viewM, viewY, events } = useMyEvents();
  const monthLong = fmt.date(new Date(viewY, viewM, 1), { month: "long" });
  const exportMonth = () => {
    const monthEvents = events.filter(
      (e) => parseDate(e.date).getMonth() === viewM,
    );
    const monthSlug = fmt
      .date(new Date(viewY, viewM, 1), { month: "long" })
      .toLowerCase();
    downloadICS(`queerpulse-${monthSlug}.ics`, monthEvents);
    toast(t("myevents:calSubscribe.exportToast", { month: monthLong }), "success");
  };
  return (
    <div className={sx("cal-sub")}>
      <button
        type="button"
        className={sx("cal-sub-btn")}
        onClick={() => toast(t("myevents:calSubscribe.feedToast"), "success")}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          aria-hidden
        >
          <circle
            cx="3.5"
            cy="12.5"
            r="1.3"
            fill="currentColor"
            stroke="none"
          />
          <path d="M3 8.2a4.8 4.8 0 0 1 4.8 4.8M3 4.2a8.8 8.8 0 0 1 8.8 8.8" />
        </svg>
        <span className={sx("csb-t")}>
          {t("myevents:calSubscribe.feedTitle")}
          <span className={sx("csb-sub")}>
            {t("myevents:calSubscribe.feedSub")}
          </span>
        </span>
      </button>
      <button type="button" className={sx("cal-sub-btn")} onClick={exportMonth}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M8 2.5v8M5 7.5 8 10.5l3-3M3 13h10" />
        </svg>
        <span className={sx("csb-t")}>
          {t("myevents:calSubscribe.exportTitle")}
          <span className={sx("csb-sub")}>
            {t("myevents:calSubscribe.exportSub")}
          </span>
        </span>
      </button>
    </div>
  );
}
