import type { PublicEligibilityDecisionDto } from "./api/publicProfile.api";

/** One public piece, timestamped so recency can decay its weight. */
export interface DatedPiece {
  /** ISO timestamp of when the piece went public. */
  at: string;
}

/**
 * Everything the evaluator needs to score a member. Derived by the caller
 * (`PublicProfileProvider`) from the real profile in live mode and from a
 * colocated fixture in demo mode. Fields the backend does not yet expose are
 * defaulted safely by the caller (0 / "unknown-safe"), never guessed here.
 */
export interface EligibilitySignals {
  /** The caller's single reference "now" (ISO). Keeps this function pure. */
  nowIso: string;
  verified: boolean;
  tenureDays: number;
  // Public contribution
  publishedPieces: DatedPiece[];
  hostedOpenEvents: DatedPiece[];
  publishedSubprofiles: number;
  // Community trust
  vouchCount: number;
  endorsementCount: number;
  connectionCount: number;
  // Sustained participation
  eventsAttended: number;
  communityPosts: number;
  lastActiveDaysAgo: number;
  // Standing (silent safety veto)
  standingOk: boolean;
}

/** A hard prerequisite — boolean, no points. Both must pass to unlock. */
export interface Gate {
  key: "verified" | "tenure";
  labelKey: string;
  hintKey: string;
  met: boolean;
  /** Catalog key + count for the concrete remaining gap ("60 days to go"). */
  remainingKey?: string;
  remainingCount?: number;
}

/** One capped scoring family. */
export interface FamilyScore {
  key: "contribution" | "trust" | "participation";
  labelKey: string;
  points: number;
  cap: number;
}

/** A ranked "do this next" suggestion shown in the tracker. */
export interface NextAction {
  family: FamilyScore["key"] | "gate";
  labelKey: string;
  /** Estimated point payoff; 0 for gate actions (they unblock, not score). */
  points: number;
}

export interface PublicEligibility {
  gates: Gate[];
  score: { total: number; target: number; families: FamilyScore[] };
  standingOk: boolean;
  /** gates all met AND score.total >= target AND standingOk. */
  eligible: boolean;
  nextActions: NextAction[];
}

// ── Tuning knobs (single source of truth) ───────────────────────────────────
export const TARGET_SCORE = 100;
/**
 * A hard gate (see `buildGates`), not a scoring input: no amount of activity
 * lets a member unlock a public profile before this many days on the
 * platform. This is deliberate policy, not an arbitrary number or a bug.
 * QueerPulse is invite-only and trust-first, so public visibility (being
 * discoverable and citable outside the platform's own membership) is
 * something earned over time, not something a brand-new member can rush by
 * racking up posts and events in their first week. Ninety days is roughly a
 * season: long enough to demonstrate you're a real, sustained presence here
 * rather than a fast-moving account optimizing for exposure, short enough
 * that a genuinely engaged member isn't locked out for a year.
 *
 * THE SERVER IS NOW THE SOURCE OF TRUTH. The rule moved to
 * `queerpulse-backend/src/public-eligibility/public-eligibility.rules.ts`,
 * which `PUT /me/public-profile` enforces with a 403. A gate that lives only
 * in the client is no gate at all, and this one publishes to the open web.
 * The constants here still drive DEMO mode (which has no server) and are kept
 * byte-for-byte identical to the backend's. In live mode the evaluator's
 * output is replaced by `publicEligibilityFromDecision` below, so a divergence
 * between the two copies can never change what a real member sees.
 */
export const TENURE_FLOOR_DAYS = 90;
export const CAP = { contribution: 50, trust: 35, participation: 30 } as const;
export const RECENCY_MONTHS = 6;
export const RECENCY_DECAY = 0.5;
export const DORMANT_DAYS = 90;
export const ACTIVE_WINDOW_DAYS = 30;

/** The one place each family's copy key lives, so the local evaluator and the
 *  server-decision mapper below label them identically. */
