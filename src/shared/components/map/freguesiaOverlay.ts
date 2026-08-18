import type { FeatureCollection, Point } from "geojson";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
} from "maplibre-gl";
import { FREGUESIAS } from "./freguesias.data";
import { BRAND } from "./siteMapStyle";

export interface FreguesiaOverlay {
  setCounts: (counts: Record<string, number>) => void;
  setSelected: (selected: Set<string>) => void;
  detach: () => void;
}

interface CreateFreguesiaOverlayOptions {
  counts: Record<string, number>;
  selected: Set<string>;
  onSelect: (name: string) => void;
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

function pushSelected(map: MapLibreMap, selected: Set<string>): void {
  for (const feature of FREGUESIAS.features) {
    const name = feature.properties.name;
    map.setFeatureState(
      { source: "freguesias", id: name },
      { selected: selected.has(name) },
    );
  }
}

function setHover(map: MapLibreMap, name: string | null, hover: boolean): void {
  if (!name) return;
  map.setFeatureState({ source: "freguesias", id: name }, { hover });
}

// Registers the freguesia fill/line/label layers and click/hover interactions
// shared by every map in the app. `selected` is caller-owned: a single-select
// caller replaces it wholesale on each click, a multi-select caller toggles
// membership: this module only reports which parish was clicked (via
// `onSelect`) and paints whatever `Set` it's given (via `setSelected`).
export function createFreguesiaOverlay(
  map: MapLibreMap,
  { counts, selected, onSelect }: CreateFreguesiaOverlayOptions,
): FreguesiaOverlay {
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
      // out as you zoom to street level. `zoom` must be the top-level input to
      // interpolate, so per-state opacities live in the stop outputs.
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

  pushSelected(map, selected);

  let hovered: string | null = null;
  const handleClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    const name = feature?.properties?.name as string | undefined;
    if (name) onSelect(name);
  };
  const handleEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const handleMove = (event: MapLayerMouseEvent) => {
    const name = event.features?.[0]?.properties?.name as string | undefined;
    if (hovered === name) return;
    setHover(map, hovered, false);
    hovered = name ?? null;
    setHover(map, hovered, true);
  };
  const handleLeave = () => {
    map.getCanvas().style.cursor = "";
    setHover(map, hovered, false);
    hovered = null;
  };

  map.on("click", "freguesia-fill", handleClick);
  map.on("mouseenter", "freguesia-fill", handleEnter);
  map.on("mousemove", "freguesia-fill", handleMove);
  map.on("mouseleave", "freguesia-fill", handleLeave);

  return {
    setCounts: (nextCounts) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const source = map.getSource("freguesia-labels") as GeoJSONSource | undefined;
      source?.setData(buildLabelCollection(nextCounts));
    },
    setSelected: (nextSelected) => pushSelected(map, nextSelected),
    detach: () => {
      map.off("click", "freguesia-fill", handleClick);
      map.off("mouseenter", "freguesia-fill", handleEnter);
      map.off("mousemove", "freguesia-fill", handleMove);
      map.off("mouseleave", "freguesia-fill", handleLeave);
    },
  };
}
