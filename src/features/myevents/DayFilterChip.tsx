import { sx } from "./myEvents.styles";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useMyEvents } from "./MyEventsContext";
import { parseDate } from "./myEvents.helpers";

/** The "Showing <day>" chip shown when a calendar day is selected. */
export function DayFilterChip() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { selectedDate, clearDay } = useMyEvents();
  if (!selectedDate) return null;
  const dt = parseDate(selectedDate);
  const label = fmt.date(dt, { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className={`${sx("dayfilter")} ${sx("show")}`}>
      <span className={sx("dayfilter-label")}>
        <Translation
          i18nKey="myevents:dayFilter.showing"
          components={{ strong: <strong /> }}
          values={{ label }}
        />
      </span>
      <button
        type="button"
        className={sx("dayfilter-clear")}
        onClick={clearDay}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
          <path
            d="M2 2l7 7M9 2l-7 7"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </svg>
        {t("myevents:dayFilter.showAll")}
      </button>
    </div>
  );
}