const FAMILY_LABEL_KEY: Record<FamilyScore["key"], string> = {
  contribution: "members:publicProfile.eligibility.family.contribution.label",
  trust: "members:publicProfile.eligibility.family.trust.label",
  participation: "members:publicProfile.eligibility.family.participation.label",
};

/** Diminishing per-piece value for the contribution family. */
const CONTRIBUTION_SERIES = [20, 12, 8, 6, 4, 3, 2, 1];

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

/** Months between two ISO timestamps. Pure — parses given strings only. */
function monthsBetween(fromIso: string, toIso: string): number {
  return (
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_PER_MONTH
  );
}

function contributionScore(signals: EligibilitySignals): number {
  const datedWeights = [
    ...signals.publishedPieces,
    ...signals.hostedOpenEvents,
  ].map((piece) =>
    monthsBetween(piece.at, signals.nowIso) > RECENCY_MONTHS
      ? RECENCY_DECAY
      : 1,
  );
  const undatedRecent = signals.publishedSubprofiles;
  for (let index = 0; index < undatedRecent; index += 1) datedWeights.push(1);

  // Full-weight pieces claim the biggest series slots first.
  datedWeights.sort((left, right) => right - left);
  const total = datedWeights.reduce((sum, weight, index) => {
    const seriesValue = CONTRIBUTION_SERIES[index] ?? 1;
    return sum + seriesValue * weight;
  }, 0);
  return Math.min(CAP.contribution, Math.round(total));
}

function trustScore(signals: EligibilitySignals): number {
  let total = 0;
  const vouches = signals.vouchCount;
  if (vouches >= 2) {
    total += 12; // reaching the "2+" bar
    if (vouches >= 3) total += 8; // the 3rd vouch
    total += Math.max(0, vouches - 3) * 5; // each beyond the 3rd
  } else {
    total += vouches * 4; // partial credit so 1 vouch still shows motion
  }
  total += Math.min(10, signals.endorsementCount * 2);
  total += Math.min(6, signals.connectionCount); // cheap to farm → low weight
  return Math.min(CAP.trust, total);
}

function participationScore(signals: EligibilitySignals): number {
  let total = 0;
  total += Math.min(16, signals.eventsAttended * 4);
  total += Math.min(10, signals.communityPosts * 2);
  const beyondFloor = Math.max(0, signals.tenureDays - TENURE_FLOOR_DAYS);
  total += Math.min(8, Math.floor(beyondFloor / 90) * 2);
  if (signals.lastActiveDaysAgo <= ACTIVE_WINDOW_DAYS) total += 6;
  return Math.min(CAP.participation, total);
}

/** The two gates with their copy attached. Takes already-decided values so the
 *  local evaluator and the server-decision mapper produce identical wording. */
function buildGates(
  isVerifiedMet: boolean,
  isTenureMet: boolean,
  tenureDaysRemaining: number,
): [Gate, Gate] {
  return [
    {
      key: "verified",
      // Reuse the profile hero's verified-badge wording.
      labelKey: "members:profile.hero.verifiedBadge",
      hintKey: "members:publicProfile.eligibility.verified.hint",
      met: isVerifiedMet,
    },
    {
      key: "tenure",
      labelKey: "members:publicProfile.eligibility.tenure.label",
      hintKey: "members:publicProfile.eligibility.tenure.hint",
      met: isTenureMet,
      remainingKey: "members:publicProfile.eligibility.tenure.remaining",
      remainingCount: tenureDaysRemaining,
    },
  ];
}

