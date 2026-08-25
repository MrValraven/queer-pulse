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

// MapLibre renders at `devicePixelRatio` by default. That is right for a
// retina screen, but on a 1x display it puts the map on a coarser grid than
// the DOM text beside it, and it gets worse below 100% browser zoom, where the
// ratio drops UNDER 1 (a 90% zoom on a 1x monitor reports 0.9, so a 754px-wide
// panel is drawn into 678 pixels and stretched back out). Rendering at a floor
// of 2 and letting the compositor resolve it down is plain supersampling: thin
// road casings and SDF label edges land on a finer grid before they reach the
// screen. This costs fragment work only on the low-DPI displays that have the
// headroom for it, since a 2x or 3x screen already sits above the floor.
const MIN_RENDER_PIXEL_RATIO = 2;

function renderPixelRatio(): number {
  return Math.max(window.devicePixelRatio, MIN_RENDER_PIXEL_RATIO);
}

// MapLibre samples `devicePixelRatio` once, when the map is constructed, and
// never looks again. Zoom the browser, or drag the window from a retina screen
// onto an external 1x monitor, and the ratio changes underneath a live map: the
// canvas keeps its old backing store and the compositor stretches it to fit.
// That is the "blurry map", and it is measurable — after a 1x to 2x move the
// canvas holds exactly half the pixels its CSS box needs, and it never recovers,
// because `resize()` reuses the stored ratio. A media query on the CURRENT ratio
// fires the moment that ratio stops being current, so each change re-arms a
// fresh query for whatever the ratio has become.
function watchPixelRatio(map: MapLibreMap): () => void {
  let query: MediaQueryList | undefined;
  const arm = () => {
    query?.removeEventListener("change", handleChange);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener("change", handleChange);
  };
  const handleChange = () => {
    map.setPixelRatio(renderPixelRatio());
    arm();
  };
  arm();
  return () => query?.removeEventListener("change", handleChange);
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
    let stopPixelRatioWatch: (() => void) | undefined;

    buildWarmStyle()
      .then((style) => {
        if (cancelled) return;
        const map = new maplibregl.Map({
          container,
          style,
          bounds,
          fitBoundsOptions,
          pixelRatio: renderPixelRatio(),
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        stopPixelRatioWatch = watchPixelRatio(map);
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
      stopPixelRatioWatch?.();
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
