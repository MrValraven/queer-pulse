import { useEffect, useRef, useState, type RefObject } from "react";
import type {
  ControlPosition,
  IControl,
  Map as MapLibreMap,
  PaddingOptions,
} from "maplibre-gl";
import { usePrefersReducedMotion } from "../../shared/hooks";
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
  /** The venue the sidebar is showing on its own, picked off the map. */
  focusedVenueId: string | null;
  counts: Record<string, number>;
  markerLabels: MarkerLabels;
  /** The overlay only ever reports which parish was clicked, so this takes a
   *  name: clearing the selection (clicking the highlighted parish again) is
   *  the caller's decision to make. */
  onSelectFreguesia: (name: string) => void;
  onSelectVenue: (venueId: string) => void;
  /** The list panel floating over the map, if any. The camera keeps pins,
   *  parish fits and the city view clear of it. */
  panelRef?: RefObject<HTMLElement | null>;
  /** Which map edge that panel covers right now: "right" for the desktop
   *  column, "bottom" for the full screen sheet on a phone, null while the
   *  list sits outside the map. */
  panelEdge?: MapPanelEdge | null;
  /** Adds an empty control slot under the zoom buttons for the caller to
   *  portal a full screen button into (see `fullscreenControlHost`). */
  hasFullscreenControl?: boolean;
}

export type MapPanelEdge = "right" | "bottom";

// The panel owns the right side of the map, so the zoom buttons and the full
// screen button stack in the opposite corner.
const CONTROLS_POSITION: ControlPosition = "top-left";

// Never let the panel claim more than this share of the map: past it the
// camera has no room to fit anything and maplibre refuses the fit outright.
const MAX_PANEL_PADDING_SHARE = 0.6;

const NO_PADDING: PaddingOptions = { top: 0, right: 0, bottom: 0, left: 0 };

/** The camera padding that keeps the visible map out from under the panel:
 *  the distance from the panel's inner edge to the map's matching edge, which
 *  is the panel's size plus its inset in one measurement. */
function measurePanelPadding(
  container: HTMLElement | null,
  panel: HTMLElement | null,
  edge: MapPanelEdge | null,
): PaddingOptions {
  if (!container || !panel || !edge) return NO_PADDING;
  const containerRect = container.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  if (edge === "right") {
    const covered = containerRect.right - panelRect.left;
    const limit = containerRect.width * MAX_PANEL_PADDING_SHARE;
    return {
      ...NO_PADDING,
      right: Math.round(Math.min(Math.max(covered, 0), limit)),
    };
  }
  const covered = containerRect.bottom - panelRect.top;
  const limit = containerRect.height * MAX_PANEL_PADDING_SHARE;
  return {
    ...NO_PADDING,
    bottom: Math.round(Math.min(Math.max(covered, 0), limit)),
  };
}

function isSamePadding(first: PaddingOptions, second: PaddingOptions) {
  return (
    first.top === second.top &&
    first.right === second.right &&
    first.bottom === second.bottom &&
    first.left === second.left
  );
}

