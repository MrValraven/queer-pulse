import { useEffect, useRef, useState, type RefObject } from "react";
import maplibregl, {
  type FitBoundsOptions,
  type LngLatBoundsLike,
  type Map as MapLibreMap,
} from "maplibre-gl";
import { buildWarmStyle } from "./siteMapStyle";

interface UseBaseMapOptions {
  bounds: LngLatBoundsLike;
  fitBoundsOptions?: FitBoundsOptions;
  /** "idle" waits for the basemap to fully paint before revealing: use when
   * the caller stages a drop-in animation on first render. "load" reveals as
   * soon as the style is ready, no animation to protect against. */
  revealOn: "load" | "idle";
  /** Called once, synchronously, inside the map's "load" handler: the place
   * to register sources/layers/marker managers that need a live map. */
  onLoad?: (map: MapLibreMap) => void;
  /** Called once, right before the map is revealed (`ready` flips true). */
  onReveal?: (map: MapLibreMap) => void;
  /** Called once on unmount, before the map instance is removed: undo
   * whatever `onLoad` registered. */
  onCleanup?: () => void;
}

interface UseBaseMapResult {
  containerRef: RefObject<HTMLDivElement | null>;
  mapRef: RefObject<MapLibreMap | null>;
  ready: boolean;
  failed: boolean;
}

// Builds the warm-recoloured basemap, constructs it once, and reveals it only
// once painted: the lifecycle shared by every map in the app. Domain logic
// (freguesia overlay, venue pins, neighbourhood pins) lives entirely in the
// caller via `onLoad`/`onReveal`, not here.
export function useBaseMap({
  bounds,
  fitBoundsOptions,
  revealOn,
  onLoad,
  onReveal,
  onCleanup,
}: UseBaseMapOptions): UseBaseMapResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Latest callbacks without re-creating the map.
  const onLoadRef = useRef(onLoad);
  const onRevealRef = useRef(onReveal);
  const onCleanupRef = useRef(onCleanup);
  useEffect(() => {
    onLoadRef.current = onLoad;
    onRevealRef.current = onReveal;
    onCleanupRef.current = onCleanup;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;

    buildWarmStyle()
      .then((style) => {
        if (cancelled) return;
        const map = new maplibregl.Map({
          container,
          style,
          bounds,
          fitBoundsOptions,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );

        // Safety net covering both "load never fires" and, for idle-reveal
        // callers, "idle never fires after load".
        const reveal = () => {
          if (cancelled) return;
          clearTimeout(revealTimer);
          onRevealRef.current?.(map);
          setReady(true);
        };
        revealTimer = setTimeout(reveal, 3000);

        map.on("load", () => {
          onLoadRef.current?.(map);
          if (revealOn === "idle") {
            void map.once("idle", reveal);
          } else {
            reveal();
          }
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      onCleanupRef.current?.();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Create-once: bounds/fitBoundsOptions/revealOn are fixed per map
    // instance; reactive updates are handled by the caller's own effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, mapRef, ready, failed };
}
