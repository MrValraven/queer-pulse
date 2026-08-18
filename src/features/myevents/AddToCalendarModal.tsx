import { FiCalendar, FiDownload } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  downloadIcsFile,
  googleCalendarUrl,
  type CalendarEventInput,
} from "../../shared/lib/calendarExport";
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

/** Lets the member add an event to Google Calendar or download an .ics file. */
export function AddToCalendarModal({
  ev,
  onClose,
}: {
  ev: MyEvent;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  const dateLabel = parseDate(ev.date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = timeStr(ev) + (ev.timezone ? ` ${ev.timezone}` : "");

  const confirm = () => {
    toast(t("myevents:tools.addedToCalendarToast"), "success");
    onClose();
  };

  return (
    <Modal
      title={t("myevents:tools.addToCalendarModalTitle")}
      sub={`${dateLabel} · ${timeLabel} · ${ev.venue}`}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              downloadIcsFile(
                `${ev.title.replace(/\s+/g, "-")}.ics`,
                toCalendarInput(ev),
              );
              confirm();
            }}
          >
            <FiDownload size={15} style={{ marginRight: 6 }} aria-hidden />
            {t("myevents:tools.addToCalendarIcs")}
          </Button>
          <Button
            onClick={() => {
              window.open(
                googleCalendarUrl(toCalendarInput(ev)),
                "_blank",
                "noopener,noreferrer",
              );
              confirm();
            }}
          >
            <FiCalendar size={15} style={{ marginRight: 6 }} aria-hidden />
            {t("myevents:tools.addToCalendarGoogle")}
          </Button>
        </>
      }
    >
      <p>{t("myevents:tools.addToCalendarBody")}</p>
    </Modal>
  );
}
