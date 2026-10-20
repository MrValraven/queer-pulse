import type { TrustGraph, VouchEdge } from "./trustGraphModel";

/** How a visible member relates to the focus (C1 rings, E1 list view). */
export type EgoRelation =
  | "mutual"
  | "vouchedBy"
  | "vouchedFor"
  | "invited"
  | "withdrawnOnly"
  | "secondHop";

interface DirectLinkFlags {
  isMutual: boolean;
  isVouchedBy: boolean;
  isInvited: boolean;
  isVouchedFor: boolean;
}

function emptyFlags(): DirectLinkFlags {
  return {
    isMutual: false,
    isVouchedBy: false,
    isInvited: false,
    isVouchedFor: false,
  };
}

function relationFromFlags(flags: DirectLinkFlags): EgoRelation {
  if (flags.isMutual) return "mutual";
  if (flags.isVouchedBy) return "vouchedBy";
  if (flags.isInvited) return "invited";
  if (flags.isVouchedFor) return "vouchedFor";
  return "withdrawnOnly";
}

/** Classifies every visible member (the focus excluded) by its direct edges
 *  with the focus, over `visEdges` only. Precedence: active mutual, active
 *  other to focus, active focus-to-other invite, active focus-to-other vouch,
 *  withdrawn edges only, then no direct edge (`secondHop`). Ids missing from
 *  `graph.peopleById` (invite bubbles) are left out of the map. */
export function groupEgoRelations(
  graph: TrustGraph,
  focusId: string,
  visIds: string[],
  visEdges: VouchEdge[],
): Map<string, EgoRelation> {
  const flagsById = new Map<string, DirectLinkFlags>();
  for (const edge of visEdges) {
    const isFromFocus = edge.from === focusId;
    const isToFocus = edge.to === focusId;
    if (isFromFocus === isToFocus) continue;
    const otherId = isFromFocus ? edge.to : edge.from;
    const flags = flagsById.get(otherId) ?? emptyFlags();
    flagsById.set(otherId, flags);
    if (edge.withdrawn) continue;
    if (edge.mutual) flags.isMutual = true;
    else if (isToFocus) flags.isVouchedBy = true;
    else if (edge.kind === "invite") flags.isInvited = true;
    else flags.isVouchedFor = true;
  }

  const relations = new Map<string, EgoRelation>();
  for (const personId of visIds) {
    if (personId === focusId || !graph.peopleById[personId]) continue;
    const flags = flagsById.get(personId);
    relations.set(personId, flags ? relationFromFlags(flags) : "secondHop");
  }
  return relations;
}

/** For a second-hop member, the direct neighbour of the focus it hangs off:
 *  the alphabetically first one (by display name) linked to it by any
 *  visible edge. Null when none is linked. */
export function findSecondHopParent(
  focusId: string,
  id: string,
  visEdges: VouchEdge[],
  relations: Map<string, EgoRelation>,
  nameFor: (id: string) => string,
): string | null {
  const candidateIds = new Set<string>();
  for (const edge of visEdges) {
    const otherId =
      edge.from === id ? edge.to : edge.to === id ? edge.from : null;
    if (!otherId || otherId === focusId || otherId === id) continue;
    const relation = relations.get(otherId);
    if (relation && relation !== "secondHop") candidateIds.add(otherId);
  }
  let parentId: string | null = null;
  for (const candidateId of candidateIds) {
    if (
      parentId === null ||
      nameFor(candidateId).localeCompare(nameFor(parentId), undefined, {
        sensitivity: "base",
      }) < 0
    ) {
      parentId = candidateId;
    }
  }
  return parentId;
}
