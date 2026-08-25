import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  hoursRows,
  openStatus,
  operatingStateOf,
  realHoursRows,
  zonedNow,
  type DirectoryPlace,
} from "./directoryPlaces";
import { DirectoryFreshnessStamp } from "./DirectoryFreshnessStamp";
import { DirectoryHoursExceptions } from "./DirectoryHoursExceptions";
import s from "./DirectorySpacePage.module.css";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7v5l3 2" />
  </svg>
);

/** The live chip above the table: open, closing soon, closed, or the flat
 *  "temporarily closed" statement that replaces the whole calculation while a
 *  business is on pause. Returns null when there is nothing truthful to say. */
function HoursStatusChip({
  place,
  venueNow,
}: {
  place: DirectoryPlace;
  venueNow: Date;
}) {
  const { t } = useTranslation();
  if (operatingStateOf(place) === "temporarily_closed") {
    return (
      <span className={s.closedChip}>
        {t("marketing:directory.detail.operating.temporarily_closed.chip")}
      </span>
    );
  }
  const status = openStatus(place.hours, venueNow, place.hoursExceptions);
  if (status.state === "unknown") return null;
  if (status.state === "closed") {
    return (
      <span className={s.closedChip}>
        {t("marketing:directory.detail.closedNow")}
      </span>
    );
  }
  if (status.isClosingSoon && status.closesAt) {
    return (
      <span className={s.closingSoonChip}>
        {t("marketing:directory.detail.closingSoon", { time: status.closesAt })}
      </span>
    );
  }
  return (
    <span className={s.openChip}>
      {t("marketing:directory.detail.openNow")}
    </span>
  );
}

/**
 * The listing's hours block: live status chip, the weekly grid (or the
 * by-appointment note), the upcoming one-off exceptions, and the freshness
 * stamp saying who last vouched for any of it.
 *
 * Two suppressions live here, both deliberate:
 *
 * - a `permanently_closed` or `moved` business renders NO hours at all. A
 *   weekly grid is an invitation to turn up on Thursday, and there is nothing
 *   to turn up to. The banner at the top of the page carries the story instead.
 * - a `temporarily_closed` business keeps its grid, greyed and captioned as
 *   the usual hours, but the open/closed calculation is replaced outright: a
 *   venue on pause must never render "Open now" because Tuesdays usually are.
 *
 * Everything is evaluated against the VENUE's clock (`zonedNow(place.timezone)`),
 * which is also what decides which exceptions still count as upcoming.
 */
export function DirectoryHoursSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const operatingState = operatingStateOf(place);
  // An online-only business has no doors to open, and a gone business has no
  // hours worth publishing.
  if (place.online) return null;
  if (operatingState === "permanently_closed" || operatingState === "moved") {
    return null;
  }

  const isTemporarilyClosed = operatingState === "temporarily_closed";
  const hasRealHours =
    place.hours != null && Object.keys(place.hours).length > 0;
  const rows = hasRealHours
    ? realHoursRows(place.hours!)
    : hoursRows(place.hoursType);
  const venueNow = zonedNow(place.timezone);
  const todayIndex = (venueNow.getDay() + 6) % 7;
  const isAppointmentOnly = !hasRealHours && place.hoursType === "appointment";

  return (
    <section className={s.sec}>
      <h2>{t("marketing:directory.detail.hoursTitle")}</h2>
      <p className={s.subLine}>{place.hoursNote}</p>
      {/* The "temporarily closed" statement does not depend on there being
          hours to evaluate, so it shows either way. */}
      {(hasRealHours || isTemporarilyClosed) && (
        <HoursStatusChip place={place} venueNow={venueNow} />
      )}
      {isTemporarilyClosed && (
        <p className={s.hoursStateNote}>
          {t(
            "marketing:directory.detail.operating.temporarily_closed.hoursNote",
          )}
        </p>
      )}
      {isAppointmentOnly ? (
        <div className={s.apptNote}>
          <div className={s.featureIc}>
            <ClockIcon />
          </div>
          {place.hoursNote}
        </div>
      ) : (
        <div
          className={
            isTemporarilyClosed
              ? `${s.hoursTable} ${s.hoursMuted}`
              : s.hoursTable
          }
        >
          {rows.map((row, index) => (
            <div
              key={row.dayKey}
              className={[
                s.hoursRow,
                index === todayIndex && !isTemporarilyClosed && s.hoursToday,
                row.closed && s.hoursClosed,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={s.hoursDay}>
                {t(`marketing:directory.days.${row.dayKey}`)}
                {index === todayIndex && !isTemporarilyClosed && (
                  <span className={s.todayTag}>
                    {t("marketing:directory.detail.today")}
                  </span>
                )}
              </span>
              <span>
                {row.val ?? t("marketing:directory.detail.hoursClosed")}
              </span>
            </div>
          ))}
        </div>
      )}
      <DirectoryHoursExceptions
        exceptions={place.hoursExceptions}
        venueNow={venueNow}
      />
      <DirectoryFreshnessStamp place={place} venueNow={venueNow} />
    </section>
  );
}
