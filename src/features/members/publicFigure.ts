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
  workshopsTaught: number;
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
export const TENURE_FLOOR_DAYS = 90;
export const CAP = { contribution: 50, trust: 35, participation: 30 } as const;
export const RECENCY_MONTHS = 6;
export const RECENCY_DECAY = 0.5;
export const DORMANT_DAYS = 90;
export const ACTIVE_WINDOW_DAYS = 30;

/** Diminishing per-piece value for the contribution family. */
const CONTRIBUTION_SERIES = [20, 12, 8, 6, 4, 3, 2, 1];

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

/** Months between two ISO timestamps. Pure — parses given strings only. */
function monthsBetween(fromIso: string, toIso: string): number {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_PER_MONTH;
}

function contributionScore(signals: EligibilitySignals): number {
  const datedWeights = [...signals.publishedPieces, ...signals.hostedOpenEvents].map(
    (piece) =>
      monthsBetween(piece.at, signals.nowIso) > RECENCY_MONTHS ? RECENCY_DECAY : 1,
  );
  const undatedRecent = signals.workshopsTaught + signals.publishedSubprofiles;
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

function buildGates(signals: EligibilitySignals): [Gate, Gate] {
  return [
    {
      key: "verified",
      // Reuse the profile hero's verified-badge wording.
      labelKey: "members:profile.hero.verifiedBadge",
      hintKey: "members:publicProfile.eligibility.verified.hint",
      met: signals.verified === true,
    },
    {
      key: "tenure",
      labelKey: "members:publicProfile.eligibility.tenure.label",
      hintKey: "members:publicProfile.eligibility.tenure.hint",
      met: signals.tenureDays >= TENURE_FLOOR_DAYS,
      remainingKey: "members:publicProfile.eligibility.tenure.remaining",
      remainingCount: Math.max(0, TENURE_FLOOR_DAYS - signals.tenureDays),
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
    gateActions.push({ family: "gate", labelKey: "members:publicProfile.eligibility.action.verify", points: 0 });
  if (!gates[1].met)
    gateActions.push({ family: "gate", labelKey: "members:publicProfile.eligibility.action.tenure", points: 0 });

  const scoreActions: NextAction[] = [];
  if (total < TARGET_SCORE) {
    const byKey = (key: FamilyScore["key"]) => families.find((family) => family.key === key)!;
    if (byKey("contribution").points < CAP.contribution)
      scoreActions.push({ family: "contribution", labelKey: "members:publicProfile.eligibility.action.host", points: 15 });
    if (byKey("trust").points < CAP.trust && signals.vouchCount < 3)
      scoreActions.push({
        family: "trust",
        labelKey: "members:publicProfile.eligibility.action.vouch",
        points: signals.vouchCount < 2 ? 12 : 8,
      });
    if (byKey("participation").points < CAP.participation)
      scoreActions.push({ family: "participation", labelKey: "members:publicProfile.eligibility.action.attend", points: 4 });
    scoreActions.sort((left, right) => right.points - left.points);
  }

  return [...gateActions, ...scoreActions];
}

/**
 * Decide whether a member may run a public profile. Two hard gates, a capped
 * three-family score, and a silent standing veto. Pure — no React, no I/O, no
 * wall-clock (time comes from `signals.nowIso`).
 */
export function evaluatePublicEligibility(signals: EligibilitySignals): PublicEligibility {
  const gates = buildGates(signals);
  const families: FamilyScore[] = [
    {
      key: "contribution",
      labelKey: "members:publicProfile.eligibility.family.contribution.label",
      points: contributionScore(signals),
      cap: CAP.contribution,
    },
    {
      key: "trust",
      labelKey: "members:publicProfile.eligibility.family.trust.label",
      points: trustScore(signals),
      cap: CAP.trust,
    },
    {
      key: "participation",
      labelKey: "members:publicProfile.eligibility.family.participation.label",
      points: participationScore(signals),
      cap: CAP.participation,
    },
  ];
  const total = Math.min(
    TARGET_SCORE,
    families.reduce((sum, family) => sum + family.points, 0),
  );
  const standingOk = signals.standingOk === true;
  const eligible = gates.every((gate) => gate.met) && total >= TARGET_SCORE && standingOk;

  return {
    gates,
    score: { total, target: TARGET_SCORE, families },
    standingOk,
    eligible,
    nextActions: buildNextActions(signals, gates, families, total),
  };
}
