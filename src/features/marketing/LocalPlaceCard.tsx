import { type LocalPlace } from "./localPlaces";
import { type DirectoryPlace } from "./directoryPlaces";
import { type Venue } from "./map.data";
import { LocalBusinessCard } from "./LocalBusinessCard";
import { LocalVenueCard } from "./LocalVenueCard";

/**
 * Renders one unified place as the right card for its kind, wired to shared
 * expand/been-here state (keyed by place.id so list + map behave identically).
 */
export function LocalPlaceCard({
  place,
  index,
  expandedId,
  been,
  onToggleExpand,
  onMarkBeen,
}: {
  place: LocalPlace;
  index: number;
  expandedId: string | null;
  been: Record<string, number>;
  onToggleExpand: (placeId: string) => void;
  onMarkBeen: (placeId: string, currentBeen: number) => void;
}) {
  if (place.kind === "business") {
    return (
      <LocalBusinessCard place={place.source as DirectoryPlace} index={index} />
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
