import s from "../venueMarker.module.css";
import { ICON_SVG, escapeHtml } from "./pinIcons";
import { clusterSizeOf, type PinRenderer } from "./pinRenderer";

// The teardrop pin: the category teardrop with a plum name label, and the
// coral count bubble. The housing map draws its neighbourhood pins with it.
// Styled by venueMarker.module.css.

// CSS-module class access is `string | undefined` (noUncheckedIndexedAccess);
// resolve the names we assign imperatively to plain strings once.
const CLASS = {
  pin: s.pin ?? "",
  pinSelected: s.pinSelected ?? "",
  pinHovered: s.pinHovered ?? "",
  pinHead: s.pinHead ?? "",
  pinIcon: s.pinIcon ?? "",
  pinLabel: s.pinLabel ?? "",
  pinName: s.pinName ?? "",
  pinAddress: s.pinAddress ?? "",
  cluster: s.cluster ?? "",
  clusterHovered: s.clusterHovered ?? "",
  pinEnter: s.pinEnter ?? "",
};

export const teardropPinRenderer: PinRenderer = {
  classes: {
    pin: CLASS.pin,
    pinSelected: CLASS.pinSelected,
    pinHovered: CLASS.pinHovered,
    pinEnter: CLASS.pinEnter,
    cluster: CLASS.cluster,
    clusterHovered: CLASS.clusterHovered,
  },
  // Pins closer than this many screen pixels get grouped into one cluster, so
  // the ~34px chips never overlap. Zooming in spreads them apart and the
  // groups split.
  clusterRadiusPx: 44,
  // Teardrop tip points at the coordinate; round clusters stay centred.
  pinAnchor: "bottom",

  buildPin(button, venue) {
    button.className = CLASS.pin;
    // `venue.type` carries the unified category (see localPlaceToMarker); it
    // drives the teardrop's fill + icon colour via `.pin[data-category="…"]`
    // in the CSS.
    button.dataset.category = venue.type;
    // The rotated `.pinHead` is the teardrop; the icon inside it
    // counter-rotates so it stays upright. The tip sits at the box bottom,
    // matching the marker's `anchor: "bottom"` so it points exactly at the
    // coordinate.
    button.innerHTML =
      `<span class="${CLASS.pinHead}" aria-hidden="true">` +
      `<span class="${CLASS.pinIcon}">${ICON_SVG[venue.type] ?? ""}</span>` +
      `</span>` +
      `<span class="${CLASS.pinLabel}">` +
      `<span class="${CLASS.pinName}">${escapeHtml(venue.name)}</span>` +
      `<span class="${CLASS.pinAddress}">${escapeHtml(venue.address)}</span>` +
      `</span>`;
  },

  // A reused pin keeps its DOM (so no re-entrance animation), but the housing
  // map's pins carry a count in their address that a filter can change under
  // the same id. Only fields that differ are written, so the directory's
  // unchanging pins cost nothing.
  refreshPin(button, venue) {
    if (button.dataset.category !== venue.type) {
      button.dataset.category = venue.type;
      // The icon is keyed by type too; its markup is the pre-rendered static
      // SVG.
      const iconElement = CLASS.pinIcon
        ? button.getElementsByClassName(CLASS.pinIcon)[0]
        : undefined;
      if (iconElement) iconElement.innerHTML = ICON_SVG[venue.type] ?? "";
    }
    const nameElement = CLASS.pinName
      ? button.getElementsByClassName(CLASS.pinName)[0]
      : undefined;
    if (nameElement && nameElement.textContent !== venue.name) {
      nameElement.textContent = venue.name;
    }
    const addressElement = CLASS.pinAddress
      ? button.getElementsByClassName(CLASS.pinAddress)[0]
      : undefined;
    if (addressElement && addressElement.textContent !== venue.address) {
      addressElement.textContent = venue.address;
    }
  },

  buildCluster(button, members) {
    button.className = CLASS.cluster;
    button.dataset.size = clusterSizeOf(members.length);
    button.textContent = String(members.length);
  },
};
