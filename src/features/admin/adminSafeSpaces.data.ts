import type { SafeSpaceCandidate } from "./api/adminSafeSpaces.api";

/**
 * Demo-mode fixture for the admin Safe Spaces candidates queue. Names/hoods
 * are drawn from `src/features/safety/safeSpaces.ts`'s mock directory so the
 * two surfaces stay recognisably in sync, but this list is intentionally its
 * own fixture (candidates + a couple of not-yet-reviewed listings) rather than
 * a re-export — the admin queue and the public safe-space pages are different
 * views over what will eventually be the same backend data.
 *
 * The `visits` tallies are hand-set to cover every state the console has to
 * draw: badges that cleared the bar, one that already stands below it (the
 * legacy case the panel REPORTS and never acts on), and unbadged listings both
 * near the bar and at zero, so the direct mark control's "write a reason"
 * branch is reachable on the demo tour.
 */
export const ADMIN_SAFE_SPACE_CANDIDATES: SafeSpaceCandidate[] = [
  {
    ref: "listing-purex",
    slug: "purex",
    name: "Purex",
    hood: "Intendente",
    safeSpaceStatus: "verified",
    visits: {
      independentVisitCount: 4,
      requiredVisitCount: 3,
      hasMetVisitBar: true,
    },
  },
  {
    ref: "listing-trumps",
    slug: "trumps",
    name: "Trumps",
    hood: "Rato",
    safeSpaceStatus: "verified",
    visits: {
      independentVisitCount: 3,
      requiredVisitCount: 3,
      hasMetVisitBar: true,
    },
  },
  {
    ref: "listing-lux-fragil",
    slug: "lux-fragil",
    name: "Lux Frágil",
    hood: "Santa Apolónia",
    safeSpaceStatus: "verified",
    visits: {
      independentVisitCount: 1,
      requiredVisitCount: 3,
      hasMetVisitBar: false,
    },
  },
  {
    ref: "listing-linha-dagua",
    slug: "linha-dagua",
    name: "Linha d'Água",
    hood: "Príncipe Real",
    safeSpaceStatus: "verified",
    visits: {
      independentVisitCount: 3,
      requiredVisitCount: 3,
      hasMetVisitBar: true,
    },
  },
  {
    ref: "listing-checkpointlx",
    slug: "checkpointlx",
    name: "CheckpointLx",
    hood: "Intendente",
    safeSpaceStatus: "removed",
    visits: {
      independentVisitCount: 2,
      requiredVisitCount: 3,
      hasMetVisitBar: false,
    },
  },
  {
    ref: "listing-bar-atlas",
    slug: "bar-atlas",
    name: "Bar Atlas",
    hood: "Santos",
    safeSpaceStatus: "none",
    visits: {
      independentVisitCount: 2,
      requiredVisitCount: 3,
      hasMetVisitBar: false,
    },
  },
  {
    ref: "listing-cafe-norte",
    slug: "cafe-norte",
    name: "Café Norte",
    hood: "Saldanha",
    safeSpaceStatus: "none",
    visits: {
      independentVisitCount: 0,
      requiredVisitCount: 3,
      hasMetVisitBar: false,
    },
  },
];
