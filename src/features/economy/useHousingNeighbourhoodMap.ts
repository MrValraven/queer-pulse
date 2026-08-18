import { useEffect, useRef } from "react";
import { GREATER_LISBON_BOUNDS } from "../../shared/components/map/siteMapStyle";
import { useBaseMap } from "../../shared/components/map/useBaseMap";
import {
  createFreguesiaOverlay,
  type FreguesiaOverlay,
} from "../../shared/components/map/freguesiaOverlay";
import { freguesiaBounds } from "../../shared/components/map/freguesiaBounds";
import type { HousingCluster } from "./housingMapClusters";

interface Options {
  clusters: HousingCluster[];
  selected: Set<string>;
  onSelect: (name: string) => void;
}

function countsOf(clusters: HousingCluster[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cluster of clusters) counts[cluster.name] = cluster.listings.length;
  return counts;
}

// Fit to the selected parishes when there's a selection, else to every parish
// present in the current result set, else the greater-Lisbon default.
function boundsOf(
  clusters: HousingCluster[],
  selected: Set<string>,
): [[number, number], [number, number]] {
  const names = selected.size > 0 ? [...selected] : clusters.map((c) => c.name);
  return freguesiaBounds(names) ?? GREATER_LISBON_BOUNDS;
}

export function useHousingNeighbourhoodMap({ clusters, selected, onSelect }: Options) {
  const overlayRef = useRef<FreguesiaOverlay | null>(null);

  const clustersRef = useRef(clusters);
  const selectedRef = useRef(selected);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    clustersRef.current = clusters;
    selectedRef.current = selected;
    onSelectRef.current = onSelect;
  });

  const { containerRef, mapRef, ready, failed } = useBaseMap({
    bounds: boundsOf(clusters, selected),
    fitBoundsOptions: { padding: 48, maxZoom: 14.5 },
    revealOn: "load",
    onLoad: (map) => {
      overlayRef.current = createFreguesiaOverlay(map, {
        counts: countsOf(clustersRef.current),
        selected: selectedRef.current,
        onSelect: (name) => onSelectRef.current(name),
      });
    },
    onCleanup: () => {
      overlayRef.current?.detach();
      overlayRef.current = null;
    },
  });

  // Push updated listing counts whenever the result set changes.
  useEffect(() => {
    if (!ready) return;
    overlayRef.current?.setCounts(countsOf(clusters));
  }, [clusters, ready]);

  // Reflect the multi-select highlight.
  useEffect(() => {
    if (!ready) return;
    overlayRef.current?.setSelected(selected);
  }, [selected, ready]);

  // Ease the camera to the current clusters/selection when either changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.fitBounds(boundsOf(clusters, selected), {
      padding: 48,
      maxZoom: 14.5,
      duration: 600,
    });
  }, [clusters, selected, ready, mapRef]);

  return { containerRef, ready, failed };
}
