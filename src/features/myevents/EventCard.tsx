import { useRef, useState } from "react";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Icons } from "./MyEventsIcons";
import {
  parseDate,
  isToday,
  shouldShowDayOf,
  soonLabel,
  COMMITTED,
} from "./myEvents.helpers";
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

/**
 * One gathering on the agenda. `isEnded` marks a card in the trailing group of
 * gatherings that are already over: it renders greyed out and drops every
 * extra that looks ahead (the soon bar, the day-of panel, alerts and clashes,
 * directions, calendar exports), keeping the listing, Manage and the menu.
 */
export function EventCard({
  ev,
  isEnded = false,
}: {
  ev: MyEvent;
  isEnded?: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { selected, toggleSelect, removingId } = useMyEvents();
  const [dayofShown, setDayofShown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const dt = parseDate(ev.date);
  const soon = !!(
    !isEnded &&
    isToday(ev) &&
    COMMITTED[ev.category] &&
    !ev.cancelled &&
    soonLabel(ev, t)
  );
  const showExtras = ev.category !== "past" && ev.category !== "sent";
  const isOn = !!selected[ev.id];

  const cardCls = sx(
    `ev-card ${ev.category}${ev.cancelled ? " cancelled" : ""}${soon ? " soon" : ""}${isEnded ? " ended" : ""}${removingId === ev.id ? " removing" : ""}`,
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
        {!isEnded && <SoonBar ev={ev} />}
        <StatusBadges ev={ev} />
        <div className={sx("ev-name")}>{ev.title}</div>
        <EventMeta ev={ev} links={ev.category !== "past" && !isEnded} />
        {showExtras && (
          <>
            <AccessRow ev={ev} />
            {!isEnded && <AlertStrip ev={ev} />}
            {!isEnded && <ConflictNote ev={ev} />}
            <EdgeNote ev={ev} />
            <SeriesLine ev={ev} />
            {!isEnded && shouldShowDayOf(ev) && (
              <DayOfPanel ev={ev} show={dayofShown} />
            )}
          </>
        )}
        {ev.category === "going" && !ev.cancelled && <FriendsLine ev={ev} />}
        <EventFoot ev={ev} />
        <EventTools
          ev={ev}
          isEnded={isEnded}
          dayofShown={dayofShown}
          onToggleDayof={() => setDayofShown((s) => !s)}
        />
      </div>

      <div className={sx("ev-side")}>
        <EventSide ev={ev} isEnded={isEnded} />
      </div>
    </div>
  );
}
