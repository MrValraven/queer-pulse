import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type Map as MapLibreMap,
  type GeoJSONSource,
} from "maplibre-gl";
import type {
  FeatureCollection,
  Point,
  Polygon,
  MultiPolygon,
} from "geojson";
import {
  GREATER_LISBON_BOUNDS,
  BRAND,
  buildWarmStyle,
} from "../../shared/components/map/siteMapStyle";
import { FREGUESIAS } from "../../shared/components/map/freguesias.data";
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

function buildLabelCollection(
  counts: Record<string, number>,
): FeatureCollection<Point, { name: string; count: number }> {
  return {
    type: "FeatureCollection",
    features: FREGUESIAS.features.map((feature) => ({
      type: "Feature",
      properties: {
        name: feature.properties.name,
        count: counts[feature.properties.name] ?? 0,
      },
      geometry: { type: "Point", coordinates: feature.properties.labelPoint },
    })),
  };
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerManagerRef = useRef<VenueMarkerManager | null>(null);
  const readyRef = useRef(false);
  const hoveredRef = useRef<string | null>(null);
  // Latest callbacks without re-creating the map; assigned in an effect (not
  // during render) per react-hooks/refs — events read them well after it runs.
  const selectFreguesiaRef = useRef(onSelectFreguesia);
  const selectVenueRef = useRef(onSelectVenue);
  const markerLabelsRef = useRef(markerLabels);
  useEffect(() => {
    selectFreguesiaRef.current = onSelectFreguesia;
    selectVenueRef.current = onSelectVenue;
    markerLabelsRef.current = markerLabels;
  });

  const [failed, setFailed] = useState(false);
  // Gates the in-panel loader: false until the map has painted its first full
  // frame, so switching List→Map never flashes a blank/half-drawn canvas.
  const [ready, setReady] = useState(false);

  // Create the map once. The style is fetched and patched (warm colours + Noto
  // fonts) before creation, so failure to load the style is the only fatal
  // error — transient tile/glyph 404s never surface the fallback.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    // Safety net: reveal the map even if `idle` never fires (e.g. a tile source
    // that never settles), so the loader can't get stuck forever.
    let revealTimer: ReturnType<typeof setTimeout> | undefined;

    buildWarmStyle()
      .then((style) => {
        if (cancelled) return;
        const map = new maplibregl.Map({
          container,
          style,
          bounds: GREATER_LISBON_BOUNDS,
          fitBoundsOptions: { padding: 24 },
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );

        map.on("load", () => {
          addMapLayers(map, counts);

          // Venue pins are HTML markers positioned directly from lat/lng
          // (see venueMarker.ts) — no clustering, so every point is visible.
          const markerManager = createVenueMarkerManager(
            map,
            (venueId) => selectVenueRef.current(venueId),
            () => markerLabelsRef.current,
          );
          markerManagerRef.current = markerManager;
          markerManager.setSelected(selectedVenueId);

          // Draw the pins + reveal the map only once the basemap has fully
          // painted (`idle`), so the staggered drop-in lands on a settled canvas
          // instead of playing hidden under a still-loading one.
          const reveal = () => {
            if (cancelled || readyRef.current) return;
            clearTimeout(revealTimer);
            markerManager.render(venues);
            readyRef.current = true;
            pushSelected(map, selectedFreguesia);
            setReady(true);
          };
          void map.once("idle", reveal);
          revealTimer = setTimeout(reveal, 3000);

          // Parish interactions (fills are WebGL; pins handle their own clicks).
          map.on("click", "freguesia-fill", (event) => {
            const feature = event.features?.[0];
            const name = feature?.properties?.name as string | undefined;
            if (name) selectFreguesiaRef.current(name);
          });

          map.on("mouseenter", "freguesia-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "freguesia-fill", () => {
            map.getCanvas().style.cursor = "";
          });
          map.on("mousemove", "freguesia-fill", (event) => {
            const name = event.features?.[0]?.properties?.name as
              | string
              | undefined;
            if (hoveredRef.current === name) return;
            setHover(map, hoveredRef.current, false);
            hoveredRef.current = name ?? null;
            setHover(map, hoveredRef.current, true);
          });
          map.on("mouseleave", "freguesia-fill", () => {
            setHover(map, hoveredRef.current, false);
            hoveredRef.current = null;
          });
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      readyRef.current = false;
      markerManagerRef.current?.clear();
      markerManagerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Create-once: reactive updates handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render the venue pins for the current filter. Depends on `ready` so a
  // filter change made *during* the 1–3s map load (when this bailed early) is
  // re-applied the moment the map becomes ready, instead of being dropped.
  useEffect(() => {
    if (!ready) return;
    markerManagerRef.current?.render(venues);
  }, [venues, ready]);

  // Push counts into the label source.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    // `getSource` is generic (`<T extends Source = Source>`); without the
    // assertion `T` defaults to the base `Source`, which lacks `setData`. The
    // assertion supplies the concrete `GeoJSONSource` this label layer uses.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const source = map.getSource("freguesia-labels") as GeoJSONSource | undefined;
    source?.setData(buildLabelCollection(counts));
  }, [counts, ready]);

  // Reflect the selected parish highlight and ease the camera to it (back to
  // the full city when cleared). Depends on `ready` so a selection made during
  // the map load is re-applied once ready rather than silently dropped.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    pushSelected(map, selectedFreguesia);
    const bounds = selectedFreguesia ? freguesiaBounds(selectedFreguesia) : null;
    if (bounds) {
      map.fitBounds(bounds, { padding: 56, maxZoom: 15.5, duration: 700 });
    } else if (!selectedFreguesia) {
      map.fitBounds(GREATER_LISBON_BOUNDS, { padding: 24, duration: 700 });
    }
  }, [selectedFreguesia, ready]);

  // Reflect the selected venue pin.
  useEffect(() => {
    if (!ready) return;
    markerManagerRef.current?.setSelected(selectedVenueId);
  }, [selectedVenueId, ready]);

  return { containerRef, failed, ready };
}

