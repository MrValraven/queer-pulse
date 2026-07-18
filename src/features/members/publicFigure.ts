import type { Member } from "./data/members";

/** One requirement toward unlocking a public profile — shown to the member as a
 *  checklist so eligibility reads as something you grow into, not a mystery.
 *  `labelKey`/`hintKey` are catalog keys, not raw strings: this is a small,
 *  platform-defined checklist (chrome), resolved through `t()` by the
 *  consuming component (`PublicProfileControl.tsx`), which is the only place
 *  with access to the translation function — this evaluator stays a pure,
 *  React-free function. */
export interface EligibilityCriterion {
  key: "verified" | "contributes" | "established" | "trusted";
  labelKey: string;
  met: boolean;
  /** Catalog key for the short "how you get there" line shown under the label. */
  hintKey: string;
}

export interface PublicEligibility {
  /** True only when every criterion is met. */
  eligible: boolean;
  criteria: EligibilityCriterion[];
}

/** The reference year for the "established" check. A literal (not `Date.now()`)
 *  so eligibility is deterministic across renders and easy to reason about. */
const NOW_YEAR = 2026;

/**
 * How much public work a member has behind them. Deliberately a plain count
 * rather than the demo `PublicContributions` fixture: eligibility is decided for
 * real members in live mode, so the caller derives this from the member's own
 * profile and only falls back to the mock in demo mode (see
 * `PublicProfileProvider`).
 */
export interface ContributionSignals {
  /** Published writing, hosted open events and other public pieces. */
  publicPieces: number;
}

/**
 * Decide whether a member may run a public profile. Public profiles are reserved
 * for members who contribute to the public side of QueerPulse, so eligibility is
 * derived from real signals rather than a numeric level. Pure — no React, no I/O.
 */
export function evaluatePublicEligibility(
  member: Member,
  contributions: ContributionSignals,
): PublicEligibility {
  const yearsOn = NOW_YEAR - Number(member.since);
  const publicPieces = contributions.publicPieces;

  const criteria: EligibilityCriterion[] = [
    {
      key: "verified",
      // Same wording as the profile hero's verified badge — reuse its key.
      labelKey: "members:profile.hero.verifiedBadge",
      met: member.verified === true,
      hintKey: "members:publicProfile.eligibility.verified.hint",
    },
    {
      key: "contributes",
      labelKey: "members:publicProfile.eligibility.contributes.label",
      met: publicPieces >= 1,
      hintKey: "members:publicProfile.eligibility.contributes.hint",
    },
    {
      key: "established",
      labelKey: "members:publicProfile.eligibility.established.label",
      met: Number.isFinite(yearsOn) && yearsOn >= 1,
      hintKey: "members:publicProfile.eligibility.established.hint",
    },
    {
      key: "trusted",
      labelKey: "members:publicProfile.eligibility.trusted.label",
      met: member.vouchers.length >= 2,
      hintKey: "members:publicProfile.eligibility.trusted.hint",
    },
  ];

  return { eligible: criteria.every((c) => c.met), criteria };
}
