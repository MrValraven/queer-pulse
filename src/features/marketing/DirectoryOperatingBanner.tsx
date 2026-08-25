import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiMapPin, FiXCircle } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath } from "../../app/routeMap";
import {
  operatingStateOf,
  parseListingDate,
  type DirectoryPlace,
  type OperatingStateValue,
} from "./directoryPlaces";
import s from "./DirectoryOperatingBanner.module.css";

/** Per-state icon and the i18n key stems. Kept as one table so a new state
 *  can never end up with copy but no icon, or the reverse. */
const STATE_ICON: Record<
  Exclude<OperatingStateValue, "open">,
  typeof FiClock
> = {
  temporarily_closed: FiClock,
  permanently_closed: FiXCircle,
  moved: FiMapPin,
};

/**
 * The honest header a listing gets the moment it stops trading normally.
 *
 * Renders nothing while the business is open, which is also what an absent
 * `operatingState` means (demo fixtures, older payloads), so the page only
 * ever claims a closure the backend actually reported.
 *
 * Each state reads differently on purpose. A temporary closure is a pause and
 * keeps an amber, reversible tone. A move points somewhere: it carries the new
 * address and, when the new premises are listed here too, a link straight to
 * the successor. A permanent closure gets the heaviest treatment on the page,
 * because everything below it (reviews, photos, the owner card) is now a
 * record of a business that existed rather than an invitation to visit.
 */
/** One banner per page, so a fixed id is safe and keeps the landmark named by
 *  its own heading instead of a duplicated `aria-label`. */
const TITLE_ID = "directory-operating-state";

export function DirectoryOperatingBanner({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const state = operatingStateOf(place);
  if (state === "open") return null;

  const operatingState = place.operatingState;
  const StateIcon = STATE_ICON[state];
  const setAtDate = parseListingDate(operatingState?.setAt);
  const note = operatingState?.note?.trim();
  const movedToAddress = operatingState?.movedToAddress?.trim();
  const successor = state === "moved" ? place.movedToListing : null;

  return (
    <div className={s.wrap}>
      <section
        className={s.banner}
        data-state={state}
        aria-labelledby={TITLE_ID}
      >
        <span className={s.icon} aria-hidden>
          <StateIcon />
        </span>
        <div className={s.body}>
          <h2 className={s.title} id={TITLE_ID}>
            {t(`marketing:directory.detail.operating.${state}.title`)}
          </h2>
          <p className={s.lead}>
            {t(`marketing:directory.detail.operating.${state}.lead`)}
          </p>
          {note && <p className={s.note}>{note}</p>}
          {state === "moved" && movedToAddress && (
            <p className={s.newAddress}>
              <FiMapPin aria-hidden />
              <span>
                {t("marketing:directory.detail.operating.moved.newAddress", {
                  address: movedToAddress,
                })}
              </span>
            </p>
          )}
          {successor && (
            <Link className={s.successor} to={businessPath(successor.slug)}>
              {t("marketing:directory.detail.operating.moved.seeSuccessor", {
                name: successor.name,
              })}
              <FiArrowRight aria-hidden />
            </Link>
          )}
          {setAtDate && (
            <span className={s.meta}>
              {t(`marketing:directory.detail.operating.${state}.since`, {
                date: fmt.date(setAtDate),
              })}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
