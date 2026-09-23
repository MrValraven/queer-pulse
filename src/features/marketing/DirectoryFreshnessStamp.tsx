import { FiAlertCircle, FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { parseListingDate, type DirectoryPlace } from "./directoryPlaces";
import { listingFreshnessOf } from "./listingFreshness";
import s from "./DirectorySpacePage.module.css";

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
 * The six-month staleness rule itself lives in `./listingFreshness`, shared
 * with the owner-facing surfaces so the two can never disagree about when a
 * confirmation stopped counting.
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

  const freshness = listingFreshnessOf(place.detailsConfirmedAt, venueNow);
  const confirmedAt = parseListingDate(place.detailsConfirmedAt);
  const ownerFirstName = place.owner.first.trim();
  const hasOwnerName = ownerFirstName.length > 0;

  // The second half of the test is a type narrowing: `confirmedAt` is null on
  // exactly the values that make the freshness read "unconfirmed".
  if (freshness === "unconfirmed" || !confirmedAt) {
    return (
      <p className={`${s.freshness} ${s.freshnessUnknown}`}>
        <FiHelpCircle aria-hidden />
        {t("marketing:directory.detail.freshness.unconfirmed")}
      </p>
    );
  }

  const date = fmt.date(confirmedAt);

  if (freshness === "stale") {
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
