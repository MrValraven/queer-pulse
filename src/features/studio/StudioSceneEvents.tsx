import { useId } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSceneEventView } from "./api/studioDiscovery.adapters";
import { StudioShelf } from "./kit/StudioShelf";
import css from "./StudioScene.module.css";

/** One upcoming event as a card linking to its event page: the title, the
 *  date in the event's own time zone, and the venue or Online. The title is
 *  an h3 by default; a list under an h3 section head passes h4. */
export function StudioEventCard({
  event,
  headingLevel = "h3",
}: {
  event: StudioSceneEventView;
  headingLevel?: "h3" | "h4";
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const Heading = headingLevel;
  return (
    <Link to={event.href} className={css.eventCard}>
      <Heading className={css.eventTitle}>{event.title}</Heading>
      <span className={css.eventDate}>
        {fmt.date(new Date(event.startAt), {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: event.timezone,
        })}
      </span>
      {(event.isOnline || event.placeName) && (
        <span className={css.eventPlace}>
          {event.isOnline ? t("studio:scene.events.online") : event.placeName}
        </span>
      )}
    </Link>
  );
}

/** Up to six upcoming events, soonest first, each linking to its event
 *  page. Folded away when the scene has none. */
export function StudioSceneEvents({
  events,
}: {
  events: StudioSceneEventView[];
}) {
  const headingId = useId();
  return (
    <Collapse isOpen={events.length > 0}>
      <StudioShelf
        id={headingId}
        layout="grid"
        title={
          <Translation
            i18nKey="studio:scene.events.title"
            components={{ em: <em /> }}
          />
        }
      >
        {events.map((event) => (
          <StudioEventCard key={event.slug} event={event} />
        ))}
      </StudioShelf>
    </Collapse>
  );
}
