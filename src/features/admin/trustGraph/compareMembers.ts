import type { TrustGraph } from "./trustGraphModel";
import { inboundTrustLinks } from "./trustPath";

const MILLISECONDS_PER_DAY = 86_400_000;

export interface MemberComparison {
  /** Members holding an active vouch for both, sorted by name. */
  sharedVoucherIds: string[];
  /** Calendar days between the two join dates (UTC), 0 = same day. */
  joinGapDays: number;
  /** Scenes both belong to, in the first member's order. */
  sharedSceneIds: string[];
}

function activeVoucherIds(graph: TrustGraph, personId: string): Set<string> {
  return new Set(
    inboundTrustLinks(graph, personId).map((link) => link.voucherId),
  );
}

function utcDayNumber(isoDate: string | undefined): number | null {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return (
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ) / MILLISECONDS_PER_DAY
  );
}

/** B6: what two members have in common. */
export function compareMembers(
  graph: TrustGraph,
  firstId: string,
  secondId: string,
): MemberComparison {
  const firstPerson = graph.peopleById[firstId];
  const secondPerson = graph.peopleById[secondId];

  const secondVoucherIds = activeVoucherIds(graph, secondId);
  const nameOf = (personId: string): string =>
    graph.peopleById[personId]?.name ?? personId;
  const sharedVoucherIds = [...activeVoucherIds(graph, firstId)]
    .filter(
      (voucherId) =>
        secondVoucherIds.has(voucherId) &&
        voucherId !== firstId &&
        voucherId !== secondId,
    )
    .sort((leftId, rightId) =>
      nameOf(leftId).localeCompare(nameOf(rightId), undefined, {
        sensitivity: "base",
      }),
    );

  const firstDay = utcDayNumber(firstPerson?.joinedAt);
  const secondDay = utcDayNumber(secondPerson?.joinedAt);
  const joinGapDays =
    firstDay === null || secondDay === null
      ? 0
      : Math.abs(Math.round(firstDay - secondDay));

  const secondSceneIds = new Set(secondPerson?.sceneIds ?? []);
  const sharedSceneIds = [...new Set(firstPerson?.sceneIds ?? [])].filter(
    (sceneId) => secondSceneIds.has(sceneId),
  );

  return { sharedVoucherIds, joinGapDays, sharedSceneIds };
}
