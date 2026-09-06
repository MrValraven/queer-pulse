import { AddToCalendarSheet } from "../../shared/components/calendar/AddToCalendarSheet";
import { useFormat } from "../../shared/i18n/format";
import type { CalendarEventInput } from "../../shared/lib/calendarExport";
import { useMyEvents } from "./MyEventsContext";
import { atTime, parseDate, timeStr } from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";

const HOUR_MS = 60 * 60 * 1000;

/** Turn a MyEvent into calendar-export input, defaulting to a 1h duration. */
function toCalendarInput(ev: MyEvent): CalendarEventInput {
  const start = atTime(ev, "start");
  const end = ev.end ? atTime(ev, "end") : new Date(start.getTime() + HOUR_MS);
  return { title: ev.title, start, end, location: ev.venue };
}

/**
 * My Events' "Add to calendar" — the card's subject, the shared picker.
 *
 * The picker itself lives in `shared/components/calendar` so the gathering
 * detail page can offer the same thing at the moment a member confirms a seat
 * (PRD-189); this wrapper only knows how to turn a `MyEvent` card into a
 * calendar subject and where this surface's toasts go.
 */
export function AddToCalendarModal({
  ev,
  onClose,
}: {
  ev: MyEvent;
  onClose: () => void;
}) {
  const fmt = useFormat();
  const { toast } = useMyEvents();
  // Through the app's own locale (`useFormat`), like every sibling surface —
  // `toLocaleDateString(undefined, …)` followed the BROWSER's locale, so a
  // member reading the app in PT on an EN device saw this one date in English.
  const dateLabel = fmt.date(parseDate(ev.date), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = timeStr(ev) + (ev.timezone ? ` ${ev.timezone}` : "");

  return (
    <AddToCalendarSheet
      input={toCalendarInput(ev)}
      subtitle={`${dateLabel} · ${timeLabel} · ${ev.venue}`}
      filename={`${ev.title.replace(/\s+/g, "-")}.ics`}
      onToast={(message) => toast(message, "success")}
      onClose={onClose}
    />
  );
}
