import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { CATEGORY_ICON, TYPE_ICON } from "./map.data";
import s from "./venueMarker.module.css";

// CSS-module class access is `string | undefined` (noUncheckedIndexedAccess);
// resolve the names we assign imperatively to plain strings once.
const CLASS = {
  pin: s.pin ?? "",
  pinSelected: s.pinSelected ?? "",
  pinHead: s.pinHead ?? "",
  pinIcon: s.pinIcon ?? "",
  pinLabel: s.pinLabel ?? "",
  pinName: s.pinName ?? "",
  pinAddress: s.pinAddress ?? "",
  cluster: s.cluster ?? "",
  pinEnter: s.pinEnter ?? "",
};

// Cap the drop-in cascade so a dense map doesn't take seconds to finish.
const ENTRANCE_STAGGER_MS = 30;
const ENTRANCE_STAGGER_CAP = 9;

// Give a freshly-created marker its staggered drop-in on the map's first paint.
// Animates the inner button (mirroring hover/selected/animateFromOrigin), so the
// maplibre positioning transform on the wrapper is never disturbed.
function applyPinEntrance(wrapper: HTMLElement, order: number): void {
  const button = wrapper.firstElementChild;
  if (!(button instanceof HTMLElement) || !CLASS.pinEnter) return;
  button.classList.add(CLASS.pinEnter);
  button.style.animationDelay = `${Math.min(order, ENTRANCE_STAGGER_CAP) * ENTRANCE_STAGGER_MS}ms`;
}

// Pins closer than this many screen pixels get grouped into one cluster, so the
// ~34px chips never overlap. Zooming in spreads them apart and the groups split.
const CLUSTER_RADIUS_PX = 44;

// maplibre stacks markers by DOM order; raising the selected marker's wrapper
// keeps its pop-up label above neighbouring pins and cluster badges.
const SELECTED_Z_INDEX = "5";

// Pre-render each venue-type icon (react-icons) to static SVG markup once, so
// markers can be built as plain DOM without a React root per marker.
const ICON_SVG: Record<string, string> = Object.fromEntries(
  Object.entries({ ...TYPE_ICON, ...CATEGORY_ICON }).map(([type, Icon]) => [
    type,
    renderToStaticMarkup(createElement(Icon)),
  ]),
);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Slide a freshly-created pin's inner button from a screen origin (the cluster
// it broke out of) to its resting position. Animating the button — not the
// maplibre wrapper — keeps map panning jitter-free; inline styles are cleared
// afterwards so hover/selected CSS transforms take back over.
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
  let removed = false;
  const finish = () => {
    if (removed) return;
    removed = true;
    marker.remove();
  };
  button.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(finish, 340);
}

// The fields a marker needs — a structural subset of Venue.
export interface VenueMarkerData {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Localized aria-label builders, supplied by the component that owns `t()`.
export interface MarkerLabels {
  venuePin: (name: string, type: string) => string;
  cluster: (count: number) => string;
}

// maplibre-gl sets its positioning transform on the wrapper element we pass it.
// We nest the interactive button inside a wrapper so our hover/selected
// transforms animate the button without disturbing the map's positioning.
function createVenuePin(
  venue: VenueMarkerData,
  onSelect: () => void,
  selected: boolean,
  ariaLabel: string,
): HTMLElement {
  const wrapper = document.createElement("div");
  const button = document.createElement("button");
  button.type = "button";
  button.className = selected ? `${CLASS.pin} ${CLASS.pinSelected}` : CLASS.pin;
  // `venue.type` carries the unified category (see localPlaceToMarker); it drives
  // the teardrop's fill + icon colour via `.pin[data-category="…"]` in the CSS.
  button.dataset.category = venue.type;
  button.setAttribute("aria-label", ariaLabel);
  // The rotated `.pinHead` is the teardrop; the icon inside it counter-rotates so
  // it stays upright. The tip sits at the box bottom, matching the marker's
  // `anchor: "bottom"` so it points exactly at the coordinate.
  button.innerHTML =
    `<span class="${CLASS.pinHead}" aria-hidden="true">` +
    `<span class="${CLASS.pinIcon}">${ICON_SVG[venue.type] ?? ""}</span>` +
    `</span>` +
    `<span class="${CLASS.pinLabel}">` +
    `<span class="${CLASS.pinName}">${escapeHtml(venue.name)}</span>` +
    `<span class="${CLASS.pinAddress}">${escapeHtml(venue.address)}</span>` +
    `</span>`;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect();
  });
  wrapper.appendChild(button);
  return wrapper;
}

function createCluster(
  count: number,
  onExpand: () => void,
  ariaLabel: string,
): HTMLElement {
  const wrapper = document.createElement("div");
  const button = document.createElement("button");
  button.type = "button";
  button.className = CLASS.cluster;
  button.dataset.size = count < 4 ? "sm" : count < 8 ? "md" : "lg";
  button.setAttribute("aria-label", ariaLabel);
  button.textContent = String(count);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onExpand();
  });
  wrapper.appendChild(button);
  return wrapper;
}

export interface VenueMarkerManager {
  render: (venues: VenueMarkerData[]) => void;
  recluster: () => void;
  setSelected: (venueId: string | null) => void;
  clear: () => void;
}

