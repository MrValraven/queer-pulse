import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { PIN_CHROME_CLASS } from "./pins/pinChrome";
import type { PinRenderer, VenueMarkerData } from "./pins/pinRenderer";
import { PIN_RENDERERS } from "./pins/pinRenderers";
import type { PinStyle } from "./pins/pinStyle";

// This file is the marker MANAGER: which markers exist, where, clustering,
// the animations in and out, highlight and stacking, clicks and labels. What
// a pin or cluster LOOKS like lives behind the PinRenderer in ./pins/, one
// renderer per style, so the manager never touches a style's classes or
// markup beyond what the renderer hands it.

export type { VenueMarkerData } from "./pins/pinRenderer";

// Cap the drop-in cascade so a dense map doesn't take seconds to finish.
const ENTRANCE_STAGGER_MS = 30;
const ENTRANCE_STAGGER_CAP = 9;

// Give a freshly-created marker its staggered drop-in on the map's first paint.
// Animates the inner button (mirroring hover/selected/animateFromOrigin), so the
// maplibre positioning transform on the wrapper is never disturbed.
function applyPinEntrance(
  wrapper: HTMLElement,
  order: number,
  enterClass: string,
): void {
  const button = wrapper.firstElementChild;
  if (!(button instanceof HTMLElement) || !enterClass) return;
  button.classList.add(enterClass);
  button.style.animationDelay = `${Math.min(order, ENTRANCE_STAGGER_CAP) * ENTRANCE_STAGGER_MS}ms`;
}

// maplibre stacks markers by DOM order; raising the selected marker's wrapper
// keeps its pop-up label above neighbouring pins and cluster badges.
const SELECTED_Z_INDEX = "5";
// The pin (or cluster) matching the list card under the pointer sits above
// even the selected one, so the highlight is never tucked under a label.
const HOVERED_Z_INDEX = "6";

// How close the camera is, in three bands a pin style can key its CSS off
// through `data-pin-zoom` on the map container (a name tag can hide its text
// when far out, say). Three coarse bands keep the attribute steady: it
// changes at most a couple of times per zoom gesture.
type PinZoomBand = "far" | "mid" | "near";
const MID_ZOOM_FROM = 13.5;
const NEAR_ZOOM_FROM = 15;

