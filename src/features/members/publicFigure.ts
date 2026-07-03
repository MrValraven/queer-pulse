import type { Member } from "./data/members";
import type { PublicContributions } from "./currentUserPublic.data";

/** One requirement toward unlocking a public profile — shown to the member as a
 *  checklist so eligibility reads as something you grow into, not a mystery. */
export interface EligibilityCriterion {
  key: "verified" | "contributes" | "established" | "trusted";
  label: string;
  met: boolean;
  /** Short "how you get there" line, shown under the label. */
  hint: string;
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
 * Decide whether a member may run a public profile. Public profiles are reserved
 * for members who contribute to the public side of QueerPulse, so eligibility is
 * derived from real signals rather than a numeric level. Pure — no React, no I/O.
 */
export function evaluatePublicEligibility(
  member: Member,
  contributions: PublicContributions,
): PublicEligibility {
  const yearsOn = NOW_YEAR - Number(member.since);
  const publicPieces =
    contributions.writing.length + contributions.hosting.length;

  const criteria: EligibilityCriterion[] = [
    {
      key: "verified",
      label: "Verified member",
      met: member.verified === true,
      hint: "Confirm your identity so people know it's really you.",
    },
    {
      key: "contributes",
      label: "Contributes publicly",
      met: publicPieces >= 1,
      hint: "Publish writing or host an open event the public can see.",
    },
    {
      key: "established",
      label: "A year on QueerPulse",
      met: Number.isFinite(yearsOn) && yearsOn >= 1,
      hint: "Public profiles open up after your first year here.",
    },
    {
      key: "trusted",
      label: "Vouched-for by 2+ members",
      met: member.vouchers.length >= 2,
      hint: "A couple of members vouching for you unlocks this.",
    },
  ];

  return { eligible: criteria.every((c) => c.met), criteria };
}