function buildNextActions(
  signals: EligibilitySignals,
  gates: [Gate, Gate],
  families: FamilyScore[],
  total: number,
): NextAction[] {
  const gateActions: NextAction[] = [];
  if (!gates[0].met)
    gateActions.push({
      family: "gate",
      labelKey: "members:publicProfile.eligibility.action.verify",
      points: 0,
    });
  if (!gates[1].met)
    gateActions.push({
      family: "gate",
      labelKey: "members:publicProfile.eligibility.action.tenure",
      points: 0,
    });

  const scoreActions: NextAction[] = [];
  if (total < TARGET_SCORE) {
    // `families` can now arrive from the server, so a missing family is read as
    // "no points earned" rather than asserted away.
    const pointsIn = (key: FamilyScore["key"]) =>
      families.find((family) => family.key === key)?.points ?? 0;
    if (pointsIn("contribution") < CAP.contribution)
      scoreActions.push({
        family: "contribution",
        labelKey: "members:publicProfile.eligibility.action.host",
        points: 15,
      });
    if (pointsIn("trust") < CAP.trust && signals.vouchCount < 3)
      scoreActions.push({
        family: "trust",
        labelKey: "members:publicProfile.eligibility.action.vouch",
        points: signals.vouchCount < 2 ? 12 : 8,
      });
    if (pointsIn("participation") < CAP.participation)
      scoreActions.push({
        family: "participation",
        labelKey: "members:publicProfile.eligibility.action.attend",
        points: 4,
      });
    scoreActions.sort((left, right) => right.points - left.points);
  }

  return [...gateActions, ...scoreActions];
}

/**
 * Decide whether a member may run a public profile. Two hard gates, a capped
 * three-family score, and a silent standing veto. Pure — no React, no I/O, no
 * wall-clock (time comes from `signals.nowIso`).
 */
export function evaluatePublicEligibility(
  signals: EligibilitySignals,
): PublicEligibility {
  const gates = buildGates(
    signals.verified === true,
    signals.tenureDays >= TENURE_FLOOR_DAYS,
    Math.max(0, TENURE_FLOOR_DAYS - signals.tenureDays),
  );
  const families: FamilyScore[] = [
    {
      key: "contribution",
      labelKey: FAMILY_LABEL_KEY.contribution,
      points: contributionScore(signals),
      cap: CAP.contribution,
    },
    {
      key: "trust",
      labelKey: FAMILY_LABEL_KEY.trust,
      points: trustScore(signals),
      cap: CAP.trust,
    },
    {
      key: "participation",
      labelKey: FAMILY_LABEL_KEY.participation,
      points: participationScore(signals),
      cap: CAP.participation,
    },
  ];
  const total = Math.min(
    TARGET_SCORE,
    families.reduce((sum, family) => sum + family.points, 0),
  );
  const standingOk = signals.standingOk === true;
  const eligible =
    gates.every((gate) => gate.met) && total >= TARGET_SCORE && standingOk;

  return {
    gates,
    score: { total, target: TARGET_SCORE, families },
    standingOk,
    eligible,
    nextActions: buildNextActions(signals, gates, families, total),
  };
}

/**
 * Build the same display shape from the SERVER's decision.
 *
 * This is the live-mode path. The server decides (gates, per-family points,
 * total, standing veto) and this function only attaches the i18n copy and the
 * ranked "do this next" list, so the checklist a member reads is a rendering
 * of the very numbers `PUT /me/public-profile` will enforce. `signals` is
 * still passed because the next-action ranking reads `vouchCount`; nothing in
 * it can change the verdict.
 */
export function publicEligibilityFromDecision(
  decision: PublicEligibilityDecisionDto,
  signals: EligibilitySignals,
): PublicEligibility {
  const gates = buildGates(
    decision.gates.isVerifiedMet,
    decision.gates.isTenureMet,
    decision.gates.tenureDaysRemaining,
  );
  const families: FamilyScore[] = decision.score.families.map((family) => ({
    key: family.key,
    labelKey: FAMILY_LABEL_KEY[family.key],
    points: family.points,
    cap: family.cap,
  }));

  return {
    gates,
    score: {
      total: decision.score.total,
      target: decision.score.target,
      families,
    },
    standingOk: decision.isStandingOk,
    eligible: decision.isEligible,
    nextActions: buildNextActions(
      signals,
      gates,
      families,
      decision.score.total,
    ),
  };
}
