import { useMemo } from "react";
import { Collapse } from "../../shared/components/ui";
import type { StudioSpotlightArtistView } from "./api/studioDiscovery.adapters";
import { StudioArtistsRow } from "./StudioArtistsRow";

/** New stars on Studio home: the artists staff picked, in the order they
 *  set, each with its note when it has one. It folds away while empty or
 *  unread, and it ignores the format chip, like the curated shelves. */
export function StudioNewStarsShelf({
  stars,
}: {
  stars: StudioSpotlightArtistView[];
}) {
  const noteByArtistId = useMemo(
    () =>
      new Map(
        stars.flatMap((star) =>
          star.note ? [[star.artist.id, star.note] as const] : [],
        ),
      ),
    [stars],
  );
  return (
    <Collapse isOpen={stars.length > 0}>
      <StudioArtistsRow
        artists={stars.map((star) => star.artist)}
        titleKey="studio:home.newStars.title"
        noteByArtistId={noteByArtistId}
      />
    </Collapse>
  );
}
