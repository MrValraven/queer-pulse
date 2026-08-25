import { FiAlertCircle, FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { parseListingDate, type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/** After six months a confirmation stops being evidence and becomes a date.
 *  The stamp keeps showing it, worded so nobody mistakes it for freshness. */
const STALE_AFTER_DAYS = 180;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * "Details confirmed by Ana on 3 March 2026", sitting under the hours.
 *
 * The three cases are deliberately different sentences, because an unconfirmed
 * listing and a freshly confirmed one are not the same claim:
 *
 * - confirmed recently → a plain, jade-ticked statement of who and when;
 * - confirmed long ago → the same date, worded so it reads as history;
 * - never confirmed → says so outright and tells the visitor to check, rather
 *   than staying silent and letting the hours table imply an authority nobody
 *   ever gave it.
 *
 * The date always goes through the repo's localized `fmt.date`. `venueNow` is
 * the venue's own clock, passed down from the hours section so "how long ago
 * was that?" is measured on the same calendar the hours are, and so this stays
 * a pure render.
 */
export function DirectoryFreshnessStamp({
  place,
  venueNow,
}: {
  place: DirectoryPlace;
  venueNow: Date;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const confirmedAt = parseListingDate(place.detailsConfirmedAt);
  const ownerFirstName = place.owner.first.trim();
  const hasOwnerName = ownerFirstName.length > 0;

  if (!confirmedAt) {
    return (
      <p className={`${s.freshness} ${s.freshnessUnknown}`}>
        <FiHelpCircle aria-hidden />
        {t("marketing:directory.detail.freshness.unconfirmed")}
      </p>
    );
  }

  const daysSince = Math.floor(
    (venueNow.getTime() - confirmedAt.getTime()) / MILLISECONDS_PER_DAY,
  );
  const isStale = daysSince > STALE_AFTER_DAYS;
  const date = fmt.date(confirmedAt);

  if (isStale) {
    return (
      <p className={`${s.freshness} ${s.freshnessStale}`}>
        <FiAlertCircle aria-hidden />
        {hasOwnerName
          ? t("marketing:directory.detail.freshness.staleBy", {
              name: ownerFirstName,
              date,
            })
          : t("marketing:directory.detail.freshness.stale", { date })}
      </p>
    );
  }

  return (
    <p className={s.freshness}>
      <FiCheckCircle aria-hidden />
      {hasOwnerName
        ? t("marketing:directory.detail.freshness.confirmedBy", {
            name: ownerFirstName,
            date,
          })
        : t("marketing:directory.detail.freshness.confirmed", { date })}
    </p>
  );
}
