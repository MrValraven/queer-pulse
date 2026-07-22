import type { SafeSpaceCandidate } from "./api/adminSafeSpaces.api";

/**
 * Demo-mode fixture for the admin Safe Spaces candidates queue. Names/hoods
 * are drawn from `src/features/safety/safeSpaces.ts`'s mock directory so the
 * two surfaces stay recognisably in sync, but this list is intentionally its
 * own fixture (candidates + a couple of not-yet-reviewed listings) rather than
 * a re-export — the admin queue and the public safe-space pages are different
 * views over what will eventually be the same backend data.
 */
export const ADMIN_SAFE_SPACE_CANDIDATES: SafeSpaceCandidate[] = [
  {
    ref: "listing-purex",
    slug: "purex",
    name: "Purex",
    hood: "Intendente",
    safeSpaceStatus: "verified",
  },
  {
    ref: "listing-trumps",
    slug: "trumps",
    name: "Trumps",
    hood: "Rato",
    safeSpaceStatus: "verified",
  },
  {
    ref: "listing-lux-fragil",
    slug: "lux-fragil",
    name: "Lux Frágil",
    hood: "Santa Apolónia",
    safeSpaceStatus: "verified",
  },
  {
    ref: "listing-linha-dagua",
    slug: "linha-dagua",
    name: "Linha d'Água",
    hood: "Príncipe Real",
    safeSpaceStatus: "verified",
  },
  {
    ref: "listing-checkpointlx",
    slug: "checkpointlx",
    name: "CheckpointLx",
    hood: "Intendente",
    safeSpaceStatus: "removed",
  },
  {
    ref: "listing-bar-atlas",
    slug: "bar-atlas",
    name: "Bar Atlas",
    hood: "Santos",
    safeSpaceStatus: "none",
  },
  {
    ref: "listing-cafe-norte",
    slug: "cafe-norte",
    name: "Café Norte",
    hood: "Saldanha",
    safeSpaceStatus: "none",
  },
];