export function useLisbonMap({
  venues,
  selectedFreguesia,
  selectedVenueId,
  focusedVenueId,
  counts,
  markerLabels,
  onSelectFreguesia,
  onSelectVenue,
  panelRef,
  panelEdge = null,
  hasFullscreenControl = false,
}: UseLisbonMapOptions) {
  const overlayRef = useRef<FreguesiaOverlay | null>(null);
  const markerManagerRef = useRef<VenueMarkerManager | null>(null);
  const fullscreenControlRef = useRef<IControl | null>(null);
  const [fullscreenControlHost, setFullscreenControlHost] =
    useState<HTMLElement | null>(null);
  const shouldReduceMotion = usePrefersReducedMotion();

  // Latest values without re-creating the map; read from the onLoad/onReveal
  // callbacks (closed over the hook's first render) and from click handlers
  // that fire well after this effect runs.
  const venuesRef = useRef(venues);
  const selectedFreguesiaRef = useRef(selectedFreguesia);
  const selectedVenueIdRef = useRef(selectedVenueId);
  const focusedVenueIdRef = useRef(focusedVenueId);
  const markerLabelsRef = useRef(markerLabels);
  const selectFreguesiaRef = useRef(onSelectFreguesia);
  const selectVenueRef = useRef(onSelectVenue);
  const panelEdgeRef = useRef(panelEdge);
  useEffect(() => {
    venuesRef.current = venues;
    selectedFreguesiaRef.current = selectedFreguesia;
    selectedVenueIdRef.current = selectedVenueId;
    focusedVenueIdRef.current = focusedVenueId;
    markerLabelsRef.current = markerLabels;
    selectFreguesiaRef.current = onSelectFreguesia;
    selectVenueRef.current = onSelectVenue;
    panelEdgeRef.current = panelEdge;
  });

  const { containerRef, mapRef, ready, failed } = useBaseMap({
    bounds: GREATER_LISBON_BOUNDS,
    fitBoundsOptions: { padding: 24 },
    controlsPosition: CONTROLS_POSITION,
    revealOn: "idle",
    onLoad: (map) => {
      // The constructor framed the city before any padding existed, so the
      // panel would sit over its right third. Pad first, then re-frame with no
      // animation: the map is still hidden until "idle", so the first frame
      // anyone sees is already clear of the panel.
      const initialPadding = measurePanelPadding(
        containerRef.current,
        panelRef?.current ?? null,
        panelEdgeRef.current,
      );
      if (!isSamePadding(initialPadding, NO_PADDING)) {
        map.setPadding(initialPadding);
        map.fitBounds(GREATER_LISBON_BOUNDS, { padding: 24, duration: 0 });
      }

      if (hasFullscreenControl) addFullscreenControl(map);

      overlayRef.current = createFreguesiaOverlay(map, {
        counts,
        selected: new Set(
          selectedFreguesiaRef.current ? [selectedFreguesiaRef.current] : [],
        ),
        onSelect: (name) => selectFreguesiaRef.current(name),
        // Pins render for the selected parish only, so its count line would
        // just double up on them.
        hideSelectedCount: true,
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
        new Set(
          selectedFreguesiaRef.current ? [selectedFreguesiaRef.current] : [],
        ),
      );
    },
    onCleanup: () => {
      overlayRef.current?.detach();
      overlayRef.current = null;
      markerManagerRef.current?.clear();
      markerManagerRef.current = null;
      if (fullscreenControlRef.current) {
        mapRef.current?.removeControl(fullscreenControlRef.current);
        fullscreenControlRef.current = null;
      }
      setFullscreenControlHost(null);
    },
  });

  // A bare maplibre control group under the zoom buttons, in the same corner
  // and with the same chrome. It stays empty here: the component portals a
  // real React button into it, so the label and icon follow i18n and state.
  function addFullscreenControl(map: MapLibreMap) {
    const host = document.createElement("div");
    host.className = "maplibregl-ctrl maplibregl-ctrl-group";
    const control: IControl = {
      onAdd: () => host,
      onRemove: () => host.remove(),
    };
    map.addControl(control, CONTROLS_POSITION);
    fullscreenControlRef.current = control;
    setFullscreenControlHost(host);
  }

  // Keep the camera padding equal to what the panel covers. Every camera move
  // below then lands in the visible part of the map: easeTo centres on the
  // padded middle, and maplibre ADDS a fitBounds `padding` to this one (the
  // fit subtracts both from the viewport), so the 24/56px margins there stay
  // a margin inside the visible area. Re-measured whenever the panel or the
  // map changes size: entering full screen, the phone sheet growing or
  // shrinking with its content, a window resize.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !ready) return;
    const panel = panelRef?.current ?? null;
    let isDisposed = false;
    let isWaitingForMoveEnd = false;

    function syncPadding() {
      if (isDisposed || !map) return;
      const nextPadding = measurePanelPadding(container, panel, panelEdge);
      if (isSamePadding(map.getPadding(), nextPadding)) return;
      // Changing padding mid-flight would cut a pin ease or parish fit short.
      // Let it land, then pad from where it ended.
      if (map.isMoving()) {
        if (isWaitingForMoveEnd) return;
        isWaitingForMoveEnd = true;
        void map.once("moveend", () => {
          isWaitingForMoveEnd = false;
          syncPadding();
        });
        return;
      }
      map.easeTo({
        padding: nextPadding,
        duration: shouldReduceMotion ? 0 : 300,
      });
    }

    syncPadding();
    const observer = new ResizeObserver(syncPadding);
    observer.observe(container);
    if (panel) observer.observe(panel);
    return () => {
      isDisposed = true;
      observer.disconnect();
    };
  }, [ready, panelEdge, panelRef, shouldReduceMotion, mapRef, containerRef]);

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
    const bounds = selectedFreguesia
      ? freguesiaBounds([selectedFreguesia])
      : null;
    if (bounds) {
      map.fitBounds(bounds, { padding: 56, maxZoom: 15.5, duration: 700 });
    } else if (!focusedVenueIdRef.current) {
      // Picking a pin drops the parish filter, so this effect fires with
      // nothing selected. Don't yank the camera back out to the whole city:
      // the focus effect below is about to ease onto that pin instead.
      map.fitBounds(GREATER_LISBON_BOUNDS, { padding: 24, duration: 700 });
    }
  }, [selectedFreguesia, ready, mapRef]);

  // Ease onto the focused pin, and back out to the city when focus is dropped
  // (unless a parish is holding the camera).
  const hadFocusRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const focused = focusedVenueId
      ? venues.find((venue) => venue.id === focusedVenueId)
      : undefined;
    if (focused) {
      hadFocusRef.current = true;
      map.easeTo({
        center: [focused.longitude, focused.latitude],
        zoom: Math.max(map.getZoom(), 15),
        duration: 700,
      });
    } else if (hadFocusRef.current) {
      hadFocusRef.current = false;
      if (!selectedFreguesia) {
        map.fitBounds(GREATER_LISBON_BOUNDS, { padding: 24, duration: 700 });
      }
    }
  }, [focusedVenueId, venues, selectedFreguesia, ready, mapRef]);

  // Reflect the selected venue pin.
  useEffect(() => {
    if (!ready) return;
    markerManagerRef.current?.setSelected(selectedVenueId);
  }, [selectedVenueId, ready]);

  return { containerRef, failed, ready, fullscreenControlHost };
}
