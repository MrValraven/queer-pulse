import { useEffect, useRef } from "react";
import { GREATER_LISBON_BOUNDS } from "../../shared/components/map/siteMapStyle";
import { useBaseMap } from "../../shared/components/map/useBaseMap";
import {
  createFreguesiaOverlay,
  type FreguesiaOverlay,
} from "../../shared/components/map/freguesiaOverlay";
import { freguesiaBounds } from "../../shared/components/map/freguesiaBounds";
import {
  createVenueMarkerManager,
  type VenueMarkerManager,
  type MarkerLabels,
  type VenueMarkerData,
} from "./venueMarker";

interface UseLisbonMapOptions {
  venues: VenueMarkerData[];
  selectedFreguesia: string | null;
  selectedVenueId: string | null;
  counts: Record<string, number>;
  markerLabels: MarkerLabels;
  onSelectFreguesia: (name: string | null) => void;
  onSelectVenue: (venueId: string) => void;
}

export function useLisbonMap({
  venues,
  selectedFreguesia,
  selectedVenueId,
  counts,
  markerLabels,
  onSelectFreguesia,
  onSelectVenue,
}: UseLisbonMapOptions) {
  const overlayRef = useRef<FreguesiaOverlay | null>(null);
  const markerManagerRef = useRef<VenueMarkerManager | null>(null);

  // Latest values without re-creating the map; read from the onLoad/onReveal
  // callbacks (closed over the hook's first render) and from click handlers
  // that fire well after this effect runs.
  const venuesRef = useRef(venues);
  const selectedFreguesiaRef = useRef(selectedFreguesia);
  const selectedVenueIdRef = useRef(selectedVenueId);
  const markerLabelsRef = useRef(markerLabels);
  const selectFreguesiaRef = useRef(onSelectFreguesia);
  const selectVenueRef = useRef(onSelectVenue);
  useEffect(() => {
    venuesRef.current = venues;
    selectedFreguesiaRef.current = selectedFreguesia;
    selectedVenueIdRef.current = selectedVenueId;
    markerLabelsRef.current = markerLabels;
    selectFreguesiaRef.current = onSelectFreguesia;
    selectVenueRef.current = onSelectVenue;
  });

  const { containerRef, mapRef, ready, failed } = useBaseMap({
    bounds: GREATER_LISBON_BOUNDS,
    fitBoundsOptions: { padding: 24 },
    revealOn: "idle",
    onLoad: (map) => {
      overlayRef.current = createFreguesiaOverlay(map, {
        counts,
        selected: new Set(
          selectedFreguesiaRef.current ? [selectedFreguesiaRef.current] : [],
        ),
        onSelect: (name) => selectFreguesiaRef.current(name),
      });

      const markerManager = createVenueMarkerManager(
        map,
        (venueId) => selectVenueRef.current(venueId),
        () => markerLabelsRef.current,
      );
      markerManagerRef.current = markerManager;
      markerManager.setSelected(selectedVenueIdRef.current);
    },
    onReveal: () => {
      // Drawing pins + repainting selection only at reveal time means the
      // staggered drop-in lands on a settled canvas, not a still-loading one.
      markerManagerRef.current?.render(venuesRef.current);
      overlayRef.current?.setSelected(
        new Set(selectedFreguesiaRef.current ? [selectedFreguesiaRef.current] : []),
      );
    },
    onCleanup: () => {
      overlayRef.current?.detach();
      overlayRef.current = null;
      markerManagerRef.current?.clear();
      markerManagerRef.current = null;
    },
  });

  // Re-render the venue pins for the current filter. Depends on `ready` so a
  // filter change made *during* map load (when this bails early) is
  // re-applied the moment the map becomes ready.
  useEffect(() => {
    if (!ready) return;
    markerManagerRef.current?.render(venues);
  }, [venues, ready]);

  // Push counts into the overlay's label source.
  useEffect(() => {
    if (!ready) return;
    overlayRef.current?.setCounts(counts);
  }, [counts, ready]);

  // Reflect the selected parish highlight and ease the camera to it (back to
  // the full city when cleared).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    overlayRef.current?.setSelected(
      new Set(selectedFreguesia ? [selectedFreguesia] : []),
    );
    const bounds = selectedFreguesia ? freguesiaBounds([selectedFreguesia]) : null;
    if (bounds) {
      map.fitBounds(bounds, { padding: 56, maxZoom: 15.5, duration: 700 });
    } else if (!selectedFreguesia) {
      map.fitBounds(GREATER_LISBON_BOUNDS, { padding: 24, duration: 700 });
    }
  }, [selectedFreguesia, ready, mapRef]);

  // Reflect the selected venue pin.
  useEffect(() => {
    if (!ready) return;
    markerManagerRef.current?.setSelected(selectedVenueId);
  }, [selectedVenueId, ready]);

  return { containerRef, failed, ready };
}
