import { useRef } from "react";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
import { placeAreaParts } from "./placeArea";
import { DirectoryContactRows } from "./DirectoryContactRows";
import { DirectoryMessageBusiness } from "./DirectoryMessageBusiness";
import { DirectoryVisitCardProvider } from "./DirectoryVisitCardProvider";
import { useOptionalDirectoryVisitCard } from "./directoryVisitCardContext";
import { useCarryVisitCardFocus } from "./visitCardFocusCarry";
import { useVisitMapReach } from "./useVisitMapReach";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: threaded to `DirectoryMessageBusiness`, which renders
   *  nothing there, so the card stays read-only. */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Threaded solely so `DirectoryMessageBusiness` can skip its member-gated
   * contact read for an owner, who has "Edit this listing" rather than an
   * inbox of their own to write to. */
  ownerRef?: string;
  /** Set by the rail only: stretches the map band so the card ends level with
   *  the hours card beside it (see `useVisitMapReach`). */
  shouldReachHoursEnd?: boolean;
}

/**
 * "Where it is": the map, the address, every contact route and the primary
 * call to action, in one card.
 *
 * It has two homes, and exactly one is mounted at a time (the card carries a
 * live map). Wherever the body grid is two columns it opens the rail
 * (`DirectorySpaceAside`), level with the start of the main column, where the
 * practical answers sit beside the listing from the first screen. Where
 * the grid is one column (phones, the moderation drawer) it sits in the main
 * column right after the hours (`DirectorySpaceMain`), where somebody deciding
 * where to go tonight meets it one screen in. The card is built to read at
 * both widths: its own container query gives the map a taller band only when
 * the card is wide. In the rail the map band also grows until the card ends
 * level with the hours card beside it (`useVisitMapReach`), so the two columns
 * close on one line. What has to survive a move (an enquiry draft, a reported
 * cap, keyboard focus) lives in `DirectoryVisitCardProvider` above both
 * columns.
 *
 * The area line (neighbourhood and city) sits under the heading as a subline,
 * mirroring the main column's first section so the two columns' cards start
 * level.
 *
 * Map and details share ONE card. The old pair of loose flex columns left a
 * 200px square map with its address orphaned underneath, and a details column
 * that, for a listing with no phone, site or Instagram, held nothing but a
 * saved-count floating in the middle of the page. The card gives the map and
 * the details one shared border and pins the saved-count and the real call to
 * action to the foot of the details column. Getting back to the directory is
 * the breadcrumb's job at the top of the page, so the card carries no link of
 * its own for it.
 */
export function DirectoryVisitSection(props: Props) {
  // `DirectorySpaceView` provides the state owner for the whole page. A caller
  // that renders a column on its own (a test) gets one scoped to this card.
  const hasStateOwner = useOptionalDirectoryVisitCard() !== null;
  if (hasStateOwner) return <DirectoryVisitCard {...props} />;
  return (
    <DirectoryVisitCardProvider place={props.place}>
      <DirectoryVisitCard {...props} />
    </DirectoryVisitCardProvider>
  );
}

function DirectoryVisitCard({
  place,
  preview = false,
  ownerRef,
  shouldReachHoursEnd = false,
}: Props) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useCarryVisitCardFocus(cardRef, headingRef, `.${s.visitMap}`);
  useVisitMapReach(cardRef, shouldReachHoursEnd);
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
  const areaLine = place.online ? "" : placeAreaParts(place).join(" · ");

  const heading = (
    // Focusable from script only: the fallback target when focus sat in the
    // map as the card changed column (see visitCardFocusCarry).
    <h2 ref={headingRef} tabIndex={-1}>
      {t("marketing:directory.detail.visitTitle")}
    </h2>
  );

  return (
    <section ref={cardRef} className={s.sec}>
      {areaLine ? (
        <>
          {heading}
          <p className={s.subLine}>{areaLine}</p>
        </>
      ) : (
        <div className={s.secHead}>{heading}</div>
      )}
      <div className={s.visitShell}>
        <div className={s.visitCard}>
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
    </section>
  );
}
