import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { MapLoading } from "./MapLoading";
import { buildWarmStyle, MAP_STYLE_URL } from "../../shared/components/map/siteMapStyle";
import s from "./localMap.module.css";

interface LocationMiniMapProps {
  latitude: number;
  longitude: number;
  /** Describes the map for screen readers, e.g. "Map showing where X is". */
  ariaLabel: string;
}

// CSS-module class access is `string | undefined` (noUncheckedIndexedAccess);
// resolve the pin classes to plain strings once, since we assign them to the
// marker element imperatively. Reuses the picker's teardrop (localMap.module.css)
// so this read-only pin matches the draggable one in the list-a-business wizard.
const PIN_WRAP_CLASS = s.pickerPinWrap ?? "";
const PIN_CLASS = s.pickerPin ?? "";

/**
 * Read-only single-pin map for a place's exact location — the real basemap
 * counterpart to the decorative SVG that used to sit on the directory detail
 * card. Reuses the warm-recoloured Lisbon style (shared/components/map/siteMapStyle.ts) and the
 * picker pin, so it matches every other map in the app. Interactive (drag +
 * zoom buttons) but with scroll-zoom off, so it never traps the page scroll
 * while the detail sidebar is sticky. The pin is fixed — this shows a location,
 * it doesn't set one (that's LocationPickerMap's job).
 */
export function LocationMiniMap({ latitude, longitude, ariaLabel }: LocationMiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [ready, setReady] = useState(false);

  // Create the map once, centred on the place. The style is fetched and patched
  // (warm colours + Noto fonts) before creation, mirroring the other maps so
  // there is no recolour flash; on failure we fall back to the raw style URL so
  // the location still renders, just without the branded palette.
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
        zoom: 15.5,
        scrollZoom: false,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      const element = document.createElement("div");
      element.className = PIN_WRAP_CLASS;
      const pin = document.createElement("div");
      pin.className = PIN_CLASS;
      element.appendChild(pin);
      markerRef.current = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat(center)
        .addTo(map);

      map.on("load", () => {
        if (!cancelled) setReady(true);
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
    // Create-once: coordinate updates are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre + move the pin when the coordinates change (e.g. the moderation
  // preview drawer switching between listings without remounting).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const center: [number, number] = [longitude, latitude];
    markerRef.current?.setLngLat(center);
    map.easeTo({ center, zoom: Math.max(map.getZoom(), 15.5), duration: 600 });
  }, [latitude, longitude, ready]);

  return (
    <>
      <div
        ref={containerRef}
        className={s.miniCanvas}
        role="img"
        aria-label={ariaLabel}
      />
      <MapLoading ready={ready} />
    </>
  );
}
