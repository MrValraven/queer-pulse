import type {
  TrustGraph,
  VouchEdge,
  VouchPerson,
} from "./trustGraph/trustGraphModel";
import type {
  InviteBubble,
  VouchGraphFilters,
  VouchLayoutKind,
  VouchMode,
} from "./vouchGraph.types";
import {
  countActiveFilters,
  hasActiveMemberFilter,
  isEdgeAllowedByFilters,
  isPersonAllowedByFilters,
} from "./vouchGraphFilters";

/** A parent with more pure invite leaves than this collapses them into one
 *  bubble node (C2). */
export const INVITE_BUBBLE_THRESHOLD = 8;
/** A focus with this many direct neighbours or fewer pulls in their
 *  neighbours too (D2). */
export const AUTO_SECOND_HOP_MAX = 5;

export interface VisibleGraphInput {
  graph: TrustGraph;
  focus: string;
  mode: VouchMode;
  expanded: ReadonlySet<string>;
  /** Parent ids whose invite bubble is open. */
  expandedBubbles: ReadonlySet<string>;
  filters: VouchGraphFilters;
  isEdgeRevealed: (edgeId: string) => boolean;
  /** Selected member, path endpoints and search matches: they skip the
   *  member filters and never fold into a bubble. */
  pinnedIds: ReadonlySet<string>;
}

export interface VisibleGraph {
  /** Member ids only; bubble nodes come through `bubbles`. */
  visIds: string[];
  visEdges: VouchEdge[];
  bubbles: InviteBubble[];
  layoutKind: VouchLayoutKind;
  /** True when D2 added at least one second-hop member. */
  isSecondHopAuto: boolean;
  /** True when the filters left only the focus. */
  isFilteredEmpty: boolean;
}

function addNeighbors(
  graph: TrustGraph,
  personId: string,
  targetIds: Set<string>,
): void {
  for (const neighborId of graph.neighbors(personId, true)) {
    targetIds.add(neighborId);
  }
}

function isSafetyConcern(person: VouchPerson): boolean {
  return (
    person.standing === "flagged" ||
    person.ringId !== null ||
    person.isolatedBy.length > 0
  );
}

/** Everyone the view could show before filters and replay: the focus and
 *  its neighbours, expanded neighbourhoods, the D2 second hop (plain view)
 *  and the Safety overlay's flagged members with their neighbours. */
function collectCandidateIds(
  graph: TrustGraph,
  focus: string,
  mode: VouchMode,
  expanded: ReadonlySet<string>,
): { candidateIds: Set<string>; isSecondHopAuto: boolean } {
  const candidateIds = new Set<string>([focus]);
  const directNeighborIds = graph.neighbors(focus, true);
  directNeighborIds.forEach((neighborId) => candidateIds.add(neighborId));
  expanded.forEach((expandedId) =>
    addNeighbors(graph, expandedId, candidateIds),
  );

  let isSecondHopAuto = false;
  const isPlainView = mode === "plain" || mode === "invites";
  if (isPlainView && directNeighborIds.length <= AUTO_SECOND_HOP_MAX) {
    const sizeBefore = candidateIds.size;
    directNeighborIds.forEach((neighborId) =>
      addNeighbors(graph, neighborId, candidateIds),
    );
    isSecondHopAuto = candidateIds.size > sizeBefore;
  }

  if (mode === "safety") {
    for (const person of graph.people) {
      if (!isSafetyConcern(person)) continue;
      candidateIds.add(person.id);
      addNeighbors(graph, person.id, candidateIds);
    }
  }
  return { candidateIds, isSecondHopAuto };
}

/** Edges with both ends allowed that pass the edge filters and the replay
 *  cut. Walks each allowed node's adjacency once and keeps an edge from its
 *  `from` side, so every edge appears once. */
function collectVisibleEdges(
  graph: TrustGraph,
  allowedIds: ReadonlySet<string>,
  filters: VouchGraphFilters,
  isEdgeRevealed: (edgeId: string) => boolean,
): VouchEdge[] {
  const visibleEdges: VouchEdge[] = [];
  for (const nodeId of allowedIds) {
    for (const edge of graph.incidentEdges(nodeId)) {
      if (edge.from !== nodeId || !allowedIds.has(edge.to)) continue;
      if (!isEdgeRevealed(edge.id)) continue;
      if (!isEdgeAllowedByFilters(edge, filters)) continue;
      visibleEdges.push(edge);
    }
  }
  return visibleEdges;
}

/** True when a revealed edge joins two candidates and reaches past the
 *  focus, ignoring every filter. */
function hasRevealedNeighbour(
  graph: TrustGraph,
  candidateIds: ReadonlySet<string>,
  focus: string,
  isEdgeRevealed: (edgeId: string) => boolean,
): boolean {
  for (const nodeId of candidateIds) {
    for (const edge of graph.incidentEdges(nodeId)) {
      if (edge.from !== nodeId || !candidateIds.has(edge.to)) continue;
      if (edge.from === focus && edge.to === focus) continue;
      if (isEdgeRevealed(edge.id)) return true;
    }
  }
  return false;
}

