import { FiArrowLeft, FiArrowRight, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  operatingStateOf,
  type DirectoryPlace,
  websiteHref,
} from "./directoryPlaces";
import {
  DirectoryPlaceAddress,
  DirectoryPlaceMap,
  DirectoryPlaceOnline,
} from "./DirectoryPlaceLocation";
import { DirectoryContactRows } from "./DirectoryContactRows";
import { DirectoryMessageBusiness } from "./DirectoryMessageBusiness";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the "back to directory" link doesn't render, matching
   *  how the rest of the page's navigation is inert there. */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Threaded solely so `DirectoryMessageBusiness` can skip its member-gated
   * contact read for an owner, who has "Edit this listing" rather than an
   * inbox of their own to write to. */
  ownerRef?: string;
}

/**
 * "Where it is": the second question a member asks, right after "is it open".
 *
 * This is the old aside contact card, moved into the main column and given a
 * heading. It was the single most useful block on the page and it was sitting
 * in a rail that a phone reader only reaches after the entire review list. The
 * map, the address, every contact route and the primary call to action now sit
 * one screen below the hours, where somebody deciding where to go tonight can
 * actually find them.
 *
 * They now sit in ONE card rather than two loose flex columns. The old pair
 * left a 200px square map with its address orphaned underneath, and a details
 * column that — for a listing with no phone, site or Instagram — held nothing
 * but a saved-count and a full-width "back to directory" button, floating in
 * the middle of the page with no edge to belong to. The card gives the map and
 * the details one shared border, pins the saved-count and the real call to
 * action to the foot of the details column, and demotes "back to directory" to
 * a quiet link below the card, which is what a navigation escape hatch is.
 */
export function DirectoryVisitSection({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const isPermanentlyClosed = operatingStateOf(place) === "permanently_closed";

  // A closed business's inbox is not somewhere to write to (see
  // `DirectoryContactRows` for the same distinction on the rows themselves), so
  // the email fallback disappears with it and the card may have no action left.
  const primaryAction = place.social.website
    ? "website"
    : place.social.email && !isPermanentlyClosed
      ? "email"
      : null;
  const hasSavedSignal = place.savedCount != null && place.savedCount > 0;

  return (
    <section className={s.sec}>
      <div className={s.secHead}>
        <h2>{t("marketing:directory.detail.visitTitle")}</h2>
      </div>
      <div className={s.visitShell}>
        <div
          className={
            place.online ? `${s.visitCard} ${s.visitCardOnline}` : s.visitCard
          }
        >
          {!place.online && <DirectoryPlaceMap place={place} />}
          <div className={s.visitBody}>
            {place.online ? (
              <DirectoryPlaceOnline place={place} />
            ) : (
              <DirectoryPlaceAddress place={place} />
            )}
            <DirectoryContactRows place={place} />
            {/* The one contact route that stays inside QueerPulse. Last in the
                list because the rows above are the business's own published
                details, and first in usefulness whenever every one of them is
                empty. */}
            <DirectoryMessageBusiness
              place={place}
              preview={preview}
              ownerRef={ownerRef}
            />
            {(hasSavedSignal || primaryAction) && (
              <div className={s.visitFoot}>
                {hasSavedSignal && (
                  <div className={s.savedSignal}>
                    <FiHeart aria-hidden />
                    {t("marketing:directory.detail.savedByMembers", {
                      count: place.savedCount!,
                    })}
                  </div>
                )}
                {primaryAction && (
                  <div className={s.cta}>
                    {primaryAction === "website" ? (
                      <Button
                        variant="primary"
                        className={s.ctaBtn}
                        href={websiteHref(place.social.website!)}
                      >
                        {t("marketing:directory.detail.visitWebsite")}{" "}
                        <FiArrowRight aria-hidden />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className={s.ctaBtn}
                        href={`mailto:${place.social.email}`}
                      >
                        {t("marketing:directory.detail.getInTouch")}{" "}
                        <FiArrowRight aria-hidden />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {!preview && (
        <Link to={routes.directory} className={s.visitBack}>
          <FiArrowLeft aria-hidden />
          {t("marketing:directory.detail.backToDirectory")}
        </Link>
      )}
    </section>
  );
}
