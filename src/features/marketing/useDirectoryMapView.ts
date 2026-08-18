import { useCallback, useMemo, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { type LocalPlace } from "./localPlaces";
import { type VenueMarkerData } from "./venueMarker";

/** Adapt a coords-having LocalPlace to the map's marker shape. Every pin keys off
 *  the unified `category` (venue types fold into it upstream), so bars + clubs
 *  read as one "nightlife" pin, community spaces + listed spaces as one "space"
 *  pin — one coherent icon/colour legend across the whole map. */
function localPlaceToMarker(place: LocalPlace): VenueMarkerData {
  const coords = place.coords!;
  return {
    id: place.id,
    name: place.name,
    type: place.category,
    address: place.neighbourhood,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

/** All the derived data + interaction state behind `DirectoryMapView`: the
 * map/sidebar split, parish (freguesia) grouping/filtering, pin↔card
 * selection sync, and the "I've been here" tally. Kept out of the component
 * so its JSX stays focused. */
export function useDirectoryMapView(places: LocalPlace[]) {
  // The map+sidebar split collapses at 880px (wider than the app mobile
  // cutover) so the map keeps usable width next to the list; off the ladder.
  const isMobile = useMediaQuery(mediaMax(880));
  const reducedMotion = usePrefersReducedMotion();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [selectedFreguesia, setSelectedFreguesia] = useState<string | null>(
    null,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  const mappable = useMemo(
    () => places.filter((place) => place.coords !== null),
    [places],
  );
  const markers = useMemo(() => mappable.map(localPlaceToMarker), [mappable]);

  const counts = useMemo(() => {
    const byFreguesia: Record<string, number> = {};
    mappable.forEach((place) => {
      byFreguesia[place.freguesia] = (byFreguesia[place.freguesia] ?? 0) + 1;
    });
    return byFreguesia;
  }, [mappable]);

  const items = useMemo(
    () =>
      selectedFreguesia
        ? mappable.filter((place) => place.freguesia === selectedFreguesia)
        : mappable,
    [mappable, selectedFreguesia],
  );

  const groups = useMemo(() => {
    if (selectedFreguesia) return null;
    const grouped: { freguesia: string; places: LocalPlace[] }[] = [];
    items.forEach((place) => {
      let group = grouped.find((entry) => entry.freguesia === place.freguesia);
      if (!group) {
        group = { freguesia: place.freguesia, places: [] };
        grouped.push(group);
      }
      group.places.push(place);
    });
    return grouped;
  }, [items, selectedFreguesia]);

  const scrollBehavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

  function selectFreguesia(name: string | null) {
    setSelectedFreguesia(name);
    setExpandedId(null);
  }
  // Tapping a map pin expands its card; on mobile the list sits below the map,
  // so bring the card into view rather than leaving the tap feel like a no-op.
  const selectPlace = useCallback(
    (placeId: string) => {
      setExpandedId(placeId);
      if (!isMobile) return;
      requestAnimationFrame(() => {
        cardRefs.current
          .get(placeId)
          ?.scrollIntoView({ behavior: scrollBehavior, block: "center" });
      });
    },
    [isMobile, scrollBehavior],
  );
  function toggleExpand(placeId: string) {
    setExpandedId((current) => (current === placeId ? null : placeId));
  }
  function markBeen(placeId: string, currentBeen: number) {
    setBeen((current) => ({ ...current, [placeId]: currentBeen + 1 }));
  }
  function jumpToList() {
    sidebarRef.current?.scrollIntoView({ behavior: scrollBehavior });
  }

  return {
    sidebarRef,
    cardRefs,
    selectedFreguesia,
    expandedId,
    been,
    markers,
    counts,
    items,
    groups,
    selectFreguesia,
    selectPlace,
    toggleExpand,
    markBeen,
    jumpToList,
  };
}

export type DirectoryMapViewState = ReturnType<typeof useDirectoryMapView>;
