import { useMemo, useRef, useState, type RefObject } from "react";
import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { useMyEvents } from "./MyEventsContext";
import { parseDate, ymd, dotClass } from "./myEvents.helpers";
import { TODAY } from "./myEvents.data";
import type { MyEvent } from "./myEvents.types";

/** Mon–Sun short weekday labels for the month grid's header row, localized. */
function weekHeadLabels(fmt: Formatters): string[] {
  // 2024-01-01 is a Monday — a stable anchor to walk a Mon..Sun week from.
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return fmt.date(d, { weekday: "short" });
  });
}

/** Distinct category dots for a given day. */
function Dots({ events }: { events: MyEvent[] }) {
  const seen = new Set<string>();
  const cls: string[] = [];
  events.forEach((e) => {
    const c = dotClass(e.category);
    if (!seen.has(c)) {
      seen.add(c);
      cls.push(c);
    }
  });
  if (!cls.length) return null;
  return (
    <div className={sx("cal-dots")}>
      {cls.map((c) => (
        <span key={c} className={sx(`cal-dot ${c}`)} />
      ))}
    </div>
  );
}

/** The 12-month year overview grid. */
function CalendarYearView({
  events,
  viewY,
  fmt,
  jumpMonth,
}: {
  events: MyEvent[];
  viewY: number;
  fmt: Formatters;
  jumpMonth: (m: number) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  return (
    <div className={sx("cal-grid cal-year")} ref={gridRef}>
      {Array.from({ length: 12 }, (_, m) => {
        const evs = events.filter((e) => {
          const dt = parseDate(e.date);
          return dt.getFullYear() === viewY && dt.getMonth() === m;
        });
        const now = viewY === TODAY.getFullYear() && m === TODAY.getMonth();
        const name = fmt.date(new Date(viewY, m, 1), { month: "short" });
        return (
          <button
            key={m}
            type="button"
            className={sx(`cy-m${now ? " now" : ""}`)}
            onClick={() => jumpMonth(m)}
          >
            <div className={sx("cy-name")}>{name}</div>
            <div className={sx("cy-dots")}>
              {evs.length ? (
                <Dots events={evs} />
              ) : (
                <span className={sx("cy-empty")}>—</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** The Mon–Sun week grid. */
function CalendarWeekView({
  weekStart,
  byDate,
  fmt,
  t,
  selectDay,
}: {
  weekStart: Date;
  byDate: Record<string, MyEvent[]>;
  fmt: Formatters;
  t: TFunction;
  selectDay: (ds: string) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart);
    dt.setDate(dt.getDate() + i);
    return dt;
  });
  return (
    <div className={sx("cal-grid cal-week")} ref={gridRef}>
      {days.map((dt) => {
        const ds = ymd(dt);
        const evs = byDate[ds] || [];
        const isTd = dt.getTime() === TODAY.getTime();
        const inner = (
          <>
            <div className={sx("cw-date")}>
              <div className={sx("cw-dow")}>
                {fmt.date(dt, { weekday: "short" })}
              </div>
              <div className={sx("cw-num")}>{dt.getDate()}</div>
            </div>
            <div className={sx("cw-evs")}>
              {evs.length ? (
                evs.map((e) => (
                  <div key={e.id} className={sx("cw-ev")}>
                    <span className={sx(`cal-dot ${dotClass(e.category)}`)} />
                    {e.start} · {e.title}
                  </div>
                ))
              ) : (
                <div className={sx("cw-none")}>
                  {t("myevents:calendar.nothingPlanned")}
                </div>
              )}
            </div>
          </>
        );
        return evs.length ? (
          <button
            key={ds}
            type="button"
            className={sx(`cw-day${isTd ? " today" : ""}`)}
            onClick={() => selectDay(ds)}
          >
            {inner}
          </button>
        ) : (
          <div
            key={ds}
            className={sx(`cw-day empty-day${isTd ? " today" : ""}`)}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/** The month grid, including the hover "peek" popover of a day's events. */
function CalendarMonthView({
  viewY,
  viewM,
  byDate,
  weekHead,
  selectedDate,
  selectDay,
  cardRef,
  t,
  fmt,
}: {
  viewY: number;
  viewM: number;
  byDate: Record<string, MyEvent[]>;
  weekHead: string[];
  selectedDate: string | null;
  selectDay: (ds: string) => void;
  cardRef: RefObject<HTMLElement | null>;
  t: TFunction;
  fmt: Formatters;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState<{
    items: MyEvent[];
    left: number;
    top: number;
  } | null>(null);

  const showPeek = (el: HTMLElement, ds: string) => {
    const items = byDate[ds];
    if (!items?.length || !cardRef.current) return;
    const cr = cardRef.current.getBoundingClientRect();
    const tr = el.getBoundingClientRect();
    setPeek({
      items,
      left: tr.left - cr.left + tr.width / 2,
      top: tr.top - cr.top - 10,
    });
  };

  const first = new Date(viewY, viewM, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <>
      <div
        className={sx("cal-grid")}
        ref={gridRef}
        aria-label={t("myevents:calendar.gridAria")}
      >
        {weekHead.map((d) => (
          <div key={d} className={sx("cal-dow")} aria-hidden>
            {d}
          </div>
        ))}
        {cells.map((dn, i) => {
          if (dn === null)
            return (
              <div key={`e${i}`} className={sx("cal-cell empty")} aria-hidden />
            );
          const ds = `${viewY}-${String(viewM + 1).padStart(2, "0")}-${String(dn).padStart(2, "0")}`;
          const dt = new Date(viewY, viewM, dn);
          const evs = byDate[ds] || [];
          const isTd = dt.getTime() === TODAY.getTime();
          const sel = selectedDate === ds;
          const dayLabel = fmt.date(dt, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const eventsPart = evs.length
            ? t("myevents:calendar.cellEventCount", { count: evs.length })
            : t("myevents:calendar.cellNoEvents");
          const label =
            dayLabel +
            (isTd ? t("myevents:calendar.cellAriaToday") : "") +
            ", " +
            eventsPart;
          return (
            <button
              key={ds}
              type="button"
              className={sx(
                `cal-cell${evs.length ? " has" : ""}${isTd ? " today" : ""}${sel ? " selected" : ""}`,
              )}
              aria-label={label}
              aria-pressed={sel}
              onClick={() => selectDay(ds)}
              onMouseEnter={(e) => evs.length && showPeek(e.currentTarget, ds)}
              onMouseLeave={() => setPeek(null)}
              onFocus={() => setPeek(null)}
            >
              {dn}
              <Dots events={evs} />
            </button>
          );
        })}
      </div>
      <div
        className={`${sx("cal-peek")} ${peek ? sx("show") : ""}`}
        style={
          peek
            ? {
                left: peek.left,
                top: peek.top,
                transform: "translate(-50%,-100%)",
              }
            : undefined
        }
      >
        {peek?.items.map((x) => (
          <div key={x.id} className={sx("cpk-row")}>
            <span className={sx(`cpk-dot ${dotClass(x.category)}`)} />
            <span>{x.title}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function CalendarGrid({
  cardRef,
}: {
  cardRef: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const weekHead = useMemo(() => weekHeadLabels(fmt), [fmt]);
  const {
    events,
    viewY,
    viewM,
    weekStart,
    calView,
    selectedDate,
    selectDay,
    jumpMonth,
  } = useMyEvents();

  const byDate = useMemo(() => {
    const m: Record<string, MyEvent[]> = {};
    events.forEach((e) => {
      (m[e.date] = m[e.date] || []).push(e);
    });
    return m;
  }, [events]);

  if (calView === "year") {
    return (
      <CalendarYearView
        events={events}
        viewY={viewY}
        fmt={fmt}
        jumpMonth={jumpMonth}
      />
    );
  }

  if (calView === "week") {
    return (
      <CalendarWeekView
        weekStart={weekStart}
        byDate={byDate}
        fmt={fmt}
        t={t}
        selectDay={selectDay}
      />
    );
  }

  return (
    <CalendarMonthView
      viewY={viewY}
      viewM={viewM}
      byDate={byDate}
      weekHead={weekHead}
      selectedDate={selectedDate}
      selectDay={selectDay}
      cardRef={cardRef}
      t={t}
      fmt={fmt}
    />
  );
}
