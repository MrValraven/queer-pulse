import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { MapLoading } from "../marketing/MapLoading";
import { usePrefersReducedMotion } from "../../shared/hooks";
import {
  buildWarmStyle,
  MAP_STYLE_URL,
} from "../../shared/components/map/siteMapStyle";
import mapStyles from "../marketing/localMap.module.css";
import s from "./housingLocationMap.module.css";

interface HousingLocationMapProps {
  latitude: number;
  longitude: number;
  /** `"area"` → a soft approximate blob at the neighbourhood centroid (no exact
   *  point); `"exact"` → the precise teardrop pin, shown once you're connected. */
  precision: "area" | "exact";
  /** Describes the map for screen readers. */
  ariaLabel: string;
}

// Resolve CSS-module classes to plain strings once: they are assigned to the
// marker element imperatively (maplibre owns the DOM node).
const PIN_WRAP_CLASS = mapStyles.pickerPinWrap ?? "";
const PIN_CLASS = mapStyles.pickerPin ?? "";
const AREA_BLOB_CLASS = s.areaBlob ?? "";

// Area view sits back at neighbourhood scale (never street level, so the blob
// reads as "somewhere around here"); the exact view zooms in on the real point.
const AREA_ZOOM = 13.5;
const EXACT_ZOOM = 15.5;

// maplibre's own cut-off for a compact credit: a map up to this wide starts
// with the credit folded behind its "i" button. Wider maps keep it open.
const COMPACT_CREDIT_MAX_WIDTH = 640;

/** The marker for one precision: the teardrop pin for `"exact"`, the soft
 * neighbourhood blob for `"area"`. Not yet added to a map. */
function createMarker(
  precision: HousingLocationMapProps["precision"],
  center: [number, number],
): maplibregl.Marker {
  const isExact = precision === "exact";
  const element = document.createElement("div");
  if (isExact) {
    element.className = PIN_WRAP_CLASS;
    const pin = document.createElement("div");
    pin.className = PIN_CLASS;
    element.appendChild(pin);
  } else {
    element.className = AREA_BLOB_CLASS;
  }
  return new maplibregl.Marker({
    element,
    anchor: isExact ? "bottom" : "center",
  }).setLngLat(center);
}

/**
 * A single-location map for a housing listing that honours address privacy.
 * In `"area"` mode it shows a translucent blob over the neighbourhood centroid,
 * deliberately imprecise. In `"exact"` mode (owner or connected member) it shows
 * the real teardrop pin. Reuses the app's warm Lisbon basemap + loader, and is
 * lazy-loaded by HousingLocationCard so maplibre stays off the entry chunk.
 */
export function HousingLocationMap({
  latitude,
  longitude,
  precision,
  ariaLabel,
}: HousingLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  // The precision the current marker was drawn for, so a precision change
  // swaps the pin for the blob (or back) in place.
  const markerPrecisionRef = useRef(precision);
  const [ready, setReady] = useState(false);
  const isReducedMotion = usePrefersReducedMotion();
  // Read by the recentre effect through a ref, so flipping Reduce motion
  // applies to the next move and leaves the map where it is.
  const isReducedMotionRef = useRef(isReducedMotion);
  const exact = precision === "exact";

  useEffect(() => {
    isReducedMotionRef.current = isReducedMotion;
  }, [isReducedMotion]);

  // Create the map once. The style is fetched + patched (warm colours + Noto
  // fonts) before creation to avoid a recolour flash; on failure we fall back to
  // the raw style URL so the location still renders.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    function createMap(style: StyleSpecification | string) {
      if (cancelled || !container) return;
      const center: [number, number] = [longitude, latitude];
      const map = new maplibregl.Map({
        container,
        style,
        center,
        zoom: exact ? EXACT_ZOOM : AREA_ZOOM,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      markerRef.current = createMarker(precision, center).addTo(map);
      markerPrecisionRef.current = precision;

      map.on("load", () => {
        if (cancelled) return;
        // maplibre opens its compact credit on first paint, and on a phone the
        // open line covers about a quarter of this short frame. Narrow maps
        // start on the "i" button (the same minimise maplibre applies on drag);
        // one tap on it opens the full credit again.
        if (container.offsetWidth <= COMPACT_CREDIT_MAX_WIDTH) {
          container
            .querySelector(".maplibregl-ctrl-attrib")
            ?.classList.remove("maplibregl-compact-show");
        }
        setReady(true);
      });
    }

    buildWarmStyle()
      .then((style) => createMap(style))
      .catch(() => createMap(MAP_STYLE_URL));

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Create-once: coordinate/precision updates are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre + move the marker when the coordinates change (e.g. the listing
  // upgrades from area to exact after connecting, without remounting). A
  // precision change also redraws the marker, so the blob becomes the pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const center: [number, number] = [longitude, latitude];
    if (markerPrecisionRef.current === precision) {
      markerRef.current?.setLngLat(center);
    } else {
      markerRef.current?.remove();
      markerRef.current = createMarker(precision, center).addTo(map);
      markerPrecisionRef.current = precision;
    }
    const targetZoom = precision === "exact" ? EXACT_ZOOM : AREA_ZOOM;
    map.easeTo({
      center,
      zoom: targetZoom,
      duration: isReducedMotionRef.current ? 0 : 600,
    });
  }, [latitude, longitude, precision, ready]);

  return (
    <>
      {/* A group: the canvas hosts the zoom buttons, which an `img` role
          would hide from assistive tech. */}
      <div
        ref={containerRef}
        className={mapStyles.miniCanvas}
        role="group"
        aria-label={ariaLabel}
      />
      <MapLoading ready={ready} />
    </>
  );
}
