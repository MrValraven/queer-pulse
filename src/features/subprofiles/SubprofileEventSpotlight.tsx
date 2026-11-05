import { FiArrowRight, FiExternalLink, FiMapPin } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { Button, Eyebrow, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EventDateBlock } from "./EventDateBlock";
import { eventDateLabels } from "./eventDateLabels";
import { isEventUpcoming } from "./eventDates";
import { ItemStateChip } from "./ItemStateChip";
import {
  isItemPhotoBlurred,
  itemCoverUrl,
} from "./skins/tattoo/tattooItemImages";
import { BlurredPhoto } from "./BlurredPhoto";
import { soonestUpcomingEvent } from "./skins/posterEvents";
import type { PersonaViewMode } from "./personaSkinRender";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";

/** The eyebrow over the poster: "Next event" for the soonest upcoming event,
 *  "Coming up" for a later one, "From the archive" once the date has passed. */
function spotlightEyebrowKey(
  item: SubprofileItemView,
  isUpcoming: boolean,
  sections: SubprofileSectionView[] | undefined,
): string {
  if (!isUpcoming) return "subprofiles:spotlight.fromArchive";
  // Without the page's sections there is nothing to compare against, so an
  // upcoming event keeps reading as the next one.
  if (!sections) return "subprofiles:spotlight.nextEvent";
  const soonest = soonestUpcomingEvent(sections);
  const isSoonest =
    soonest === item || (Boolean(item.id) && soonest?.id === item.id);
  return isSoonest
    ? "subprofiles:spotlight.nextEvent"
    : "subprofiles:spotlight.comingUp";
}

/** The poster's one action: open the event sheet when the page has one, else
 *  the event's own page, else nothing. In the editor's preview it is a
 *  disabled look-alike so a click can never leave the editor. */
function EventSpotlightAction({
  item,
  isInteractive,
  onOpenEvent,
}: {
  item: SubprofileItemView;
  isInteractive: boolean;
  onOpenEvent?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const eventHref = safeHref(item.url);
  if (onOpenEvent) {
    const label = t("subprofiles:spotlight.eventDetails");
    return isInteractive ? (
      <Button
        variant="primary"
        size="md"
        className="pp-spot-cta"
        onClick={() => onOpenEvent(item)}
      >
        {label} <FiArrowRight aria-hidden />
      </Button>
    ) : (
      <Button variant="primary" size="md" className="pp-spot-cta" disabled>
        {label} <FiArrowRight aria-hidden />
      </Button>
    );
  }
  if (!eventHref) return null;
  const label = t("subprofiles:event.sheet.eventPage");
  return isInteractive ? (
    <Button
      variant="primary"
      size="md"
      className="pp-spot-cta"
      href={eventHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label} <FiExternalLink aria-hidden />
    </Button>
  ) : (
    <Button variant="primary" size="md" className="pp-spot-cta" disabled>
      {label} <FiExternalLink aria-hidden />
    </Button>
  );
}

/**
 * The featured event on a Poster (collective) page, printed as the event's
 * own poster: the image in the skin's grayscale riso grade beside a column
 * that leads with the stacked date at twice the row size, then the title, the
 * venue, the doors time and the line-up. The eyebrow says "Next event" when
 * this is the soonest upcoming event, "Coming up" for a later one, and "From
 * the archive" once the date has passed; `data-upcoming` on the root carries
 * the same split for the CSS. Two columns once the page is wide enough
 * (`persona-skins.css`, `.pp-spot-poster`), stacked on a phone.
 */
export function SubprofileEventSpotlight({
  item,
  mode,
  sections,
  onOpenEvent,
}: {
  item: SubprofileItemView;
  mode: PersonaViewMode;
  /** The persona's sections, featured item included, to tell whether this is
   *  the soonest upcoming event. */
  sections?: SubprofileSectionView[];
  onOpenEvent?: (item: SubprofileItemView) => void;
}) {
  const { t, language } = useTranslation();
  const isInteractive = mode !== "preview";
  const labels = eventDateLabels(item.date, language);
  const isUpcoming = isEventUpcoming(item.date);
  const shouldShowYear =
    labels !== null && labels.year !== new Date().getFullYear();
  const venue = item.venue?.trim() || item.subtitle;
  const coverUrl = itemCoverUrl(item);
  const isCoverBlurred = coverUrl !== "" && isItemPhotoBlurred(item);
  const hasChip = Boolean(item.gigState || item.workState);
  const doors = (item.doors ?? "").trim();
  const coverImage = (
    <ImageSlot
      src={coverUrl}
      alt={item.title}
      tint="plum"
      radius={0}
      height="100%"
      className="ph"
    />
  );

  return (
    <div
      className="pp-spot pp-spot-poster"
      data-has-image={coverUrl ? "" : undefined}
      data-upcoming={isUpcoming ? "true" : "false"}
      data-preview-anchor={`section:${item.section}`}
    >
      {coverUrl && (
        <div className="art">
          {isCoverBlurred ? (
            <BlurredPhoto isBlurred revealKey={coverUrl}>
              {coverImage}
            </BlurredPhoto>
          ) : (
            coverImage
          )}
        </div>
      )}
      <div className="txt">
        <Eyebrow className="pp-spot-eyebrow">
          {t(spotlightEyebrowKey(item, isUpcoming, sections))}
        </Eyebrow>
        <EventDateBlock
          labels={labels}
          rawDate={item.date}
          shouldShowYear={shouldShowYear}
        />
        {labels && <span className="visuallyHidden">{labels.longLabel}</span>}
        <h2>{item.title}</h2>
        {venue && (
          <p className="pp-spot-venue">
            <FiMapPin aria-hidden />
            <span>{venue}</span>
          </p>
        )}
        {doors && (
          <p className="pp-spot-doors">
            {t("subprofiles:row.doors", { doors })}
          </p>
        )}
        {item.meta && <p className="pp-spot-lineup">{item.meta}</p>}
        {hasChip && <ItemStateChip item={item} />}
        <EventSpotlightAction
          item={item}
          isInteractive={isInteractive}
          onOpenEvent={onOpenEvent}
        />
      </div>
    </div>
  );
}
