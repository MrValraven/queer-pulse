import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";

/**
 * The crafts a host can invite someone to the lineup as. The wire value
 * (`EventLineupEntryDTO.role`) is a free ≤40-char string the backend leaves
 * open, since a host may name a craft that is not (yet) a recognised persona
 * kind. This FE picker keeps to the `SubprofileKind` values that already
 * describe "who performed" at a gathering, so `role` doubles as the exact
 * `SubprofileKind` `lineupRoleToKind` matches against, with no lossy
 * translation table.
 */
export const LINEUP_ROLES: SubprofileKind[] = [
  "dj",
  "chef",
  "mixologist",
  "performer",
  "musician",
  "drag",
  "dancer",
];

const LINEUP_ROLE_SET = new Set<string>(LINEUP_ROLES);

/**
 * A lineup role maps to a persona kind only when the host picked one of the
 * curated {@link LINEUP_ROLES} (an identical value on the wire). A legacy or
 * free-text role matches no kind, so `GatheringPerformerNudge` stays silent
 * for it.
 */
export function lineupRoleToKind(role: string): SubprofileKind | null {
  return LINEUP_ROLE_SET.has(role) ? (role as SubprofileKind) : null;
}

/** Backend cap on a single lineup's open rows (`MAX_LINEUP_ENTRIES` in
 *  `event-lineup.service.ts`). */
export const MAX_LINEUP_ENTRIES = 50;
