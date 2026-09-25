import { useCallback, useMemo, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOUSING_PIN_TYPE } from "../marketing/map.data";
import type { MarkerLabels, VenueMarkerData } from "../marketing/venueMarker";
import {
  buildHousingClusters,
  housingPinId,
  neighbourhoodOfPin,
} from "./housingMapClusters";
import type { HousingListing } from "./housingListings";

/** All the derived data and interaction state behind `HousingMapView`: one pin
 * per neighbourhood, the parish selection shared by the overlay and the pins,
 * and the neighbourhood-grouped sidebar. Mirrors `useDirectoryMapView` so both
 * maps behave the same way. */
export function useHousingMapView(
  listings: HousingListing[],
  {
    isFullscreen = false,
  }: {
    /** The map stage is full screen. On a phone the list is then a sheet over
     *  the map with its own scroll, so a pin tap scrolls the sheet and leaves
     *  the page alone. */
    isFullscreen?: boolean;
  } = {},
) {
  const { t } = useTranslation();
  // Same 880px cutover as the directory map, so both stack at the same width.
  const isMobile = useMediaQuery(mediaMax(880));
  const reducedMotion = usePrefersReducedMotion();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [selectedFreguesia, setSelectedFreguesia] = useState<string | null>(
    null,
  );

  // Every neighbourhood with a mappable listing, busiest first.
  const clusters = useMemo(() => buildHousingClusters(listings), [listings]);

  // Computed over the whole mappable set, so every parish keeps its count
  // label while another one is selected.
  const counts = useMemo(() => {
    const byFreguesia: Record<string, number> = {};
    clusters.forEach((cluster) => {
      byFreguesia[cluster.name] = cluster.listings.length;
    });
    return byFreguesia;
  }, [clusters]);

  const visibleClusters = useMemo(
    () =>
      selectedFreguesia
        ? clusters.filter((cluster) => cluster.name === selectedFreguesia)
        : clusters,
    [clusters, selectedFreguesia],
  );

  // One pin per neighbourhood at its shared area-level point. A listing's own
  // point never reaches the map.
  const markers = useMemo<VenueMarkerData[]>(
    () =>
      visibleClusters.map((cluster) => ({
        id: housingPinId(cluster.name),
        name: cluster.name,
        type: HOUSING_PIN_TYPE,
        address: t("economy:housing.map.count", {
          count: cluster.listings.length,
        }),
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      })),
    [visibleClusters, t],
  );

  const markerLabels = useMemo<MarkerLabels>(
    () => ({
      venuePin: (name) =>
        t("economy:housing.map.pinAria", { name, count: counts[name] ?? 0 }),
      cluster: (count) => t("economy:housing.map.clusterAria", { count }),
    }),
    [counts, t],
  );

  const items = useMemo(
    () => visibleClusters.flatMap((cluster) => cluster.listings),
    [visibleClusters],
  );

  const groups = useMemo(
    () =>
      selectedFreguesia
        ? null
        : clusters.map((cluster) => ({
            freguesia: cluster.name,
            listings: cluster.listings,
          })),
    [clusters, selectedFreguesia],
  );

  const selectedPinId = selectedFreguesia
    ? housingPinId(selectedFreguesia)
    : null;
  const scrollBehavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

  function selectFreguesia(name: string | null) {
    setSelectedFreguesia(name);
  }
  // The map's own parish handler. The overlay only reports which parish was
  // clicked, so clicking the highlighted one again is what clears it.
  const toggleFreguesia = useCallback((name: string) => {
    setSelectedFreguesia((current) => (current === name ? null : name));
  }, []);
  // A pin is a whole neighbourhood, so tapping it selects that parish. On a
  // phone the list sits below the map, so bring it into view too; in full
  // screen it is the sheet over the map, and its top is where the homes are.
  const selectPin = useCallback(
    (pinId: string) => {
      setSelectedFreguesia(neighbourhoodOfPin(pinId));
      if (!isMobile) return;
      requestAnimationFrame(() => {
        if (isFullscreen) {
          sidebarRef.current?.scrollTo({ top: 0, behavior: scrollBehavior });
          return;
        }
        sidebarRef.current?.scrollIntoView({ behavior: scrollBehavior });
      });
    },
    [isMobile, isFullscreen, scrollBehavior],
  );
  function jumpToList() {
    sidebarRef.current?.scrollIntoView({ behavior: scrollBehavior });
  }

  return {
    isMobile,
    sidebarRef,
    selectedFreguesia,
    selectedPinId,
    markers,
    markerLabels,
    counts,
    items,
    groups,
    selectFreguesia,
    toggleFreguesia,
    selectPin,
    jumpToList,
  };
}

export type HousingMapViewState = ReturnType<typeof useHousingMapView>;
