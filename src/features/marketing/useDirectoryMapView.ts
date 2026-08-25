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
  // A place picked straight off the map. It takes over the sidebar (one card,
  // its own heading) instead of being hunted for inside a parish list.
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  const mappable = useMemo(
    () => places.filter((place) => place.coords !== null),
    [places],
  );
  // Picking a parish narrows the map to that parish's own pins. Every other
  // parish keeps its name and count label (see `counts`, which stays computed
  // over the whole set) so an emptied area still says how much is in it.
  const markers = useMemo(
    () =>
      (selectedFreguesia
        ? mappable.filter((place) => place.freguesia === selectedFreguesia)
        : mappable
      ).map(localPlaceToMarker),
    [mappable, selectedFreguesia],
  );

  const counts = useMemo(() => {
    const byFreguesia: Record<string, number> = {};
    mappable.forEach((place) => {
      byFreguesia[place.freguesia] = (byFreguesia[place.freguesia] ?? 0) + 1;
    });
    return byFreguesia;
  }, [mappable]);

  // Resolved rather than stored, so a place that upstream filters drop stops
  // holding the sidebar hostage.
  const focusedPlace = useMemo(
    () => mappable.find((place) => place.id === focusedId) ?? null,
    [mappable, focusedId],
  );

  const items = useMemo(() => {
    if (focusedPlace) return [focusedPlace];
    return selectedFreguesia
      ? mappable.filter((place) => place.freguesia === selectedFreguesia)
      : mappable;
  }, [mappable, selectedFreguesia, focusedPlace]);

  const groups = useMemo(() => {
    if (selectedFreguesia || focusedPlace) return null;
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
  }, [items, selectedFreguesia, focusedPlace]);

  const scrollBehavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

  function selectFreguesia(name: string | null) {
    setSelectedFreguesia(name);
    setExpandedId(null);
    setFocusedId(null);
  }
  // The map's own parish handler. The overlay only reports which parish was
  // clicked, so clicking the highlighted one again is what clears the
  // selection: pins come back everywhere and the camera eases out.
  const toggleFreguesia = useCallback((name: string) => {
    setSelectedFreguesia((current) => (current === name ? null : name));
    setExpandedId(null);
    setFocusedId(null);
  }, []);
  // Tapping a map pin hands the sidebar over to that one place: the parish
  // filter steps aside, since the pin itself is the answer, and the card
  // opens. On mobile the list sits below the map, so bring it into view too.
  const selectPlace = useCallback(
    (placeId: string) => {
      setSelectedFreguesia(null);
      setFocusedId(placeId);
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
  function clearFocus() {
    setFocusedId(null);
    setExpandedId(null);
  }
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
    focusedPlace,
    been,
    markers,
    counts,
    items,
    groups,
    selectFreguesia,
    toggleFreguesia,
    selectPlace,
    clearFocus,
    toggleExpand,
    markBeen,
    jumpToList,
  };
}

export type DirectoryMapViewState = ReturnType<typeof useDirectoryMapView>;