// One HTML marker per venue, with screen-space clustering: pins whose chips
// would overlap at the current zoom are merged into a count badge; zooming in
// spreads them and the badge splits. No GeoJSON source / WebGL layer involved,
// so every point renders reliably (23 venues is trivial for O(n^2) grouping).
export function createVenueMarkerManager(
  map: MapLibreMap,
  onSelectVenue: (venueId: string) => void,
  getLabels: () => MarkerLabels,
): VenueMarkerManager {
  const markers = new Map<string, Marker>();
  let venues: VenueMarkerData[] = [];
  let selectedId: string | null = null;
  // The first render with real data gets the staggered drop-in; later reclusters
  // (pan/zoom) rely on the break-out/merge animations instead.
  let firstPaint = true;

  // Greedy screen-space grouping: anchor on the first ungrouped pin and absorb
  // any others within CLUSTER_RADIUS_PX of it.
  function computeGroups(): VenueMarkerData[][] {
    const projected = venues.map((venue) => ({
      venue,
      point: map.project([venue.longitude, venue.latitude]),
    }));
    const used = new Array<boolean>(projected.length).fill(false);
    const groups: VenueMarkerData[][] = [];
    for (let index = 0; index < projected.length; index++) {
      const anchor = projected[index];
      if (used[index] || !anchor) continue;
      used[index] = true;
      const members = [anchor.venue];
      for (let other = index + 1; other < projected.length; other++) {
        const candidate = projected[other];
        if (used[other] || !candidate) continue;
        const deltaX = anchor.point.x - candidate.point.x;
        const deltaY = anchor.point.y - candidate.point.y;
        if (deltaX * deltaX + deltaY * deltaY < CLUSTER_RADIUS_PX ** 2) {
          used[other] = true;
          members.push(candidate.venue);
        }
      }
      groups.push(members);
    }
    return groups;
  }

  function zoomToMembers(members: VenueMarkerData[]) {
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
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 90, maxZoom: 17, duration: 500 },
      );
    }
  }

  function recluster() {
    const groups = computeGroups();
    // Stagger the drop-in across markers created on the first paint only.
    const entrance = firstPaint && !prefersReducedMotion();
    let entranceOrder = 0;
    // Where each venue's marker sits right now — a pin breaking out of a cluster
    // animates from the cluster's position.
    const previousAnchor = new Map<string, [number, number]>();
    for (const [key, marker] of markers) {
      const { lng, lat } = marker.getLngLat();
      if (key.startsWith("v:")) {
        previousAnchor.set(key.slice(2), [lng, lat]);
      } else if (key.startsWith("c:")) {
        for (const id of key.slice(2).split(",")) {
          previousAnchor.set(id, [lng, lat]);
        }
      }
    }
    // Where each venue's marker will sit now — a pin merging into a cluster
    // animates toward that cluster's position before being removed.
    const nextAnchor = new Map<string, [number, number]>();
    for (const members of groups) {
      const anchor = members[0];
      if (!anchor) continue;
      for (const member of members) {
        nextAnchor.set(member.id, [anchor.longitude, anchor.latitude]);
      }
    }

    const next = new Set<string>();
    for (const members of groups) {
      const anchor = members[0];
      if (!anchor) continue;
      if (members.length === 1) {
        const key = `v:${anchor.id}`;
        next.add(key);
        if (!markers.has(key)) {
          const element = createVenuePin(
            anchor,
            () => onSelectVenue(anchor.id),
            anchor.id === selectedId,
            getLabels().venuePin(anchor.name, anchor.type),
          );
          // Teardrop tip points at the coordinate; round clusters stay centred.
          const marker = new maplibregl.Marker({ element, anchor: "bottom" })
            .setLngLat([anchor.longitude, anchor.latitude])
            .addTo(map);
          markers.set(key, marker);
          if (anchor.id === selectedId) element.style.zIndex = SELECTED_Z_INDEX;
          if (entrance) applyPinEntrance(element, entranceOrder++);
          const origin = previousAnchor.get(anchor.id);
          const button = element.firstElementChild;
          if (origin && button instanceof HTMLElement) {
            animateFromOrigin(
              button,
              map.project(origin),
              map.project([anchor.longitude, anchor.latitude]),
            );
          }
        }
      } else {
        const key = `c:${members
          .map((member) => member.id)
          .sort()
          .join(",")}`;
        next.add(key);
        if (!markers.has(key)) {
          const element = createCluster(
            members.length,
            () => zoomToMembers(members),
            getLabels().cluster(members.length),
          );
          markers.set(
            key,
            new maplibregl.Marker({ element })
              .setLngLat([anchor.longitude, anchor.latitude])
              .addTo(map),
          );
          if (entrance) applyPinEntrance(element, entranceOrder++);
        }
      }
    }
    for (const [key, marker] of markers) {
      if (next.has(key)) continue;
      markers.delete(key);
      // A pin whose venue is now inside a cluster slides into it; anything else
      // (an old cluster becoming pins, or a filtered-out venue) just leaves.
      if (key.startsWith("v:")) {
        const destination = nextAnchor.get(key.slice(2));
        if (destination) {
          animateMarkerOut(map, marker, destination);
          continue;
        }
      }
      marker.remove();
    }
  }

  function render(nextVenues: VenueMarkerData[]) {
    venues = nextVenues;
    recluster();
    // Keep the drop-in armed until the first render that actually has data, so a
    // pre-load empty render doesn't consume the one-shot entrance.
    if (venues.length > 0) firstPaint = false;
  }

  function setSelected(venueId: string | null) {
    selectedId = venueId;
    if (!CLASS.pinSelected) return;
    for (const [key, marker] of markers) {
      if (!key.startsWith("v:")) continue;
      const wrapper = marker.getElement();
      const isSelected = key === `v:${venueId}`;
      wrapper.firstElementChild?.classList.toggle(
        CLASS.pinSelected,
        isSelected,
      );
      wrapper.style.zIndex = isSelected ? SELECTED_Z_INDEX : "";
    }
  }

  function clear() {
    map.off("moveend", recluster);
    for (const marker of markers.values()) marker.remove();
    markers.clear();
  }

  // Re-group whenever the view settles (pan/zoom changes the pixel distances).
  map.on("moveend", recluster);

  return { render, recluster, setSelected, clear };
}
