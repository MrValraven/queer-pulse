import { useCallback, useMemo, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import {
  coveredParishesOfPlace,
  isAcrossLisbonPlace,
  isMobilePlace,
  type LocalPlace,
} from "./localPlaces";
import { type DirectoryPlace } from "./directoryPlaces";
import { galleryShotsOf } from "./directoryGalleryShots";
import { type Venue } from "./map.data";
import { type VenueMarkerData } from "./venueMarker";

/** The place's cover photo URL, or undefined when it has none. A demo venue
 *  carries a hand-picked `photo`. A business's photos are its uploaded slots,
 *  wide shot first; its `gallery` holds caption text for the placeholder
 *  grid, so it is never read as an image. */
function placePhoto(place: LocalPlace): string | undefined {
  if (place.kind === "venue") {
    return (place.source as Venue).photo || undefined;
  }
  return galleryShotsOf(place.source as DirectoryPlace)[0]?.url;
}

/** A verified safe space, or a moderator-verified queer-owned business. */
function isPlaceVerified(place: LocalPlace): boolean {
  if (place.safeSpaceStatus === "verified") return true;
  return (
    place.kind === "business" &&
    (place.source as DirectoryPlace).queerOwnedVerified === true
  );
}

/** Adapt a coords-having LocalPlace to the map's marker shape. Every pin keys off
 *  the unified `category` (venue types fold into it upstream), so bars + clubs
 *  read as one "nightlife" pin, community spaces + listed spaces as one "space"
 *  pin: one coherent icon/colour legend across the whole map. */
function localPlaceToMarker(place: LocalPlace): VenueMarkerData {
  const coords = place.coords!;
  return {
    id: place.id,
    name: place.name,
    type: place.category,
    address: place.neighbourhood,
    latitude: coords.latitude,
    longitude: coords.longitude,
    photo: placePhoto(place),
    isVerified: isPlaceVerified(place),
    // An out-and-about listing on the map is always at its meeting point.
    isMeetingPoint: isMobilePlace(place),
  };
}

const NO_PARISHES: readonly string[] = [];

/** All the derived data + interaction state behind `DirectoryMapView`: the
 * map/sidebar split, parish (freguesia) grouping/filtering, pin↔card
 * selection sync, the "Across Lisbon" group and its parish shading, and the
 * "I've been here" tally. Kept out of the component
 * so its JSX stays focused. */
export function useDirectoryMapView(
  places: LocalPlace[],
  {
    isFullscreen = false,
  }: {
    /** The map stage is full screen. On a phone the list is then a sheet over
     *  the map with its own scroll, so a pin tap scrolls the sheet and leaves
     *  the page alone. */
    isFullscreen?: boolean;
  } = {},
) {
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
  // The card under the pointer or keyboard focus, mirrored onto its pin.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  // Out-and-about listings with no meeting point have no pin. They close the
  // sidebar as "Across Lisbon", narrowed to the selected parish when there is
  // one, and step aside while a pin has the sidebar.
  const acrossLisbon = useMemo(() => {
    if (focusedPlace) return [];
    return places.filter(
      (place) =>
        isAcrossLisbonPlace(place) &&
        (!selectedFreguesia ||
          coveredParishesOfPlace(place).includes(selectedFreguesia)),
    );
  }, [places, selectedFreguesia, focusedPlace]);

  // Hovering or focusing one of those cards shades the parishes it covers.
  const highlightedFreguesias = useMemo(() => {
    const hovered = acrossLisbon.find((place) => place.id === hoveredId);
    return hovered ? coveredParishesOfPlace(hovered) : NO_PARISHES;
  }, [acrossLisbon, hoveredId]);

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
  // opens. On mobile the list sits below the map, so bring it into view too;
  // in full screen it is the sheet over the map, and its top is where the
  // place now is.
  const selectPlace = useCallback(
    (placeId: string) => {
      setSelectedFreguesia(null);
      setFocusedId(placeId);
      setExpandedId(placeId);
      if (!isMobile) return;
      requestAnimationFrame(() => {
        if (isFullscreen) {
          sidebarRef.current?.scrollTo({ top: 0, behavior: scrollBehavior });
          return;
        }
        cardRefs.current
          .get(placeId)
          ?.scrollIntoView({ behavior: scrollBehavior, block: "center" });
      });
    },
    [isMobile, isFullscreen, scrollBehavior],
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
    isMobile,
    sidebarRef,
    cardRefs,
    selectedFreguesia,
    expandedId,
    focusedPlace,
    hoveredId,
    setHoveredId,
    been,
    markers,
    counts,
    items,
    groups,
    acrossLisbon,
    highlightedFreguesias,
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
