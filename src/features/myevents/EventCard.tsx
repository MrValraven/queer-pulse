import { useEffect, useRef, useState } from "react";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Icons } from "./MyEventsIcons";
import { parseDate, isToday, soonLabel, COMMITTED } from "./myEvents.helpers";
import { EventMeta, SoonBar, FriendsLine } from "./EventCardParts";
import { StatusBadges, EventFoot } from "./EventCardBadges";
import { EventSide, EventTools } from "./EventCardActions";
import {
  AccessRow,
  AlertStrip,
  ConflictNote,
  EdgeNote,
  SeriesLine,
  DayOfPanel,
} from "./EventCardExtras";
import type { MyEvent } from "./myEvents.types";

export function EventCard({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { selected, toggleSelect, removingId, focusId } = useMyEvents();
  const [dayofShown, setDayofShown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  const dt = parseDate(ev.date);
  const soon = !!(
    isToday(ev) &&
    COMMITTED[ev.cat] &&
    !ev.cancelled &&
    soonLabel(ev, t)
  );
  const showExtras = ev.cat !== "past" && ev.cat !== "sent";
  const isOn = !!selected[ev.id];
  const focused = focusId === ev.id;

  // Deep-link from a notification: bring this card into view and flash it.
  useEffect(() => {
    if (focused)
      cardRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
  }, [focused, reduce]);

  const cardCls = sx(
    `ev-card ${ev.cat}${ev.cancelled ? " cancelled" : ""}${soon ? " soon" : ""}${removingId === ev.id ? " removing" : ""}${focused ? " flash" : ""}`,
  );

  return (
    <div ref={cardRef} className={cardCls} data-id={ev.id}>
      <div
        className={sx(`ev-check${isOn ? " on" : ""}`)}
        role="checkbox"
        aria-checked={isOn}
        aria-label={t("myevents:card.selectAria", { title: ev.title })}
        tabIndex={0}
        onClick={() => toggleSelect(ev.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSelect(ev.id);
          }
        }}
      >
        {Icons.check}
      </div>

      <div className={sx("ev-tile")}>
        <div className={sx("et-dow")}>{fmt.date(dt, { weekday: "short" })}</div>
        <div className={sx("et-day")}>{dt.getDate()}</div>
        <div className={sx("et-mon")}>{fmt.date(dt, { month: "short" })}</div>
      </div>

      <div className={sx("ev-body")}>
        <SoonBar ev={ev} />
        <StatusBadges ev={ev} />
        <div className={sx("ev-name")}>{ev.title}</div>
        <EventMeta ev={ev} links={ev.cat !== "past"} />
        {showExtras && (
          <>
            <AccessRow ev={ev} />
            <AlertStrip ev={ev} />
            <ConflictNote ev={ev} />
            <EdgeNote ev={ev} />
            <SeriesLine ev={ev} />
            {isToday(ev) && <DayOfPanel ev={ev} show={dayofShown} />}
          </>
        )}
        {ev.cat === "going" && !ev.cancelled && <FriendsLine ev={ev} />}
        <EventFoot ev={ev} />
        <EventTools
          ev={ev}
          dayofShown={dayofShown}
          onToggleDayof={() => setDayofShown((s) => !s)}
        />
      </div>

      <div className={sx("ev-side")}>
        <EventSide ev={ev} />
      </div>
    </div>
  );
}
