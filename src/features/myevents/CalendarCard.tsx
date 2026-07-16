import { useRef } from "react";
import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useMyEvents } from "./MyEventsContext";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarSubscribe } from "./CalendarSubscribe";
import { InsightsCard } from "./InsightsCard";
import type { CalView } from "./myEvents.types";

const VIEWS: { key: CalView; labelKey: string }[] = [
  { key: "month", labelKey: "myevents:calendar.view.month" },
  { key: "week", labelKey: "myevents:calendar.view.week" },
  { key: "year", labelKey: "myevents:calendar.view.year" },
];

function monthLabel(
  calView: CalView,
  viewY: number,
  viewM: number,
  weekStart: Date,
  fmt: Formatters,
): string {
  if (calView === "year") return String(viewY);
  if (calView === "week") {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const startLabel = `${weekStart.getDate()} ${fmt.date(weekStart, { month: "short" })}`;
    const endLabel = `${end.getDate()} ${fmt.date(end, { month: "short" })}`;
    return `${startLabel} – ${endLabel}`;
  }
  return fmt.date(new Date(viewY, viewM, 1), { month: "long", year: "numeric" });
}

/** The right-hand calendar aside: nav, grid, legend, subscribe, insights. */
export function CalendarCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const c = useMyEvents();
  const cardRef = useRef<HTMLElement>(null);
  const label = monthLabel(c.calView, c.viewY, c.viewM, c.weekStart, fmt);

  return (
    <aside className={sx("cal-card")} ref={cardRef}>
      <div className={sx("cal-top")}>
        <div className={sx("cal-month")}>{label}</div>
        <div className={sx("cal-controls")}>
          <button
            type="button"
            className={sx("cal-today-btn")}
            onClick={c.goToday}
          >
            {t("myevents:calendar.today")}
          </button>
          <button
            type="button"
            className={sx("cal-arrow")}
            onClick={() => c.shiftMonth(-1)}
            aria-label={t("myevents:calendar.prevAria")}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={sx("cal-arrow")}
            onClick={() => c.shiftMonth(1)}
            aria-label={t("myevents:calendar.nextAria")}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={sx("cal-views")}>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            className={sx(`cal-view-btn${c.calView === v.key ? " on" : ""}`)}
            onClick={() => c.setCalView(v.key)}
          >
            {t(v.labelKey)}
          </button>
        ))}
      </div>

      <CalendarGrid cardRef={cardRef} />

      <div className={sx("cal-legend")}>
        <div className={sx("cal-leg")}>
          <span className={sx("ld hosting")} /> {t("myevents:calendar.legend.hosting")}
        </div>
        <div className={sx("cal-leg")}>
          <span className={sx("ld going")} /> {t("myevents:calendar.legend.going")}
        </div>
        <div className={sx("cal-leg")}>
          <span className={sx("ld pending")} /> {t("myevents:calendar.legend.pending")}
        </div>
      </div>

      <CalendarSubscribe />
      <InsightsCard />
    </aside>
  );
}
