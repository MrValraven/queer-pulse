import { FiCalendar, FiPackage, FiVideo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isByAppointmentListing } from "./listBusiness/listingMobile.data";
import { onlineStatusOf } from "./listBusiness/listingOnline.data";
import {
  openStatus,
  operatingStateOf,
  zonedNow,
  type DirectoryPlace,
} from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/**
 * The card's one-line trading status.
 *
 * A business that is temporarily closed, permanently closed or has moved still
 * turns up in results, so the card has to say so; an "Open till 23:00" line
 * computed from hours that no longer describe anything would mislead. The
 * operating state therefore replaces the live calculation outright, and the
 * two never sit side by side.
 *
 * For an open business the live status comes from `openStatus`, which resolves
 * the venue's own timezone and lets a one-off date exception override the
 * weekday grid, and which reports the window it is actually inside, so
 * "closes at" is the real closing time of the window it is inside. Renders
 * nothing when there are no hours to reason about.
 *
 * An online-only listing never shows Closed. An out-and-about listing that
 * works by appointment says so.
 */
export function DirectoryCardStatus({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const operatingState = operatingStateOf(place);

  if (operatingState !== "open") {
    return (
      <span
        className={`${s.status} ${s.statusFlag}`}
        data-preview-region="status"
      >
        <span className={s.statusDot} />
        {t(`marketing:directory.card.state.${operatingState}`)}
      </span>
    );
  }

  // "By appointment only" keeps no hours, so the slot says how to book.
  if (isByAppointmentListing(place)) {
    return (
      <span className={s.status} data-preview-region="status">
        <FiCalendar className={s.statusIcon} aria-hidden />
        {t("marketing:directory.card.byAppointment")}
      </span>
    );
  }

  // An online-only business has no opening hours: the slot names how people
  // get what it sells, else its first session format, else nothing.
  if (place.online === true) {
    const onlineStatus = onlineStatusOf(place.onlineSummary);
    if (!onlineStatus) return null;
    const StatusIcon = onlineStatus.isSession ? FiVideo : FiPackage;
    return (
      <span className={s.status} data-preview-region="status">
        <StatusIcon className={s.statusIcon} aria-hidden />
        {t(onlineStatus.labelKey)}
      </span>
    );
  }

  const status = openStatus(
    place.hours,
    zonedNow(place.timezone),
    place.hoursExceptions,
  );
  if (status.state === "unknown") return null;

  if (status.state === "closed") {
    return (
      <span className={s.status} data-preview-region="status">
        <span className={s.statusDot} />
        {t("marketing:directory.card.closedNow")}
      </span>
    );
  }

  // `closesAt` is always set alongside an "open" state; the null branch below
  // keeps the copy honest in case it ever is not.
  const closesAt = status.closesAt;
  const isClosingSoon = status.isClosingSoon && closesAt !== null;
  return (
    <span className={s.status} data-preview-region="status">
      <span
        className={`${s.statusDot} ${isClosingSoon ? s.statusClosingSoon : s.statusOpen}`}
      />
      {closesAt === null
        ? t("marketing:directory.card.openNow")
        : isClosingSoon
          ? t("marketing:directory.card.closingSoon", { time: closesAt })
          : t("marketing:directory.card.openTill", { time: closesAt })}
    </span>
  );
}