function pinZoomBand(zoom: number): PinZoomBand {
  if (zoom < MID_ZOOM_FROM) return "far";
  if (zoom < NEAR_ZOOM_FROM) return "mid";
  return "near";
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Slide a freshly-created pin's inner button from a screen origin (the cluster
// it broke out of) to its resting position. Animating the button and leaving
// the maplibre wrapper alone keeps map panning jitter-free; inline styles are
// cleared afterwards so hover/selected CSS transforms take back over.
function animateFromOrigin(
  button: HTMLElement,
  origin: { x: number; y: number },
  target: { x: number; y: number },
): void {
  const deltaX = origin.x - target.x;
  const deltaY = origin.y - target.y;
  if (Math.hypot(deltaX, deltaY) < 4 || prefersReducedMotion()) return;
  button.style.transition = "none";
  button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  void button.offsetWidth; // force a reflow so the start position sticks
  button.style.transition = "transform 340ms cubic-bezier(0.16, 1, 0.3, 1)";
  button.style.transform = "translate(0px, 0px)";
  const cleanup = () => {
    button.style.transition = "";
    button.style.transform = "";
    button.removeEventListener("transitionend", cleanup);
  };
  button.addEventListener("transitionend", cleanup);
}

// Slide a departing marker's button toward a screen target (the cluster it's
// merging into), fading + shrinking, then remove the marker. Mirror of
// animateFromOrigin for the merge (zoom-out) direction.
function animateMarkerOut(
  map: MapLibreMap,
  marker: Marker,
  destination: [number, number],
): void {
  const button = marker.getElement().firstElementChild;
  if (!(button instanceof HTMLElement) || prefersReducedMotion()) {
    marker.remove();
    return;
  }
  const current = marker.getLngLat();
  const from = map.project([current.lng, current.lat]);
  const to = map.project(destination);
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  if (Math.hypot(deltaX, deltaY) < 4) {
    marker.remove();
    return;
  }
  button.style.transition =
    "transform 280ms cubic-bezier(0.4, 0, 1, 1), opacity 280ms ease";
  button.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.5)`;
  button.style.opacity = "0";
  let isRemoved = false;
  const finish = () => {
    if (isRemoved) return;
    isRemoved = true;
    marker.remove();
  };
  button.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(finish, 340);
}

// Localized aria-label builders, supplied by the component that owns `t()`.
export interface MarkerLabels {
  venuePin: (name: string, type: string) => string;
  cluster: (count: number) => string;
}

// A pin's visible secondary line (an out-and-about "Meeting point") is hidden
// from assistive tech, so the button's label carries it.
function venuePinLabel(labels: MarkerLabels, anchor: VenueMarkerData): string {
  return [labels.venuePin(anchor.name, anchor.type), anchor.secondaryLabel]
    .filter(Boolean)
    .join(", ");
}

// maplibre-gl sets its positioning transform on the wrapper element we pass it.
// We nest the interactive button inside a wrapper so our hover/selected
// transforms animate the button without disturbing the map's positioning. The
// manager owns the button's type, label and click; the renderer fills in the
// rest (class, data, markup) right after.
function createMarkerButton(
  ariaLabel: string,
  onActivate: () => void,
): { wrapper: HTMLElement; button: HTMLButtonElement } {
  const wrapper = document.createElement("div");
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onActivate();
  });
  wrapper.appendChild(button);
  return { wrapper, button };
}

// A reused marker keeps its DOM (so no re-entrance animation), but the housing
// map's pins carry a count in their aria-label that a filter can change under
// the same id, and a language switch changes every label. Written only when it
// differs. Returns the button for the renderer's own refresh.
function refreshAriaLabel(
  wrapper: HTMLElement,
  ariaLabel: string,
): HTMLElement | null {
  const button = wrapper.firstElementChild;
  if (!(button instanceof HTMLElement)) return null;
  if (button.getAttribute("aria-label") !== ariaLabel) {
    button.setAttribute("aria-label", ariaLabel);
  }
  return button;
}

// The wrapper's stacking order for a marker: hovered above selected above the
// rest. It goes on the wrapper because maplibre's positioning transform makes
// each wrapper its own stacking context, so a z-index on the button could never
// lift it over a neighbouring marker.
function wrapperZIndex(isHovered: boolean, isSelected: boolean): string {
  if (isHovered) return HOVERED_Z_INDEX;
  if (isSelected) return SELECTED_Z_INDEX;
  return "";
}

// One state on a marker button, in two forms: the renderer's class when it
// has one, and `data-selected` / `data-hovered` ("true" while on, absent
// while off) for styles whose CSS lives in a shared module that cannot know
// the renderer's class names. Each is written only when it changes.
function setButtonState(
  button: Element | null,
  className: string,
  state: "selected" | "hovered",
  isOn: boolean,
): void {
  if (!(button instanceof HTMLElement)) return;
  if (className) button.classList.toggle(className, isOn);
  if (isOn) {
    if (button.dataset[state] !== "true") button.dataset[state] = "true";
  } else if (button.dataset[state] !== undefined) {
    delete button.dataset[state];
  }
}

// Paint the current selection and hover onto one marker, keyed as the manager
// keys them: `v:<id>` for a venue pin, which matches by its own id, and
// `c:<id,id,...>` for a cluster, which lights up when the hovered or selected
// venue is one of its members. A cluster has no selected class of its own, so
// its selection rides on `data-selected` alone. Each class is guarded on its
// own, so a missing name leaves the other highlights working.
function applyMarkerHighlight(
  key: string,
  wrapper: HTMLElement,
  selectedId: string | null,
  hoveredId: string | null,
  classes: PinRenderer["classes"],
): void {
  const button = wrapper.firstElementChild;
  if (key.startsWith("v:")) {
    const venueId = key.slice(2);
    const isSelected = venueId === selectedId;
    const isHovered = venueId === hoveredId;
    setButtonState(button, classes.pinSelected, "selected", isSelected);
    setButtonState(button, classes.pinHovered, "hovered", isHovered);
    wrapper.style.zIndex = wrapperZIndex(isHovered, isSelected);
  } else if (key.startsWith("c:")) {
    const memberIds = key.slice(2).split(",");
    const isHovered = hoveredId !== null && memberIds.includes(hoveredId);
    const isSelected = selectedId !== null && memberIds.includes(selectedId);
    setButtonState(button, classes.clusterHovered, "hovered", isHovered);
    setButtonState(button, "", "selected", isSelected);
    wrapper.style.zIndex = wrapperZIndex(isHovered, isSelected);
  }
}

// A venue's projected screen position: `x` and `coordinateY` are the
// coordinate itself, where a cluster renders centred; `bodyY` is the centre
// of the pin's visible body, lifted by the renderer's visualCenterOffsetPx.
interface ProjectedVenue {
  venue: VenueMarkerData;
  x: number;
  coordinateY: number;
  bodyY: number;
}

function isWithinRadius(
  deltaX: number,
  deltaY: number,
  radiusPx: number,
): boolean {
  return deltaX * deltaX + deltaY * deltaY < radiusPx ** 2;
}

// Greedy screen-space grouping: anchor on the first ungrouped pin and absorb
// any others whose body centre is within `radiusPx` of the anchor's.
function groupByBodyDistance(
  projected: ProjectedVenue[],
  radiusPx: number,
): ProjectedVenue[][] {
  const isGrouped = new Array<boolean>(projected.length).fill(false);
  const groups: ProjectedVenue[][] = [];
  for (let index = 0; index < projected.length; index++) {
    const anchor = projected[index];
    if (isGrouped[index] || !anchor) continue;
    isGrouped[index] = true;
    const members = [anchor];
    for (let other = index + 1; other < projected.length; other++) {
      const candidate = projected[other];
      if (isGrouped[other] || !candidate) continue;
      if (
        isWithinRadius(
          anchor.x - candidate.x,
          anchor.bodyY - candidate.bodyY,
          radiusPx,
        )
      ) {
        isGrouped[other] = true;
        members.push(candidate);
      }
    }
    groups.push(members);
  }
  return groups;
}

// A lone pin whose lifted body lands within `radiusPx` of a cluster's centre
// (its anchor coordinate) joins the nearest such cluster. Cluster centres stay
// fixed, so one pass settles every pin. With no offset this never fires: the
// greedy pass already kept every lone pin a full radius from each anchor.
function absorbLonePinsIntoClusters(
  groups: ProjectedVenue[][],
  radiusPx: number,
): ProjectedVenue[][] {
  const clusters = groups.filter((members) => members.length > 1);
  if (clusters.length === 0) return groups;
  const settled: ProjectedVenue[][] = [];
  for (const members of groups) {
    const lonePin = members.length === 1 ? members[0] : undefined;
    let nearestCluster: ProjectedVenue[] | undefined;
    let nearestDistanceSquared = radiusPx ** 2;
    for (const cluster of lonePin ? clusters : []) {
      const clusterAnchor = cluster[0];
      if (!lonePin || !clusterAnchor) continue;
      const deltaX = lonePin.x - clusterAnchor.x;
      const deltaY = lonePin.bodyY - clusterAnchor.coordinateY;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;
      if (distanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestCluster = cluster;
      }
    }
    if (lonePin && nearestCluster) nearestCluster.push(lonePin);
    else settled.push(members);
  }
  return settled;
}

// Distances are measured between the centres of what the eye sees. A tall pin
// (Portrait) stands above its coordinate, so its visible body sits
// `visualCenterOffsetPx` from the projected point (negative is up), while a
// cluster renders centred on its anchor coordinate. Between two pins the
// shared offset cancels out; between a pin and a cluster it does not, so a pin
// standing just below a cluster would put its disc on the badge. Comparing
// the offset pin centre against the cluster centre folds that pin in.
function computeGroups(
  map: MapLibreMap,
  venues: VenueMarkerData[],
  radiusPx: number,
  visualCenterOffsetPx: number,
): VenueMarkerData[][] {
  const projected = venues.map((venue) => {
    const point = map.project([venue.longitude, venue.latitude]);
    return {
      venue,
      x: point.x,
      coordinateY: point.y,
      bodyY: point.y + visualCenterOffsetPx,
    };
  });
  const groups = absorbLonePinsIntoClusters(
    groupByBodyDistance(projected, radiusPx),
    radiusPx,
  );
  return groups.map((members) => members.map((member) => member.venue));
}

function zoomToMembers(map: MapLibreMap, members: VenueMarkerData[]) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const member of members) {
    if (member.longitude < minLng) minLng = member.longitude;
    if (member.latitude < minLat) minLat = member.latitude;
    if (member.longitude > maxLng) maxLng = member.longitude;
    if (member.latitude > maxLat) maxLat = member.latitude;
  }
  if (minLng === maxLng && minLat === maxLat) {
    map.easeTo({ center: [minLng, minLat], zoom: map.getZoom() + 2 });
  } else {
    // Zoom 18 lets a pair on the densest streets split apart.
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 90, maxZoom: 18, duration: 500 },
    );
  }
}

// Where each venue's marker sits right now, keyed by venue id: a pin breaking
// out of a cluster animates from the cluster's position.
function currentAnchors(
  markers: Map<string, Marker>,
): Map<string, [number, number]> {
  const anchors = new Map<string, [number, number]>();
  for (const [key, marker] of markers) {
    const { lng, lat } = marker.getLngLat();
    if (key.startsWith("v:")) {
      anchors.set(key.slice(2), [lng, lat]);
    } else if (key.startsWith("c:")) {
      for (const id of key.slice(2).split(",")) {
        anchors.set(id, [lng, lat]);
      }
    }
  }
  return anchors;
}

// Where each venue's marker will sit after this grouping: a pin merging into a
// cluster animates toward that cluster's position before being removed.
function nextAnchors(
  groups: VenueMarkerData[][],
): Map<string, [number, number]> {
  const anchors = new Map<string, [number, number]>();
  for (const members of groups) {
    const anchor = members[0];
    if (!anchor) continue;
    for (const member of members) {
      anchors.set(member.id, [anchor.longitude, anchor.latitude]);
    }
  }
  return anchors;
}

// Drop every marker this grouping no longer has. A pin whose venue is now
// inside a cluster slides into it; anything else (an old cluster becoming
// pins, or a filtered-out venue) just leaves.
function removeStaleMarkers(
  map: MapLibreMap,
  markers: Map<string, Marker>,
  nextKeys: Set<string>,
  nextAnchor: Map<string, [number, number]>,
): void {
  for (const [key, marker] of markers) {
    if (nextKeys.has(key)) continue;
    markers.delete(key);
    const destination = key.startsWith("v:")
      ? nextAnchor.get(key.slice(2))
      : undefined;
    if (destination) animateMarkerOut(map, marker, destination);
    else marker.remove();
  }
}

// The map container carries the pin style and the zoom band, so a style's
// CSS can adapt to both (`[data-pin-style]`, `[data-pin-zoom]`).
function syncContainerAttributes(map: MapLibreMap, style: PinStyle): void {
  const container = map.getContainer();
  if (container.dataset.pinStyle !== style) container.dataset.pinStyle = style;
  const band = pinZoomBand(map.getZoom());
  if (container.dataset.pinZoom !== band) container.dataset.pinZoom = band;
}

// ── Label culling ───────────────────────────────────────────────────────────
// A style with floating name labels (it names `labelClass` and `bodyClass`)
// shows a label only where it has room. Labels claim space in priority order,
// and a label that would cover another pin's body, an already shown label, a
// cluster or the selected pin's callout gets `data-label="hidden"`, which the
// style's CSS reads. One read pass measures everything, then one write pass
// touches only the buttons whose state changed, so the layout is read once.

// Clearance around a label, so it never sits edge to edge with an obstacle.
const LABEL_CLEARANCE_PX = 4;

interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The element's screen rect grown by `paddingPx`, or null when it has no
 *  box (not rendered). A label at opacity 0 still has its box. */
function measureRect(
  element: Element | undefined,
  paddingPx: number,
): ScreenRect | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    left: rect.left - paddingPx,
    top: rect.top - paddingPx,
    right: rect.right + paddingPx,
    bottom: rect.bottom + paddingPx,
  };
}

function rectsOverlap(first: ScreenRect, second: ScreenRect): boolean {
  return (
    first.left < second.right &&
    second.left < first.right &&
    first.top < second.bottom &&
    second.top < first.bottom
  );
}

interface MeasuredPin {
  button: HTMLElement;
  isSelected: boolean;
  label: ScreenRect | null;
  body: ScreenRect | null;
}

/** Lower claims space first: selected, hovered, verified, then the rest. */
function labelPriority(
  venue: VenueMarkerData,
  selectedId: string | null,
  hoveredId: string | null,
): number {
  if (venue.id === selectedId) return 0;
  if (venue.id === hoveredId) return 1;
  if (venue.isVerified) return 2;
  return 3;
}

/** The read pass: every shown pin's label and body in priority order (ties
 *  keep the venues array's order, as the sort is stable), plus the fixed
 *  obstacles: each cluster button and the selected pin's callout. */
function measureLabelScene(
  markers: Map<string, Marker>,
  venues: VenueMarkerData[],
  classNames: { label: string; body: string },
  selectedId: string | null,
  hoveredId: string | null,
): { pins: MeasuredPin[]; obstacles: ScreenRect[] } {
  const ranked = venues
    .map((venue) => ({
      venue,
      priority: labelPriority(venue, selectedId, hoveredId),
    }))
    .sort((first, second) => first.priority - second.priority);
  const pins: MeasuredPin[] = [];
  const obstacles: ScreenRect[] = [];
  for (const { venue } of ranked) {
    const button = markers.get(`v:${venue.id}`)?.getElement().firstElementChild;
    if (!(button instanceof HTMLElement)) continue;
    const isSelected = venue.id === selectedId;
    pins.push({
      button,
      isSelected,
      label: measureRect(
        button.getElementsByClassName(classNames.label)[0],
        LABEL_CLEARANCE_PX,
      ),
      body: measureRect(button.getElementsByClassName(classNames.body)[0], 0),
    });
    const callout = isSelected
      ? measureRect(
          button.getElementsByClassName(PIN_CHROME_CLASS.callout)[0],
          0,
        )
      : null;
    if (callout) obstacles.push(callout);
  }
  for (const [key, marker] of markers) {
    if (!key.startsWith("c:")) continue;
    const clusterRect = measureRect(
      marker.getElement().firstElementChild ?? undefined,
      0,
    );
    if (clusterRect) obstacles.push(clusterRect);
  }
  return { pins, obstacles };
}

/** The buttons whose label must hide. The selected pin's own label is hidden
 *  by its CSS and a label with no box has nothing to place; both are skipped. */
function pickCulledLabels(
  pins: MeasuredPin[],
  obstacles: ScreenRect[],
): Set<HTMLElement> {
  const culled = new Set<HTMLElement>();
  const shownLabels: ScreenRect[] = [];
  for (const pin of pins) {
    const label = pin.label;
    if (pin.isSelected || !label) continue;
    const isBlocked =
      obstacles.some((obstacle) => rectsOverlap(label, obstacle)) ||
      shownLabels.some((shown) => rectsOverlap(label, shown)) ||
      pins.some(
        (other) =>
          other !== pin &&
          other.body !== null &&
          rectsOverlap(label, other.body),
      );
    if (isBlocked) culled.add(pin.button);
    else shownLabels.push(label);
  }
  return culled;
}

/** The write pass: `data-label="hidden"` on culled buttons, absent on the
 *  rest, written only where it changes. */
function writeLabelVisibility(
  pins: MeasuredPin[],
  culled: Set<HTMLElement>,
): void {
  for (const pin of pins) {
    if (pin.isSelected || !pin.label) continue;
    if (culled.has(pin.button)) {
      if (pin.button.dataset.label !== "hidden") {
        pin.button.dataset.label = "hidden";
      }
    } else if (pin.button.dataset.label !== undefined) {
      delete pin.button.dataset.label;
    }
  }
}

/** Culls the labels of the current scene. Far out the style shows no labels,
 *  so nothing is measured there. The band is read from the camera, so the
 *  order of zoomend and moveend never matters. */
function cullPinLabels(
  map: MapLibreMap,
  markers: Map<string, Marker>,
  venues: VenueMarkerData[],
  renderer: PinRenderer,
  selectedId: string | null,
  hoveredId: string | null,
): void {
  const { labelClass, bodyClass } = renderer;
  if (!labelClass || !bodyClass) return;
  if (pinZoomBand(map.getZoom()) === "far") return;
  const { pins, obstacles } = measureLabelScene(
    markers,
    venues,
    { label: labelClass, body: bodyClass },
    selectedId,
    hoveredId,
  );
  writeLabelVisibility(pins, pickCulledLabels(pins, obstacles));
}

export interface VenueMarkerManager {
  render: (venues: VenueMarkerData[]) => void;
  recluster: () => void;
  setSelected: (venueId: string | null) => void;
  /** Highlights the pin of the venue whose list card is hovered, or the
   *  cluster holding it. Pass null when no card is hovered. */
  setHovered: (venueId: string | null) => void;
  clear: () => void;
}

// One HTML marker per venue, with screen-space clustering: pins whose chips
// would overlap at the current zoom are merged into a count badge; zooming in
// spreads them and the badge splits. No GeoJSON source / WebGL layer involved,
// so every point renders reliably (a few dozen venues is trivial for O(n^2)
// grouping). The pin style is fixed for the manager's lifetime.
export function createVenueMarkerManager(
  map: MapLibreMap,
  onSelectVenue: (venueId: string) => void,
  getLabels: () => MarkerLabels,
  style: PinStyle = "teardrop",
): VenueMarkerManager {
  const markers = new Map<string, Marker>();
  const renderer = PIN_RENDERERS[style];
  const shouldCullLabels = Boolean(renderer.labelClass && renderer.bodyClass);
  const markerLayer = map.getCanvasContainer();
  let venues: VenueMarkerData[] = [];
  let selectedId: string | null = null;
  let hoveredId: string | null = null;
  // The first render with real data gets the staggered drop-in; later reclusters
  // (pan/zoom) rely on the break-out/merge animations instead.
  let isFirstPaint = true;
  let pendingCullFrame: number | null = null;

  function addVenuePin(
    anchor: VenueMarkerData,
    origin: [number, number] | undefined,
    entranceOrder: number | null,
  ): Marker {
    const { wrapper, button } = createMarkerButton(
      venuePinLabel(getLabels(), anchor),
      () => onSelectVenue(anchor.id),
    );
    renderer.buildPin(button, anchor);
    // A pin created selected shows it at once instead of fading its label in.
    // Hover waits for the syncHighlights pass at the end of recluster.
    setButtonState(
      button,
      renderer.classes.pinSelected,
      "selected",
      anchor.id === selectedId,
    );
    const marker = new maplibregl.Marker({
      element: wrapper,
      anchor: renderer.pinAnchor,
    })
      .setLngLat([anchor.longitude, anchor.latitude])
      .addTo(map);
    if (entranceOrder !== null) {
      applyPinEntrance(wrapper, entranceOrder, renderer.classes.pinEnter);
    }
    if (origin) {
      animateFromOrigin(
        button,
        map.project(origin),
        map.project([anchor.longitude, anchor.latitude]),
      );
    }
    return marker;
  }

  function addCluster(
    members: VenueMarkerData[],
    anchor: VenueMarkerData,
    entranceOrder: number | null,
  ): Marker {
    const { wrapper, button } = createMarkerButton(
      getLabels().cluster(members.length),
      () => zoomToMembers(map, members),
    );
    renderer.buildCluster(button, members);
    // Clusters are always centred on their anchor venue.
    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([anchor.longitude, anchor.latitude])
      .addTo(map);
    if (entranceOrder !== null) {
      applyPinEntrance(wrapper, entranceOrder, renderer.classes.pinEnter);
    }
    return marker;
  }

  function recluster() {
    const groups = computeGroups(
      map,
      venues,
      renderer.clusterRadiusPx,
      renderer.visualCenterOffsetPx ?? 0,
    );
    // Stagger the drop-in across markers created on the first paint only.
    const isEntranceArmed = isFirstPaint && !prefersReducedMotion();
    let entranceOrder = 0;
    const previousAnchor = currentAnchors(markers);
    const nextAnchor = nextAnchors(groups);

    const nextKeys = new Set<string>();
    for (const members of groups) {
      const anchor = members[0];
      if (!anchor) continue;
      if (members.length === 1) {
        const key = `v:${anchor.id}`;
        nextKeys.add(key);
        const existing = markers.get(key);
        if (existing) {
          const ariaLabel = venuePinLabel(getLabels(), anchor);
          const button = refreshAriaLabel(existing.getElement(), ariaLabel);
          if (button) renderer.refreshPin(button, anchor);
        } else {
          markers.set(
            key,
            addVenuePin(
              anchor,
              previousAnchor.get(anchor.id),
              isEntranceArmed ? entranceOrder++ : null,
            ),
          );
        }
      } else {
        const key = `c:${members
          .map((member) => member.id)
          .sort()
          .join(",")}`;
        nextKeys.add(key);
        const existing = markers.get(key);
        // A cluster's count is fixed by its key, but its label follows the
        // language.
        if (existing) {
          refreshAriaLabel(
            existing.getElement(),
            getLabels().cluster(members.length),
          );
        } else {
          markers.set(
            key,
            addCluster(
              members,
              anchor,
              isEntranceArmed ? entranceOrder++ : null,
            ),
          );
        }
      }
    }
    removeStaleMarkers(map, markers, nextKeys, nextAnchor);
    // Markers created above (a pan, a zoom, a cluster splitting or merging)
    // start plain; give them the current hover and selection, then fit the
    // labels around the new layout.
    syncHighlights();
    cullLabels();
  }

  // One pass that paints the current selection and hover onto every marker.
  function syncHighlights() {
    for (const [key, marker] of markers) {
      applyMarkerHighlight(
        key,
        marker.getElement(),
        selectedId,
        hoveredId,
        renderer.classes,
      );
    }
  }

  function cullLabels() {
    if (!shouldCullLabels) return;
    cullPinLabels(map, markers, venues, renderer, selectedId, hoveredId);
  }

  // A pin's geometry keeps moving after the manager acts: the drop-in grows
  // each pin from a smaller scale, and selection and hover animate the body
  // and the callout. When such an animation settles inside the marker layer,
  // the labels are culled again, at most once per frame.
  function scheduleLabelCull() {
    if (pendingCullFrame !== null) return;
    pendingCullFrame = window.requestAnimationFrame(() => {
      pendingCullFrame = null;
      cullLabels();
    });
  }

  function render(nextVenues: VenueMarkerData[]) {
    venues = nextVenues;
    recluster();
    // Keep the drop-in armed until the first render that actually has data, so a
    // pre-load empty render doesn't consume the one-shot entrance.
    if (venues.length > 0) isFirstPaint = false;
  }

  function setSelected(venueId: string | null) {
    selectedId = venueId;
    syncHighlights();
    cullLabels();
  }

  function setHovered(venueId: string | null) {
    if (venueId === hoveredId) return;
    hoveredId = venueId;
    syncHighlights();
    cullLabels();
  }

  function syncZoomBand() {
    syncContainerAttributes(map, style);
  }

  function clear() {
    map.off("moveend", recluster);
    map.off("zoomend", syncZoomBand);
    if (shouldCullLabels) {
      markerLayer.removeEventListener("transitionend", scheduleLabelCull);
      markerLayer.removeEventListener("animationend", scheduleLabelCull);
    }
    if (pendingCullFrame !== null) {
      window.cancelAnimationFrame(pendingCullFrame);
      pendingCullFrame = null;
    }
    for (const marker of markers.values()) marker.remove();
    markers.clear();
    const container = map.getContainer();
    delete container.dataset.pinStyle;
    delete container.dataset.pinZoom;
  }

  // Re-group whenever the view settles (pan/zoom changes the pixel distances);
  // recluster culls the labels last.
  map.on("moveend", recluster);
  // Keep the zoom band current for styles that change with the camera.
  map.on("zoomend", syncZoomBand);
  if (shouldCullLabels) {
    markerLayer.addEventListener("transitionend", scheduleLabelCull);
    markerLayer.addEventListener("animationend", scheduleLabelCull);
  }
  syncContainerAttributes(map, style);

  return { render, recluster, setSelected, setHovered, clear };
}