// Registers the freguesia fill/line/label/count sources and layers. Venue pins
// are HTML markers (venueMarker.ts), not layers. Called once from `load`.
function addMapLayers(map: MapLibreMap, counts: Record<string, number>) {
  map.addSource("freguesias", {
    type: "geojson",
    data: FREGUESIAS,
    promoteId: "name",
  });
  map.addLayer({
    id: "freguesia-fill",
    type: "fill",
    source: "freguesias",
    paint: {
      "fill-color": BRAND.accent,
      // Parishes are a city-scale wayfinding aid: a whisper of tint that fades
      // out as you zoom to street level, where the venue pins take over.
      // `zoom` must be the top-level input to interpolate, so the per-state
      // opacities live in the stop outputs — the z15 stop is ~0.15x the z12 one.
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          0.26,
          ["boolean", ["feature-state", "hover"], false],
          0.16,
          0.07,
        ],
        15,
        [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          0.04,
          ["boolean", ["feature-state", "hover"], false],
          0.024,
          0.01,
        ],
      ],
    },
  });
  map.addLayer({
    id: "freguesia-line",
    type: "line",
    source: "freguesias",
    paint: { "line-color": BRAND.accentInk, "line-width": 1, "line-opacity": 0.55 },
  });

  map.addSource("freguesia-labels", {
    type: "geojson",
    data: buildLabelCollection(counts),
  });
  // One label per parish: the name, plus the place count on a second line when
  // it is greater than zero. Collision is left on (text-allow-overlap defaults
  // to false) so the tightly packed central parishes declutter at city zoom
  // rather than overlapping into a blob; `symbol-sort-key` = -count lets
  // parishes with places win placement over empty ones. Every label reappears
  // as you zoom in, and the polygon fills stay visible regardless.
  map.addLayer({
    id: "freguesia-label",
    type: "symbol",
    source: "freguesia-labels",
    layout: {
      "text-field": [
        "case",
        [">", ["get", "count"], 0],
        [
          "format",
          ["get", "name"],
          {},
          "\n",
          {},
          ["to-string", ["get", "count"]],
          { "text-color": BRAND.accentInk },
        ],
        ["format", ["get", "name"], {}],
      ],
      "text-font": ["Noto Sans Bold"],
      "text-size": 12,
      "text-line-height": 1.3,
      "text-padding": 4,
      "symbol-sort-key": ["-", 0, ["get", "count"]],
    },
    paint: {
      "text-color": BRAND.plum,
      "text-halo-color": BRAND.cream,
      "text-halo-width": 1.5,
    },
  });

}

// Bounding box [SW, NE] of a parish polygon, for easing the camera to it.
function freguesiaBounds(
  name: string,
): [[number, number], [number, number]] | null {
  const feature = FREGUESIAS.features.find(
    (candidate) => candidate.properties.name === name,
  );
  if (!feature) return null;
  const geometry: Polygon | MultiPolygon = feature.geometry;
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const position of ring) {
        const lng = position[0];
        const lat = position[1];
        if (lng === undefined || lat === undefined) continue;
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  if (minLng === Infinity) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function setHover(map: MapLibreMap, name: string | null, hover: boolean) {
  if (!name) return;
  map.setFeatureState({ source: "freguesias", id: name }, { hover });
}

function pushSelected(map: MapLibreMap, selected: string | null) {
  for (const feature of FREGUESIAS.features) {
    const name = feature.properties.name;
    map.setFeatureState(
      { source: "freguesias", id: name },
      { selected: name === selected },
    );
  }
}
