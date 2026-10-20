import type { TrustGraph } from "./trustGraphModel";
import { outboundTrustLinks } from "./trustPath";

/** B5: members who would lose their only vouch if `voucherId` were removed.
 *  A member counts when `voucherId` holds an active vouch for them and their
 *  platform-wide `activeInboundCount` is exactly 1, so vouches from outside
 *  the loaded view still protect them. Sorted by name. */
export function soleVoucheesOf(graph: TrustGraph, voucherId: string): string[] {
  const soleIds = new Set<string>();
  for (const link of outboundTrustLinks(graph, voucherId)) {
    const vouchee = graph.peopleById[link.voucheeId];
    if (!vouchee || link.voucheeId === voucherId) continue;
    if (vouchee.activeInboundCount === 1) soleIds.add(link.voucheeId);
  }
  const nameOf = (personId: string): string =>
    graph.peopleById[personId]?.name ?? personId;
  return [...soleIds].sort((leftId, rightId) =>
    nameOf(leftId).localeCompare(nameOf(rightId), undefined, {
      sensitivity: "base",
    }),
  );
}
