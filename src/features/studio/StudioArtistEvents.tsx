import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useStudioArtistEvents } from "./api/useStudioArtistEvents";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioEventCard } from "./StudioSceneEvents";

/** "Upcoming events" on the artist's music tab: up to 4, soonest first,
 *  each linking to its event page. Folded away when there are none. */
export function StudioArtistEvents({ artistId }: { artistId: string }) {
  const headingId = useId();
  const events = useStudioArtistEvents(artistId);
  return (
    <Collapse isOpen={events.length > 0}>
      <StudioShelf
        id={headingId}
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
