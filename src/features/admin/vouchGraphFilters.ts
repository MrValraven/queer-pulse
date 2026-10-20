import { ymValue } from "./trustGraph/trustGraphModel";
import type {
  Standing,
  VouchEdge,
  VouchPerson,
} from "./trustGraph/trustGraphModel";
import type {
  VouchEdgeFilterKind,
  VouchGraphFilters,
} from "./vouchGraph.types";

const STANDING_COUNT = 4;
const EDGE_KIND_COUNT = 3;

/** The filter state with nothing narrowed: every standing, scene, date and
 *  connection type passes. */
export const EMPTY_FILTERS: VouchGraphFilters = {
  standings: [],
  sceneId: null,
  isVerifiedOnly: false,
  connectedFrom: null,
  connectedTo: null,
  edgeKinds: [],
  shouldHideWithdrawn: false,
};

/** A standing list narrows only when it leaves at least one standing out. */
function isStandingFilterActive(standings: readonly Standing[]): boolean {
  return standings.length > 0 && new Set(standings).size < STANDING_COUNT;
}

/** A connection type list narrows only when it leaves at least one type out. */
function isEdgeKindFilterActive(
  edgeKinds: readonly VouchEdgeFilterKind[],
): boolean {
  return edgeKinds.length > 0 && new Set(edgeKinds).size < EDGE_KIND_COUNT;
}

/** True when the standing, scene or verified filter narrows the members. */
export function hasActiveMemberFilter(filters: VouchGraphFilters): boolean {
  return (
    isStandingFilterActive(filters.standings) ||
    filters.sceneId !== null ||
    filters.isVerifiedOnly
  );
}

/** How many filter panel fields narrow the view, for the button's pill. The
 *  two "Connected between" months count as one field. */
export function countActiveFilters(filters: VouchGraphFilters): number {
  let activeCount = 0;
  if (isStandingFilterActive(filters.standings)) activeCount += 1;
  if (filters.sceneId !== null) activeCount += 1;
  if (filters.isVerifiedOnly) activeCount += 1;
  if (filters.connectedFrom !== null || filters.connectedTo !== null) {
    activeCount += 1;
  }
  if (isEdgeKindFilterActive(filters.edgeKinds)) activeCount += 1;
  if (filters.shouldHideWithdrawn) activeCount += 1;
  return activeCount;
}

/** The connection type an edge files under: mutual first, then invite, then
 *  vouch. */
export function edgeFilterKind(edge: VouchEdge): VouchEdgeFilterKind {
  if (edge.mutual) return "mutual";
  if (edge.kind === "invite") return "invite";
  return "vouch";
}

/** True when the edge passes the connection type, withdrawn and date
 *  filters. Dates compare by month, both bounds inclusive. */
export function isEdgeAllowedByFilters(
  edge: VouchEdge,
  filters: VouchGraphFilters,
): boolean {
  if (filters.shouldHideWithdrawn && edge.withdrawn) return false;
  if (
    isEdgeKindFilterActive(filters.edgeKinds) &&
    !filters.edgeKinds.includes(edgeFilterKind(edge))
  ) {
    return false;
  }
  if (filters.connectedFrom === null && filters.connectedTo === null) {
    return true;
  }
  const edgeMonth = ymValue(edge.date);
  if (
    filters.connectedFrom !== null &&
    edgeMonth < ymValue(filters.connectedFrom)
  ) {
    return false;
  }
  if (
    filters.connectedTo !== null &&
    edgeMonth > ymValue(filters.connectedTo)
  ) {
    return false;
  }
  return true;
}

/** True when the member passes the standing, scene and verified filters.
 *  The caller exempts the focus and pinned members. */
export function isPersonAllowedByFilters(
  person: VouchPerson,
  filters: VouchGraphFilters,
): boolean {
  if (
    isStandingFilterActive(filters.standings) &&
    !filters.standings.includes(person.standing)
  ) {
    return false;
  }
  if (filters.sceneId !== null && !person.sceneIds.includes(filters.sceneId)) {
    return false;
  }
  if (filters.isVerifiedOnly && !person.verified) return false;
  return true;
}
