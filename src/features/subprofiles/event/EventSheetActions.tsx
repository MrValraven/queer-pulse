import { FiArrowUpRight, FiCalendar } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { downloadBlob } from "../../../shared/lib/downloadBlob";
import { safeHref } from "../../../shared/lib/safeHref";
import { isEventUpcoming, parseEventDate } from "../eventDates";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { buildEventCalendar, calendarFileName } from "./eventCalendar";
import styles from "./EventSheetContent.module.css";

/** Toast duration for the one error this row can raise. */
const CALENDAR_ERROR_TOAST_MS = 6000;

/**
 * The sheet's actions: Tickets (the one primary, only while the event is
 * ahead and still on sale), Add to calendar and Event page. External links
 * open in a new tab the way the persona's other links do.
 */
export function EventSheetActions({ item }: { item: SubprofileItemView }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const dateParts = parseEventDate(item.date);
  const isUpcoming = isEventUpcoming(item.date);
  const isCancelled = item.gigState === "cancelled";
  // A month-only date names no day a calendar entry could sit on, so only a
  // day date that is still ahead (and still happening) offers the file.
  const canAddToCalendar =
    dateParts !== null && dateParts.day !== null && isUpcoming && !isCancelled;
  const ticketHref = safeHref(item.ticketUrl);
  const isOnSale = isUpcoming && !isCancelled && item.gigState !== "sold_out";
  const eventPageHref = safeHref(item.url);
  if (!canAddToCalendar && !(ticketHref && isOnSale) && !eventPageHref) {
    return null;
  }

  function handleAddToCalendar() {
    const calendarText = buildEventCalendar(item);
    if (!calendarText) return;
    try {
      downloadBlob(
        calendarFileName(item.title),
        calendarText,
        "text/calendar;charset=utf-8",
      );
    } catch {
      // The file is built in the browser; the only step that can fail is the
      // browser refusing the download itself.
      showToast(
        t("subprofiles:event.sheet.calendarBlocked"),
        "error",
        CALENDAR_ERROR_TOAST_MS,
      );
    }
  }

  return (
    <div className={styles.actions}>
      {ticketHref && isOnSale && (
        <Button
          variant="primary"
          href={ticketHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("subprofiles:event.sheet.tickets")}
          <FiArrowUpRight aria-hidden />
        </Button>
      )}
      {canAddToCalendar && (
        <Button variant="ghost" type="button" onClick={handleAddToCalendar}>
          <FiCalendar aria-hidden />
          {t("subprofiles:event.sheet.addToCalendar")}
        </Button>
      )}
      {eventPageHref && (
        <Button
          variant="ghost"
          href={eventPageHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("subprofiles:event.sheet.eventPage")}
          <FiArrowUpRight aria-hidden />
        </Button>
      )}
    </div>
  );
}
