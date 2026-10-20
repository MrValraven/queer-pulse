import type { TrustGraph, VouchEdge } from "./trustGraphModel";

/** One hop of a trust path. `fromId → toId` follows the path's reading order;
 *  `isForward` is true when the hop runs with the trust (the voucher is
 *  `fromId`), false when an undirected path walks an edge against it. */
export interface TrustPathStep {
  fromId: string;
  toId: string;
  edgeId: string;
  kind: "invite" | "vouch";
  isForward: boolean;
}

export interface TrustPath {
  nodeIds: string[];
  edgeIds: string[];
  steps: TrustPathStep[];
  /** True when every step runs voucher to vouchee. */
  isDirected: boolean;
}

/** A single direction of active trust, voucher to vouchee. A mutual edge
 *  carries trust both ways (demo stores one edge for a mutual pair, live
 *  stores two), so it yields a link in each direction. */
export interface TrustLink {
  voucherId: string;
  voucheeId: string;
  edge: VouchEdge;
  kind: "invite" | "vouch";
}

function edgeKindOf(edge: VouchEdge): "invite" | "vouch" {
  return edge.kind === "invite" ? "invite" : "vouch";
}

type LinkDirection = "inbound" | "outbound";

/** One link per other member, keyed by that member. A real directional row
 *  always sets the entry; the reverse half of a mutual row fills it only when
 *  that member has no real row. So a live mutual pair (two rows, both flagged
 *  mutual) reads as one link, the same as demo's single mutual row. */
function collectTrustLinks(
  graph: TrustGraph,
  personId: string,
  direction: LinkDirection,
  isEdgeUsable: (edge: VouchEdge) => boolean,
): TrustLink[] {
  const linkByOtherId = new Map<string, TrustLink>();
  for (const edge of graph.incidentEdges(personId)) {
    if (edge.withdrawn || edge.from === edge.to || !isEdgeUsable(edge)) {
      continue;
    }
    const isOutboundRow = edge.from === personId;
    const otherId = isOutboundRow ? edge.to : edge.from;
    const isRealRow = isOutboundRow === (direction === "outbound");
    const voucherId = direction === "inbound" ? otherId : personId;
    const voucheeId = direction === "inbound" ? personId : otherId;
    if (isRealRow) {
      linkByOtherId.set(otherId, {
        voucherId,
        voucheeId,
        edge,
        kind: edgeKindOf(edge),
      });
    } else if (edge.mutual && !linkByOtherId.has(otherId)) {
      // The reverse half of a mutual row is always a plain vouch back.
      linkByOtherId.set(otherId, { voucherId, voucheeId, edge, kind: "vouch" });
    }
  }
  return [...linkByOtherId.values()];
}

const isAnyEdgeUsable = (): boolean => true;

/** Active trust links that point INTO `personId`, mutual edges included, one
 *  per voucher. */
export function inboundTrustLinks(
  graph: TrustGraph,
  personId: string,
): TrustLink[] {
  return collectTrustLinks(graph, personId, "inbound", isAnyEdgeUsable);
}

/** Active trust links that point OUT of `personId`, mutual edges included,
 *  one per vouchee. */
export function outboundTrustLinks(
  graph: TrustGraph,
  personId: string,
): TrustLink[] {
  return collectTrustLinks(graph, personId, "outbound", isAnyEdgeUsable);
}

type ExpandNode = (currentId: string) => TrustPathStep[];

/** Plain breadth-first search; returns the steps from `startId` to `endId`. */
function breadthFirstSteps(
  startId: string,
  endId: string,
  expandNode: ExpandNode,
): TrustPathStep[] | null {
  const arrivalStepById = new Map<string, TrustPathStep | null>([
    [startId, null],
  ]);
  const queue: string[] = [startId];
  for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
    const currentId = queue[queueIndex]!;
    if (currentId === endId) break;
    for (const step of expandNode(currentId)) {
      if (arrivalStepById.has(step.toId)) continue;
      arrivalStepById.set(step.toId, step);
      queue.push(step.toId);
    }
  }
  if (!arrivalStepById.has(endId)) return null;
  const steps: TrustPathStep[] = [];
  let cursorId = endId;
  while (cursorId !== startId) {
    const step = arrivalStepById.get(cursorId)!;
    steps.push(step);
    cursorId = step.fromId;
  }
  return steps.reverse();
}

function buildPath(
  startId: string,
  steps: TrustPathStep[],
  isDirected: boolean,
): TrustPath {
  return {
    nodeIds: [startId, ...steps.map((step) => step.toId)],
    edgeIds: steps.map((step) => step.edgeId),
    steps,
    isDirected,
  };
}

/** B8: the trust path between two members. Withdrawn edges never count, and
 *  `isEdgeUsable` narrows further (the replay step, filters). Search order:
 *  directed start to end, then directed end to start (returned in voucher to
 *  vouchee order, so it starts at `endId`), then undirected. */
export function findTrustPath(
  graph: TrustGraph,
  startId: string,
  endId: string,
  isEdgeUsable: (edge: VouchEdge) => boolean,
): TrustPath | null {
  if (startId === endId) return buildPath(startId, [], true);

  const usableEdgesOf = (personId: string): VouchEdge[] =>
    graph
      .incidentEdges(personId)
      .filter(
        (edge) =>
          !edge.withdrawn && edge.from !== edge.to && isEdgeUsable(edge),
      );

  // Same "real row wins" rule as the link helpers, so the highlighted edge is
  // the one the sentence describes.
  const expandDirected: ExpandNode = (currentId) =>
    collectTrustLinks(graph, currentId, "outbound", isEdgeUsable).map(
      (link) => ({
        fromId: currentId,
        toId: link.voucheeId,
        edgeId: link.edge.id,
        kind: link.kind,
        isForward: true,
      }),
    );

  const expandUndirected: ExpandNode = (currentId) =>
    usableEdgesOf(currentId).map((edge) => {
      const isOutbound = edge.from === currentId;
      const isForward = isOutbound || edge.mutual === true;
      return {
        fromId: currentId,
        toId: isOutbound ? edge.to : edge.from,
        edgeId: edge.id,
        kind: isOutbound || !edge.mutual ? edgeKindOf(edge) : "vouch",
        isForward,
      };
    });

  const forwardSteps = breadthFirstSteps(startId, endId, expandDirected);
  if (forwardSteps) return buildPath(startId, forwardSteps, true);

  const backwardSteps = breadthFirstSteps(endId, startId, expandDirected);
  if (backwardSteps) return buildPath(endId, backwardSteps, true);

  const undirectedSteps = breadthFirstSteps(startId, endId, expandUndirected);
  if (undirectedSteps) return buildPath(startId, undirectedSteps, false);

  return null;
}
