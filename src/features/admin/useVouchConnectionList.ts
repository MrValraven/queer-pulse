import { useMemo, useState } from "react";
import { foldForSearch } from "../../shared/lib/foldForSearch";
import type { TrustGraph, VouchEdge } from "./trustGraph/trustGraphModel";
import { inboundTrustLinks, outboundTrustLinks } from "./trustGraph/trustPath";

export type ConnectionTab = "vouchedBy" | "vouchedFor" | "invited";
export type ConnectionSort = "name" | "newest" | "oldest";
export interface ConnectionRow {
  edge: VouchEdge;
  otherId: string;
  isWithdrawn: boolean;
}

export const CONNECTION_TABS: ConnectionTab[] = [
  "vouchedBy",
  "vouchedFor",
  "invited",
];

function otherIdOf(edge: VouchEdge, personId: string): string {
  return edge.from === personId ? edge.to : edge.from;
}

/** Withdrawn edges point either way for a mutual pair; every other withdrawn
 *  edge has one direction. */
function isWithdrawnInbound(edge: VouchEdge, personId: string): boolean {
  return (
    edge.to === personId || (edge.mutual === true && edge.from === personId)
  );
}

function isWithdrawnOutbound(edge: VouchEdge, personId: string): boolean {
  return (
    edge.from === personId || (edge.mutual === true && edge.to === personId)
  );
}

function belongsToTab(
  edge: VouchEdge,
  personId: string,
  tab: ConnectionTab,
): boolean {
  if (tab === "vouchedBy") return isWithdrawnInbound(edge, personId);
  if (!isWithdrawnOutbound(edge, personId)) return false;
  const isInvite = edge.kind === "invite" && edge.from === personId;
  return tab === "invited" ? isInvite : !isInvite;
}

function activeEdgesForTab(
  graph: TrustGraph,
  personId: string,
  tab: ConnectionTab,
): VouchEdge[] {
  if (tab === "vouchedBy") {
    return inboundTrustLinks(graph, personId).map((link) => link.edge);
  }
  const wantedKind = tab === "invited" ? "invite" : "vouch";
  return outboundTrustLinks(graph, personId)
    .filter((link) => link.kind === wantedKind)
    .map((link) => link.edge);
}

function rowsForTab(
  graph: TrustGraph,
  personId: string,
  tab: ConnectionTab,
  shouldHideWithdrawn: boolean,
): ConnectionRow[] {
  const rows: ConnectionRow[] = activeEdgesForTab(graph, personId, tab).map(
    (edge) => ({
      edge,
      otherId: otherIdOf(edge, personId),
      isWithdrawn: false,
    }),
  );
  if (shouldHideWithdrawn) return rows;
  for (const edge of graph.incidentEdges(personId)) {
    if (!edge.withdrawn || edge.from === edge.to) continue;
    if (!belongsToTab(edge, personId, tab)) continue;
    rows.push({ edge, otherId: otherIdOf(edge, personId), isWithdrawn: true });
  }
  return rows;
}

function nameOf(graph: TrustGraph, row: ConnectionRow): string {
  return graph.peopleById[row.otherId]?.name ?? "";
}

function compareRows(
  graph: TrustGraph,
  sort: ConnectionSort,
): (first: ConnectionRow, second: ConnectionRow) => number {
  return (first, second) => {
    if (first.isWithdrawn !== second.isWithdrawn) {
      return first.isWithdrawn ? 1 : -1;
    }
    const byName = nameOf(graph, first).localeCompare(
      nameOf(graph, second),
      undefined,
      { sensitivity: "base" },
    );
    if (sort === "name") return byName;
    const byDate = first.edge.date.localeCompare(second.edge.date);
    if (byDate !== 0) return sort === "newest" ? -byDate : byDate;
    return byName;
  };
}

export function buildConnectionRows(input: {
  graph: TrustGraph;
  personId: string;
  tab: ConnectionTab;
  query: string;
  sort: ConnectionSort;
  shouldHideWithdrawn: boolean;
}): ConnectionRow[] {
  const { graph, personId, tab, query, sort, shouldHideWithdrawn } = input;
  const foldedQuery = foldForSearch(query.trim());
  const rows = rowsForTab(graph, personId, tab, shouldHideWithdrawn).filter(
    (row) =>
      foldedQuery === "" ||
      foldForSearch(nameOf(graph, row)).includes(foldedQuery),
  );
  return rows.sort(compareRows(graph, sort));
}

export function countConnections(
  graph: TrustGraph,
  personId: string,
  shouldHideWithdrawn: boolean,
): Record<ConnectionTab, number> {
  const counts = { vouchedBy: 0, vouchedFor: 0, invited: 0 };
  for (const tab of CONNECTION_TABS) {
    counts[tab] = rowsForTab(graph, personId, tab, shouldHideWithdrawn).length;
  }
  return counts;
}

/** Count of active rows on the Vouched by tab, whatever the name filter. */
export function countVisibleInbound(
  graph: TrustGraph,
  personId: string,
): number {
  return inboundTrustLinks(graph, personId).length;
}

export function useVouchConnectionList(input: {
  graph: TrustGraph;
  personId: string;
  shouldHideWithdrawn: boolean;
}) {
  const { graph, personId, shouldHideWithdrawn } = input;
  const [tab, setTab] = useState<ConnectionTab>("vouchedBy");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ConnectionSort>("name");
  const counts = useMemo(
    () => countConnections(graph, personId, shouldHideWithdrawn),
    [graph, personId, shouldHideWithdrawn],
  );
  const rows = useMemo(
    () =>
      buildConnectionRows({
        graph,
        personId,
        tab,
        query,
        sort,
        shouldHideWithdrawn,
      }),
    [graph, personId, tab, query, sort, shouldHideWithdrawn],
  );
  return { tab, setTab, query, setQuery, sort, setSort, counts, rows };
}