function isPureInviteLeafEdge(edge: VouchEdge, leafId: string): boolean {
  return (
    edge.kind === "invite" &&
    !edge.mutual &&
    !edge.withdrawn &&
    edge.to === leafId &&
    edge.from !== leafId
  );
}

/** C2: groups the visible members whose only visible edge is an active,
 *  non-mutual invite from one parent. Parents with more than
 *  INVITE_BUBBLE_THRESHOLD such leaves get a bubble. */
function collectInviteBubbles(
  visIds: string[],
  visEdges: VouchEdge[],
  focus: string,
  pinnedIds: ReadonlySet<string>,
  expandedBubbles: ReadonlySet<string>,
): InviteBubble[] {
  const edgesByNodeId = new Map<string, VouchEdge[]>();
  const appendEdge = (nodeId: string, edge: VouchEdge): void => {
    const nodeEdges = edgesByNodeId.get(nodeId);
    if (nodeEdges) nodeEdges.push(edge);
    else edgesByNodeId.set(nodeId, [edge]);
  };
  for (const edge of visEdges) {
    appendEdge(edge.from, edge);
    if (edge.to !== edge.from) appendEdge(edge.to, edge);
  }

  const leafIdsByParentId = new Map<string, string[]>();
  for (const personId of visIds) {
    if (personId === focus || pinnedIds.has(personId)) continue;
    const personEdges = edgesByNodeId.get(personId);
    if (personEdges?.length !== 1) continue;
    const onlyEdge = personEdges[0]!;
    if (!isPureInviteLeafEdge(onlyEdge, personId)) continue;
    const leafIds = leafIdsByParentId.get(onlyEdge.from);
    if (leafIds) leafIds.push(personId);
    else leafIdsByParentId.set(onlyEdge.from, [personId]);
  }

  const bubbles: InviteBubble[] = [];
  for (const parentId of visIds) {
    const leafIds = leafIdsByParentId.get(parentId);
    if (!leafIds || leafIds.length <= INVITE_BUBBLE_THRESHOLD) continue;
    bubbles.push({
      id: `bubble:${parentId}`,
      parentId,
      leafIds,
      isExpanded: expandedBubbles.has(parentId),
    });
  }
  return bubbles;
}

/** Which members and edges the canvas shows (B7, C1, C2, C6, D2). Uses the
 *  graph's adjacency only. Steps: candidates, member filters (the focus and
 *  pinned members exempt), edge filters plus replay, drop members left with
 *  no visible edge (the focus stays), then fold closed invite bubbles. */
export function deriveVisibleGraph(input: VisibleGraphInput): VisibleGraph {
  const { graph, focus, filters, pinnedIds } = input;
  const { candidateIds, isSecondHopAuto } = collectCandidateIds(
    graph,
    focus,
    input.mode,
    input.expanded,
  );

  const allowedIds = new Set<string>();
  const hasMemberFilter = hasActiveMemberFilter(filters);
  for (const candidateId of candidateIds) {
    const person = graph.peopleById[candidateId];
    const isExempt = candidateId === focus || pinnedIds.has(candidateId);
    const isAllowed = person
      ? isPersonAllowedByFilters(person, filters)
      : !hasMemberFilter;
    if (isExempt || isAllowed) allowedIds.add(candidateId);
  }

  const filteredEdges = collectVisibleEdges(
    graph,
    allowedIds,
    filters,
    input.isEdgeRevealed,
  );
  const connectedIds = new Set<string>([focus]);
  for (const edge of filteredEdges) {
    connectedIds.add(edge.from);
    connectedIds.add(edge.to);
  }
  const filteredIds = [...allowedIds].filter((id) => connectedIds.has(id));
  // Empty because of the filters: the same view without them, at this
  // replay step, would show someone besides the focus.
  const isFilteredEmpty =
    filteredIds.length === 1 &&
    countActiveFilters(filters) > 0 &&
    hasRevealedNeighbour(graph, candidateIds, focus, input.isEdgeRevealed);

  const bubbles = collectInviteBubbles(
    filteredIds,
    filteredEdges,
    focus,
    pinnedIds,
    input.expandedBubbles,
  );
  const foldedIds = new Set<string>();
  for (const bubble of bubbles) {
    if (!bubble.isExpanded) bubble.leafIds.forEach((id) => foldedIds.add(id));
  }

  const isPlainView = input.mode === "plain" || input.mode === "invites";
  return {
    visIds: filteredIds.filter((id) => !foldedIds.has(id)),
    visEdges: filteredEdges.filter(
      (edge) => !foldedIds.has(edge.from) && !foldedIds.has(edge.to),
    ),
    bubbles,
    layoutKind: isPlainView && input.expanded.size === 0 ? "rings" : "force",
    isSecondHopAuto,
    isFilteredEmpty,
  };
}
