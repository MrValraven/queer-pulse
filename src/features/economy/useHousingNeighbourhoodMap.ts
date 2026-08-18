import { useEffect, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import {
  buildWarmStyle,
  GREATER_LISBON_BOUNDS,
  MAP_STYLE_URL,
} from "../../shared/components/map/siteMapStyle";
import type { HousingCluster } from "./housingMapClusters";
import styles from "./housingMap.module.css";

interface Options {
  clusters: HousingCluster[];
  selected: Set<string>;
  onSelect: (name: string) => void;
}

const PIN_CLASS = styles.pin ?? "";
const PIN_ON_CLASS = styles.pinOn ?? "";
const COUNT_CLASS = styles.count ?? "";

/** A neighbourhood pin's DOM, kept so updates never re-read the marker's HTML. */
interface ManagedPin {
  marker: maplibregl.Marker;
  element: HTMLButtonElement;
  labelEl: HTMLSpanElement;
  countEl: HTMLSpanElement;
}

/** Fit the camera to the clustered pins (or the whole city when there are none). */
function boundsOf(clusters: HousingCluster[]): maplibregl.LngLatBoundsLike {
  if (clusters.length === 0) return GREATER_LISBON_BOUNDS;
  const bounds = new maplibregl.LngLatBounds();
  for (const cluster of clusters) {
    bounds.extend([cluster.longitude, cluster.latitude]);
  }
  return bounds;
}

function applySelected(pin: ManagedPin, on: boolean) {
  if (PIN_ON_CLASS) pin.element.classList.toggle(PIN_ON_CLASS, on);
  pin.element.setAttribute("aria-pressed", on ? "true" : "false");
}

export function useHousingNeighbourhoodMap({
  clusters,
  selected,
  onSelect,
}: Options) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pinsRef = useRef<Map<string, ManagedPin>>(new Map());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Latest callback + selection without re-creating the map.
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selected);
  useEffect(() => {
    onSelectRef.current = onSelect;
    selectedRef.current = selected;
  });

  // Create the map once. buildWarmStyle failure falls back to the raw style URL
  // (the location still renders); only a hard construction error surfaces as
  // `failed`. A reveal timer guarantees the loader can't hang if `load` stalls.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;

    function createMap(style: StyleSpecification | string) {
      if (cancelled || !container) return;
      try {
        const map = new maplibregl.Map({
          container,
          style,
          bounds: boundsOf(clusters),
          fitBoundsOptions: { padding: 48, maxZoom: 14.5 },
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        const reveal = () => {
          if (cancelled) return;
          clearTimeout(revealTimer);
          setReady(true);
        };
        map.on("load", reveal);
        revealTimer = setTimeout(reveal, 3000);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    buildWarmStyle()
      .then((style) => createMap(style))
      .catch(() => createMap(MAP_STYLE_URL));

    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      for (const pin of pinsRef.current.values()) pin.marker.remove();
      pinsRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Create-once; markers + camera reconcile in the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconcile markers whenever the clusters change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const live = new Set(clusters.map((cluster) => cluster.name));

    // Remove markers whose neighbourhood left the result set.
    for (const [name, pin] of pinsRef.current) {
      if (!live.has(name)) {
        pin.marker.remove();
        pinsRef.current.delete(name);
      }
    }

    // Add or update the rest.
    for (const cluster of clusters) {
      const on = selectedRef.current.has(cluster.name);
      let pin = pinsRef.current.get(cluster.name);
      if (!pin) {
        const element = document.createElement("button");
        element.type = "button";
        if (PIN_CLASS) element.classList.add(PIN_CLASS);
        const labelEl = document.createElement("span");
        const countEl = document.createElement("span");
        countEl.className = COUNT_CLASS;
        element.appendChild(labelEl);
        element.appendChild(countEl);
        // cluster.name is stable for this pin's lifetime (it is the map key).
        element.addEventListener("click", () =>
          onSelectRef.current(cluster.name),
        );
        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat([cluster.longitude, cluster.latitude])
          .addTo(map);
        pin = { marker, element, labelEl, countEl };
        pinsRef.current.set(cluster.name, pin);
      } else {
        pin.marker.setLngLat([cluster.longitude, cluster.latitude]);
      }
      pin.labelEl.textContent = cluster.name;
      pin.countEl.textContent = String(cluster.listings.length);
      pin.element.setAttribute(
        "aria-label",
        `${cluster.name}, ${cluster.listings.length}`,
      );
      applySelected(pin, on);
    }
  }, [clusters, ready]);

  // Reflect selection highlight without rebuilding markers.
  useEffect(() => {
    if (!ready) return;
    for (const [name, pin] of pinsRef.current) {
      applySelected(pin, selected.has(name));
    }
  }, [selected, ready]);

  // Ease the camera to the current clusters when they change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.fitBounds(boundsOf(clusters), {
      padding: 48,
      maxZoom: 14.5,
      duration: 600,
    });
  }, [clusters, ready]);

  return { containerRef, ready, failed };
}
