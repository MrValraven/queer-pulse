import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";

/**
 * The crafts a host can tag someone with on a gathering's lineup. The wire
 * value (`EventLineupEntryDTO.role`) is a free ≤40-char string the backend
 * deliberately doesn't enum-constrain (a host may tag a craft that isn't
 * (yet) a recognised persona kind) — but this FE picker is kept to the
 * `SubprofileKind` values that already describe "who performed" at a
 * gathering, so `role` doubles as the exact `SubprofileKind`
 * `lineupRoleToKind` matches against, with no lossy translation table.
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
 * curated {@link LINEUP_ROLES} (an identical value on the wire) — a
 * legacy/free-text role never matches a kind, so `GatheringPerformerNudge`
 * simply doesn't fire for it rather than mis-suggesting a craft.
 */
export function lineupRoleToKind(role: string): SubprofileKind | null {
  return LINEUP_ROLE_SET.has(role) ? (role as SubprofileKind) : null;
}

/** Backend cap on a single lineup (`MAX_LINEUP_ENTRIES` in `events.service.ts`). */
export const MAX_LINEUP_ENTRIES = 50;
