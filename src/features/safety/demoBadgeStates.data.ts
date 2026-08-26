import type { SafeSpaceBadgeStateDTO } from "./api/safeSpaceGovernance.api";
import { DEMO_BADGE_STATE } from "./safeSpaceGovernance.data";

/**
 * Per-slug demo badge states, so demo mode can show a badge that is verified,
 * a badge past its yearly check, and a badge the platform has paused, side by
 * side with the same three places' cards in the directory grid.
 *
 * Before this, one fixed fixture answered for every slug, so ANY demo place
 * asked about its badge came back "verified, trust tier 2" — including the
 * fifteen demo listings that have no badge at all. That is the same untruth
 * the card grid was fixed for, in the one place a member goes to read the
 * detail. The slugs below mirror `DIRECTORY_PLACES` exactly, and every other
 * slug resolves to `none`, which renders no badge panel at all.
 *
 * PRIVACY: nothing here carries a flag count or names a flagger, in demo data
 * any more than in a real response.
 */
const DEMO_BADGE_OVERRIDES: Record<string, Partial<SafeSpaceBadgeStateDTO>> = {
  // Verified, and past its annual re-review. Still a valid badge.
  "livraria-bertha": {
    state: "verified",
    tier: 2,
    verifier: "Mod team, 2 member visits",
    badgeAwardedAt: "2025-05-12",
    reReviewDueAt: "2026-05-12T00:00:00.000Z",
    isDueForReReview: true,
  },
  // Verified, inside its year. The plain case.
  "a-farinha": {
    state: "verified",
    tier: 3,
    verifier: "Mod team, 3 member visits",
    badgeAwardedAt: "2026-04-27",
    reReviewDueAt: "2027-04-27T00:00:00.000Z",
  },
  // A real grant the platform has put on hold while a review runs. The reason
  // is about the badge and about what was reported, and names nobody.
  "espaco-intendente": {
    state: "suspended",
    tier: 1,
    verifier: "Mod team, 2 member visits",
    badgeAwardedAt: "2025-03-09",
    reReviewDueAt: "2026-03-09T00:00:00.000Z",
    isUnderReview: true,
    suspendedAt: "2026-08-14T09:00:00.000Z",
    suspensionReason:
      "Members reported that the written policy is no longer being followed at the front desk. The mod team is visiting again.",
  },
};

/** The demo badge state for one slug. Unknown slugs carry no badge. */
export function demoBadgeState(slug: string): SafeSpaceBadgeStateDTO {
  const override = DEMO_BADGE_OVERRIDES[slug];
  if (!override) {
    return {
      ...DEMO_BADGE_STATE,
      slug,
      state: "none",
      tier: null,
      verifier: null,
      badgeAwardedAt: null,
      reReviewDueAt: null,
      isDueForReReview: false,
      isUnderReview: false,
      suspendedAt: null,
      suspensionReason: null,
    };
  }
  return { ...DEMO_BADGE_STATE, slug, ...override };
}
