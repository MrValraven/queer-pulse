import { useMemo, useRef, useState, type RefObject } from "react";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { MON, MONFULL, DOW } from "./myEvents.data";
import { parseDate, ymd, dotClass } from "./myEvents.helpers";
import { TODAY } from "./myEvents.data";
import type { MyEvent } from "./myEvents.types";

const WEEK_HEAD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Distinct category dots for a given day. */
function Dots({ events }: { events: MyEvent[] }) {
  const seen = new Set<string>();
  const cls: string[] = [];
  events.forEach((e) => {
    const c = dotClass(e.cat);
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

export function CalendarGrid({
  cardRef,
}: {
  cardRef: RefObject<HTMLElement | null>;
}) {
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
  const gridRef = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState<{
    items: MyEvent[];
    left: number;
    top: number;
  } | null>(null);

  const byDate = useMemo(() => {
    const m: Record<string, MyEvent[]> = {};
    events.forEach((e) => {
      (m[e.date] = m[e.date] || []).push(e);
    });
    return m;
  }, [events]);

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

  if (calView === "year") {
    return (
      <div className={sx("cal-grid cal-year")} ref={gridRef}>
        {MON.map((name, m) => {
          const evs = events.filter((e) => {
            const dt = parseDate(e.date);
            return dt.getFullYear() === viewY && dt.getMonth() === m;
          });
          const now = viewY === TODAY.getFullYear() && m === TODAY.getMonth();
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

  if (calView === "week") {
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
                <div className={sx("cw-dow")}>{DOW[dt.getDay()]}</div>
                <div className={sx("cw-num")}>{dt.getDate()}</div>
              </div>
              <div className={sx("cw-evs")}>
                {evs.length ? (
                  evs.map((e) => (
                    <div key={e.id} className={sx("cw-ev")}>
                      <span className={sx(`cal-dot ${dotClass(e.cat)}`)} />
                      {e.start} · {e.title}
                    </div>
                  ))
                ) : (
                  <div className={sx("cw-none")}>Nothing planned</div>
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

  // month
  const first = new Date(viewY, viewM, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <>
      <div className={sx("cal-grid")} ref={gridRef} aria-label="Event calendar">
        {WEEK_HEAD.map((d) => (
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
          const label = `${dn} ${MONFULL[viewM]} ${viewY}${isTd ? ", today" : ""}, ${evs.length ? `${evs.length} event${evs.length > 1 ? "s" : ""}` : "no events"}`;
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
            <span className={sx(`cpk-dot ${dotClass(x.cat)}`)} />
            <span>{x.title}</span>
          </div>
        ))}
      </div>
    </>
  );
}
