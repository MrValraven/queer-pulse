import { type LocalPlace } from "./localPlaces";
import { type DirectoryPlace } from "./directoryPlaces";
import { type Venue } from "./map.data";
import { LocalBusinessCard } from "./LocalBusinessCard";
import { LocalVenueCard } from "./LocalVenueCard";
import { LocalWalkTimeTag } from "./LocalWalkTimeTag";

/**
 * Renders one unified place as the right card for its kind, wired to shared
 * expand/been-here state (keyed by place.id so list + map behave identically).
 */
export function LocalPlaceCard({
  place,
  index,
  distanceMetres,
  expandedId,
  been,
  onToggleExpand,
  onMarkBeen,
}: {
  place: LocalPlace;
  index: number;
  /** How far the member is from here, once they have opted in to "use my
   *  location". Undefined whenever there is no position, or whenever this
   *  place has no coordinates of its own to measure to. */
  distanceMetres?: number;
  expandedId: string | null;
  been: Record<string, number>;
  onToggleExpand: (placeId: string) => void;
  onMarkBeen: (placeId: string, currentBeen: number) => void;
}) {
  if (place.kind === "business") {
    return (
      <LocalBusinessCard
        place={place.source as DirectoryPlace}
        index={index}
        photoTag={
          distanceMetres === undefined ? undefined : (
            <LocalWalkTimeTag metres={distanceMetres} />
          )
        }
      />
    );
  }
  const venue = place.source as Venue;
  return (
    <LocalVenueCard
      venue={venue}
      index={index}
      isExpanded={expandedId === place.id}
      beenCount={been[place.id] ?? venue.beenHere}
      marked={been[place.id] !== undefined}
      onToggle={() => onToggleExpand(place.id)}
      onMarkBeen={() => onMarkBeen(place.id, venue.beenHere)}
    />
  );
}
