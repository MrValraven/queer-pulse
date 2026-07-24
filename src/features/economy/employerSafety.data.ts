export interface SafetySignals {
  /** Community-verified as a safe employer. */
  verifiedSafe: boolean;
  /** Verified trans-inclusive policies. */
  transFriendly: boolean;
  /** 0–10, mirrors the Employer Reviews "Safe to be out" dimension. */
  safeToBeOut: number;
}

/**
 * One source of truth for employer safety signals, keyed by org name. Read by both
 * the Jobs pages (`safetyFor(job.org)`) and Employer Reviews (`safetyFor(company.name)`)
 * so a company reads the same in both places.
 */
export const EMPLOYER_SAFETY: Record<string, SafetySignals> = {
  "Atelier Pulso": {
    verifiedSafe: true,
    transFriendly: true,
    safeToBeOut: 9.4,
  },
  "A national LGBTQ+ rights organisation": {
    verifiedSafe: true,
    transFriendly: true,
    safeToBeOut: 9.6,
  },
  "A Lisbon Fintech": {
    verifiedSafe: false,
    transFriendly: false,
    safeToBeOut: 5.2,
  },
  "Rainbow Arts Collective": {
    verifiedSafe: true,
    transFriendly: true,
    safeToBeOut: 9.0,
  },
  "Opus Diversus": {
    verifiedSafe: true,
    transFriendly: false,
    safeToBeOut: 7.8,
  },
  "Livraria Devagar": {
    verifiedSafe: true,
    transFriendly: true,
    safeToBeOut: 8.6,
  },
  QueerPulse: { verifiedSafe: true, transFriendly: true, safeToBeOut: 9.8 },
  "Lisbon Tech Hub": {
    verifiedSafe: true,
    transFriendly: false,
    safeToBeOut: 8.2,
  },
  "Nova Ventures": {
    verifiedSafe: false,
    transFriendly: false,
    safeToBeOut: 4.0,
  },
  "Marvila Creative": {
    verifiedSafe: true,
    transFriendly: true,
    safeToBeOut: 9.4,
  },
};

/** Look up an employer's safety signals by org name, if known. */
export function safetyFor(org: string): SafetySignals | undefined {
  return EMPLOYER_SAFETY[org];
}
