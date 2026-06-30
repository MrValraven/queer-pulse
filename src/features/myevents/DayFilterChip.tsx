import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { DOWFULL, MONFULL } from "./myEvents.data";
import { parseDate } from "./myEvents.helpers";

/** The "Showing <day>" chip shown when a calendar day is selected. */
export function DayFilterChip() {
  const { selectedDate, clearDay } = useMyEvents();
  if (!selectedDate) return null;
  const dt = parseDate(selectedDate);
  const label = `${DOWFULL[dt.getDay()]} ${dt.getDate()} ${MONFULL[dt.getMonth()]}`;
  return (
    <div className={`${sx("dayfilter")} ${sx("show")}`}>
      <span className={sx("dayfilter-label")}>
        Showing <strong>{label}</strong>
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
        Show all
      </button>
    </div>
  );
}
