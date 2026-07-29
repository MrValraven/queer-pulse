import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MapLoading } from "./MapLoading";
import { buildWarmStyle, LISBON_BOUNDS, MAP_STYLE_URL } from "./lisbonMapStyle";
import s from "./localMap.module.css";

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

// CSS-module class access is `string | undefined` (noUncheckedIndexedAccess);
// resolve the classes we assign imperatively to plain strings once. maplibre
// positions the wrapper; the teardrop + its animations live on the inner pin.
const PICKER_WRAP_CLASS = s.pickerPinWrap ?? "";
const PICKER_PIN_CLASS = s.pickerPin ?? "";

/** Reusable draggable-marker picker for the Lisbon map. Reuses the warm-recoloured
 *  Lisbon style + bounds (lisbonMapStyle.ts) so the picker matches every other
 *  map in the app. Mounted only once coordinates already exist (geocoded
 *  upstream); dragging the pin reports the adjusted coordinates via `onChange`. */
export function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [ready, setReady] = useState(false);
  // Latest callback without re-creating the map; assigned in an effect (not
  // during render), per react-hooks/refs — the dragend handler reads it well
  // after this effect runs.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Create the map once. The style is fetched and patched (warm colours + Noto
  // fonts) before creation, mirroring useLisbonMap.ts exactly, so there is no
  // recolour flash. If the fetch/patch fails, fall back to the raw style URL
  // so location picking still works — just without the branded palette.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    function createMap(style: StyleSpecification | string) {
      if (cancelled || !container) return;
      const map = new maplibregl.Map({
        container,
        style,
        bounds: LISBON_BOUNDS,
        fitBoundsOptions: { padding: 24 },
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
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

  // Reflect coords → marker, once the map has loaded. No coords ⇒ no marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (latitude === null || longitude === null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const lngLat: [number, number] = [longitude, latitude];
    if (markerRef.current) {
      markerRef.current.setLngLat(lngLat);
    } else {
      const element = document.createElement("div");
      element.className = PICKER_WRAP_CLASS;
      const pin = document.createElement("div");
      pin.className = PICKER_PIN_CLASS;
      element.appendChild(pin);
      const marker = new maplibregl.Marker({ element, draggable: true, anchor: "bottom" })
        .setLngLat(lngLat)
        .addTo(map);
      // Lift the teardrop off its shadow while dragging; the CSS keys off the
      // data attribute so the rotate/lift transforms stay in the stylesheet.
      marker.on("dragstart", () => {
        element.dataset.dragging = "true";
      });
      marker.on("dragend", () => {
        delete element.dataset.dragging;
        const next = marker.getLngLat();
        onChangeRef.current(next.lat, next.lng);
      });
      markerRef.current = marker;
    }
    map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 15), duration: 600 });
  }, [latitude, longitude, ready]);

  return (
    <div className={s.mapPanel}>
      <div
        ref={containerRef}
        className={s.mapCanvas}
        role="application"
        aria-label={t("marketing:listBusiness.step3.mapAria")}
      />
      <MapLoading ready={ready} />
    </div>
  );
}
