// maplibre's own cut-off for a compact credit: a map up to this wide starts
// with the credit folded behind its "i" button. Wider maps keep it open.
// Matches `COMPACT_CREDIT_MAX_WIDTH` in features/economy/HousingLocationMap.tsx.
export const COMPACT_CREDIT_MAX_WIDTH = 640;

/**
 * maplibre opens its compact credit on first paint, and on a phone the open
 * line covers a wide strip along the bottom of the map. A map no wider than
 * {@link COMPACT_CREDIT_MAX_WIDTH} starts on the "i" button (the same minimise
 * maplibre applies on drag); one tap on it opens the full credit again, so the
 * attribution stays one tap away. Call it from the map's "load" handler, once
 * the attribution control is in the DOM. Wider maps are left untouched.
 */
export function collapseCompactCreditOnNarrowMap(container: HTMLElement): void {
  if (container.offsetWidth > COMPACT_CREDIT_MAX_WIDTH) return;
  container
    .querySelector(".maplibregl-ctrl-attrib")
    ?.classList.remove("maplibregl-compact-show");
}
