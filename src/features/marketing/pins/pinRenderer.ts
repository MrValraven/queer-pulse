// The seam between the marker manager (venueMarker.ts), which owns WHEN and
// WHERE markers exist, and a pin style, which owns what one LOOKS like. The
// manager creates every button, sets its type, aria-label and click handler,
// toggles the state classes below plus `data-selected` / `data-hovered`, and
// animates it in and out. A renderer only fills the button it is handed.

// The fields a marker needs: a structural subset of Venue. Everything past
// the coordinates is optional so the housing map, which knows none of it,
// still draws; each style degrades to its plain form when a field is absent.
export interface VenueMarkerData {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  /** A cover photo URL for the place, when it has one. */
  photo?: string;
  /** The place holds a verified badge (safe space, or verified queer-owned). */
  isVerified?: boolean;
  /** The localized category name, for the selected pin's callout. */
  categoryLabel?: string;
}

export interface PinRenderer {
  /** Classes the manager toggles. Every name is a plain string ("" when
   *  absent), and the manager skips an empty one. */
  classes: {
    /** Set by the renderer itself in buildPin; listed for completeness. */
    pin: string;
    /** On a pin whose venue is selected. */
    pinSelected: string;
    /** On a pin whose list card is hovered (fine pointers style it). */
    pinHovered: string;
    /** The one-shot staggered drop-in, on pins and clusters alike. */
    pinEnter: string;
    /** Set by the renderer itself in buildCluster; listed for completeness. */
    cluster: string;
    /** On a cluster holding the venue whose list card is hovered. */
    clusterHovered: string;
  };
  /** Pins closer than this many screen pixels merge into one cluster. */
  clusterRadiusPx: number;
  /** maplibre anchor for a venue pin ("bottom" puts a tip on the coordinate).
   *  Clusters are always centred. */
  pinAnchor: "bottom" | "center";
  /** Vertical screen offset, in pixels, from the coordinate to the centre of
   *  the pin's visible body; negative is up. The manager measures clustering
   *  distances from that point, so two pins merge when their bodies crowd
   *  each other. Absent means 0, the coordinate itself. */
  visualCenterOffsetPx?: number;
  /** Class of the pin's floating name label element, which the manager reads
   *  to hide labels that would collide with a neighbouring pin. Absent when
   *  the style draws no label. */
  labelClass?: string;
  /** Class of the element whose rect is the pin's visible disc, the obstacle
   *  a neighbouring label is tested against in the same culling. */
  bodyClass?: string;
  /** Fill a freshly created pin button: className, dataset, inline style,
   *  innerHTML. */
  buildPin: (button: HTMLButtonElement, venue: VenueMarkerData) => void;
  /** Update a reused pin in place; write only fields that changed. */
  refreshPin: (button: HTMLElement, venue: VenueMarkerData) => void;
  /** Fill a freshly created cluster button. */
  buildCluster: (button: HTMLButtonElement, members: VenueMarkerData[]) => void;
}

export type ClusterSize = "sm" | "md" | "lg";

// A cluster grows with its group, in three steps every style shares.
export function clusterSizeOf(count: number): ClusterSize {
  return count < 4 ? "sm" : count < 8 ? "md" : "lg";
}
