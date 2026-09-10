import { FiCalendar } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { AvStack, PriceChip } from "./EventCardParts";
import { downloadICS } from "./myEvents.ics";
import { isOnline } from "./myEvents.helpers";
import { joinWhenParts, myEventWhen } from "./myEvents.when";

/**
 * The real ticket for a confirmed RSVP: event details straight off the
 * viewer's own event record (`ticket.eventId`), not a fixed prototype
 * fixture. Mounted only while open, keyed by event id (see MyEventsBody).
 */
export function EventTicketModal() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { ticket, closeTicket, byId, toast } = useMyEvents();
  const ev = ticket.eventId ? byId(ticket.eventId) : undefined;
  if (!ev) return null;

  // `dateText` already reads as a range across a festival, so only the
  // overnight case still needs the note spelled out beside the clock.
  const when = myEventWhen(ev, fmt, t, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const statusText =
    ev.category === "waitlisted"
      ? t("myevents:badges.waitlistedPosition", { position: ev.position })
      : ev.maybe
        ? t("myevents:badges.maybe")
        : t("myevents:badges.going");

  return (
    <Modal
      onClose={closeTicket}
      eyebrow={t("myevents:ticketModal.eyebrow")}
      title={ev.title}
      sub={`${when.dateText} · ${joinWhenParts(when.timeText, when.nextDayNote)}`}
      footer={
        <Button
          variant="jade"
          onClick={() => {
            downloadICS(`queerpulse-${ev.id}.ics`, [ev], t);
            toast(t("myevents:ticketModal.addedToCalendarToast"), "success");
          }}
        >
          <FiCalendar aria-hidden />{" "}
          {t("myevents:ticketModal.addToCalendarCta")}
        </Button>
      }
    >
      <div className={sx("field")}>
        <span className={sx("field-label")}>
          {t("myevents:ticketModal.statusLabel")}
        </span>
        <div>{statusText}</div>
      </div>

      <div className={sx("field")}>
        <span className={sx("field-label")}>
          {t("myevents:ticketModal.whereLabel")}
        </span>
        <div>{isOnline(ev) ? t("myevents:ticketModal.online") : ev.venue}</div>
      </div>

      {ev.paid && (
        <div className={sx("field")}>
          <span className={sx("field-label")}>
            {t("myevents:ticketModal.priceLabel")}
          </span>
          <PriceChip ev={ev} />
        </div>
      )}

      {!!ev.who?.length && (
        <div className={sx("field")}>
          <span className={sx("field-label")}>
            {t("myevents:ticketModal.withLabel")}
          </span>
          <div className={sx("ev-foot")}>
            <AvStack who={ev.who} />
            {ev.whoText && (
              <span className={sx("ev-foot-text")}>{ev.whoText}</span>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
